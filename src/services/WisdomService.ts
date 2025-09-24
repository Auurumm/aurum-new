import { supabase } from '../lib/supabase.ts';

export interface WisdomFormData {
  requestA: string;
  requestB: string;
  requestC: string;
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
  profile?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
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
  profile?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
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
      // 인증 상태 체크
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
      // 인증 상태 체크
      const { user, error: authError } = await this.checkAuth();
      if (authError) {
        // 비로그인 상태에서는 에러를 반환하지 않고 null 데이터만 반환
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('wisdom_drafts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // 데이터가 없는 경우 (PGRST116)는 정상적인 상황
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
      // 인증 상태 체크
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
            avatar_url
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
            avatar_url
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

      // 가중치 기반 총점 계산 및 정렬 (경의 x4, 추천 x3, 존중 x2, 응원 x1)
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
   * 표현행위 추가/변경
   */
  static async addReaction(postId: string, reactionType: 'honor' | 'recommend' | 'respect' | 'hug'): Promise<{ error: ServiceError | null }> {
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

      // 기존 반응 확인
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingReaction) {
        // 기존 반응이 있으면 업데이트
        const { error } = await supabase
          .from('reactions')
          .update({ reaction_type: reactionType })
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) {
          console.error('표현행위 업데이트 오류:', error);
          return { 
            error: { 
              code: 'UPDATE_REACTION_FAILED', 
              message: '표현행위 업데이트 중 오류가 발생했습니다.', 
              type: 'SERVER' 
            } 
          };
        }
      } else {
        // 새로운 반응 추가
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            post_id: postId,
            reaction_type: reactionType
          });

        if (error) {
          console.error('표현행위 추가 오류:', error);
          return { 
            error: { 
              code: 'ADD_REACTION_FAILED', 
              message: '표현행위 추가 중 오류가 발생했습니다.', 
              type: 'SERVER' 
            } 
          };
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
        .from('reactions')
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
          honor: counts.honor < 1,     // 경의: 1장 제한
          recommend: counts.recommend < 3,  // 추천: 3장 제한
          respect: counts.respect < 5,      // 존중: 5장 제한
          hug: counts.hug < 3              // 응원: 3장 제한
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