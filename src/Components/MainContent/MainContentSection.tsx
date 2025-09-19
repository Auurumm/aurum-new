import React, { useState, useEffect } from "react";

interface UserCard {
  id: number;
  userInfo: string;
  stats: {
    honor: number;      // 경의
    recommend: number;  // 추천
    respect: number;    // 존중
    hug: number;        // 응원
  };
  profileImage?: string;
}

export const MainContentSection = (): JSX.Element => {
  const getRankBadgeImage = (rank: number): string | null => {
    if (rank === 1) return "/images/rank-1-badge.png";
    if (rank === 2) return "/images/rank-2-badge.png";
    if (rank === 3) return "/images/rank-3-badge.png";
    return null;
  };

  const getRankBadgeSize = (rank: number): string => {
    if (rank === 1) return "w-12 h-14 sm:w-16 sm:h-20 lg:w-[75px] lg:h-[88px]";
    return "w-12 h-12 sm:w-16 sm:h-16 lg:w-[71px] lg:h-[71px]";
  };

  const allUsers: UserCard[] = [
    {
      id: 1,
      userInfo: "홍길동 / 남 / 23 / 율도국 / 스키학과 / 3 / 미디어 / 웹툰 / 일반 / 구글",
      stats: { honor: 28, recommend: 21, respect: 11, hug: 2 },
      profileImage: "/images/profile1.png"
    },
    {
      id: 2,
      userInfo: "홍길동 / 남 / 23 / 율도국 / 스키학과 / 3 / 미디어 / 웹툰 / 일반 / 구글",
      stats: { honor: 22, recommend: 8, respect: 10, hug: 2 },
      profileImage: "/images/profile2.png"
    },
    {
      id: 3,
      userInfo: "홍길동 / 남 / 23 / 율도국 / 스키학과 / 3 / 미디어 / 웹툰 / 일반 / 구글",
      stats: { honor: 22, recommend: 8, respect: 10, hug: 2 },
      profileImage: "/images/profile1.png"
    },
    {
      id: 4,
      userInfo: "홍길동 / 남 / 23 / 율도국 / 스키학과 / 3 / 미디어 / 웹툰 / 일반 / 구글",
      stats: { honor: 22, recommend: 8, respect: 10, hug: 2 },
      profileImage: "/images/profile2.png"
    },
    {
      id: 5,
      userInfo: "홍길동 / 남 / 23 / 율도국 / 스키학과 / 3 / 미디어 / 웹툰 / 일반 / 구글",
      stats: { honor: 22, recommend: 8, respect: 10, hug: 2 },
      profileImage: "/images/profile1.png"
    }
  ];

  const [translateX, setTranslateX] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 반응형 카드 너비 계산
  const getCardWidth = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 280; // 모바일: 280px (카드 1장만 표시)
      if (window.innerWidth < 1024) return 350; // 태블릿: 350px
      return 490; // 데스크탑: 490px
    }
    return 490;
  };

  const [cardWidth, setCardWidth] = useState(getCardWidth());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCardWidth(getCardWidth());
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const originalSetWidth = allUsers.length * cardWidth;

  // 데스크탑에서만 자동 슬라이드
  useEffect(() => {
    if (!isMobile) {
      const interval = setInterval(() => {
        setTranslateX(prev => {
          const newX = prev - 1;
          if (Math.abs(newX) >= originalSetWidth) {
            return 0;
          }
          return newX;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [originalSetWidth, isMobile]);

  // 모바일 네비게이션 함수
  const goToNext = () => {
    const nextIndex = currentIndex < allUsers.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
    setTranslateX(-nextIndex * 296); // 256px(카드) + 48px(여백) = 304px
  };

  const goToPrev = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allUsers.length - 1;
    setCurrentIndex(prevIndex);
    setTranslateX(-prevIndex * 296); // 256px(카드) + 12px(여백) = 304px
  };

  // 데스크탑은 기존 3번 복제, 모바일만 원본 배열 사용
  const extendedUsers = isMobile ? allUsers : [...allUsers, ...allUsers, ...allUsers];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* 제목 */}
      <div className="text-center text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-['Pretendard'] leading-tight lg:leading-[96px] mb-6 sm:mb-8 lg:mb-6">
        실시간 순위
      </div>

      {/* 모바일 레이아웃 */}
      {isMobile ? (
        <div className="relative flex items-center justify-center px-2">
          {/* 왼쪽 화살표 - 여백 줄임 */}
          <button 
            onClick={goToPrev}
            className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center transition-opacity touch-optimized"
            aria-label="이전 카드"
          >
            <img 
              src="/images/left.png" 
              alt="이전" 
              className="w-6 h-6 object-contain"
            />
          </button>
          
          {/* 카드 영역 - 한 장만 표시, 정확히 카드 1장 크기로 맞춤 */}
          <div className="w-64 overflow-hidden mx-8">
            <div 
              className="flex transition-transform duration-300"
              style={{ 
                transform: `translateX(${translateX}px)`,
                width: `${allUsers.length * 296}px` // 256px(카드) + 48px(여백) = 304px
              }}
            >
              {allUsers.map((user, index) => {
                const actualRank = index + 1;
                const badgeImage = getRankBadgeImage(actualRank);
                
                return (
                  <div 
                    key={user.id} 
                    className="w-64 flex-shrink-0 flex flex-col relative mr-12" // w-12 여백 추가
                  >
                    
                    {/* 상단 프로필 영역 */}
                    <div className="w-full h-28 px-4 py-3 bg-gradient-to-b from-black/0 to-black/50 rounded-tl-[20px] rounded-tr-[20px] outline outline-1 outline-offset-[-1px] outline-white/20 flex flex-col justify-end items-center relative overflow-hidden">
                      
                      {/* 배경 프로필 이미지 */}
                      {user.profileImage && (
                        <img
                          src={user.profileImage}
                          alt="프로필"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={user.profileImage === "/images/profile2.png" ? { objectPosition: "center 75%" } : {}}
                        />
                      )}
                      
                      {/* 어둡게 보정 그라디언트 */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/50" />
                      
                      {/* 순위 배지 */}
                      {badgeImage && (
                        <div className="absolute top-2 left-2 z-10">
                          <img 
                            src={badgeImage} 
                            alt={`${actualRank}위 배지`}
                            className="w-12 h-14"
                          />
                        </div>
                      )}
                      
                      {/* 프로필 정보 텍스트 */}
                      <div className="text-center text-white text-sm font-semibold font-['Pretendard'] capitalize leading-none px-2 relative z-10">
                        <span className="line-clamp-2 break-all">
                          {user.userInfo}
                        </span>
                      </div>
                    </div>

                    {/* 하단 통계 영역 */}
                    <div className="w-full px-4 py-2.5 bg-neutral-900 rounded-bl-[20px] rounded-br-[20px] outline outline-1 outline-offset-[-1px] outline-white/20 flex flex-col gap-3.5">
                      
                      {/* 통계 아이콘들 */}
                      <div className="bg-neutral-900 rounded-[20px] flex justify-center items-center">
                        <div className="flex">
                          
                          {/* 경의 */}
                          <div className="p-3.5 flex flex-col justify-center items-center gap-[5px]">
                            <img className="w-7 h-7" src="/images/honor-icon.png" alt="경의" />
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-center text-white text-xl font-semibold font-['Pretendard'] leading-9">
                                {user.stats.honor}
                              </div>
                              <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                경의
                              </div>
                            </div>
                          </div>
                          
                          {/* 추천 */}
                          <div className="p-3.5 flex flex-col justify-center items-center gap-[5px]">
                            <img className="w-7 h-7" src="/images/recommend-icon.png" alt="추천" />
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-center text-white text-xl font-semibold font-['Pretendard'] leading-9">
                                {user.stats.recommend}
                              </div>
                              <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                추천
                              </div>
                            </div>
                          </div>
                          
                          {/* 존중 */}
                          <div className="p-3.5 flex flex-col justify-center items-center gap-[5px]">
                            <img className="w-7 h-7" src="/images/respect-icon.png" alt="존중" />
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-center text-white text-xl font-semibold font-['Pretendard'] leading-9">
                                {user.stats.respect}
                              </div>
                              <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                존중
                              </div>
                            </div>
                          </div>
                          
                          {/* 응원 */}
                          <div className="p-3.5 flex flex-col justify-center items-center gap-[5px]">
                            <img className="w-7 h-7" src="/images/hug-icon.png" alt="응원" />
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-center text-white text-xl font-semibold font-['Pretendard'] leading-9">
                                {user.stats.hug}
                              </div>
                              <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                응원
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 메시지 박스 - 이미지 사용 */}
                      <img 
                        className="w-full h-auto object-cover" 
                        src="/images/message2.png" 
                        alt="나는 기획자 중에 기획자 멋쟁이 기획자다 =!" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 오른쪽 화살표 - 여백 줄임 */}
          <button 
            onClick={goToNext}
            className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center transition-opacity touch-optimized"
            aria-label="다음 카드"
          >
            <img 
              src="/images/right.png" 
              alt="다음" 
              className="w-6 h-6 object-contain"
            />
          </button>
        </div>
      ) : (
        /* 데스크탑 레이아웃 - 기존 유지 */
        <div className="relative w-full overflow-hidden">
          <div 
            className="flex gap-3 sm:gap-4 lg:gap-[14px] transition-none"
            style={{ 
              transform: `translateX(${translateX}px)`,
              width: `${extendedUsers.length * cardWidth}px`
            }}
          >
            {extendedUsers.map((user, index) => {
              const actualRank = (index % allUsers.length) + 1;
              const badgeImage = getRankBadgeImage(actualRank);
              const badgeSize = getRankBadgeSize(actualRank);
              
              return (
                <div 
                  key={`${user.id}-${index}`} 
                  className="flex-shrink-0 inline-flex flex-col justify-start items-start relative"
                  style={{ 
                    width: `${cardWidth - (typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : typeof window !== 'undefined' && window.innerWidth < 1024 ? 16 : 14)}px`
                  }}
                >
                  
                  {/* 상단 프로필 영역 */}
                  <div className="self-stretch h-32 sm:h-40 lg:h-48 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 bg-gradient-to-b from-black/0 to-black/50 rounded-tl-[15px] sm:rounded-tl-[18px] lg:rounded-tl-[20px] rounded-tr-[15px] sm:rounded-tr-[18px] lg:rounded-tr-[20px] outline outline-1 outline-offset-[-1px] outline-white/20 flex flex-col justify-end items-center gap-2.5 relative overflow-hidden">
                    
                    {/* 배경 프로필 이미지 */}
                    {user.profileImage && (
                      <img
                        src={user.profileImage}
                        alt="프로필"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={user.profileImage === "/images/profile2.png" ? { objectPosition: "center 75%" } : {}}
                      />
                    )}
                    
                    {/* 어둡게 보정 그라디언트 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/50" />
                    
                    {/* 순위 배지 */}
                    {badgeImage && (
                      <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 z-10">
                        <img 
                          src={badgeImage} 
                          alt={`${actualRank}위 배지`}
                          className={badgeSize}
                        />
                      </div>
                    )}
                    
                    {/* 프로필 정보 텍스트 */}
                    <div className="text-center text-white text-xs sm:text-sm lg:text-sm font-semibold font-['Pretendard'] capitalize leading-none px-2 relative z-10">
                      <span className="line-clamp-2 break-all">
                        {user.userInfo}
                      </span>
                    </div>
                  </div>

                  {/* 하단 통계 영역 */}
                  <div className="self-stretch h-40 sm:h-48 lg:h-60 px-3 sm:px-4 lg:px-4 py-3 sm:py-4 lg:py-5 bg-neutral-900 rounded-bl-[15px] sm:rounded-bl-[18px] lg:rounded-bl-[20px] rounded-br-[15px] sm:rounded-br-[18px] lg:rounded-br-[20px] outline outline-1 outline-offset-[-1px] outline-white/20 flex flex-col justify-start items-start gap-2.5">
                    
                    <div className="w-full flex flex-col justify-start items-center gap-2.5 sm:gap-3 lg:gap-3.5">
                      
                      {/* 통계 아이콘들 */}
                      <div className="self-stretch bg-neutral-900 rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] inline-flex justify-center items-center">
                        
                        {/* 경의 */}
                        <div className="w-16 sm:w-20 lg:w-28 p-2 sm:p-2.5 lg:p-3.5 inline-flex flex-col justify-center items-center gap-1 sm:gap-1 lg:gap-[5px]">
                          <img className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" src="/images/honor-icon.png" alt="경의" />
                          <div className="self-stretch flex flex-col justify-center items-center">
                            <div className="text-center text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-tight lg:leading-10 font-['Pretendard']">
                              {user.stats.honor}
                            </div>
                            <div className="text-center text-gray-400 text-xs sm:text-sm lg:text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              경의
                            </div>
                          </div>
                        </div>
                        
                        {/* 추천 */}
                        <div className="w-16 sm:w-20 lg:w-28 p-2 sm:p-2.5 lg:p-3.5 inline-flex flex-col justify-center items-center gap-1 sm:gap-1 lg:gap-[5px]">
                          <img className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" src="/images/recommend-icon.png" alt="추천" />
                          <div className="self-stretch flex flex-col justify-center items-center">
                            <div className="text-center text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-tight lg:leading-10 font-['Pretendard']">
                              {user.stats.recommend}
                            </div>
                            <div className="text-center text-gray-400 text-xs sm:text-sm lg:text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              추천
                            </div>
                          </div>
                        </div>
                        
                        {/* 존중 */}
                        <div className="w-16 sm:w-20 lg:w-28 p-2 sm:p-2.5 lg:p-3.5 inline-flex flex-col justify-center items-center gap-1 sm:gap-1 lg:gap-[5px]">
                          <img className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" src="/images/respect-icon.png" alt="존중" />
                          <div className="self-stretch flex flex-col justify-center items-center">
                            <div className="text-center text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-tight lg:leading-10 font-['Pretendard']">
                              {user.stats.respect}
                            </div>
                            <div className="text-center text-gray-400 text-xs sm:text-sm lg:text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              존중
                            </div>
                          </div>
                        </div>
                        
                        {/* 응원 */}
                        <div className="w-16 sm:w-20 lg:w-28 p-2 sm:p-2.5 lg:p-3.5 inline-flex flex-col justify-center items-center gap-1 sm:gap-1 lg:gap-[5px]">
                          <img className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" src="/images/hug-icon.png" alt="응원" />
                          <div className="self-stretch flex flex-col justify-center items-center">
                            <div className="text-center text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-tight lg:leading-10 font-['Pretendard']">
                              {user.stats.hug}
                            </div>
                            <div className="text-center text-gray-400 text-xs sm:text-sm lg:text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              응원
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 메시지 박스 */}
                      <img 
                        className="w-full h-auto object-cover" 
                        src="/images/message2.png" 
                        alt="나는 기획자 중에 기획자 멋쟁이 기획자다 =!" 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};