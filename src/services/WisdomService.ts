import { supabase } from '../lib/supabase.ts';

export interface WisdomFormData {
  requestA: string;
  requestB: string;
  requestC: string;
}

// ✅ 프로필 타입에 성별, 나이, 회사 추가
export interface Profile {
  id?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  gender?: string;      // 추가
  age?: number;         // 추가
  company?: string;     // 추가
}

export interface WisdomPost {
  id: string;
  user_id: string;
  request_a: string;
  request_b: string;
  request_c: string;
  honor_count: number;
  recommend_count: number;
  respect_count: number;
  hug_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

// ✅ 반응 히스토리 타입 추가
export interface WisdomReaction {
  id: string;
  wisdom_post_id: string;
  user_id: string;
  reaction_type: 'honor' | 'recommend' | 'respect' | 'hug';
  created_at: string;
  profile?: Profile;
}

export interface WisdomDraft {
  id: string;
  user_id: string;
  request_a?: string;
  request_b?: string;
  request_c?: string;
  created_at: string;
  updated_at: string;
}

export interface RankingUser {
  user_id: string;
  total_score: number;
  honor_count: number;
  recommend_count: number;
  respect_count: number;
  hug_count: number;
  profile?: Profile;
}

// 에러 타입 정의
export interface ServiceError {
  code: string;
  message: string;
  type?: 'AUTH' | 'VALIDATION' | 'SERVER' | 'NETWORK';
}

export class WisdomService {
  
  /**
   * 현재 사용자 인증 상태 확인
   */
  private static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * 인증 상태를 먼저 체크하는 헬퍼 메서드
   */
  private static async checkAuth(): Promise<{ user: any; error: ServiceError | null }> {
    const { user, error } = await this.getCurrentUser();
    
    if (error || !user) {
      return { 
        user: null, 
        error: { 
          code: 'UNAUTHORIZED', 
          message: '로그인이 필요합니다.', 
          type: 'AUTH' 
        } 
      };
    }
    
    return { user, error: null };
  }

  /**
   * 임시 저장 - 사용자당 하나의 임시저장만 유지
   */
  static async saveDraft(formData: WisdomFormData): Promise<{ error: ServiceError | null }> {
    try {
      const { user, error: authError } = await this.checkAuth();
      if (authError) {
        return { error: authError };
      }

      const { error } = await supabase
        .from('wisdom_drafts')
        .upsert({
          user_id: user.id,
          request_a: formData.requestA,
          request_b: formData.requestB,
          request_c: formData.requestC,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });

      if (error) {
        console.error('임시 저장 오류:', error);
        return { 
          error: { 
            code: 'SAVE_DRAFT_FAILED', 
            message: '임시 저장 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      console.log('임시 저장 완료');
      return { error: null };

    } catch (error) {
      console.error('임시 저장 예외:', error);
      return { 
        error: { 
          code: 'SAVE_DRAFT_EXCEPTION', 
          message: '임시 저장 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * 임시저장된 내용 불러오기
   */
  static async loadDraft(): Promise<{ data: WisdomDraft | null; error: ServiceError | null }> {
    try {
      const { user, error: authError } = await this.checkAuth();
      if (authError) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('wisdom_drafts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.error('임시저장 불러오기 오류:', error);
        return { 
          data: null, 
          error: { 
            code: 'LOAD_DRAFT_FAILED', 
            message: '임시저장 불러오기 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      return { data, error: null };

    } catch (error) {
      console.error('임시저장 불러오기 예외:', error);
      return { 
        data: null, 
        error: { 
          code: 'LOAD_DRAFT_EXCEPTION', 
          message: '임시저장 불러오기 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * 위즈덤 최종 제출
   */
  static async submitWisdom(formData: WisdomFormData): Promise<{ data: WisdomPost | null; error: ServiceError | null }> {
    try {
      const { user, error: authError } = await this.checkAuth();
      if (authError) {
        return { data: null, error: authError };
      }

      // 입력 검증
      if (formData.requestA.length < 10 || formData.requestA.length > 40) {
        return { 
          data: null, 
          error: { 
            code: 'VALIDATION_REQUEST_A', 
            message: 'Request A는 10자 이상 40자 이하여야 합니다.', 
            type: 'VALIDATION' 
          } 
        };
      }
      if (formData.requestB.length < 10 || formData.requestB.length > 150) {
        return { 
          data: null, 
          error: { 
            code: 'VALIDATION_REQUEST_B', 
            message: 'Request B는 10자 이상 150자 이하여야 합니다.', 
            type: 'VALIDATION' 
          } 
        };
      }
      if (formData.requestC.length < 10 || formData.requestC.length > 40) {
        return { 
          data: null, 
          error: { 
            code: 'VALIDATION_REQUEST_C', 
            message: 'Request C는 10자 이상 40자 이하여야 합니다.', 
            type: 'VALIDATION' 
          } 
        };
      }

      // 위즈덤 게시물 생성
      const { data: post, error: postError } = await supabase
        .from('wisdom_posts')
        .insert({
          user_id: user.id,
          request_a: formData.requestA,
          request_b: formData.requestB,
          request_c: formData.requestC,
          honor_count: 0,
          recommend_count: 0,
          respect_count: 0,
          hug_count: 0
        })
        .select()
        .single();

      if (postError) {
        console.error('위즈덤 제출 오류:', postError);
        return { 
          data: null, 
          error: { 
            code: 'SUBMIT_WISDOM_FAILED', 
            message: '위즈덤 제출 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      // 제출 완료 후 임시 저장 데이터 삭제
      await supabase
        .from('wisdom_drafts')
        .delete()
        .eq('user_id', user.id);

      console.log('위즈덤 제출 완료:', post.id);
      return { data: post, error: null };

    } catch (error) {
      console.error('위즈덤 제출 예외:', error);
      return { 
        data: null, 
        error: { 
          code: 'SUBMIT_WISDOM_EXCEPTION', 
          message: '위즈덤 제출 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * 현재 로그인 상태 확인 (UI에서 사용)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { user } = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * 모든 위즈덤 게시물 조회 (본인 제외, 최신순)
   */
  static async getAllWisdomPosts(): Promise<{ data: WisdomPost[]; error: ServiceError | null }> {
    try {
      const { user } = await this.getCurrentUser();
      
      let query = supabase
        .from('wisdom_posts')
        .select(`
          *,
          profiles(
            full_name,
            username,
            avatar_url,
            gender,
            age,
            company
          )
        `)
        .order('created_at', { ascending: false });

      // 로그인한 사용자가 있으면 본인 게시물 제외
      if (user) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('위즈덤 게시물 조회 오류:', error);
        return { 
          data: [], 
          error: { 
            code: 'GET_POSTS_FAILED', 
            message: '위즈덤 게시물 조회 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      // 프로필 정보 매핑
      const postsWithProfiles = (data || []).map(post => ({
        ...post,
        profile: post.profiles
      }));

      return { data: postsWithProfiles, error: null };

    } catch (error) {
      console.error('위즈덤 게시물 조회 예외:', error);
      return { 
        data: [], 
        error: { 
          code: 'GET_POSTS_EXCEPTION', 
          message: '위즈덤 게시물 조회 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * 실시간 순위 조회
   */
  static async getRankingData(): Promise<{ data: RankingUser[]; error: ServiceError | null }> {
    try {
      const { data, error } = await supabase
        .from('wisdom_posts')
        .select(`
          user_id,
          honor_count,
          recommend_count,
          respect_count,
          hug_count,
          profiles!inner(
            full_name,
            username,
            avatar_url,
            gender,
            age,
            company
          )
        `);

      if (error) {
        console.error('순위 데이터 조회 오류:', error);
        return { 
          data: [], 
          error: { 
            code: 'GET_RANKING_FAILED', 
            message: '순위 조회 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      // 사용자별로 통계 집계
      const userStats = new Map<string, {
        user_id: string;
        honor_count: number;
        recommend_count: number;
        respect_count: number;
        hug_count: number;
        profile: any;
      }>();

      (data || []).forEach(post => {
        const existing = userStats.get(post.user_id);
        if (existing) {
          existing.honor_count += post.honor_count;
          existing.recommend_count += post.recommend_count;
          existing.respect_count += post.respect_count;
          existing.hug_count += post.hug_count;
        } else {
          userStats.set(post.user_id, {
            user_id: post.user_id,
            honor_count: post.honor_count,
            recommend_count: post.recommend_count,
            respect_count: post.respect_count,
            hug_count: post.hug_count,
            profile: post.profiles
          });
        }
      });

      // 가중치 기반 총점 계산 및 정렬
      const rankingData = Array.from(userStats.values()).map(user => ({
        ...user,
        total_score: (user.honor_count * 4) + (user.recommend_count * 3) + (user.respect_count * 2) + (user.hug_count * 1)
      })).sort((a, b) => b.total_score - a.total_score);

      return { data: rankingData, error: null };

    } catch (error) {
      console.error('순위 조회 예외:', error);
      return { 
        data: [], 
        error: { 
          code: 'GET_RANKING_EXCEPTION', 
          message: '순위 조회 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * ✅ 3번: 특정 포스트의 반응 히스토리 조회 (프로필 정보 포함)
   */
  static async fetchReactionHistory(postId: string): Promise<{ data: WisdomReaction[]; error: ServiceError | null }> {
    try {
      const { data, error } = await supabase
        .from('wisdom_reactions')
        .select(`
          *,
          profile:profiles(
            full_name,
            gender,
            age,
            company
          )
        `)
        .eq('wisdom_post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('반응 히스토리 조회 오류:', error);
        return { 
          data: [], 
          error: { 
            code: 'GET_REACTION_HISTORY_FAILED', 
            message: '반응 히스토리 조회 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      return { data: data || [], error: null };

    } catch (error) {
      console.error('반응 히스토리 조회 예외:', error);
      return { 
        data: [], 
        error: { 
          code: 'GET_REACTION_HISTORY_EXCEPTION', 
          message: '반응 히스토리 조회 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * ✅ 4번: wisdom_posts의 반응 카운트 업데이트
   */
  static async updateReaction(
    postId: string, 
    reactionType: 'honor' | 'recommend' | 'respect' | 'hug', 
    newCount: number
  ): Promise<{ error: ServiceError | null }> {
    try {
      const countField = `${reactionType}_count`;
      
      const { error } = await supabase
        .from('wisdom_posts')
        .update({ [countField]: newCount })
        .eq('id', postId);

      if (error) {
        console.error('반응 카운트 업데이트 오류:', error);
        return { 
          error: { 
            code: 'UPDATE_REACTION_COUNT_FAILED', 
            message: '반응 카운트 업데이트 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      return { error: null };

    } catch (error) {
      console.error('반응 카운트 업데이트 예외:', error);
      return { 
        error: { 
          code: 'UPDATE_REACTION_COUNT_EXCEPTION', 
          message: '반응 카운트 업데이트 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * ✅ 표현행위 추가 (wisdom_reactions 테이블에 기록 + 카운트 증가)
   */
  static async addReaction(
    postId: string, 
    reactionType: 'honor' | 'recommend' | 'respect' | 'hug'
  ): Promise<{ error: ServiceError | null }> {
    try {
      // 인증 상태 체크
      const { user, error: authError } = await this.checkAuth();
      if (authError) {
        return { error: authError };
      }

      // 본인 게시물인지 확인
      const { data: post } = await supabase
        .from('wisdom_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post && post.user_id === user.id) {
        return { 
          error: { 
            code: 'SELF_REACTION_NOT_ALLOWED', 
            message: '본인의 게시물에는 표현행위를 할 수 없습니다.', 
            type: 'VALIDATION' 
          } 
        };
      }

      // 기존 반응 확인 (한 사용자는 한 포스트에 하나의 반응만)
      const { data: existingReaction } = await supabase
        .from('wisdom_reactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('wisdom_post_id', postId)
        .single();

      if (existingReaction) {
        return { 
          error: { 
            code: 'REACTION_ALREADY_EXISTS', 
            message: '이미 이 게시물에 반응을 보냈습니다.', 
            type: 'VALIDATION' 
          } 
        };
      }

      // wisdom_reactions 테이블에 반응 기록
      const { error: insertError } = await supabase
        .from('wisdom_reactions')
        .insert({
          user_id: user.id,
          wisdom_post_id: postId,
          reaction_type: reactionType
        });

      if (insertError) {
        console.error('반응 추가 오류:', insertError);
        return { 
          error: { 
            code: 'ADD_REACTION_FAILED', 
            message: '표현행위 추가 중 오류가 발생했습니다.', 
            type: 'SERVER' 
          } 
        };
      }

      // wisdom_posts의 카운트 증가
      const countField = `${reactionType}_count`;
      const { error: updateError } = await supabase.rpc('increment_reaction_count', {
        post_id: postId,
        reaction_field: countField
      });

      // RPC 함수가 없으면 직접 업데이트
      if (updateError) {
        const { data: currentPost } = await supabase
          .from('wisdom_posts')
          .select(countField)
          .eq('id', postId)
          .single();

        if (currentPost) {
          await supabase
            .from('wisdom_posts')
            .update({ [countField]: (currentPost[countField] || 0) + 1 })
            .eq('id', postId);
        }
      }

      console.log(`표현행위 완료: ${reactionType} for post ${postId}`);
      
      // 순위 업데이트 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rankingUpdate'));
      }
      
      return { error: null };

    } catch (error) {
      console.error('표현행위 예외:', error);
      return { 
        error: { 
          code: 'REACTION_EXCEPTION', 
          message: '표현행위 중 예상치 못한 오류가 발생했습니다.', 
          type: 'NETWORK' 
        } 
      };
    }
  }

  /**
   * 사용자의 표현행위 제한 확인
   */
  static async checkReactionLimits(userId: string): Promise<{
    honor: number;
    recommend: number; 
    respect: number;
    hug: number;
    canSend: {
      honor: boolean;
      recommend: boolean;
      respect: boolean;
      hug: boolean;
    };
  }> {
    try {
      const { data, error } = await supabase
        .from('wisdom_reactions')
        .select('reaction_type')
        .eq('user_id', userId);

      if (error) {
        console.error('반응 제한 확인 오류:', error);
        return {
          honor: 0, recommend: 0, respect: 0, hug: 0,
          canSend: { honor: true, recommend: true, respect: true, hug: true }
        };
      }

      const counts = { honor: 0, recommend: 0, respect: 0, hug: 0 };
      (data || []).forEach(reaction => {
        counts[reaction.reaction_type as keyof typeof counts]++;
      });

      return {
        ...counts,
        canSend: {
          honor: counts.honor < 1,
          recommend: counts.recommend < 3,
          respect: counts.respect < 5,
          hug: counts.hug < 3
        }
      };

    } catch (error) {
      console.error('반응 제한 확인 예외:', error);
      return {
        honor: 0, recommend: 0, respect: 0, hug: 0,
        canSend: { honor: true, recommend: true, respect: true, hug: true }
      };
    }
  }
}

// ✅ Supabase에서 모든 위즈덤 포스트 가져오기 (프로필 정보 포함)
export async function fetchWisdomPosts(): Promise<WisdomPost[]> {
  try {
    const { data, error } = await supabase
      .from('wisdom_posts')
      .select(`
        *,
        profiles!inner(username, avatar_url, gender, age, company)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 에러:', error);
      throw error;
    }

    const postsWithProfile = (data || []).map(post => ({
      ...post,
      profile: post.profiles
    }));

    return postsWithProfile;
  } catch (error) {
    console.error('위즈덤 포스트 조회 실패:', error);
    throw error;
  }
}