import React from "react";

interface ProgressSectionProps {
  isCompleted?: boolean;
  isAllReactionsCompleted?: boolean;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({ isCompleted = false, isAllReactionsCompleted = false }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleMessageClick = () => {
    if (isAllReactionsCompleted) {
      // 3단계 완료 시에는 아무 동작 안함
      return;
    } else if (isCompleted) {
      console.log('2단계로 이동 - NavigationSection');
      scrollToSection('navigation-section');
    } else {
      console.log('1단계로 이동 - CountDown');
      scrollToSection('countdown-section');
    }
  };

  // 프로그레스 바 이미지 결정
  const getProgressBarImage = () => {
    if (isAllReactionsCompleted) return "/images/ProgressBar3.png";
    if (isCompleted) return "/images/ProgressBar2.png";
    return "/images/ProgressBar.png";
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 flex justify-center overflow-hidden bg-gradient-to-b from-transparent to-black/5">
      <div className="w-full max-w-[1920px] px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[540px]">
        <div className="w-full max-w-[837px] mx-auto flex flex-col justify-start items-center gap-5 lg:gap-8">
          
          {/* 제목 */}
          <h2 className="w-full text-center text-white font-bold font-['Pretendard']
                        text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                        leading-tight sm:leading-snug md:leading-relaxed lg:leading-[72px]
                        tracking-tight">
            나의 진행 상태
          </h2>
          
          {/* Progress Container */}
          <div className="w-full max-w-[863px] relative min-h-[120px] lg:min-h-[144px]">
            
            {/* Progress Bar 영역 */}
            <div className="w-full flex justify-center mb-8 lg:mb-12">
              <div className="w-full max-w-[837px] relative">
                <img 
                  src={getProgressBarImage()}
                  alt="나의 진행 상태 진행바" 
                  className="w-full h-auto max-h-12 sm:max-h-14 lg:max-h-16 object-contain"
                />
              </div>
            </div>
            
            {/* Message 버튼 영역 - 3단계 완료 시 숨김 */}
            {!isAllReactionsCompleted && (
              <div className={`absolute bottom-0 ${
                isCompleted ? 'left-[50%] transform -translate-x-1/2' : 'left-0 lg:left-[2px]'
              }`}>
                {isCompleted ? (
                  // 2단계 메시지 (완료 시)
                  <button 
                    onClick={handleMessageClick}
                    className="w-36 h-11 relative group transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ADFF00] focus:ring-opacity-50 rounded"
                    aria-label="2단계를 완수하세요"
                  >
                    <img 
                      src="/images/Message-2.png"
                      alt="21단계를 완수하세요!" 
                      className="w-auto h-8 sm:h-10 lg:h-11 object-contain group-hover:brightness-110 transition-all duration-200"
                    />
                  </button>
                ) : (
                  // 1단계 메시지 (기본 상태)
                  <button 
                    onClick={handleMessageClick}
                    className="group transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ADFF00] focus:ring-opacity-50 rounded-lg"
                    aria-label="1단계를 완수하세요"
                  >
                    <img 
                      src="/images/Message.png"
                      alt="1단계를 완수하세요!" 
                      className="w-auto h-8 sm:h-10 lg:h-11 object-contain group-hover:brightness-110 transition-all duration-200"
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};