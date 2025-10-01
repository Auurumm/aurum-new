import React, { useEffect, useState } from "react";

const reactionCards = [
  {
    id: 1,
    image: "/images/honor-card.png",
    mobileImage: "/images/honor-mobile.png",
    title: "경의",
    position: { left: "503.45px", top: "40px" },
  },
  {
    id: 2,
    image: "/images/recommend-card.png",
    mobileImage: "/images/recommend-mobile.png",
    title: "추천",
    position: { left: "803.45px", top: "40px" },
  },
  {
    id: 3,
    image: "/images/respect-card.png",
    mobileImage: "/images/respect-mobile.png",
    title: "존중", 
    position: { left: "1103.45px", top: "40px" },
  },
  {
    id: 4,
    image: "/images/hug-card.png",
    mobileImage: "/images/hug-mobile.png",
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
        {/* 데스크톱: 이미지 기반 - 1280px 이상만 rotate */}
        <div className="hidden xl:flex justify-center items-center min-h-[500px]">
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

        {/* 모바일/태블릿: 수평 스크롤 - 1279px 이하, rotate 없음 */}
        <div className="block xl:hidden w-full">
          <div 
            className="flex overflow-x-auto py-6 md:py-8"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              paddingLeft: '16px',
              paddingRight: '60px'
            }}
          >
            {reactionCards.map((card, index) => (
              <div
                key={card.id}
                className="flex-shrink-0"
                style={{ 
                  width: 'min(280px, calc(100vw - 80px))',
                  marginRight: index < reactionCards.length - 1 ? '20px' : '0' 
                }}
              >
                <img
                  src={card.mobileImage}
                  alt={card.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};