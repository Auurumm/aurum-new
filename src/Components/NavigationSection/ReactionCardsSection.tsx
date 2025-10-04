import React, { useEffect, useState, useRef } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // 스크롤 위치 추적
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      
      setIsAtStart(scrollLeft <= 10);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
      
      // 현재 카드 인덱스 계산
      const cardElement = container.querySelector('.card-item') as HTMLElement;
      if (cardElement) {
        const cardWidth = cardElement.offsetWidth;
        const newIndex = Math.round(scrollLeft / (cardWidth + 20));
        setCurrentIndex(Math.min(newIndex, reactionCards.length - 1));
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // CSS 애니메이션
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

      /* 스크롤바 숨기기 */
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }

      /* 오른쪽 페이드 효과 - "더 있어요" 암시 */
      .scroll-fade-right::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 60px;
        height: 100%;
        background: linear-gradient(to left, rgba(17,20,16,1) 0%, rgba(17,20,16,0) 100%);
        pointer-events: none;
        transition: opacity 0.3s;
        z-index: 1;
      }

      .scroll-fade-right.at-end::after {
        opacity: 0;
      }

      /* 스크롤 힌트 애니메이션 */
      @keyframes swipe-hint {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(10px); }
      }

      .swipe-hint {
        animation: swipe-hint 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
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

        {/* 모바일/태블릿: 개선된 수평 스크롤 */}
        <div className="block xl:hidden w-full">
          <div 
            className={`relative scroll-fade-left scroll-fade-right ${
              isAtStart ? 'at-start' : ''
            } ${isAtEnd ? 'at-end' : ''}`}
          >
            {/* 스크롤 컨테이너 */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto hide-scrollbar py-6 md:py-8 snap-x snap-mandatory"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                paddingLeft: '16px',
                paddingRight: '16px',
                scrollBehavior: 'smooth'
              }}
            >
              {reactionCards.map((card, index) => (
                <div
                  key={card.id}
                  className="card-item flex-shrink-0 snap-start"
                  style={{ 
                    // 🎯 핵심: 다음 카드 미리보기 효과
                    width: 'min(72vw, 260px)', // 조정된 너비
                    marginRight: index < reactionCards.length - 1 ? '20px' : '16px' 
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

            {/* 스크롤 힌트 (처음에만 3초간 표시) */}
            {isAtStart && !isAtEnd && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none swipe-hint">
                <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-full backdrop-blur-sm">
                  <span className="text-white/90 text-sm font-medium">스와이프</span>
                  <svg 
                    className="w-5 h-5 text-[#ADFF00]" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};