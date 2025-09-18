import React from "react";

interface NavigationSectionProps {
  isAllReactionsCompleted?: boolean;
}

export const NavigationSection = ({ isAllReactionsCompleted = false }: NavigationSectionProps): JSX.Element => {
  // 완료 상태에 따른 색상 결정
  const titleColor = isAllReactionsCompleted ? "#555555" : "#ADFF00";

  return (
    <section className="self-stretch pt-8 sm:pt-10 lg:pt-12 flex flex-col justify-center items-center gap-12 sm:gap-16 lg:gap-20 px-4 sm:px-6 lg:px-8">
      
      {/* 헤더 섹션 */}
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
    </section>
  );
};