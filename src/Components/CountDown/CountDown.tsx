import React, { useState, useEffect } from "react";
import { WisdomModal } from "./WisdomModal.tsx"; 

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountDownProps {
  isCompleted?: boolean;
  onComplete?: () => void;
}

export const CountDown: React.FC<CountDownProps> = ({ isCompleted = false, onComplete }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWisdomCompleted, setIsWisdomCompleted] = useState(isCompleted);
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 2,
    hours: 39,
    minutes: 0,
    seconds: 44
  });

  // 완료 상태가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setIsWisdomCompleted(isCompleted);
  }, [isCompleted]);

  useEffect(() => {
    // 완료 상태일 때는 타이머를 실행하지 않음
    if (isWisdomCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const totalSeconds = 
          prevTime.days * 24 * 60 * 60 +
          prevTime.hours * 60 * 60 +
          prevTime.minutes * 60 +
          prevTime.seconds;

        if (totalSeconds <= 1) {
          clearInterval(timer);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const newTotalSeconds = totalSeconds - 1;
        return {
          days: Math.floor(newTotalSeconds / (24 * 60 * 60)),
          hours: Math.floor((newTotalSeconds % (24 * 60 * 60)) / (60 * 60)),
          minutes: Math.floor((newTotalSeconds % (60 * 60)) / 60),
          seconds: newTotalSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWisdomCompleted]);

  const formatTime = (time: number): string => {
    return time.toString().padStart(2, '0');
  };

  const handleWisdomComplete = () => {
    setIsWisdomCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  // 완료 상태에 따른 색상 결정
  const primaryColor = isWisdomCompleted ? "#555555" : "#ADFF00";

  return (
    <>
    <section className="w-full flex flex-col justify-center items-center gap-8 sm:gap-12 lg:gap-16 py-12 lg:py-20 px-4">
      
      {/* 상단: 제목과 카운트다운 */}
      <div className="w-full max-w-[544px] flex flex-col justify-start items-center gap-8 sm:gap-10 lg:gap-12">
        
        {/* 제목 영역 */}
        <div className="flex flex-col justify-start items-center gap-3 sm:gap-4 lg:gap-5">
          <div className="self-stretch flex flex-col justify-start items-center">
            <div 
              className="self-stretch text-center text-3xl sm:text-4xl lg:text-6xl font-bold font-['Pretendard'] leading-tight lg:leading-[96px]"
              style={{ color: primaryColor }}
            >
              1단계
            </div>
            <div className="text-center text-white text-3xl sm:text-4xl lg:text-6xl font-bold font-['Pretendard'] leading-tight lg:leading-[96px]">
              위즈덤 카드 작성하기
            </div>
          </div>
        </div>

        {/* 카운트다운 타이머 */}
        <div className="w-full max-w-96 flex flex-col justify-start items-center gap-5">
          
          {/* 타이머 숫자들 */}
          <div className="w-full flex justify-center items-center gap-2 sm:gap-3 lg:gap-4">
            
            {/* 일 */}
            <div className="w-16 sm:w-18 lg:w-20 inline-flex flex-col justify-start items-center">
              <div className="self-stretch h-16 sm:h-18 lg:h-20 rounded-[32px] sm:rounded-[36px] lg:rounded-[42px] outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px] flex flex-col justify-center items-center ">
                <div 
                  className="text-center text-xl sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-none"
                  style={{ color: primaryColor }}
                >
                  {formatTime(timeLeft.days)}
                </div>
              </div>
              <div className="self-stretch text-center text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] leading-tight">
                일
              </div>
            </div>

            {/* 시 */}
            <div className="w-16 sm:w-18 lg:w-20 inline-flex flex-col justify-start items-center ">
              <div className="self-stretch h-16 sm:h-18 lg:h-20 rounded-[32px] sm:rounded-[36px] lg:rounded-[42px] outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px] flex flex-col justify-center items-center ">
                <div 
                  className="text-center text-xl sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-none"
                  style={{ color: primaryColor }}
                >
                  {formatTime(timeLeft.hours)}
                </div>
              </div>
              <div className="self-stretch text-center text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] leading-tight">
                시
              </div>
            </div>

            {/* 분 */}
            <div className="w-16 sm:w-18 lg:w-20 inline-flex flex-col justify-start items-center ">
              <div className="self-stretch h-16 sm:h-18 lg:h-20 px-5 sm:px-6  rounded-[32px] sm:rounded-[36px] lg:rounded-[42px] outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px] flex flex-col justify-center items-center ">
                <div 
                  className="text-center text-xl sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-none"
                  style={{ color: primaryColor }}
                >
                  {formatTime(timeLeft.minutes)}
                </div>
              </div>
              <div className="self-stretch text-center text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] leading-tight">
                분
              </div>
            </div>

            {/* 초 */}
            <div className="w-16 sm:w-18 lg:w-20 inline-flex flex-col justify-start items-center ">
              <div className="self-stretch h-16 sm:h-18 lg:h-20 rounded-[32px] sm:rounded-[36px] lg:rounded-[42px] outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px] flex flex-col justify-center items-center ">
                <div 
                  className="text-center text-xl sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-none"
                  style={{ color: primaryColor }}
                >
                  {formatTime(timeLeft.seconds)}
                </div>
              </div>
              <div className="self-stretch text-center text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] leading-tight">
                초
              </div>
            </div>
          </div>

          {/* 남은 시간 메시지 */}
          <div 
            className="self-stretch text-center text-lg sm:text-xl font-semibold font-['Pretendard'] leading-relaxed lg:leading-9"
            style={{ color: primaryColor }}
          >
            {isWisdomCompleted ? "작성이 완료되었습니다!" : "남았어요 ! 얼른 작성해보세요"}
          </div>
        </div>
      </div>

      {/* 하단: 비디오와 텍스트 */}
      <div className="w-full flex flex-col lg:flex-row justify-center items-center gap-5 max-w-7xl mx-auto">
        
      <div className="w-[1200px] h-[400px] bg-stone-700/40 outline outline-1 outline-offset-[-1px] outline-white/20 flex justify-center items-center relative rounded-lg lg:rounded-none overflow-hidden">

        {!isVideoPlaying ? (
          <>
            {/* YouTube 인네일 배경 */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url(https://img.youtube.com/vi/gYV0IAUxGhw/maxresdefault.jpg)"
              }}
            />
            
            {/* 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* 플레이 버튼 */}
            <button 
              className="relative w-20 sm:w-24 lg:w-28 h-20 sm:h-24 lg:h-28 bg-stone-900/60 rounded-full border border-[#ADFF00] backdrop-blur-[6px] flex items-center justify-center hover:scale-105 transition-transform group z-10"
              onClick={() => setIsVideoPlaying(true)}
              aria-label="비디오 재생"
            >
              <img 
                src="/images/Polygon 1.png" 
                alt="재생 버튼" 
                className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 object-contain group-hover:brightness-110"
              />
            </button>
          </>
        ) : (
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/gYV0IAUxGhw?autoplay=1"
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

        {/* 텍스트 영역 */}
        <div className="w-full max-w-[534px] h-[400px] flex flex-col justify-between items-start px-4 lg:px-0">
          
          {/* 상단 영역 - 영상과 같은 위치에서 시작 */}
          <div className="flex flex-col justify-start items-start">
            <h3 className="self-stretch text-white text-2xl sm:text-3xl lg:text-5xl font-bold font-['Pretendard'] leading-tight lg:leading-[72px]">
              이색 미니 보험의 등장
            </h3>
            
            <div className="self-stretch text-neutral-400 text-sm sm:text-base lg:text-lg font-normal font-['Pretendard'] leading-relaxed">
              이번 영상은 "요즘 보험"에 대한 트렌드를 다루고 있어요. 아이돌 덕질하다 다치거나, 책을 오래 읽다가 시력이 나빠지는 등의 일상 속 예상 못한 상황을 보장해주는 '미니 보험' 상품에 대한 내용이에요. '우리 서비스에도 이런 개인화된 접근을 할 수 있을까?' 고민해볼 수 있는 좋은 사례예요. 이번주 위즈덤도 화이팅~! 💪
            </div>
          </div>

          {/* 하단 영역 - 영상과 같은 위치에서 종료 */}
          <div className="flex flex-col justify-start items-start gap-3.5 mt-auto">
            
            {/* 날짜 영역 */}
            <div className="inline-flex justify-center items-center gap-[10px]">
              <div className="w-6 h-6 relative overflow-hidden flex items-center justify-center">
                <img 
                  src="/images/arrow.png" 
                  alt="화살표" 
                  className="w-3.5 h-2.5 object-contain"
                />
              </div>
              <div className="text-white text-base sm:text-lg lg:text-xl font-semibold font-['Pretendard'] leading-relaxed lg:leading-9">
                2025. 09. 08 (월) ~ 2025. 09. 12 (목) 23:59
              </div>
            </div>

            {/* 버튼 - 완료 상태에 따라 이미지와 클릭 가능 여부 변경 */}
            {isWisdomCompleted ? (
              <div className="w-full h-12 sm:h-14 flex justify-center items-center">
                <img 
                  src="/images/complete.png" 
                  alt="작성 완료됨" 
                  className="w-full max-w-[534px] h-full object-cover"
                />
              </div>
            ) : (
              <button 
                className="w-full h-12 sm:h-14 flex justify-center items-center hover:scale-[1.02] transition-transform"
                onClick={() => setIsModalOpen(true)}
                aria-label="위즈덤 작성하기"
              >
                <img 
                  src="/images/button.png" 
                  alt="위즈덤 작성하기" 
                  className="w-full max-w-[534px] h-full object-cover"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* 위즈덤 작성 모달 */}
    <WisdomModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)}
      onComplete={handleWisdomComplete}
    />
  </>
);
};