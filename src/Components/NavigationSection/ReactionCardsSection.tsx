import React from "react";

const reactionCards = [
  {
    id: 1,
    icon: "/images/honor-icon.png",
    title: "경의",
    subtitle: "Honor",
    count: "1장",
    description: "최고의 지혜를 뽐내는 1명에게 부여하는 나의 '감탄' 입니다. :)",
    subDescription: "1명 밖에 선택할 수 없으니, 신중하게 나의 경의를 표현해보세요!",
    position: { left: "-100px", top: "74.80px" },
    rotation: "rotate-[-15deg]",
    iconPosition: { left: "16.36px", top: "20.72px" },
    cardSize: { width: "w-[345px]", height: "h-[495px]" },
    contentWidth: "w-[285px]"
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
    cardSize: { width: "w-[345px]", height: "h-[495px]" },
    contentWidth: "w-[285px]"
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
    cardSize: { width: "w-[345px]", height: "h-[495px]" },
    contentWidth: "w-[285px]"
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
    cardSize: { width: "w-[345px]", height: "h-[495px]" },
    contentWidth: "w-[285px]"
  }
];

export const ReactionCardsSection = (): JSX.Element => {
  return (
    <section 
      className="w-full flex justify-center px-4 sm:px-6 lg:px-8"
      style={{ paddingTop: '135px', paddingBottom: '135px' }}
    >
      {/* 데스크톱: 원본 absolute 레이아웃 */}
      <div className="hidden xl:block relative w-[1277.57px] h-[464.77px] rounded-[20px]">
        {reactionCards.map((card) => (
          <div
            key={card.id}
            className={`${card.cardSize.width} ${card.cardSize.height} px-7 py-12 absolute origin-top-left ${card.rotation} bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 inline-flex flex-col justify-start items-start gap-8`}
            style={{
              left: card.position.left,
              top: card.position.top
            }}
          >
            <div className={`${card.contentWidth} flex flex-col justify-start items-start gap-8`}>
              
              {/* 아이콘 - Figma와 동일한 absolute positioning */}
              <div className="w-32 h-32 relative bg-stone-700 rounded-[100px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.08)] overflow-hidden">
                <img
                  className="w-24 h-24 absolute"
                  style={{
                    left: card.iconPosition.left,
                    top: card.iconPosition.top
                  }}
                  alt={card.title}
                  src={card.icon}
                />
              </div>
              
              {/* 텍스트 정보 */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                
                {/* 제목과 카운트 */}
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-center items-center gap-2">
                    <div className="justify-start text-white text-3xl font-bold font-['Pretendard'] leading-10">
                      {card.title}
                    </div>
                    <div className="justify-start text-gray-400 text-xl font-semibold font-['Pretendard'] leading-9">
                      {card.subtitle}
                    </div>
                  </div>
                  <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
                    {card.count}
                  </div>
                </div>
                
                {/* 설명 텍스트 */}
                <div className="self-stretch justify-start">
                  <span className="text-neutral-400 text-lg font-normal font-['Pretendard'] leading-relaxed">
                    {card.description}
                    <br />
                  </span>
                  <span className="text-neutral-400 text-lg font-bold font-['Pretendard'] leading-relaxed">
                    {card.subDescription}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 태블릿과 모바일: 반응형 그리드 레이아웃 */}
      <div className="xl:hidden w-full flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12 max-w-6xl">
        {reactionCards.map((card) => (
          <div
            key={card.id}
            className={`w-60 sm:w-64 lg:w-72 h-80 sm:h-88 lg:h-96 px-6 lg:px-7 py-8 sm:py-10 lg:py-12 origin-top-left ${card.rotation} bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 flex flex-col justify-start items-start gap-6 sm:gap-7 lg:gap-8`}
          >
            <div className="w-full flex flex-col justify-start items-start gap-6 sm:gap-7 lg:gap-8">
              
              {/* 아이콘 - 모바일에서는 centered */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative bg-stone-700 rounded-[100px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.08)] overflow-hidden flex items-center justify-center">
                <img
                  className="w-20 h-20 sm:w-22 sm:h-22 lg:w-24 lg:h-24"
                  alt={card.title}
                  src={card.icon}
                />
              </div>
              
              {/* 텍스트 정보 */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3 sm:gap-3.5">
                
                {/* 제목과 카운트 */}
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-center items-center gap-2">
                    <h4 className="text-white text-2xl sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-tight lg:leading-10">
                      {card.title}
                    </h4>
                    <span className="text-gray-400 text-base sm:text-lg lg:text-xl font-semibold font-['Pretendard'] leading-relaxed lg:leading-9">
                      {card.subtitle}
                    </span>
                  </div>
                  <span className="text-white text-base sm:text-lg lg:text-xl font-semibold font-['Pretendard'] leading-relaxed lg:leading-9">
                    {card.count}
                  </span>
                </div>
                
                {/* 설명 텍스트 */}
                <div className="self-stretch justify-start">
                  <span className="text-neutral-400 text-sm sm:text-base lg:text-lg font-normal font-['Pretendard'] leading-relaxed">
                    {card.description}
                    <br />
                  </span>
                  <span className="text-neutral-400 text-sm sm:text-base lg:text-lg font-bold font-['Pretendard'] leading-relaxed">
                    {card.subDescription}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};