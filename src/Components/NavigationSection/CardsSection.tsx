import React, { useState, useEffect, useRef } from "react";

interface WisdomCard {
  id: number;
  userInfo: string;
  content: string[];
  timestamp: string;
  stats: {
    honor: number;
    recommend: number;
    respect: number;
    hug: number;
  };
}

interface WisdomCardGridProps {
  isWisdomCompleted?: boolean;
  onAllReactionsComplete?: () => void;
}

export const WisdomCardGrid = ({ isWisdomCompleted = false, onAllReactionsComplete }: WisdomCardGridProps): JSX.Element => {
  const [selectedCard, setSelectedCard] = useState<WisdomCard | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [isCompletePopup, setIsCompletePopup] = useState(false);
  const [modalTopPosition, setModalTopPosition] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // 카드 데이터 (12개)
  const wisdomCards: WisdomCard[] = Array(12).fill(null).map((_, index) => ({
    id: index + 1,
    userInfo: "홍길동 / 남 / 23 / 한국대 / 표범학과 / 3 / 미디어 / 웹툰 / 일반 / 구글",
    content: [
      "- 소액으로 시작하는 미니 보험, 일상 속 작은 안전망이 되어줍니다.",
      "- 미니 보험은 소액으로 가입할 수 있어 누구나 부담 없이 이용 가능합니다. 일상 속 돌발 상황에 대비할 수 있고, 건강·여행·반려동물 등 테마별 보장으로 생활 전반에 안전망을 제공합니다.\n간단한 절차와 저렴한 비용이 강점입니다.",
      "- 소액으로 시작하는 미니 보험, 일상 속 작은 안전망이 되어줍니다."
    ],
    timestamp: "2025. 09. 09(화) 19:18",
    stats: {
      honor: 22,
      recommend: 8,
      respect: 10,
      hug: 2
    }
  }));

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

  // 표현행위 히스토리 더미 데이터
  const reactionHistory = [
    { name: "윤하린", gender: "여", age: 24, company: "미래에셋대우증권주식회사", reaction: "경의" },
    { name: "정현우", gender: "남", age: 26, company: "카카오", reaction: "추천" },
    { name: "박하늘", gender: "여", age: 25, company: "배달의민족", reaction: "존중" },
    { name: "강시후", gender: "남", age: 22, company: "쿠팡", reaction: "경의" },
    { name: "김민지", gender: "여", age: 22, company: "카카오엔터테인먼트", reaction: "응원" }
  ];

  const handleCardClick = (card: WisdomCard, event: React.MouseEvent<HTMLElement>) => {
    if (!isWisdomCompleted) {
      alert("1단계를 먼저 완료해주세요!");
      return;
    }
    
    // 클릭한 요소의 위치 계산
    const clickedElement = event.currentTarget;
    const elementRect = clickedElement.getBoundingClientRect();
    const elementTop = elementRect.top + window.pageYOffset;
    
    // 모달이 나타날 위치 설정 (클릭한 요소 위쪽 50px)
    setModalTopPosition(Math.max(50, elementTop - 50));
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setSelectedReaction(null);
    setModalTopPosition(0);
  };

  const handleReactionSelect = (reactionType: string) => {
    setSelectedReaction(reactionType);
  };

  const handleSendReaction = () => {
    if (!selectedReaction) {
      alert("표현행위를 선택해주세요!");
      return;
    }
    
    // 테스트용: 2번째 반응에서 바로 12번째로 건너뛰기
    const newCount = reactionCount === 1 ? 12 : reactionCount + 1;
    setReactionCount(newCount);
    
    // 12번째 표현행위 완료 시 완료 팝업이 뜨도록 설정
    // 2번째부터 완료 팝업(별 떨어지는 모션)이 뜨도록 설정
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
  };

  // 모달이 열릴 때 스크롤 위치 조정
  useEffect(() => {
    if (selectedCard && modalTopPosition > 0) {
      const scrollToModal = () => {
        // 모달 위치를 기준으로 스크롤 조정
        const targetScrollTop = modalTopPosition - 80; // 모달 위쪽 80px 여백
        
        window.scrollTo({ 
          top: Math.max(0, targetScrollTop), 
          behavior: 'smooth' 
        });
      };

      // 모달이 완전히 렌더링된 후 스크롤 실행
      setTimeout(scrollToModal, 150);
    }
  }, [selectedCard, modalTopPosition]);

  // 토스트 팝업이 뜰 때 자동 스크롤 처리
  useEffect(() => {
    if (showReactionPopup) {
      const scrollToToastPosition = () => {
        // 토스트 팝업이 표시되는 위치로 스크롤
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
      // 완료 팝업일 때는 카드 상세 모달도 함께 닫기
      setSelectedCard(null);
      setSelectedReaction(null);
      
      // 최상단으로 스크롤 이동
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 500);
      
      onAllReactionsComplete();
    }
  };
  
  return (
    <>
      {/* 반응형 카드 그리드 - 모바일 최적화 */}
      <div className="w-full flex justify-center mb-[120px] content-padding">
        <div className="responsive-container">
          
          {/* 데스크톱 레이아웃 (lg 이상) */}
          <div className="hidden lg:block">
            <div className="inline-flex flex-col justify-start items-center gap-3.5">
              {Array(4).fill(null).map((_, rowIndex) => (
                <div key={rowIndex} className="self-stretch inline-flex justify-center items-center gap-3.5">
                  {wisdomCards.slice(rowIndex * 3, (rowIndex + 1) * 3).map((card) => (
                    <div 
                      key={card.id}
                      className={`p-6 bg-stone-700 rounded-[20px] outline outline-1 outline-offset-[-0.50px] outline-neutral-900 inline-flex flex-col justify-start items-center gap-9 transition-opacity duration-300 ${
                        isWisdomCompleted ? 'opacity-100 cursor-pointer hover:bg-stone-600' : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={(e) => handleCardClick(card, e)}
                    >
                      <div className="self-stretch flex flex-col justify-start items-center gap-5">
                        
                        {/* 프로필 및 콘텐츠 섹션 */}
                        <div className="flex flex-col justify-start items-start gap-4">
                          
                          {/* 프로필 */}
                          <div className="inline-flex justify-start items-center gap-3.5">
                            <img 
                              className="w-12 h-12 rounded-full" 
                              src="/images/boy.png"
                              alt="프로필 이미지"
                            />
                            <div className="w-96 justify-start text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                              {card.userInfo}
                            </div>
                          </div>
                          
                          {/* 콘텐츠 */}
                          <div className="w-96 flex flex-col justify-start items-start gap-3.5">
                            {card.content.map((line, lineIndex) => (
                              <div 
                                key={lineIndex}
                                className="self-stretch justify-center text-white text-lg font-semibold font-['Pretendard'] leading-9 truncate"
                                title={line}
                              >
                                {line}
                              </div>
                            ))}
                            <div className="justify-center text-neutral-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              {card.timestamp}
                            </div>
                          </div>
                        </div>
                        
                        {/* 구분선 */}
                        <div className="w-96 h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
                        
                        {/* 표현 행위 통계 */}
                        <div className="self-stretch bg-neutral-900 rounded-[20px] inline-flex justify-center items-center">
                          {Object.entries(card.stats).map(([type, value]) => (
                            <div 
                              key={type}
                              className="w-28 p-3.5 bg-stone-700 inline-flex flex-col justify-center items-center gap-[5px]"
                            >
                              <img 
                                className="w-7 h-7" 
                                src={reactionIcons[type as keyof typeof reactionIcons]}
                                alt={reactionLabels[type as keyof typeof reactionLabels]}
                              />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center justify-start text-white text-3xl font-bold font-['Pretendard'] leading-10">
                                  {value}
                                </div>
                                <div className="text-center justify-start text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                  {reactionLabels[type as keyof typeof reactionLabels]}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* 자세히 보기 버튼 */}
                        <button
                          disabled={!isWisdomCompleted}
                          className={`w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 transition-colors ${
                            isWisdomCompleted 
                              ? 'cursor-pointer hover:bg-stone-800/60' 
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <div className="justify-start text-white text-lg font-semibold font-['Pretendard'] leading-9">
                            자세히 보기
                          </div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 모바일/태블릿 레이아웃 (lg 미만) */}
          <div className="lg:hidden">
            <div className="responsive-grid-2">
              {wisdomCards.map((card) => (
                <div 
                  key={card.id}
                  className={`responsive-card transition-all duration-300 ${
                    isWisdomCompleted ? 'opacity-100 cursor-pointer hover:bg-stone-600' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={(e) => handleCardClick(card, e)}
                >
                  
                  {/* 모바일 프로필 */}
                  <div className="w-full flex items-start gap-3">
                    <img 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" 
                      src="/images/boy.png"
                      alt="프로필 이미지"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="responsive-text text-xs sm:text-sm text-neutral-400 truncate">
                        {card.userInfo}
                      </div>
                      <div className="responsive-text text-xs text-neutral-500 mt-1">
                        {card.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  {/* 모바일 콘텐츠 */}
                  <div className="w-full">
                    {card.content.slice(0, 2).map((line, lineIndex) => (
                      <p 
                        key={lineIndex}
                        className="responsive-text text-sm sm:text-base text-white mb-2 line-clamp-2"
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
                          <div className="text-center text-white text-lg sm:text-lg font-bold">
                            {value}
                          </div>
                          <div className="text-center text-gray-400 text-xs font-medium">
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
                    <div className="text-white text-base sm:text-lg font-semibold">
                      자세히 보기
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 모달 - 클릭한 위치 기준 */}
      {selectedCard && (
        <div 
          className="modal-overlay flex items-start justify-center"
          onClick={closeModal}
        >
          <div 
            ref={modalRef}
            className="modal-content mx-4 my-8 max-w-lg sm:max-w-2xl w-full max-h-[85vh] overflow-y-auto p-4 sm:p-7"
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
                    <div className="text-neutral-400 text-xs sm:text-sm font-medium truncate">
                      {selectedCard.userInfo}
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
                {selectedCard.content.map((line, index) => (
                  <div 
                    key={index}
                    className="text-white text-base sm:text-xl font-semibold leading-relaxed mb-3"
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {line}
                  </div>
                ))}
                <div className="text-neutral-400 text-xs sm:text-sm font-medium mt-4">
                  {selectedCard.timestamp}
                </div>
              </div>

              {/* 구분선 */}
              <div className="w-full h-0 border-t border-stone-500"></div>
              
              {/* 표현행위 선택 */}
              <div className="w-full bg-stone-700 rounded-[15px] sm:rounded-[20px] p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(selectedCard.stats).map(([type, value]) => (
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
                      <div className="text-white text-lg sm:text-2xl font-bold">
                        {value}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm font-semibold">
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
                <div className={`text-base sm:text-xl font-semibold ${
                  selectedReaction ? 'text-[#ADFF00]' : 'text-gray-500'
                }`}>
                  표현행위 보내기
                </div>
              </button>

              {/* 표현행위 히스토리 - 모바일에서는 간소화 */}
              <div className="w-full">
                <h4 className="text-white text-base sm:text-lg font-semibold mb-3">최근 표현행위</h4>
                <div className="space-y-3">
                  {reactionHistory.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" 
                        src="/images/Ellipse 79.png"
                        alt="프로필 이미지"
                      />
                      <div className="flex-1 text-white text-xs sm:text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400"> 님이 </span>
                        <span className="text-[#ADFF00]">{item.reaction}</span>
                        <span className="text-gray-400">을 부여</span>
                      </div>
                      <img 
                        className="w-5 h-5 sm:w-6 sm:h-6" 
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
            className="w-full max-w-md sm:max-w-lg px-6 sm:px-28 py-8 sm:py-20 bg-neutral-900 outline outline-2 outline-offset-[-1px] outline-[#ADFF00] rounded-[20px] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isCompletePopup ? (
              // 12장 모두 완료했을 때
              <div>
                <div className="text-white text-xl sm:text-3xl font-bold font-['Pretendard'] leading-tight">
                  모든 표현 보내기가 완료 되었습니다!
                </div>
                <div className="text-gray-400 text-lg sm:text-3xl font-bold font-['Pretendard'] leading-tight mt-2">
                  *수정이 어려워요
                </div>
              </div>
            ) : (
              // 1~11번째일 때
              <div>
                <div className="text-white text-xl sm:text-3xl font-bold font-['Pretendard'] leading-tight">
                  {reactionCount}번째 표현 보내기가 완료 되었습니다.
                </div>
                <div className="text-[#ADFF00] text-lg sm:text-3xl font-bold font-['Pretendard'] leading-tight mt-2">
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