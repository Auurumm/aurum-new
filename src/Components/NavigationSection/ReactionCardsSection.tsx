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
  }
];

export const ReactionCardsSection = (): JSX.Element => {
  return (
    <section className="w-full my-[85px] content-padding">
      <div className="responsive-container">
        
        {/* 데스크톱 레이아웃: XL 이상에서만 표시 */}
        <div className="hidden xl:flex xl:justify-center xl:items-center">
          <div className="relative" style={{ width: '1277.57px', height: '464.77px' }}>
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
                  top: card.position.top
                }}
              >
                <div className="w-[285px] flex flex-col justify-start items-start gap-8">
                  
                  {/* 아이콘 */}
                  <div className="w-32 h-32 relative bg-stone-700 rounded-full shadow-lg overflow-hidden">
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
                    <div className="self-stretch flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-3xl font-bold font-pretendard leading-10">
                          {card.title}
                        </h4>
                        <span className="text-gray-400 text-xl font-semibold font-pretendard leading-9">
                          {card.subtitle}
                        </span>
                      </div>
                      <span className="text-white text-xl font-semibold font-pretendard leading-9">
                        {card.count}
                      </span>
                    </div>
                    
                    {/* 설명 텍스트 */}
                    <div className="self-stretch">
                      <p className="text-neutral-400 text-lg font-normal font-pretendard leading-relaxed">
                        {card.description}
                      </p>
                      <p className="text-neutral-400 text-lg font-bold font-pretendard leading-relaxed">
                        {card.subDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 모바일/태블릿 레이아웃: XL 미만에서만 표시 */}
        <div className="xl:hidden w-full">
          {/* 단순하고 안정적인 Grid 레이아웃 */}
          <div className="responsive-grid-2">
            {reactionCards.map((card) => (
              <div
                key={card.id}
                className="responsive-card hover:rotate-0 cursor-pointer"
                style={{
                  transform: `${card.rotation}`,
                  transition: 'transform 0.5s ease-in-out'
                }}
              >
                
                {/* 아이콘 */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative bg-stone-700 rounded-full shadow-lg overflow-hidden flex items-center justify-center">
                  <img
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
                    alt={card.title}
                    src={card.icon}
                  />
                </div>
                
                {/* 텍스트 정보 */}
                <div className="w-full flex flex-col justify-start items-start gap-3">
                  
                  {/* 제목과 카운트 */}
                  <div className="w-full flex justify-between items-start">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <h4 className="responsive-title text-xl sm:text-2xl lg:text-3xl">
                        {card.title}
                      </h4>
                      <span className="responsive-subtitle text-base sm:text-lg lg:text-xl flex-shrink-0">
                        {card.subtitle}
                      </span>
                    </div>
                    <span className="responsive-title text-base sm:text-lg lg:text-xl flex-shrink-0 ml-2">
                      {card.count}
                    </span>
                  </div>
                  
                  {/* 설명 텍스트 */}
                  <div className="w-full">
                    <p className="responsive-text text-xs sm:text-sm lg:text-base mb-1">
                      {card.description}
                    </p>
                    <p className="responsive-text font-bold text-xs sm:text-sm lg:text-base">
                      {card.subDescription}
                    </p>
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