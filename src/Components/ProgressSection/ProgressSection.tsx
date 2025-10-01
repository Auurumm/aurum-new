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

  // 프로그레스 바 이미지 결정 (데스크탑용)
  const getProgressBarImage = () => {
    if (isAllReactionsCompleted) return "/images/ProgressBar3.png";
    if (isCompleted) return "/images/ProgressBar2.png";
    return "/images/ProgressBar.png";
  };

  // 모바일 프로그레스 바 이미지 결정
  const getMobileProgressBarImage = () => {
    if (isAllReactionsCompleted) return "/images/ProgressBar-mobile-3.png";
    if (isCompleted) return "/images/ProgressBar-mobile-2.png";
    return "/images/ProgressBar-mobile.png";
  };

  // 메시지 텍스트 결정
  const getMessageText = () => {
    if (isAllReactionsCompleted) return null;
    if (isCompleted) return "2단계를 완수하세요!";
    return "1단계를 완수하세요!";
  };

  return (
    <section className="w-full py-8 sm:py-12 lg:py-20 flex justify-center overflow-hidden bg-gradient-to-b from-transparent to-black/5">
      <div className="w-full max-w-[1920px] px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[540px]">
        
        {/* 데스크탑 레이아웃 (lg 이상) */}
        <div className="hidden lg:block w-full max-w-[837px] mx-auto">
          <div className="flex flex-col justify-start items-center gap-8">
            
            {/* 제목 */}
            <h2 className="w-full text-center text-white font-bold font-['Pretendard'] text-5xl leading-[72px] tracking-tight">
              나의 진행 상태
            </h2>
            
            {/* Progress Container */}
            <div className="w-full max-w-[863px] relative min-h-[144px]">
              
              {/* Progress Bar 영역 */}
              <div className="w-full flex justify-center mb-12">
                <div className="w-full max-w-[837px] relative">
                  <img 
                    src={getProgressBarImage()}
                    alt="나의 진행 상태 진행바" 
                    className="w-full h-auto max-h-16 object-contain"
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
                        alt="2단계를 완수하세요!" 
                        className="w-auto h-11 object-contain group-hover:brightness-110 transition-all duration-200"
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
                        className="w-auto h-11 object-contain group-hover:brightness-110 transition-all duration-200"
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 레이아웃 (lg 미만) - ProgressBar-mobile.png 사용 */}
        <div className="lg:hidden w-full h-56 flex flex-col justify-center items-center gap-6 px-4">
          
          {/* 제목 */}
          <h2 className="w-full text-center text-white text-xl font-semibold font-['Pretendard'] leading-9">
            나의 진행 상태
          </h2>
          
          {/* Progress Container */}
          <div className="w-full flex flex-col justify-start items-center gap-3.5">
            
            {/* Mobile Progress Bar 이미지 - 진행 상태별로 다른 이미지 */}
            <div className="w-full max-w-80 h-11 flex justify-center items-center">
              <img 
                src={getMobileProgressBarImage()}
                alt="모바일 진행 상태 바" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                }}
              />
              {/* 폴백: 이미지가 없을 때 표시될 내용 */}
              <div className="hidden w-80 h-11 bg-neutral-600 rounded-[50px] flex items-center justify-center">
                <div className="text-center text-white text-sm">Progress Bar</div>
              </div>
            </div>
            
            {/* Message 버튼 - 3단계 완료 시 숨김 */}
            {!isAllReactionsCompleted && (
              <div className="w-36 h-11 relative">
                <button
                  onClick={handleMessageClick}
                  className="w-full h-full transition-all duration-200 hover:scale-105 touch-optimized"
                  aria-label={getMessageText() || ""}
                >
                  <img 
                    src={isCompleted ? "/images/Message-2.png" : "/images/Message.png"}
                    alt={getMessageText() || ""} 
                    className="w-full h-full object-contain"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};