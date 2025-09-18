import React, { useState, useEffect } from "react";

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

  const handleCardClick = (card: WisdomCard) => {
    if (!isWisdomCompleted) {
      alert("1단계를 먼저 완료해주세요!");
      return;
    }
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setSelectedReaction(null);
  };

  const handleReactionSelect = (reactionType: string) => {
    setSelectedReaction(reactionType);
  };

  const handleSendReaction = () => {
    if (!selectedReaction) {
      alert("표현행위를 선택해주세요!");
      return;
    }
    
    const newCount = reactionCount === 1 ? 12 : reactionCount + 1;
    setReactionCount(newCount);
    
    // 12번째 표현행위 완료 시 완료 팝업이 뜨도록 설정
    if (newCount >= 12) {
      setIsCompletePopup(true);
      console.log('완료 팝업 설정됨 - newCount:', newCount);
    } else {
      setIsCompletePopup(false);
    }
    
    setShowReactionPopup(true);
    
    // 3초 후 팝업 자동 닫기
    setTimeout(() => {
      console.log('3초 후 자동 닫기 - 콜백 호출 예정');
      closeReactionPopup();
    }, 3000);
  };

  // 토스트 팝업이 뜰 때 자동 스크롤 처리
  useEffect(() => {
    if (showReactionPopup) {
      // 1811px 위치로 스크롤 이동
      const scrollToPosition = () => {
        window.scrollTo({ top: 1811, behavior: 'smooth' });
        document.documentElement.scrollTop = 1811;
        document.body.scrollTop = 1811;
      };

      // 팝업이 완전히 렌더링된 후 스크롤 실행
      setTimeout(scrollToPosition, 100);
      
      // 버셀 환경에서 지연이 있을 수 있으므로 추가 시도
      setTimeout(scrollToPosition, 300);
    }
  }, [showReactionPopup]);

  const closeReactionPopup = () => {
    console.log('=== 팝업 닫기 시작 ===');
    console.log('isCompletePopup:', isCompletePopup);
    console.log('reactionCount:', reactionCount);
    console.log('onAllReactionsComplete 존재:', !!onAllReactionsComplete);
    
    setShowReactionPopup(false);
    
    // 12번째 완료 후 팝업을 닫을 때 상위 컴포넌트에 알림
    if (isCompletePopup && reactionCount >= 12 && onAllReactionsComplete) {
      console.log('🎉 12번째 완료 콜백 호출!');
      
      // 완료 팝업일 때는 카드 상세 모달도 함께 닫기
      setSelectedCard(null);
      setSelectedReaction(null);
      
      // 최상단으로 스크롤 이동 (별 떨어지는 모션을 보기 위해)
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 500); // 팝업이 사라진 후 스크롤
      
      onAllReactionsComplete();
    } else {
      console.log('콜백 호출 조건 미충족:', {
        isCompletePopup,
        countCheck: reactionCount >= 12,
        callbackExists: !!onAllReactionsComplete
      });
    }
    
    console.log('=== 팝업 닫기 완료 ===');
  };
  
  return (
    <>
      <div className="w-full flex justify-center mb-[120px]">
        <div className="inline-flex flex-col justify-start items-center gap-3.5">
        {/* 4개 행, 각 행마다 3개 카드 */}
        {Array(4).fill(null).map((_, rowIndex) => (
          <div key={rowIndex} className="self-stretch inline-flex justify-center items-center gap-3.5">
            {wisdomCards.slice(rowIndex * 3, (rowIndex + 1) * 3).map((card) => (
              <div 
                key={card.id}
                className={`p-6 bg-stone-700 rounded-[20px] outline outline-1 outline-offset-[-0.50px] outline-neutral-900 inline-flex flex-col justify-start items-center gap-9 ${
                  isWisdomCompleted ? '' : 'opacity-50'
                }`}
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
                          className="self-stretch justify-center text-white text-xl font-semibold font-['Pretendard'] leading-9 truncate"
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
                    onClick={() => handleCardClick(card)}
                    disabled={!isWisdomCompleted}
                    className={`w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 transition-colors ${
                      isWisdomCompleted 
                        ? 'cursor-pointer hover:bg-stone-800/60' 
                        : 'cursor-not-allowed'
                    }`}
                  >
                    <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
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

      {/* 상세 모달 */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="p-7 bg-stone-700 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 inline-flex justify-start items-center gap-2.5 max-h-[90vh] overflow-y-auto overflow-x-hidden max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex flex-col justify-start items-center gap-6">
              <div className="w-[501px] flex flex-col justify-start items-start gap-6">
                
                {/* 상단 프로필과 메뉴 */}
                <div className="self-stretch inline-flex justify-end items-center gap-2.5">
                  <div className="flex-1 flex justify-start items-center gap-3.5">
                    <img 
                      className="w-12 h-12 rounded-full" 
                      src="/images/boy.png"
                      alt="프로필 이미지"
                    />
                    <div className="justify-start text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                      {selectedCard.userInfo}
                    </div>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="w-6 h-6 relative overflow-hidden"
                  >
                    <div className="w-0 h-3 left-[6px] top-[6px] absolute origin-top-left -rotate-90 outline outline-2 outline-offset-[-1px] outline-white"></div>
                    <div className="w-0 h-3 left-[6px] top-[6px] absolute origin-top-left -rotate-90 outline outline-2 outline-offset-[-1px] outline-white"></div>
                  </button>
                </div>

                {/* 콘텐츠 */}
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                    {selectedCard.content.map((line, index) => (
                      <div 
                        key={index}
                        className="self-stretch justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9"
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="self-stretch justify-center text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                    {selectedCard.timestamp}
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div className="w-[498px] h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
              
              {/* 표현행위 통계 */}
              <div className="bg-stone-700 rounded-[20px] inline-flex justify-center items-center">
                <div className="w-96 h-32 rounded-[20px] flex justify-center items-center">
                  {Object.entries(selectedCard.stats).map(([type, value]) => (
                    <button
                      key={type}
                      onClick={() => handleReactionSelect(type)}
                      className={`w-28 p-3.5 inline-flex flex-col justify-center items-center gap-[5px] transition-all duration-200 hover:bg-stone-600 ${
                        selectedReaction === type 
                          ? 'bg-[#ADFF00]/20 border-2 border-[#ADFF00] rounded-lg' 
                          : 'bg-stone-700'
                      }`}
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
                    </button>
                  ))}
                </div>
              </div>

              {/* 표현행위 보내기 버튼 */}
              <button 
                onClick={handleSendReaction}
                disabled={!selectedReaction}
                className={`w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 transition-colors ${
                  selectedReaction 
                    ? 'hover:bg-stone-800/60 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`justify-start text-xl font-semibold font-['Pretendard'] leading-9 ${
                  selectedReaction ? 'text-[#ADFF00]' : 'text-gray-500'
                }`}>
                  표현행위 보내기
                </div>
              </button>

              {/* 표현행위 히스토리 */}
              <div className="px-5 relative flex flex-col justify-start items-start gap-3.5">
                {reactionHistory.map((item, index) => (
                  <div key={index} className="flex flex-col justify-start items-start gap-3.5">
                    <div className="inline-flex justify-start items-center gap-3.5">
                      <div className="w-96 flex justify-start items-center gap-2">
                        <img 
                          className="w-12 h-12 rounded-full" 
                          src="/images/Ellipse 79.png"
                          alt="프로필 이미지"
                        />
                        <div className="justify-start text-white text-sm font-medium font-['Pretendard'] leading-tight">
                          {item.name} ({item.gender} / {item.age} / {item.company}) 님이 {item.reaction}을 부여하였습니다
                        </div>
                      </div>
                      <img 
                        className="w-7 h-7" 
                        src={reactionIcons[Object.keys(reactionLabels).find(key => 
                          reactionLabels[key as keyof typeof reactionLabels] === item.reaction
                        ) as keyof typeof reactionIcons]}
                        alt={item.reaction}
                      />
                    </div>
                  </div>
                ))}
                
                {/* 세로 구분선 */}
                <div className="w-0.5 h-16 left-[527px] top-0 absolute bg-neutral-500 rounded-[20px]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 표현행위 완료 토스트 팝업 */}
      {showReactionPopup && (
        <div 
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeReactionPopup}
        >
          <div 
            className="px-28 py-20 bg-neutral-900 outline outline-2 outline-offset-[-1px] outline-[#ADFF00] inline-flex flex-col justify-start items-start gap-2.5 rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-center items-center gap-12">
              {isCompletePopup ? (
                // 12장 모두 완료했을 때
                <div className="text-center justify-start">
                  <div className="text-white text-3xl font-bold font-['Pretendard'] leading-10">
                    모든 표현 보내기가 완료 되었습니다 !
                  </div>
                  <div className="text-gray-400 text-3xl font-bold font-['Pretendard'] leading-10 mt-2">
                    *수정이 어려워요
                  </div>
                </div>
              ) : (
                // 1~11번째일 때
                <div className="text-center justify-start">
                  <div className="text-white text-3xl font-bold font-['Pretendard'] leading-10">
                    {reactionCount}번째 표현 보내기가 완료 되었습니다.<br/>
                  </div>
                  <div className="text-[#ADFF00] text-3xl font-bold font-['Pretendard'] leading-10">
                    {12 - reactionCount}번의 표현 보내기 완료 후<br/>자동으로 완료 처리 됩니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};