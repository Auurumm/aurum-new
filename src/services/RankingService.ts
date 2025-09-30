import { supabase } from '../lib/supabase.ts';

// 순위 데이터 인터페이스
export interface RankingData {
    id: string;
    user_id: string;
    honor_count: number;
    recommend_count: number;
    respect_count: number;
    hug_count: number;
    total_score: number;
    profile?: {
      username?: string;        // ✅ 사용자 설정 이름
      display_name?: string;    // ✅ 표시용 이름 (있다면)
      full_name?: string;       // 구글 이름
      avatar_url?: string;
      gender?: string;
      age?: number;
      company?: string;
    };
    rank: number;
  }

export class RankingService {
  /**
   * 실시간 순위 조회
   * @param limit 조회할 순위 개수 (기본값: 10)
   * @returns 순위 데이터 배열
   */
  static async getRankings(limit: number = 10): Promise<RankingData[]> {
    try {
      const { data, error } = await supabase
        .from('wisdom_posts')
        .select(`
          id,
          user_id,
          honor_count,
          recommend_count,
          respect_count,
          hug_count,
          profile:profiles!wisdom_posts_user_id_fkey (
            full_name,
            username,
            avatar_url,
            gender,
            age,
            company
          )
        `)
        .order('honor_count', { ascending: false })
        .order('recommend_count', { ascending: false })
        .order('respect_count', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('순위 조회 실패:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('순위 데이터 없음');
        return [];
      }

      // 총점 계산 및 순위 부여
      const rankedData = data.map((post, index) => {
        // profile이 배열로 올 수 있으므로 처리
        const profile = Array.isArray(post.profile) 
          ? post.profile[0] 
          : post.profile;

        return {
          ...post,
          profile: profile || undefined,
          total_score: 
            (post.honor_count || 0) + 
            (post.recommend_count || 0) + 
            (post.respect_count || 0) + 
            (post.hug_count || 0),
          rank: index + 1
        };
      });

      console.log(`✅ ${rankedData.length}개의 순위 데이터 로드 완료`);
      return rankedData;

    } catch (error) {
      console.error('getRankings 에러:', error);
      return [];
    }
  }

  /**
   * 특정 사용자의 순위 조회
   * @param userId 사용자 ID
   * @returns 사용자의 순위 데이터
   */
  static async getUserRanking(userId: string): Promise<RankingData | null> {
    try {
      // 전체 순위를 가져와서 해당 사용자 찾기
      const allRankings = await this.getRankings(100); // 충분히 많은 수
      const userRanking = allRankings.find(r => r.user_id === userId);
      
      return userRanking || null;
    } catch (error) {
      console.error('사용자 순위 조회 실패:', error);
      return null;
    }
  }

  /**
   * 실시간 순위 변동 구독
   * @param callback 순위 업데이트 시 호출될 콜백 함수
   * @returns 구독 해제 함수
   */
  static subscribeToRankingUpdates(
    callback: (rankings: RankingData[]) => void
  ): () => void {
    console.log('🔔 Realtime 구독 시작...');

    const channel = supabase
      .channel('wisdom_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 감지
          schema: 'public',
          table: 'wisdom_posts'
        },
        async (payload) => {
          console.log('🔄 wisdom_posts 변경 감지:', payload);
          
          // 변경 발생 시 순위 재조회
          const rankings = await RankingService.getRankings();
          callback(rankings);
        }
      )
      .subscribe((status) => {
        console.log('📡 구독 상태:', status);
      });

    // 구독 해제 함수 반환
    return () => {
      console.log('🔕 Realtime 구독 해제');
      supabase.removeChannel(channel);
    };
  }

  /**
   * 순위 변동 통계
   * @param userId 사용자 ID
   * @returns 순위 변동 정보
   */
  static async getRankingChange(userId: string): Promise<{
    currentRank: number;
    previousRank: number;
    change: number;
  } | null> {
    try {
      // 실제 구현시에는 별도 테이블에 히스토리를 저장하는 것이 좋습니다
      // 여기서는 단순화된 버전
      const currentRanking = await this.getUserRanking(userId);
      
      if (!currentRanking) return null;

      return {
        currentRank: currentRanking.rank,
        previousRank: currentRanking.rank, // 히스토리 테이블에서 가져와야 함
        change: 0
      };
    } catch (error) {
      console.error('순위 변동 조회 실패:', error);
      return null;
    }
  }

  /**
   * 표현행위별 상위 랭커 조회
   * @param reactionType 표현행위 타입
   * @param limit 조회할 개수
   */
  static async getTopByReaction(
    reactionType: 'honor' | 'recommend' | 'respect' | 'hug',
    limit: number = 5
  ): Promise<RankingData[]> {
    try {
      const countField = `${reactionType}_count`;
      
      const { data, error } = await supabase
        .from('wisdom_posts')
        .select(`
          id,
          user_id,
          honor_count,
          recommend_count,
          respect_count,
          hug_count,
          profile:profiles!wisdom_posts_user_id_fkey (
            full_name,
            username,
            avatar_url,
            gender,
            age,
            company
          )
        `)
        .order(countField, { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data) return [];

      return data.map((post, index) => {
        const profile = Array.isArray(post.profile) 
          ? post.profile[0] 
          : post.profile;

        return {
          ...post,
          profile: profile || undefined,
          total_score: 
            (post.honor_count || 0) + 
            (post.recommend_count || 0) + 
            (post.respect_count || 0) + 
            (post.hug_count || 0),
          rank: index + 1
        };
      });
    } catch (error) {
      console.error(`${reactionType} 상위 랭커 조회 실패:`, error);
      return [];
    }
  }
}