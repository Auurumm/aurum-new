import React, { useState, useEffect, useRef } from "react";
import { WisdomService, WisdomPost, fetchWisdomPosts } from "../../services/WisdomService.ts";
import { supabase } from "../../lib/supabase.ts";

interface WisdomCardGridProps {
  isWisdomCompleted?: boolean;
  onAllReactionsComplete?: () => void;
  requireAuth?: boolean;
  onAuthRequired?: () => boolean;
  newWisdomPost?: WisdomPost | null;
}

interface ReactionHistoryItem {
  id: string;
  name: string;
  gender: string;
  age: number;
  company: string;
  avatar_url: string;
  reaction: string;
  created_at: string;
}

type ReactionType = 'honor' | 'recommend' | 'respect' | 'hug';

// 상수 정의
const REACTION_LIMITS = {
  honor: 1,
  recommend: 3,
  respect: 5,
  hug: 3
} as const;

const TOTAL_REACTIONS_REQUIRED = 12;
const POPUP_CLOSE_DELAY = 3000;

const REACTION_ICONS: Record<ReactionType, string> = {
  honor: "/images/honor-icon.png",
  recommend: "/images/recommend-icon.png",
  respect: "/images/respect-icon.png",
  hug: "/images/hug-icon.png"
};

const REACTION_LABELS: Record<ReactionType, string> = {
  honor: "경의",
  recommend: "추천",
  respect: "존중",
  hug: "응원"
};

const REACTION_KEY_MAP: Record<string, ReactionType> = {
  "경의": "honor",
  "추천": "recommend",
  "존중": "respect",
  "응원": "hug"
};

export const WisdomCardGrid = ({
  isWisdomCompleted = false,
  onAllReactionsComplete,
  requireAuth = false,
  onAuthRequired,
  newWisdomPost
}: WisdomCardGridProps): JSX.Element => {
  // 카드 상태
  const [selectedCard, setSelectedCard] = useState<WisdomPost | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [isCompletePopup, setIsCompletePopup] = useState(false);
  const [modalTopPosition, setModalTopPosition] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const prevReactionCountRef = useRef<number>(0); // ✅ 추가
  const scrollPositionRef = useRef<number>(0);
  const [showAll, setShowAll] = useState(false);


  // 위즈덤 포스트 상태
  const [wisdomPosts, setWisdomPosts] = useState<WisdomPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 표시할 포스트 결정
  const displayedPosts = showAll ? wisdomPosts : wisdomPosts.slice(0, 12);
  const hasMore = wisdomPosts.length > 12

  // 히스토리 상태
  const [reactionHistory, setReactionHistory] = useState<ReactionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 반응 사용 횟수 상태
  const [reactionUsage, setReactionUsage] = useState<Record<ReactionType, number>>({
    honor: 0,
    recommend: 0,
    respect: 0,
    hug: 0
  });

  const [showDefaultWarning, setShowDefaultWarning] = useState(false);
  const [showAlertImage, setShowAlertImage] = useState(false);
  const [userReactedPosts, setUserReactedPosts] = useState<Map<string, ReactionType>>(new Map());


  // 초기 위즈덤 포스트 로드
  useEffect(() => {
    loadWisdomPosts();
  }, []);

  // 새 포스트가 추가되었을 때 리스트에 반영
  useEffect(() => {
    if (newWisdomPost) {
      setWisdomPosts(prev => [newWisdomPost, ...prev]);
    }
  }, [newWisdomPost]);

  // 선택된 카드의 히스토리 로드
  useEffect(() => {
    if (selectedCard) {
      loadReactionHistory(selectedCard.id);
    } else {
      setReactionHistory([]);
    }
  }, [selectedCard]);

  // 사용자의 반응 사용 현황 로드
  useEffect(() => {
    loadUserReactionUsage();
  }, []);

  // 모달이 열릴 때 스크롤 위치 저장 및 조정
  useEffect(() => {
    if (selectedCard && modalTopPosition > 0) {
      // 현재 스크롤 위치 저장
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
      
      const scrollToModal = () => {
        const targetScrollTop = modalTopPosition - 80;
        window.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      };
      setTimeout(scrollToModal, 150);
    }
  }, [selectedCard, modalTopPosition]);

  // 토스트 팝업이 뜰 때 자동 스크롤 처리
  useEffect(() => {
    if (showReactionPopup) {
      const scrollToToastPosition = () => {
        const targetScrollTop = Math.max(0, modalTopPosition + 100);
        window.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      };
      setTimeout(scrollToToastPosition, 100);
      setTimeout(scrollToToastPosition, 300);
    }
  }, [showReactionPopup, modalTopPosition]);

  // 기존 useEffect들 아래에 추가
  useEffect(() => {
    loadUserReactedPosts();
  }, []);

  // 기존 useEffect (11번째 달성 순간 감지)
  useEffect(() => {
    if (prevReactionCountRef.current < 11 && reactionCount === 11) {
      setShowAlertImage(true);
      setTimeout(() => setShowAlertImage(false), 3000);
    }
    prevReactionCountRef.current = reactionCount;
  }, [reactionCount]);

  // ✅ 추가: 카드를 열 때도 11번째 상태면 alert 표시
  useEffect(() => {
    if (selectedCard && reactionCount === 11) {
      setShowAlertImage(true);
      setTimeout(() => setShowAlertImage(false), 3000);
    }
  }, [selectedCard]);

  // ✅ 추가: selectedCard가 열릴 때 히스토리 관리
  useEffect(() => {
    if (!selectedCard) return;

    // 히스토리에 모달 상태 추가
    window.history.pushState({ modal: 'wisdom-detail' }, '', window.location.href);

    // 뒤로 가기 이벤트 처리
    const handlePopState = () => {
      closeModal();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedCard]);

  // 위즈덤 포스트 로드
  const loadWisdomPosts = async () => {
    try {
      setLoading(true);
      const posts = await fetchWisdomPosts();
      setWisdomPosts(posts);
    } catch (error) {
      console.error('위즈덤 포스트 로딩 실패:', error);
      setWisdomPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 반응 사용 현황 로드
  const loadUserReactionUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const limits = await WisdomService.checkReactionLimits(user.id);

      setReactionUsage({
        honor: limits.honor,
        recommend: limits.recommend,
        respect: limits.respect,
        hug: limits.hug
      });

      // ✅ 총 반응 횟수도 설정
      const totalCount = limits.honor + limits.recommend + limits.respect + limits.hug;
      setReactionCount(totalCount);

      console.log('현재 반응 사용 횟수:', limits);
      console.log('총 반응 횟수:', totalCount);
    } catch (error) {
      console.error('반응 사용 현황 로드 중 오류:', error);
    }
  };

  // 사용자가 표현행위를 보낸 카드 목록 로드
  const loadUserReactedPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data, error } = await supabase
        .from('wisdom_reactions')
        .select('wisdom_post_id, reaction_type')
        .eq('user_id', user.id);
  
      if (error) {
        console.error('표현행위 보낸 카드 로드 실패:', error);
        return;
      }
  
      const reactedMap = new Map(
        data?.map(item => [item.wisdom_post_id, item.reaction_type as ReactionType]) || []
      );
      setUserReactedPosts(reactedMap);
    } catch (error) {
      console.error('표현행위 보낸 카드 로드 중 오류:', error);
    }
  };

  // 반응 히스토리 로드
  const loadReactionHistory = async (postId: string) => {
    try {
      setLoadingHistory(true);
      const { data, error } = await WisdomService.getReactionHistory(postId);

      if (error || !data) {
        console.error('히스토리 로드 실패:', error);
        setReactionHistory([]);
        return;
      }

      const formattedHistory: ReactionHistoryItem[] = data.map(item => ({
        id: item.id,
        name: item.profile?.username || item.profile?.full_name || '사용자',
        gender: item.profile?.gender || '남',
        age: item.profile?.age || 23,
        company: item.profile?.company || '회사명',
        avatar_url: item.profile?.avatar_url || '/images/Ellipse 79.png',
        reaction: REACTION_LABELS[item.reaction_type as ReactionType] || item.reaction_type,
        created_at: item.created_at
      }));

      setReactionHistory(formattedHistory);
    } catch (error) {
      console.error('히스토리 로드 예외:', error);
      setReactionHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 타임스탬프 포맷팅
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}. ${month}. ${day}(${dayName}) ${hours}:${minutes}`;
  };

  // 카드를 표시용으로 변환
  const convertToDisplayCard = (post: WisdomPost) => {
    const userName = post.profile?.username || post.profile?.full_name || '사용자';
    const avatarUrl = post.profile?.avatar_url || '/images/boy.png';
    const gender = post.profile?.gender || '남';
    const age = post.profile?.age || 23;
    const company = post.profile?.company || '회사명';

    const userInfo = `${userName} / ${gender} / ${age} / ${company}`;

    return {
      ...post,
      userInfo,
      userName,
      avatarUrl,
      timestamp: formatTimestamp(post.created_at)
    };
  };

  // 카드 클릭 핸들러
  const handleCardClick = (post: WisdomPost, event: React.MouseEvent<HTMLElement>) => {
    const clickedElement = event.currentTarget;
    const elementRect = clickedElement.getBoundingClientRect();
    const elementTop = elementRect.top + window.pageYOffset;

    setModalTopPosition(Math.max(50, elementTop - 50));
    
    // 이미 모달이 열려있는 경우 히스토리 중복 추가 방지
    if (!selectedCard) {
      setSelectedCard(post);
    } else {
      // 다른 카드 선택 시 히스토리는 유지하고 카드만 변경
      setSelectedCard(post);
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedCard(null);
    setSelectedReaction(null);
    setModalTopPosition(0);
    
    // ✅ 스크롤을 최상단으로 이동 (헤더가 보이도록)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // ✅ 확실하게 최상단 고정
    setTimeout(() => {
      window.scrollTo({ top: 0 });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  };
  // 반응 선택 핸들러
  const handleReactionSelect = (reactionType: ReactionType) => {
    setSelectedReaction(reactionType);
  };

  // 표현 행위 전송 핸들러
  const handleSendReaction = async () => {
    // 1단계 완료 체크
    if (!isWisdomCompleted) {
      alert("1단계를 먼저 완료해주세요!");
      return;
    }

    // 반응 선택 체크 - 수정된 부분
    if (!selectedReaction || !selectedCard) {
      setShowDefaultWarning(true); // ✅ 이미지 표시
      setTimeout(() => setShowDefaultWarning(false), 3000); // 3초 후 자동 숨김
      return;
    }

    // 반응 제한 체크
    const currentUsage = reactionUsage[selectedReaction];
    const limit = REACTION_LIMITS[selectedReaction];

    if (currentUsage >= limit) {
      const limitText = {
        honor: '경의는 1명',
        recommend: '추천은 3명',
        respect: '존중은 5명',
        hug: '응원은 3명'
      };
      alert(`⚠️ ${limitText[selectedReaction]}까지만 부여할 수 있습니다.\n현재 ${currentUsage}/${limit} 사용 중입니다.`);
      return;
    }

    // 인증 체크
    if (requireAuth && onAuthRequired && !onAuthRequired()) {
      return;
    }

    try {
      const reactionField = `${selectedReaction}_count` as keyof Pick<WisdomPost, 'honor_count' | 'recommend_count' | 'respect_count' | 'hug_count'>;
      const currentCount = selectedCard[reactionField];

      const { error } = await WisdomService.addReaction(selectedCard.id, selectedReaction);

      if (error) {
        handleReactionError(error);
        return;
      }

      // 성공 처리
      await handleReactionSuccess(selectedReaction, reactionField, currentCount);

    } catch (error) {
      console.error('표현행위 전송 중 예외 발생:', error);
      handleUnexpectedError(error);
    }
  };

  // 반응 전송 에러 처리
  const handleReactionError = (error: Error) => {
    let userMessage = '표현행위 전송에 실패했습니다.';

    if (error.message.includes('이미 이 게시물에 반응')) {
      userMessage = '⚠️ 이미 이 게시물에 표현행위를 보냈습니다.\n다른 게시물을 선택해주세요.';
    } else if (error.message.includes('본인의 게시물')) {
      userMessage = '⚠️ 본인이 작성한 위즈덤에는 표현행위를 할 수 없습니다.\n다른 크루의 위즈덤을 선택해주세요.';
    } else if (error.message.includes('위즈덤을 먼저 작성')) {
      userMessage = '⚠️ 먼저 1단계에서 위즈덤을 작성해주세요.';
    } else if (error.message.includes('로그인')) {
      userMessage = '⚠️ 로그인이 필요합니다.';
    }

    console.error('표현행위 전송 실패:', error);
    alert(userMessage);
  };

  // 예상치 못한 에러 처리
  const handleUnexpectedError = (error: unknown) => {
    let errorMessage = '표현행위 전송 중 오류가 발생했습니다.';

    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        errorMessage = '⚠️ 네트워크 연결을 확인해주세요.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '⚠️ 서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
      }
    }

    alert(errorMessage);
  };

  // 반응 전송 성공 처리
  const handleReactionSuccess = async (
    reactionType: ReactionType,
    reactionField: keyof Pick<WisdomPost, 'honor_count' | 'recommend_count' | 'respect_count' | 'hug_count'>,
    currentCount: number
  ) => {
    if (!selectedCard) return;

    // ✅ userReactedPosts 즉시 업데이트
    setUserReactedPosts(prev => {
      const newMap = new Map(prev);
      newMap.set(selectedCard.id, reactionType);
      return newMap;
    });

    // 로컬 상태 업데이트
    setWisdomPosts(prev => prev.map(post =>
      post.id === selectedCard.id
        ? { ...post, [reactionField]: currentCount + 1 }
        : post
    ));

    setSelectedCard(prev => prev ? { ...prev, [reactionField]: currentCount + 1 } : null);

    // 히스토리 즉시 다시 로드
    await loadReactionHistory(selectedCard.id);

    // ✅ 서버에서 최신 반응 사용 현황 다시 로드
    await loadUserReactionUsage();

    // 완료 체크 - reactionCount는 loadUserReactionUsage에서 업데이트됨
    // useEffect로 처리하거나 여기서 직접 체크
    const newCount = reactionCount + 1; // 임시로 계산
    setIsCompletePopup(newCount >= TOTAL_REACTIONS_REQUIRED);
    setShowReactionPopup(true);

    // 자동 닫기
    setTimeout(() => {
      closeReactionPopup();
    }, POPUP_CLOSE_DELAY);
  };

  // 표현행위 취소 핸들러
  const handleCancelReaction = async () => {
    if (!selectedCard) return;
  
    // ✅ 12번 완료 후에는 취소 불가
    if (reactionCount >= TOTAL_REACTIONS_REQUIRED) {
      alert('⚠️ 모든 표현행위가 완료되어 더 이상 취소할 수 없습니다.');
      return;
    }
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const userReactionType = userReactedPosts.get(selectedCard.id);
      if (!userReactionType) {
        alert('취소할 표현행위를 찾을 수 없습니다.');
        return;
      }
  
      const { error } = await WisdomService.removeReaction(selectedCard.id, user.id);
  
      if (error) {
        console.error('표현행위 취소 실패:', error);
        alert('표현행위 취소에 실패했습니다.');
        return;
      }
  
      setShowAlertImage(false);
  
      setUserReactedPosts(prev => {
        const newMap = new Map(prev);
        newMap.delete(selectedCard.id);
        return newMap;
      });
  
      const reactionField = `${userReactionType}_count` as keyof Pick<WisdomPost, 'honor_count' | 'recommend_count' | 'respect_count' | 'hug_count'>;
      const currentCount = selectedCard[reactionField];
  
      setWisdomPosts(prev => prev.map(post =>
        post.id === selectedCard.id
          ? { ...post, [reactionField]: Math.max(0, currentCount - 1) }
          : post
      ));
  
      setSelectedCard(prev => prev ? { 
        ...prev, 
        [reactionField]: Math.max(0, currentCount - 1) 
      } : null);
  
      await loadReactionHistory(selectedCard.id);
      await loadUserReactionUsage();
      
      alert('표현행위가 취소되었습니다.');
      closeModal();
    } catch (error) {
      console.error('표현행위 취소 중 오류:', error);
      alert('표현행위 취소 중 오류가 발생했습니다.');
    }
  };

  // 반응 팝업 닫기
  const closeReactionPopup = () => {
    setShowReactionPopup(false);

    if (isCompletePopup && reactionCount >= TOTAL_REACTIONS_REQUIRED && onAllReactionsComplete) {
      setSelectedCard(null);
      setSelectedReaction(null);

      // ✅ 개선: 즉시 최상단으로 스크롤 시작
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // ✅ 추가: 확실하게 최상단 고정 (여러 번 시도)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 300);

      onAllReactionsComplete();
    }
  };

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[500px]">
        <div className="text-white text-xl">위즈덤 포스트를 불러오는 중...</div>
      </div>
    );
  }

  // 데이터가 없을 때 표시
  if (wisdomPosts.length === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-[500px]">
        <div className="text-white text-xl">아직 등록된 위즈덤 포스트가 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ 진행 상황 표시 */}
      <div className="w-full flex justify-center mb-8">
        <div className="px-8 py-4 bg-[#3B4236] rounded-full border border-[#ADFF00]">
          <div className="text-white text-xl font-bold">
            표현행위 진행: <span className="text-[#ADFF00]">{reactionCount}</span>/{TOTAL_REACTIONS_REQUIRED}
          </div>
        </div>
      </div>
  
      {/* 반응형 카드 그리드 */}
      <div className="w-full flex flex-col items-center mb-[120px]">
        <CardGrid
          wisdomPosts={displayedPosts}
          onCardClick={handleCardClick}
          convertToDisplayCard={convertToDisplayCard}
          userReactedPosts={userReactedPosts}  // ✅ 이 줄 추가
        />
        
        {/* 더보기 버튼 */}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-8 text-white text-lg font-medium underline hover:text-gray-300 transition-colors"
          >
            더보기...
          </button>
        )}
      </div>
  
      {/* 나머지 코드는 동일... */}

      {/* 상세 모달 */}
      {selectedCard && (
        <DetailModal
          selectedCard={selectedCard}
          selectedReaction={selectedReaction}
          reactionUsage={reactionUsage}
          reactionCount={reactionCount}  // ✅ 이 줄 추가
          reactionHistory={reactionHistory}
          loadingHistory={loadingHistory}
          modalTopPosition={modalTopPosition}
          modalRef={modalRef}
          showDefaultWarning={showDefaultWarning}
          showAlertImage={showAlertImage}
          userReactionType={userReactedPosts.get(selectedCard.id) || null}
          onClose={closeModal}
          onReactionSelect={handleReactionSelect}
          onSendReaction={handleSendReaction}
          onCancelReaction={handleCancelReaction}
          formatTimestamp={formatTimestamp}
          convertToDisplayCard={convertToDisplayCard}
        />
      )}

      {/* 표현행위 완료 토스트 팝업 */}
      {showReactionPopup && (
        <ReactionPopup
          isComplete={isCompletePopup}
          reactionCount={reactionCount}
          modalTopPosition={modalTopPosition}
          onClose={closeReactionPopup}
        />
      )}
    </>
  );
};

// CardGrid 컴포넌트
const CardGrid = ({
  wisdomPosts,
  onCardClick,
  convertToDisplayCard,
  userReactedPosts  // ✅ 추가
}: {
  wisdomPosts: WisdomPost[];
  onCardClick: (post: WisdomPost, event: React.MouseEvent<HTMLElement>) => void;
  convertToDisplayCard: (post: WisdomPost) => any;
  userReactedPosts: Map<string, ReactionType>;  // ✅ 추가
}) => (
  <div className="w-full flex justify-center mb-[120px]">
    <div className="w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
      {/* 데스크탑 레이아웃 */}
      <DesktopCardLayout
        wisdomPosts={wisdomPosts}
        onCardClick={onCardClick}
        convertToDisplayCard={convertToDisplayCard}
        userReactedPosts={userReactedPosts}  // ✅ 추가
      />

      {/* 모바일/태블릿 레이아웃 */}
      <MobileCardLayout
        wisdomPosts={wisdomPosts}
        onCardClick={onCardClick}
        convertToDisplayCard={convertToDisplayCard}
        userReactedPosts={userReactedPosts}  // ✅ 추가
      />
    </div>
  </div>
);

// 데스크탑 카드 레이아웃
const DesktopCardLayout = ({
  wisdomPosts,
  onCardClick,
  convertToDisplayCard,
  userReactedPosts  // ✅ 추가
}: {
  wisdomPosts: WisdomPost[];
  onCardClick: (post: WisdomPost, event: React.MouseEvent<HTMLElement>) => void;
  convertToDisplayCard: (post: WisdomPost) => any;
  userReactedPosts: Map<string, ReactionType>;  // ✅ 추가
}) => {
  const [columnsPerRow, setColumnsPerRow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1440) {
        setColumnsPerRow(3);
      } else if (window.innerWidth >= 1024) {
        setColumnsPerRow(2);
      } else if (window.innerWidth >= 768) {
        setColumnsPerRow(2);
      } else {
        setColumnsPerRow(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="hidden lg:block">
      <div className="inline-flex flex-col justify-start items-center gap-3.5 w-full">
        {Array(Math.ceil(wisdomPosts.length / columnsPerRow)).fill(null).map((_, rowIndex) => (
          <div key={rowIndex} className="w-full inline-flex justify-center items-center gap-3.5">
            {wisdomPosts.slice(rowIndex * columnsPerRow, (rowIndex + 1) * columnsPerRow).map((post) => {
              const card = convertToDisplayCard(post);
              const isCompleted = userReactedPosts.has(post.id);  // ✅ 추가
              return (
                <WisdomCard
                  key={post.id}
                  post={post}
                  card={card}
                  onClick={(e) => onCardClick(post, e)}
                  isCompleted={isCompleted}  // ✅ 추가
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// 모바일 카드 레이아웃
const MobileCardLayout = ({
  wisdomPosts,
  onCardClick,
  convertToDisplayCard,
  userReactedPosts  // ✅ 추가
}: {
  wisdomPosts: WisdomPost[];
  onCardClick: (post: WisdomPost, event: React.MouseEvent<HTMLElement>) => void;
  convertToDisplayCard: (post: WisdomPost) => any;
  userReactedPosts: Map<string, ReactionType>;  // ✅ 추가
}) => (
  <div className="lg:hidden pl-3">
    <div className="flex flex-col gap-6">
      {wisdomPosts.map((post) => {
        const card = convertToDisplayCard(post);
        const isCompleted = userReactedPosts.has(post.id);  // ✅ 추가
        return (
          <MobileWisdomCard
            key={post.id}
            post={post}
            card={card}
            onClick={(e) => onCardClick(post, e)}
            isCompleted={isCompleted}  // ✅ 추가
          />
        );
      })}
    </div>
  </div>
);

// 위즈덤 카드 컴포넌트 (데스크탑)
const WisdomCard = ({
  post,
  card,
  onClick,
  isCompleted = false
}: {
  post: WisdomPost;
  card: any;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  isCompleted?: boolean;
}) => (
  <div
    className={`relative w-[470px] h-[523px] p-[25px] rounded-[20px] border
              inline-flex flex-col justify-start items-center gap-[35px] cursor-pointer
              transition-all duration-200
              ${isCompleted 
                ? 'bg-[#3B4236]/60 border-[#ADFF00]' 
                : 'bg-[#3B4236] border-[#141612] hover:border-[#ADFF00]/50'
              }`}
    onClick={onClick}
  >
    {isCompleted && (
      <div className="absolute top-6 right-6 px-4 py-2 bg-[#ADFF00] rounded-full z-10">
        <span className="text-[#1C1F18] text-sm font-bold">완료</span>
      </div>
    )}
    
    <div className="self-stretch flex flex-col justify-start items-center gap-5">
      <CardHeader card={card} />
      <CardContent post={post} timestamp={card.timestamp} />
      <div className="w-[420px] h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
      <ReactionStats post={post} />
      <div className="w-[420px] h-14 px-9 py-3 bg-[#1C1F18]/60 border-t border-b border-white/20 
                    inline-flex justify-center items-center gap-2.5 cursor-pointer mt-[10px]">
        <div className="text-white text-xl font-semibold leading-9">자세히 보기</div>
      </div>
    </div>
  </div>
);

// 모바일 위즈덤 카드
const MobileWisdomCard = ({
  post,
  card,
  onClick,
  isCompleted = false
}: {
  post: WisdomPost;
  card: any;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  isCompleted?: boolean;
}) => (
  <div
    className={`relative w-[323px] mx-auto rounded-[20px] outline outline-1 outline-offset-[-0.50px]
              p-6 flex flex-col gap-9 cursor-pointer transition-all duration-200
              ${isCompleted 
                ? 'bg-[#3B4236]/60 outline-[#ADFF00]' 
                : 'bg-[#3B4236] outline-neutral-900'
              }`}
    onClick={onClick}
  >
    {isCompleted && (
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#ADFF00] rounded-full z-10">
        <span className="text-[#1C1F18] text-xs font-bold">완료</span>
      </div>
    )}
    
    <div className="flex flex-col justify-start items-center gap-5">
      <div className="w-full flex flex-col justify-start items-start gap-4">
        <CardHeader card={card} isMobile />
        <CardContent post={card} timestamp={card.timestamp} isMobile />
      </div>
      <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
      <ReactionStats post={post} isMobile />
      <button className="w-full h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 
                       backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 
                       cursor-pointer hover:bg-stone-800/60 transition-colors">
        <div className="text-white text-xl font-semibold leading-9">자세히 보기</div>
      </button>
    </div>
  </div>
);

// 카드 헤더
const CardHeader = ({ card, isMobile = false }: { card: any; isMobile?: boolean }) => (
  <div className={`${isMobile ? 'w-full' : ''} inline-flex justify-start items-center gap-3.5`}>
    <img 
      className="w-12 h-12 rounded-full object-cover object-center" 
      src={card.avatarUrl} 
      alt="프로필 이미지" 
    />
    <div className={`${isMobile ? 'flex-1 min-w-0' : 'w-[408px]'} text-neutral-400 text-sm font-medium leading-tight truncate`}>
      {card.userInfo}
    </div>
  </div>
);

// 카드 내용
const CardContent = ({
  post,
  timestamp,
  isMobile = false
}: {
  post: WisdomPost;
  timestamp: string;
  isMobile?: boolean;
}) => (
  <div className={`${isMobile ? 'w-full' : 'w-[408px]'} flex flex-col justify-start items-start gap-3.5`}>
    <div className="self-stretch text-white text-xl font-semibold leading-9 truncate">- {post.request_a}</div>
    <div className="self-stretch text-white text-xl font-semibold leading-9 truncate">- {post.request_b}</div>
    <div className="self-stretch text-white text-xl font-semibold leading-9 truncate">- {post.request_c}</div>
    <div className="text-neutral-400 text-sm font-semibold capitalize leading-none">{timestamp}</div>
  </div>
);

// 반응 통계
const ReactionStats = ({ post, isMobile = false }: { post: WisdomPost; isMobile?: boolean }) => {
  const reactions = [
    { type: 'honor', count: post.honor_count, icon: REACTION_ICONS.honor, label: REACTION_LABELS.honor },
    { type: 'recommend', count: post.recommend_count, icon: REACTION_ICONS.recommend, label: REACTION_LABELS.recommend },
    { type: 'respect', count: post.respect_count, icon: REACTION_ICONS.respect, label: REACTION_LABELS.respect },
    { type: 'hug', count: post.hug_count, icon: REACTION_ICONS.hug, label: REACTION_LABELS.hug }
  ];

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-4 gap-2">
          {reactions.map(({ icon, count, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <img className="w-7 h-7" src={icon} alt={label} />
              <div className="text-center text-white text-3xl font-bold leading-10">{count}</div>
              <div className="text-center text-gray-400 text-sm font-semibold capitalize leading-none">{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="self-stretch bg-neutral-900 rounded-[20px] inline-flex justify-center items-center">
      {reactions.map(({ icon, count, label }) => (
        <div key={label} className="w-28 p-3.5 bg-[#3B4236] inline-flex flex-col justify-center items-center gap-[5px]">
          <img className="w-7 h-7" src={icon} alt={label} />
          <div className="self-stretch flex flex-col justify-center items-center">
            <div className="text-center text-white text-3xl font-bold leading-10">{count}</div>
            <div className="text-center text-gray-400 text-sm font-semibold leading-none">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 상세 모달
const DetailModal = ({
  selectedCard,
  selectedReaction,
  reactionUsage,
  reactionCount,  // ✅ 이 줄 추가
  reactionHistory,
  loadingHistory,
  modalTopPosition,
  modalRef,
  showDefaultWarning,
  showAlertImage,
  userReactionType,
  onClose,
  onReactionSelect,
  onSendReaction,
  onCancelReaction,
  formatTimestamp,
  convertToDisplayCard
}: any) => {
  // ... 나머지 코드
  const hasUserReacted = !!userReactionType;
  const card = convertToDisplayCard(selectedCard);

  const handleBackdropClick = () => {
    // 히스토리를 고려한 닫기
    if (window.history.state?.modal === 'wisdom-detail') {
      window.history.back();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-2 sm:px-4 overflow-x-hidden bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[589px] 
                  bg-[#3B4236] rounded-[20px] 
                  outline outline-1 outline-offset-[-1px] outline-stone-500 
                  my-4 sm:my-6 lg:my-8 
                  p-4 sm:p-6 lg:p-[45px] relative" // ✅ relative 추가
        style={{
          marginTop: `${modalTopPosition}px`,
          marginBottom: '10px'
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="inline-flex flex-col justify-start items-center gap-6 lg:gap-[10px]">
          <ModalHeader 
            card={card} 
            onClose={onClose}
            hasUserReacted={hasUserReacted}  // ✅ 추가
            onCancelReaction={onCancelReaction}  // ✅ 추가
          />
          <ModalContent selectedCard={selectedCard} formatTimestamp={formatTimestamp} />
          <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
          
          <ReactionSelector
            selectedCard={selectedCard}
            selectedReaction={selectedReaction}
            userReactionType={userReactionType}
            reactionCount={reactionCount}  // ✅ 추가
            onReactionSelect={onReactionSelect}
            onCancelReaction={onCancelReaction}
          />

          {/* ✅ 상대 위치 컨테이너로 감싸기 */}
          <div className="relative w-full flex flex-col items-center">
            {/* ✅ Alert 이미지 (11번째 완료 후) - 버튼 위에 절대 위치 */}
            {showAlertImage && (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
                <img src="/images/alert.png" alt="마지막 표현행위" className="w-64 h-[150px] scale-150 transform" />
              </div>
            )}
            {/* ✅ Default 경고 이미지 - 버튼 위에 절대 위치 */}
            {showDefaultWarning && (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
                <img src="/images/default.png" alt="표현행위를 선택해주세요" className="w-64 h-[150px]" />
              </div>
            )}
            
            <SendReactionButton
              selectedReaction={selectedReaction}
              onSendReaction={onSendReaction}
            />
          </div>

          <ReactionHistory
            reactionHistory={reactionHistory}
            loadingHistory={loadingHistory}
          />
        </div>
      </div>
    </div>
  );
};

// 모달 헤더
const ModalHeader = ({ card, onClose, hasUserReacted, onCancelReaction }: any) => {
  const handleClose = () => {
    // 히스토리를 고려한 닫기
    if (window.history.state?.modal === 'wisdom-detail') {
      window.history.back();
    } else {
      onClose();
    }
  };
  
  return (
    <div className="w-full flex flex-col justify-start items-start gap-6">
      <div className="self-stretch inline-flex justify-between items-center gap-2.5">
        <div className="flex-1 flex justify-start items-center gap-3.5">
          <img className="w-12 h-12 rounded-full" src={card.avatarUrl} alt="프로필 이미지" />
          <div className="text-neutral-400 text-sm font-medium leading-tight">{card.userInfo}</div>
        </div>
        <button
          onClick={handleClose}
          className="w-6 h-6 relative overflow-hidden text-white hover:bg-[#3B4236] rounded flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// 모달 내용
const ModalContent = ({ selectedCard, formatTimestamp }: any) => (
  <div className="self-stretch flex flex-col justify-start items-start gap-3">
    <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
      <div className="self-stretch text-white text-base lg:text-xl font-extralight leading-relaxed lg:leading-9">
        - {selectedCard.request_a}
      </div>
      <div className="self-stretch text-white text-base lg:text-xl font-extralight leading-relaxed lg:leading-9 whitespace-pre-line">
        - {selectedCard.request_b}
      </div>
      <div className="self-stretch text-white text-base lg:text-xl font-extralight leading-relaxed lg:leading-9">
        - {selectedCard.request_c}
      </div>
    </div>
    <div className="self-stretch text-left text-neutral-400 text-sm font-extralight leading-tight">
      {formatTimestamp(selectedCard.created_at)}
    </div>
  </div>
);

{/* // 남은 횟수 표시
const RemainingReactionsDisplay = ({ reactionUsage }: { reactionUsage: Record<ReactionType, number> }) => (
  <div className="w-full px-4 py-3 bg-neutral-900/50 rounded-lg mb-2">
    <div className="text-center text-sm text-gray-300">
      <span className="font-semibold text-[#ADFF00]">남은 횟수</span>
      <div className="mt-1">
        경의: {REACTION_LIMITS.honor - reactionUsage.honor}/{REACTION_LIMITS.honor} | 
        추천: {REACTION_LIMITS.recommend - reactionUsage.recommend}/{REACTION_LIMITS.recommend} | 
        존중: {REACTION_LIMITS.respect - reactionUsage.respect}/{REACTION_LIMITS.respect} | 
        응원: {REACTION_LIMITS.hug - reactionUsage.hug}/{REACTION_LIMITS.hug}
      </div>
    </div>
  </div>
); */}

const ReactionSelector = ({ 
  selectedCard, 
  selectedReaction, 
  userReactionType,
  reactionCount,  // ✅ 추가
  onReactionSelect,
  onCancelReaction  
}: any) => {
  const reactions = [
    { type: 'honor', count: selectedCard.honor_count, icon: REACTION_ICONS.honor },
    { type: 'recommend', count: selectedCard.recommend_count, icon: REACTION_ICONS.recommend },
    { type: 'respect', count: selectedCard.respect_count, icon: REACTION_ICONS.respect },
    { type: 'hug', count: selectedCard.hug_count, icon: REACTION_ICONS.hug }
  ];

  // ✅ 12번 완료 여부 확인
  const isAllCompleted = reactionCount >= TOTAL_REACTIONS_REQUIRED;

  return (
    <div className="w-full bg-[#3B4236] rounded-[20px] flex justify-center items-center">
      <div className="w-full max-w-[320px] sm:max-w-sm lg:max-w-96 
                    h-auto sm:h-32 rounded-[20px] 
                    grid grid-cols-4 gap-1 sm:gap-0 sm:flex justify-center items-center 
                    p-2 sm:p-0">
        {reactions.map(({ type, count, icon }) => (
          <div key={type} className="relative w-full sm:w-auto">
            {/* ✅ 12번 완료 전에만 Cancel 버튼 표시 */}
            {userReactionType === type && !isAllCompleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelReaction();
                }}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 
                         w-5 h-5 sm:w-7 sm:h-7 z-10 
                         hover:opacity-80 transition-opacity"
                title="표현행위 취소"
              >
                <img src="/images/cancel.png" alt="취소" className="w-full h-full" />
              </button>
            )}
            
            {/* ✅ 12번 완료 시 완료 뱃지 표시 (선택사항) */}
            {userReactionType === type && isAllCompleted && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 
                            w-5 h-5 sm:w-6 sm:h-6 z-10 
                            bg-[#ADFF00] rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">✓</span>
              </div>
            )}
            
            <button
              onClick={() => !userReactionType && onReactionSelect(type as ReactionType)}
              disabled={!!userReactionType}
              className={`w-full sm:w-20 lg:w-28 
                        p-2 sm:p-2.5 lg:p-3.5 
                        inline-flex flex-col justify-center items-center 
                        gap-1 sm:gap-[5px] 
                        transition-all duration-200 ${
                selectedReaction === type || userReactionType === type
                  ? 'bg-lime-400/20 outline outline-1 outline-offset-[-1px] outline-lime-400'
                  : 'bg-[#3B4236] hover:bg-stone-600'
              }`}
            >
              <img className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" 
                   src={icon} 
                   alt={REACTION_LABELS[type as ReactionType]} />
              <div className="self-stretch flex flex-col justify-center items-center">
                <div className="text-center text-white 
                              text-lg sm:text-2xl lg:text-3xl 
                              font-bold leading-tight sm:leading-10">
                  {count}
                </div>
                <div className="text-center text-gray-400 
                              text-xs sm:text-sm 
                              font-semibold capitalize leading-none">
                  {REACTION_LABELS[type as ReactionType]}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 표현행위 보내기 버튼
const SendReactionButton = ({ selectedReaction, onSendReaction }: any) => (
  <button
    onClick={onSendReaction}
    className="w-full max-w-[320px] sm:max-w-sm lg:max-w-96 
               h-12 sm:h-14 
               px-6 sm:px-9 py-2.5 sm:py-3 
               bg-stone-900/60 border-t border-b border-white/20 
               backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 
               transition-all my-3 sm:my-[15px] cursor-pointer"
  >
    <div className="text-[#BEFF00] 
                  text-base sm:text-lg lg:text-xl 
                  font-semibold font-['Pretendard'] 
                  leading-tight sm:leading-9">
      표현행위 보내기
    </div>
  </button>
);

// 반응 히스토리
const ReactionHistory = ({ reactionHistory, loadingHistory }: any) => (
  <div
    className="history-scrollbar relative flex flex-col justify-start items-start gap-[15px] 
              w-full h-[250px] overflow-y-auto"
    style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#777777 transparent'
    }}
  >
    {loadingHistory ? (
      <div className="w-full flex justify-center items-center h-full">
        <div className="text-white text-sm">로딩 중...</div>
      </div>
    ) : reactionHistory.length === 0 ? (
      <div className="w-full flex justify-center items-center h-full">
        <div className="text-gray-400 text-sm">아직 표현행위가 없습니다.</div>
      </div>
    ) : (
      reactionHistory.map((item: ReactionHistoryItem) => (
        <div key={item.id} className="w-full flex flex-col justify-start items-start">
          <div className="w-full inline-flex justify-start items-center gap-3.5">
            <div className="flex-1 h-[50px] flex justify-start items-center gap-2">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={item.avatar_url}
                alt="프로필 이미지"
                onError={(e) => {
                  e.currentTarget.src = '/images/Ellipse 79.png';
                }}
              />
              <div className="flex-1 text-white text-sm font-medium leading-tight">
                {item.name} ({item.gender} / {item.age} / {item.company}) 님이 {item.reaction}을 부여하였습니다
              </div>
            </div>
            <img
              className="w-7 h-7"
              src={REACTION_ICONS[REACTION_KEY_MAP[item.reaction]]}
              alt={item.reaction}
            />
          </div>
        </div>
      ))
    )}
  </div>
);

// 반응 팝업
const ReactionPopup = ({
  isComplete,
  reactionCount,
  modalTopPosition,
  onClose
}: {
  isComplete: boolean;
  reactionCount: number;
  modalTopPosition: number;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4"
    style={{ paddingTop: `${modalTopPosition + 200}px` }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-md sm:max-w-lg px-6 sm:px-8 py-8 sm:py-12 bg-neutral-900 
                outline outline-2 outline-offset-[-1px] outline-[#ADFF00] rounded-[20px] text-center"
      onClick={(e) => e.stopPropagation()}
    >
      {isComplete ? (
        <div>
          <div className="text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-snug break-keep">
            모든 표현 보내기가<br className="sm:hidden" />
            완료 되었습니다!
          </div>
          <div className="text-gray-400 text-base sm:text-lg lg:text-2xl font-bold leading-snug mt-4 whitespace-nowrap">
            *수정이 어려워요
          </div>
        </div>
      ) : (
        <div>
          <div className="text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-snug break-keep">
            {reactionCount}번째 표현 보내기가<br className="sm:hidden" />
            완료 되었습니다.
          </div>
          <div className="text-[#ADFF00] text-base sm:text-lg lg:text-2xl font-bold leading-snug mt-4 break-keep">
            {TOTAL_REACTIONS_REQUIRED - reactionCount}번의<br className="sm:hidden" />
            표현 보내기 완료 후<br />
            자동으로 완료 처리 됩니다.
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ReactionPopup;