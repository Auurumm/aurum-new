import React, { useEffect, useRef, useState } from "react";

const reactionCards = [
  {
    id: 1,
    icon: "/images/honor-icon.png",
    title: "경의",
    subtitle: "Honor",
    count: "1장",
    description: "최고' 의 지혜를 뽐내는 1명에게 부여하는 나의 '감탄' 입니다. :)",
    subDescription: "1명 밖에 선택할 수 없으니, 신중하게 나의 경의를 표현해보세요!",
    position: { left: "-100px", top: "74.80px" },
    rotation: "rotate-[-15deg]",
    iconPosition: { left: "16.36px", top: "20.72px" },
  },
  {
    id: 2,
    icon: "/images/recommend-icon.png",
    title: "추천",
    subtitle: "Recommend",
    count: "3장",
    description: "다른 사람들에게도 보여주고 싶은 3명의 지혜를 뽑는 나의 '추천' 입니다.",
    subDescription: "3명을 선택할 수 있으니, 동료 크루의 지혜에 감탄을 보내주세요!",
    position: { left: "408.43px", top: "0" },
    rotation: "rotate-[15deg]",
    iconPosition: { left: "13.36px", top: "20.52px" },
  },
  {
    id: 3,
    icon: "/images/respect-icon.png",
    title: "존중",
    subtitle: "Respect",
    count: "5장",
    description: "나의 지혜와 완전히 같지는 않지만 새로운 관점과 재미를 준 지혜를 뽑는 나의 '존중' 입니다.",
    subDescription: "5명을 골라, 소소한 존중을 표현해보자구요!",
    position: { left: "601.75px", top: "75.26px" },
    rotation: "rotate-[-15deg]",
    iconPosition: { left: "16.43px", top: "20.70px" },
  },
  {
    id: 4,
    icon: "/images/hug-icon.png",
    title: "응원",
    subtitle: "Hug",
    count: "3장",
    description: "조금 더 분발한다면 더 좋은 지혜에 도전해볼 수 있을 지혜를 뽑는 나의 '응원' 입니다.",
    subDescription: "3명을 골라, 힘차게 어깨를 주물러 주자구요!",
    position: { left: "1105.25px", top: "0" },
    rotation: "rotate-[15deg]",
    iconPosition: { left: "13.36px", top: "20.52px" },
  },
];

export const ReactionCardsSection = (): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 첫 카드 높이 → 모든 모바일 카드에 적용
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  // 모바일 스와이프 상태
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [deltaX, setDeltaX] = useState(0);

  // 브레이크포인트 및 첫 카드 높이 측정
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // md
      setIsMobile(mobile);
      if (mobile && firstCardRef.current) {
        // 이미지 로드/줄바꿈 등으로 높이 변동 고려
        setCardHeight(firstCardRef.current.offsetHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 첫 카드 이미지 로드 시 높이 재측정
  const onFirstImageLoad = () => {
    if (isMobile && firstCardRef.current) {
      setCardHeight(firstCardRef.current.offsetHeight);
    }
  };

  // 순환 이동
  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : reactionCards.length - 1
    );
  };
  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev < reactionCards.length - 1 ? prev + 1 : 0
    );
  };

  // 스와이프 핸들러 (터치 + 마우스)
  const getContainerWidth = () => trackRef.current?.clientWidth ?? 1;

  const onPointerDown = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDeltaX(0);
  };
  const onPointerMove = (clientX: number) => {
    if (!isDragging) return;
    setDeltaX(clientX - startX);
  };
  const onPointerUp = () => {
    if (!isDragging) return;
    const threshold = getContainerWidth() * 0.15; // 15% 넘으면 페이지 전환
    if (deltaX > threshold) {
      goToPrev();
    } else if (deltaX < -threshold) {
      goToNext();
    }
    setIsDragging(false);
    setDeltaX(0);
  };

  // 터치 이벤트 바인딩
  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) =>
    onPointerDown(e.touches[0].clientX);
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) =>
    onPointerMove(e.touches[0].clientX);
  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () =>
    onPointerUp();

  // 마우스 드래그도 지원(모바일 테스트 외 데스크에서도 확인 용)
  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) =>
    onPointerDown(e.clientX);
  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) =>
    onPointerMove(e.clientX);
  const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () =>
    onPointerUp();
  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    if (isDragging) onPointerUp();
  };

  // 드래그 중 추가 이동 퍼센트
  const dragPercent =
    isDragging && getContainerWidth() > 0
      ? (-deltaX / getContainerWidth()) * 100
      : 0;

  return (
    <section className="w-full my-[85px] content-padding">
      <div className="responsive-container">
        {/* ============================== */}
        {/* 데스크톱: 원본 유지 (절대 수정 금지) */}
        {/* ============================== */}
        <div className="hidden md:flex md:justify-center md:items-center min-h-[500px]">
          <div
            className="relative"
            style={{ width: "1277.57px", height: "464.77px", minWidth: "1277.57px" }}
          >
            {reactionCards.map((card) => (
              <div
                key={card.id}
                className={`
                  absolute w-[345px] h-[495px] p-7 
                  ${card.rotation} hover:rotate-0
                  bg-neutral-900 rounded-[20px] 
                  outline outline-1 outline-offset-[-1px] outline-stone-500
                  flex flex-col justify-start items-start gap-8
                  transition-transform duration-500 ease-in-out cursor-pointer
                  origin-top-left
                `}
                style={{
                  left: card.position.left,
                  top: card.position.top,
                }}
              >
                <div className="w-[285px] flex flex-col justify-start items-start gap-8">
                  <div className="w-32 h-32 relative bg-stone-700 rounded-full shadow-lg overflow-hidden">
                    <img
                      className="w-24 h-24 absolute"
                      style={{
                        left: card.iconPosition.left,
                        top: card.iconPosition.top,
                      }}
                      alt={card.title}
                      src={card.icon}
                    />
                  </div>

                  <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                    <div className="self-stretch flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-3xl font-bold font-['Pretendard'] leading-10">
                          {card.title}
                        </h4>
                        <span className="text-gray-400 text-xl font-semibold font-['Pretendard'] leading-9">
                          {card.subtitle}
                        </span>
                      </div>
                      <span className="text-white text-xl font-semibold font-['Pretendard'] leading-9">
                        {card.count}
                      </span>
                    </div>

                    <div className="self-stretch">
                      <p className="text-neutral-400 text-lg font-normal font-['Pretendard'] leading-relaxed">
                        {card.description}
                      </p>
                      <p className="text-neutral-400 text-lg font-bold font-['Pretendard'] leading-relaxed">
                        {card.subDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================== */}
        {/* 모바일: 첫 카드 높이에 자동 맞춤 + 스와이프 */}
        {/* ============================== */}
        <div className="md:hidden w-full overflow-hidden">
          <div
            ref={trackRef}
            className={`flex ${isDragging ? "" : "transition-transform duration-300"}`}
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${dragPercent}%))`,
              width: `${reactionCards.length * 100}%`,
              touchAction: "pan-y",
              userSelect: "none",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {reactionCards.map((card, index) => (
              <div
                key={card.id}
                // ✅ 폭 충돌 방지: 인라인 width 제거, 한 칸 = 화면 100%
                className="min-w-full basis-full shrink-0 flex justify-center items-stretch px-4 py-6"
              >
                {/* 실제 카드: 첫 카드 높이를 모든 카드에 적용 */}
                <div
                  ref={index === 0 ? firstCardRef : null}
                  className="
                    w-[320px] max-w-full p-6
                    bg-neutral-900 rounded-[20px]
                    outline outline-1 outline-offset-[-1px] outline-stone-500
                    flex flex-col justify-start items-start gap-6
                  "
                  style={{ height: cardHeight ?? "auto" }}
                >
                  {/* 아이콘 */}
                  <div className="w-28 h-28 relative bg-stone-700 rounded-full shadow-lg overflow-hidden">
                    <img
                      className="absolute w-20 h-20 object-contain"
                      style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                      alt={card.title}
                      src={card.icon}
                      onLoad={index === 0 ? onFirstImageLoad : undefined}
                    />
                  </div>

                  {/* 텍스트 블록 */}
                  <div className="w-full flex flex-col gap-3">
                    <div className="w-full flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-2xl font-bold leading-tight">
                          {card.title}
                        </h4>
                        <span className="text-gray-400 text-base font-semibold leading-tight">
                          {card.subtitle}
                        </span>
                      </div>
                      <span className="text-white text-base font-semibold leading-tight">
                        {card.count}
                      </span>
                    </div>

                    <div className="w-full space-y-2">
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        {card.description}
                      </p>
                      <p className="text-neutral-400 text-sm font-bold leading-relaxed">
                        {card.subDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};