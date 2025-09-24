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

export class WisdomService {
  
  /**
   * 임시 저장 - 사용자당 하나의 임시저장만 유지
   */
  static async saveDraft(formData: WisdomFormData): Promise<{ error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { error: { message: '인증이 필요합니다.' } };
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
        return { error };
      }

      console.log('임시 저장 완료');
      return { error: null };

    } catch (error) {
      console.error('임시 저장 예외:', error);
      return { error: { message: '임시 저장 중 오류가 발생했습니다.' } };
    }
  }

  /**
   * 임시 저장된 내용 불러오기
   */
  static async loadDraft(): Promise<{ data: WisdomDraft | null; error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: { message: '인증이 필요합니다.' } };
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
        console.error('임시 저장 불러오기 오류:', error);
        return { data: null, error };
      }

      return { data, error: null };

    } catch (error) {
      console.error('임시 저장 불러오기 예외:', error);
      return { data: null, error: { message: '임시 저장 불러오기 중 오류가 발생했습니다.' } };
    }
  }

  /**
   * 위즈덤 최종 제출
   */
  static async submitWisdom(formData: WisdomFormData): Promise<{ data: WisdomPost | null; error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: { message: '인증이 필요합니다.' } };
      }

      // 입력 검증
      if (formData.requestA.length < 10 || formData.requestA.length > 40) {
        return { data: null, error: { message: 'Request A는 10자 이상 40자 이하여야 합니다.' } };
      }
      if (formData.requestB.length < 10 || formData.requestB.length > 150) {
        return { data: null, error: { message: 'Request B는 10자 이상 150자 이하여야 합니다.' } };
      }
      if (formData.requestC.length < 10 || formData.requestC.length > 40) {
        return { data: null, error: { message: 'Request C는 10자 이상 40자 이하여야 합니다.' } };
      }

      // 위즈덤 게시물 생성
      const { data: post, error: postError } = await supabase
        .from('wisdom_posts')
        .insert({
          user_id: user.id,
          request_a: formData.requestA,
          request_b: formData.requestB,
          request_c: formData.requestC,
          honor_count: 0,        // 추가
          recommend_count: 0,    // 추가
          respect_count: 0,      // 추가
          hug_count: 0          // 추가
        })
        .select()
        .single();

      if (postError) {
        console.error('위즈덤 제출 오류:', postError);
        return { data: null, error: postError };
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
      return { data: null, error: { message: '위즈덤 제출 중 오류가 발생했습니다.' } };
    }
  }

  /**
   * 모든 위즈덤 게시물 조회 (최신순)
   */
  static async getAllWisdomPosts(): Promise<{ data: WisdomPost[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wisdom_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('위즈덤 게시물 조회 오류:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };

    } catch (error) {
      console.error('위즈덤 게시물 조회 예외:', error);
      return { data: [], error: { message: '위즈덤 게시물 조회 중 오류가 발생했습니다.' } };
    }
  }

  /**
   * 표현행위 추가/변경
   */
  static async addReaction(postId: string, reactionType: 'honor' | 'recommend' | 'respect' | 'hug'): Promise<{ error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { error: { message: '인증이 필요합니다.' } };
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
          return { error };
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
          return { error };
        }
      }

      console.log(`표현행위 완료: ${reactionType} for post ${postId}`);
      return { error: null };

    } catch (error) {
      console.error('표현행위 예외:', error);
      return { error: { message: '표현행위 중 오류가 발생했습니다.' } };
    }
  }
}