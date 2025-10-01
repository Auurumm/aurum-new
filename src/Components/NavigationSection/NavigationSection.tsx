import React from "react";

interface NavigationSectionProps {
  isAllReactionsCompleted?: boolean;
}

export const NavigationSection = ({ isAllReactionsCompleted = false }: NavigationSectionProps): JSX.Element => {
  // 완료 상태에 따른 색상 결정
  const titleColor = isAllReactionsCompleted ? "#555555" : "#ADFF00";

  const cardData = [
    {
      icon: "/images/honor-icon.png",
      title: "경의",
      english: "Honor",
      count: "1장",
      description: "최고' 의 지혜를 뽐내는 1명에게 부여하는 나의 '감탄' 입니다. :)",
      boldText: "1명 밖에 선택할 수 없으니, 신중하게 나의 경의를 표현해보세요!"
    },
    {
      icon: "/images/recommend-icon.png",
      title: "추천",
      english: "Recommend",
      count: "3장",
      description: "다른 사람들에게도 보여주고 싶은 3명의 지혜를 뽑는 나의 '추천'입니다. ",
      boldText: "3명을 선택할 수 있으니, 동료 크루의 지혜에 감탄을 보내주세요!"
    },
    {
      icon: "/images/respect-icon.png",
      title: "존중",
      english: "Respect",
      count: "5장",
      description: "나의 지혜와 완전히 같지는 않지만 새로운 관점과 재미를 준 지혜를 뽑는 나의 '존중' 입니다.",
      boldText: " 5명을 골라, 소소한 존중을 표현해보자구요!"
    },
    {
      icon: "/images/hug-icon.png",
      title: "응원",
      english: "Hug",
      count: "3장",
      description: "조금 더 분발한다면 더 좋은 지혜에 도전해볼 수 있을 지혜를 뽑는 나의 '응원'입니다. 3명을 골라, 힘차게 어깨를 주물러 주자구요!",
      boldText: ""
    }
  ];

  return (
    <section className="self-stretch pt-8 sm:pt-10 lg:pt-12 lg:pb-12 flex flex-col justify-center items-center gap-6 sm:gap-16 lg:gap-20 px-4 sm:px-6 lg:px-8">
      
      {/* 데스크탑 레이아웃 (lg 이상) - 기존 유지 */}
      <div className="hidden lg:block self-stretch">
        <div className="self-stretch flex flex-col justify-start items-center gap-12 sm:gap-16 lg:gap-20">
          <div className="self-stretch flex flex-col justify-start items-center gap-8 sm:gap-10 lg:gap-12">
            <div className="w-full max-w-[628px] flex flex-col justify-start items-center px-4 sm:px-0">
              <div className="self-stretch flex flex-col justify-start items-center">
                <div 
                  className="self-stretch text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-['Pretendard'] leading-tight lg:leading-[96px]"
                  style={{ color: titleColor }}
                >
                  2단계
                </div>
                <div className="self-stretch text-center text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-['Pretendard'] leading-tight lg:leading-[96px]">
                  다른 크루들의 위즈덤 카드
                </div>
              </div>
              <div className="self-stretch text-center text-neutral-400 text-base sm:text-lg lg:text-xl font-semibold font-['Pretendard'] leading-relaxed lg:leading-9 mt-4 lg:mt-0">
                다른 크루의 위즈덤 카드를 읽어보고, 표현 행위를 진행해 주세요.
                <br className="hidden sm:block" />
                표현 행위 카드는 총 12장이며, 각각의 의미를 확인하고 2단계를 완료하세요 !
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 레이아웃 (lg 미만) - Figma 시안 구현 */}
      <div className="lg:hidden self-stretch py-5 flex flex-col justify-start items-start gap-6">
        
        {/* 헤더 영역 */}
        <div className="w-96 flex flex-col justify-start items-center gap-5 mx-auto">
          <div className="self-stretch flex flex-col justify-start items-center gap-[5px]">
            <div 
              className="self-stretch text-center text-lime-400 text-3xl font-bold font-['Pretendard'] leading-10"
              style={{ color: titleColor }}
            >
              2단계
            </div>
            <div className="self-stretch text-center text-white text-3xl font-bold font-['Pretendard'] leading-10">
              다른 크루들의 위즈덤 카드
            </div>
          </div>
          <div className="self-stretch text-center text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
            다른 크루의 위즈덤 카드를 읽어보고,<br/>
            표현 행위를 진행해 주세요.<br/>
            표현 행위 카드는 총 12장이며,<br/>
            각각의 의미를 확인하고 2단계를 완료하세요 !
          </div>
        </div>
      </div>
    </section>
  );
};