import React, { useState, useEffect, useRef } from "react";
import { WisdomService, WisdomPost } from "../../services/WisdomService.ts";

interface WisdomCardGridProps {
  isWisdomCompleted?: boolean;
  onAllReactionsComplete?: () => void;
  requireAuth?: boolean;
  onAuthRequired?: () => boolean;
  newWisdomPost?: WisdomPost | null; // 새로 제출된 위즈덤
}

export const WisdomCardGrid = ({ 
  isWisdomCompleted = false, 
  onAllReactionsComplete, 
  requireAuth = false, 
  onAuthRequired,
  newWisdomPost 
}: WisdomCardGridProps): JSX.Element => {
  const [selectedCard, setSelectedCard] = useState<WisdomPost | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [isCompletePopup, setIsCompletePopup] = useState(false);
  const [modalTopPosition, setModalTopPosition] = useState<number>(0);
  const [wisdomPosts, setWisdomPosts] = useState<WisdomPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // 표현 행위 아이콘 매핑
  const reactionIcons = {
    honor: "/images/honor-icon.png",
    recommend: "/images/recommend-icon.png", 
    respect: "/images/respect-icon.png",
    hug: "/images/hug-icon.png"
  };

  // 표현 행위 라벨 매핑
  const reactionLabels = {
    honor: "경의",
    recommend: "추천",
    respect: "존중", 
    hug: "응원"
  };

  // 더미 반응 히스토리 (나중에 실제 데이터로 교체)
  const reactionHistory = [
    { name: "윤하린", gender: "여", age: 24, company: "미래에셋대우증권주식회사", reaction: "경의" },
    { name: "정현우", gender: "남", age: 26, company: "카카오", reaction: "추천" },
    { name: "박하늘", gender: "여", age: 25, company: "배달의민족", reaction: "존중" },
    { name: "강시후", gender: "남", age: 22, company: "쿠팡", reaction: "경의" },
    { name: "김민지", gender: "여", age: 22, company: "카카오엔터테인먼트", reaction: "응원" }
  ];

  // 위즈덤 게시물 불러오기
  const loadWisdomPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await WisdomService.getAllWisdomPosts();
      
      if (error) {
        console.error('위즈덤 게시물 로드 실패:', error);
        return;
      }

      setWisdomPosts(data || []);
      console.log('위즈덤 게시물 로드 완료:', data?.length || 0, '개');
    } catch (error) {
      console.error('위즈덤 게시물 로드 예외:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadWisdomPosts();
  }, []);

  // 새 위즈덤 게시물이 추가되었을 때 목록 업데이트
  useEffect(() => {
    if (newWisdomPost) {
      setWisdomPosts(prev => [newWisdomPost, ...prev]);
      console.log('새 위즈덤 게시물 추가됨:', newWisdomPost.id);
    }
  }, [newWisdomPost]);

  // 타임스탬프 포맷팅 함수
  const formatTimestamp = (timestamp: string) => {
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

  // 카드를 WisdomPost 형식으로 변환
  const convertToDisplayCard = (post: WisdomPost) => {
    const userInfo = post.profile 
      ? `${post.profile.full_name || '사용자'} / 미상 / 미상 / 미상대 / 미상학과 / 미상 / 미상 / 미상 / 일반 / 미상`
      : "사용자 / 미상 / 미상 / 미상대 / 미상학과 / 미상 / 미상 / 미상 / 일반 / 미상";
    
    return {
      ...post,
      userInfo,
      content: [
        `- ${post.request_a}`,
        `- ${post.request_b}`,
        `- ${post.request_c}`
      ],
      timestamp: formatTimestamp(post.created_at),
      stats: {
        honor: post.honor_count,
        recommend: post.recommend_count,
        respect: post.respect_count,
        hug: post.hug_count
      }
    };
  };

  const handleCardClick = (post: WisdomPost, event: React.MouseEvent<HTMLElement>) => {
    if (!isWisdomCompleted) {
      alert("1단계를 먼저 완료해주세요!");
      return;
    }
    
    const clickedElement = event.currentTarget;
    const elementRect = clickedElement.getBoundingClientRect();
    const elementTop = elementRect.top + window.pageYOffset;
    
    setModalTopPosition(Math.max(50, elementTop - 50));
    setSelectedCard(post);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setSelectedReaction(null);
    setModalTopPosition(0);
  };

  const handleReactionSelect = (reactionType: string) => {
    setSelectedReaction(reactionType);
  };

  const handleSendReaction = async () => {
    if (!selectedReaction || !selectedCard) {
      alert("표현행위를 선택해주세요!");
      return;
    }
    
    // 인증 확인
    if (requireAuth && onAuthRequired && !onAuthRequired()) {
      return;
    }
    
    try {
      const { error } = await WisdomService.addReaction(
        selectedCard.id, 
        selectedReaction as 'honor' | 'recommend' | 'respect' | 'hug'
      );
      
      if (error) {
        console.error('표현행위 실패:', error);
        alert('표현행위 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }
      
      // 로컬 상태 업데이트
      setWisdomPosts(prev => prev.map(post => {
        if (post.id === selectedCard.id) {
          const updatedPost = { ...post };
          const reactionKey = `${selectedReaction}_count` as keyof WisdomPost;
          (updatedPost as any)[reactionKey] = ((post as any)[reactionKey] || 0) + 1;
          return updatedPost;
        }
        return post;
      }));
      
      // 선택된 카드도 업데이트
      const updatedCard = { ...selectedCard };
      const reactionKey = `${selectedReaction}_count` as keyof WisdomPost;
      (updatedCard as any)[reactionKey] = ((selectedCard as any)[reactionKey] || 0) + 1;
      setSelectedCard(updatedCard);
    
      // 테스트용: 2번째 반응에서 바로 12번째로 건너뛰기
      const newCount = reactionCount === 1 ? 12 : reactionCount + 1;
      setReactionCount(newCount);
      
      // 12번째 표현행위 완료 시 완료 팝업이 뜨도록 설정
      if (newCount >= 2) {
        setIsCompletePopup(true);
      } else {
        setIsCompletePopup(false);
      }
      
      setShowReactionPopup(true);
      
      // 3초 후 팝업 자동 닫기
      setTimeout(() => {
        closeReactionPopup();
      }, 3000);
      
    } catch (error) {
      console.error('표현행위 예외:', error);
      alert('표현행위 중 예상치 못한 오류가 발생했습니다.');
    }
  };

  // 모달이 열릴 때 스크롤 위치 조정
  useEffect(() => {
    if (selectedCard && modalTopPosition > 0) {
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
  }, [showReactionPopup]);

  const closeReactionPopup = () => {
    setShowReactionPopup(false);
    
    // 12번째 완료 후 팝업을 닫을 때 상위 컴포넌트에 알림
    if (isCompletePopup && reactionCount >= 12 && onAllReactionsComplete) {
      setSelectedCard(null);
      setSelectedReaction(null);
      
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 500);
      
      onAllReactionsComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ADFF00]"></div>
          <span className="text-white text-lg">위즈덤 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 표시할 카드들 (실제 데이터 + 더미 데이터로 12개 맞추기)
  const displayCards = [...wisdomPosts];
  
  // 12개보다 적으면 더미 데이터로 채우기
  while (displayCards.length < 12) {
    const dummyPost: WisdomPost = {
      id: `dummy-${displayCards.length}`,
      user_id: 'dummy-user',
      request_a: "소액으로 시작하는 미니 보험, 일상 속 작은 안전망이 되어줍니다.",
      request_b: "미니 보험은 소액으로 가입할 수 있어 누구나 부담 없이 이용 가능합니다. 일상 속 돌발 상황에 대비할 수 있고, 건강·여행·반려동물 등 테마별 보장으로 생활 전반에 안전망을 제공합니다.\n간단한 절차와 저렴한 비용이 강점입니다.",
      request_c: "소액으로 시작하는 미니 보험, 일상 속 작은 안전망이 되어줍니다.",
      honor_count: Math.floor(Math.random() * 30),
      recommend_count: Math.floor(Math.random() * 20),
      respect_count: Math.floor(Math.random() * 25),
      hug_count: Math.floor(Math.random() * 15),
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    };
    displayCards.push(dummyPost);
  }

  return (
    <>
      {/* 반응형 카드 그리드 */}
      <div className="w-full flex justify-center mb-[120px]">
        <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          
          {/* 데스크톱 레이아웃 (lg 이상) */}
          <div className="hidden lg:block">
            <div className="inline-flex flex-col justify-start items-center gap-3.5 w-full">
              {Array(4).fill(null).map((_, rowIndex) => (
                <div key={rowIndex} className="w-full inline-flex justify-center items-center gap-3.5">
                  {displayCards.slice(rowIndex * 3, (rowIndex + 1) * 3).map((post) => {
                    const card = convertToDisplayCard(post);
                    return (
                      <div 
                        key={post.id}
                        className={`w-full max-w-[380px] p-4 bg-stone-700 rounded-[20px] outline outline-1 outline-offset-[-0.50px] outline-neutral-900 inline-flex flex-col justify-start items-center gap-9 transition-opacity duration-300 ${
                          isWisdomCompleted ? 'opacity-100 cursor-pointer hover:bg-stone-600' : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={(e) => handleCardClick(post, e)}
                      >
                        <div className="w-full flex flex-col justify-start items-center gap-5">
                          
                          {/* 프로필 및 콘텐츠 섹션 */}
                          <div className="w-full flex flex-col justify-start items-start gap-4">
                            
                            {/* 프로필 */}
                            <div className="w-full inline-flex justify-start items-center gap-3.5">
                              <img 
                                className="w-12 h-12 rounded-full flex-shrink-0" 
                                src="/images/boy.png"
                                alt="프로필 이미지"
                              />
                              <div className="flex-1 min-w-0 text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight truncate">
                                {card.userInfo}
                              </div>
                            </div>
                            
                            {/* 콘텐츠 */}
                            <div className="w-full flex flex-col justify-start items-start gap-3.5">
                              {card.content.map((line, lineIndex) => (
                                <div 
                                  key={lineIndex}
                                  className="w-full text-white text-lg font-semibold font-['Pretendard'] leading-9 break-words"
                                  style={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                  title={line}
                                >
                                  {line}
                                </div>
                              ))}
                              <div className="text-neutral-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                {card.timestamp}
                              </div>
                            </div>
                          </div>
                          
                          {/* 구분선 */}
                          <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
                          
                          {/* 표현 행위 통계 */}
                          <div className="w-full bg-neutral-900 rounded-[20px] inline-flex justify-center items-center">
                            {Object.entries(card.stats).map(([type, value]) => (
                              <div 
                                key={type}
                                className="flex-1 p-3.5 bg-stone-700 inline-flex flex-col justify-center items-center gap-[5px]"
                              >
                                <img 
                                  className="w-7 h-7" 
                                  src={reactionIcons[type as keyof typeof reactionIcons]}
                                  alt={reactionLabels[type as keyof typeof reactionLabels]}
                                />
                                <div className="w-full flex flex-col justify-center items-center">
                                  <div className="text-center text-white text-3xl font-bold font-['Pretendard'] leading-10">
                                    {value as number}
                                  </div>
                                  <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                    {reactionLabels[type as keyof typeof reactionLabels]}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* 자세히 보기 버튼 */}
                          <button
                            disabled={!isWisdomCompleted}
                            className={`w-full h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 transition-colors ${
                              isWisdomCompleted 
                                ? 'cursor-pointer hover:bg-stone-800/60' 
                                : 'cursor-not-allowed'
                            }`}
                          >
                            <div className="text-white text-lg font-semibold font-['Pretendard'] leading-9">
                              자세히 보기
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 모바일/태블릿 레이아웃 (lg 미만) */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {displayCards.map((post) => {
                const card = convertToDisplayCard(post);
                return (
                  <div 
                    key={post.id}
                    className={`w-full bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 transition-all duration-300 ${
                      isWisdomCompleted ? 'opacity-100 cursor-pointer hover:bg-stone-600' : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={(e) => handleCardClick(post, e)}
                  >
                    
                    {/* 모바일 프로필 */}
                    <div className="w-full flex items-start gap-3">
                      <img 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" 
                        src="/images/boy.png"
                        alt="프로필 이미지"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm text-neutral-400 truncate font-['Pretendard']">
                          {card.userInfo}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1 font-['Pretendard']">
                          {card.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    {/* 모바일 콘텐츠 */}
                    <div className="w-full">
                      {card.content.slice(0, 2).map((line, lineIndex) => (
                        <p 
                          key={lineIndex}
                          className="text-sm sm:text-base text-white mb-2 font-['Pretendard'] leading-relaxed"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'keep-all'
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                    
                    {/* 모바일 통계 */}
                    <div className="w-full bg-neutral-900 rounded-[15px] p-3">
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(card.stats).map(([type, value]) => (
                          <div 
                            key={type}
                            className="flex flex-col items-center gap-1"
                          >
                            <img 
                              className="w-5 h-5 sm:w-6 sm:h-6" 
                              src={reactionIcons[type as keyof typeof reactionIcons]}
                              alt={reactionLabels[type as keyof typeof reactionLabels]}
                            />
                            <div className="text-center text-white text-lg font-bold font-['Pretendard']">
                              {value as number}
                            </div>
                            <div className="text-center text-gray-400 text-xs font-medium font-['Pretendard']">
                              {reactionLabels[type as keyof typeof reactionLabels]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 모바일 버튼 */}
                    <button
                      disabled={!isWisdomCompleted}
                      className={`w-full h-12 px-4 py-2 bg-stone-900/60 border border-white/20 backdrop-blur-[6px] rounded-lg inline-flex justify-center items-center transition-colors ${
                        isWisdomCompleted 
                          ? 'cursor-pointer hover:bg-stone-800/60' 
                          : 'cursor-not-allowed'
                      }`}
                    >
                      <div className="text-white text-base sm:text-lg font-semibold font-['Pretendard']">
                        자세히 보기
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 모달 - 클릭한 위치 기준 */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center px-4 overflow-x-hidden bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            ref={modalRef}
            className="w-full max-w-lg sm:max-w-2xl bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 my-8 max-h-[85vh] overflow-y-auto p-4 sm:p-7"
            style={{ 
              marginTop: `${modalTopPosition}px`,
              marginBottom: '32px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex flex-col gap-4 sm:gap-6">
              
              {/* 모달 헤더 */}
              <div className="w-full flex justify-between items-start gap-4">
                <div className="flex-1 flex items-start gap-3">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" 
                    src="/images/boy.png"
                    alt="프로필 이미지"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] truncate">
                      {convertToDisplayCard(selectedCard).userInfo}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-stone-600 rounded"
                >
                  ✕
                </button>
              </div>

              {/* 모달 콘텐츠 */}
              <div className="w-full">
                <div className="text-white text-base sm:text-xl font-semibold font-['Pretendard'] leading-relaxed mb-3">
                  {selectedCard.request_a}
                </div>
                <div className="text-white text-base sm:text-xl font-semibold font-['Pretendard'] leading-relaxed mb-3 whitespace-pre-line">
                  {selectedCard.request_b}
                </div>
                <div className="text-white text-base sm:text-xl font-semibold font-['Pretendard'] leading-relaxed mb-3">
                  {selectedCard.request_c}
                </div>
                <div className="text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] mt-4">
                  {formatTimestamp(selectedCard.created_at)}
                </div>
              </div>

              {/* 구분선 */}
              <div className="w-full h-0 border-t border-stone-500"></div>
              
              {/* 표현행위 선택 */}
              <div className="w-full bg-stone-700 rounded-[15px] sm:rounded-[20px] p-3 sm:p-4">
                <div className="grid grid-cols-4 gap-3">  
                  {[
                    { type: 'honor', count: selectedCard.honor_count },
                    { type: 'recommend', count: selectedCard.recommend_count },
                    { type: 'respect', count: selectedCard.respect_count },
                    { type: 'hug', count: selectedCard.hug_count }
                  ].map(({ type, count }) => (
                    <button
                      key={type}
                      onClick={() => handleReactionSelect(type)}
                      className={`p-3 flex flex-col items-center gap-2 transition-all duration-200 rounded-lg hover:bg-stone-600 ${
                        selectedReaction === type 
                          ? 'bg-[#ADFF00]/20 border-2 border-[#ADFF00]' 
                          : 'bg-stone-700'
                      }`}
                    >
                      <img 
                        className="w-6 h-6 sm:w-7 sm:h-7" 
                        src={reactionIcons[type as keyof typeof reactionIcons]}
                        alt={reactionLabels[type as keyof typeof reactionLabels]}
                      />
                      <div className="text-white text-lg sm:text-2xl font-bold font-['Pretendard']">
                        {count}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm font-semibold font-['Pretendard']">
                        {reactionLabels[type as keyof typeof reactionLabels]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 표현행위 보내기 버튼 */}
              <button 
                onClick={handleSendReaction}
                disabled={!selectedReaction}
                className={`w-full h-12 sm:h-14 px-4 py-2 bg-stone-900/60 border border-white/20 backdrop-blur-[6px] rounded-lg transition-colors ${
                  selectedReaction 
                    ? 'hover:bg-stone-800/60 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`text-base sm:text-xl font-semibold font-['Pretendard'] ${
                  selectedReaction ? 'text-[#ADFF00]' : 'text-gray-500'
                }`}>
                  표현행위 보내기
                </div>
              </button>

              {/* 표현행위 히스토리 - 모바일에서는 간소화 */}
              <div className="w-full">
                <h4 className="text-white text-base sm:text-lg font-semibold font-['Pretendard'] mb-3">최근 표현행위</h4>
                <div className="space-y-3">
                  {reactionHistory.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" 
                        src="/images/Ellipse 79.png"
                        alt="프로필 이미지"
                      />
                      <div className="flex-1 text-white text-xs sm:text-sm font-['Pretendard'] truncate">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400"> 님이 </span>
                        <span className="text-[#ADFF00]">{item.reaction}</span>
                        <span className="text-gray-400">을 부여</span>
                      </div>
                      <img 
                        className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" 
                        src={reactionIcons[Object.keys(reactionLabels).find(key => 
                          reactionLabels[key as keyof typeof reactionLabels] === item.reaction
                        ) as keyof typeof reactionIcons]}
                        alt={item.reaction}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 표현행위 완료 토스트 팝업 - 모바일 최적화 */}
      {showReactionPopup && (
        <div 
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4"
          style={{ paddingTop: `${modalTopPosition + 200}px` }}
          onClick={closeReactionPopup}
        >
          <div 
            className="w-full max-w-md sm:max-w-lg px-6 sm:px-8 py-8 sm:py-12 bg-neutral-900 outline outline-2 outline-offset-[-1px] outline-[#ADFF00] rounded-[20px] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isCompletePopup ? (
              // 12장 모두 완료했을 때
              <div>
                <div className="text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-tight">
                  모든 표현 보내기가 완료 되었습니다!
                </div>
                <div className="text-gray-400 text-base sm:text-lg lg:text-2xl font-bold font-['Pretendard'] leading-tight mt-2">
                  *수정이 어려워요
                </div>
              </div>
            ) : (
              // 1~11번째일 때
              <div>
                <div className="text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-tight">
                  {reactionCount}번째 표현 보내기가 완료 되었습니다.
                </div>
                <div className="text-[#ADFF00] text-base sm:text-lg lg:text-2xl font-bold font-['Pretendard'] leading-tight mt-2">
                  {12 - reactionCount}번의 표현 보내기 완료 후<br/>자동으로 완료 처리 됩니다.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};