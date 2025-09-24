import React, { useEffect, useState } from "react";

const reactionCards = [
  {
    id: 1,
    image: "/images/honor-card.png",
    title: "경의",
    position: { left: "503.45px", top: "40px" },
  },
  {
    id: 2,
    image: "/images/recommend-card.png", 
    title: "추천",
    position: { left: "803.45px", top: "40px" },
  },
  {
    id: 3,
    image: "/images/respect-card.png",
    title: "존중", 
    position: { left: "1103.45px", top: "40px" },
  },
  {
    id: 4,
    image: "/images/hug-card.png",
    title: "응원",
    position: { left: "1403.45px", top: "40px" },
  },
];

export const ReactionCardsSection = (): JSX.Element => {
  const [isMobile, setIsMobile] = useState(false);

  // 브레이크포인트 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // CSS 애니메이션을 위한 스타일 추가
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-3deg); }
        75% { transform: rotate(3deg); }
      }
      .wiggle-animation:hover {
        animation: wiggle 0.6s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="w-full my-[0px] content-padding">
      <div className="responsive-container">
        {/* ============================== */}
        {/* 데스크톱: 이미지 기반 */}
        {/* ============================== */}
        <div className="hidden md:flex justify-center items-center min-h-[500px]">
          <div
            className="relative"
            style={{ width: "2283.45px", height: "625px", minWidth: "2283.45px" }}
          >
            {reactionCards.map((card) => (
              <div
                key={card.id}
                className="absolute cursor-pointer wiggle-animation transition-transform duration-300 ease-in-out"
                style={{
                  left: card.position.left,
                  top: card.position.top,
                  width: "380px",
                  height: "540px",
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ============================== */}
        {/* 모바일: 수평 스크롤 */}
        {/* ============================== */}
        <div className="block md:hidden w-full">
          <div 
            className="flex overflow-x-auto py-6"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              paddingLeft: '16px',
              paddingRight: '60px' // 마지막 카드 여백
            }}
          >
            {reactionCards.map((card, index) => (
              <div
                key={card.id}
                className="flex-shrink-0"
                style={{ 
                  width: 'calc(100vw - 80px)', // 화면 너비에서 여백 제외, 다음 카드가 살짝 보이도록
                  marginRight: index < reactionCards.length - 1 ? '12px' : '0' 
                }}
              >
                <div className={`
                  ${index === 0 || index === 2 ? 'rotate-[15deg]' : 'rotate-[-15deg]'}
                `}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};