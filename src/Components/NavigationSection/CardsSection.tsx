import React, { useState, useEffect, useRef } from "react";
import { WisdomService, WisdomPost } from "../../services/WisdomService.ts";

interface WisdomCardGridProps {
  isWisdomCompleted?: boolean;
  onAllReactionsComplete?: () => void;
  requireAuth?: boolean;
  onAuthRequired?: () => boolean;
  newWisdomPost?: WisdomPost | null;
}

export const WisdomCardGrid = ({ 
  isWisdomCompleted = false, 
  onAllReactionsComplete, 
  requireAuth = false, 
  onAuthRequired,
  newWisdomPost 
}: WisdomCardGridProps): JSX.Element => {
  const [selectedCard, setSelectedCard] = useState<WisdomPost | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [isCompletePopup, setIsCompletePopup] = useState(false);
  const [modalTopPosition, setModalTopPosition] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // 표현 행위 아이콘 매핑
  const reactionIcons = {
    honor: "/images/honor-icon.png",
    recommend: "/images/recommend-icon.png", 
    respect: "/images/respect-icon.png",
    hug: "/images/hug-icon.png"
  };

  // 표현 행위 라벨 매핑
  const reactionLabels = {
    honor: "경의",
    recommend: "추천",
    respect: "존중", 
    hug: "응원"
  };

  // 더미 반응 히스토리
  const reactionHistory = [
    { name: "윤하린", gender: "여", age: 24, company: "미래에셋대우증권주식회사", reaction: "경의" },
    { name: "정현우", gender: "남", age: 26, company: "카카오", reaction: "추천" },
    { name: "박하늘", gender: "여", age: 25, company: "배달의민족", reaction: "존중" },
    { name: "강시후", gender: "남", age: 22, company: "쿠팡", reaction: "경의" },
    { name: "김민지", gender: "여", age: 22, company: "카카오엔터테인먼트", reaction: "응원" }
  ];

  // 더미 위즈덤 데이터 (12개)
  const dummyWisdomPosts: WisdomPost[] = [
    {
      id: "1",
      user_id: "user1",
      request_a: "미니 보험은 1만 원 이하의 적은 보험료로 1년 미만의 짧은 보험을 말한다. 해당",
      request_b: "2030세대 라이프스타일을 반영한 미니보험에 '게임화(게이미피케이션) 요소'를 보험 가입 및",
      request_c: "최근 미니보험은 생활 밀착형 콘셉트로 2030 세대의 눈길을 사로잡고 있다.",
      honor_count: 22,
      recommend_count: 8,
      respect_count: 10,
      hug_count: 2,
      created_at: "2025-09-09T19:18:00Z",
      updated_at: "2025-09-09T19:18:00Z",
      profile: {
        full_name: "홍길동"
      }
    },
    {
      id: "2",
      user_id: "user2",
      request_a: "소액으로 시작하는 미니 보험, 일상 속 작은 안전망이 되어줍니다.",
      request_b: "미니 보험은 소액으로 가입할 수 있어 누구나 부담 없이 이용 가능합니다. 일상 속 돌발 상황에 대비할 수 있고, 건강·여행·반려동물 등 테마별 보장으로 생활 전반에 안전망을 제공합니다.\n간단한 절차와 저렴한 비용이 강점입니다.",
      request_c: "소액으로 시작하는 미니 보험, 일상 속 작은 안전망이 되어줍니다.",
      honor_count: 15,
      recommend_count: 12,
      respect_count: 8,
      hug_count: 5,
      created_at: "2025-09-08T14:30:00Z",
      updated_at: "2025-09-08T14:30:00Z",
      profile: {
        full_name: "김민수"
      }
    },
    {
      id: "3",
      user_id: "user3",
      request_a: "디지털 네이티브 세대를 위한 맞춤형 금융 서비스 제안",
      request_b: "Z세대와 밀레니얼 세대는 기존 금융 서비스보다 간편하고 직관적인 서비스를 선호합니다. 모바일 우선 설계와 게임화 요소를 통해 금융에 대한 진입장벽을 낮추고 있습니다.",
      request_c: "개인 맞춤형 추천 시스템과 실시간 알림으로 효율적인 자산 관리를 지원합니다.",
      honor_count: 18,
      recommend_count: 9,
      respect_count: 14,
      hug_count: 7,
      created_at: "2025-09-07T11:45:00Z",
      updated_at: "2025-09-07T11:45:00Z",
      profile: {
        full_name: "이서연"
      }
    },
    {
      id: "4",
      user_id: "user4",
      request_a: "ESG 투자의 새로운 패러다임과 미래 전망",
      request_b: "환경, 사회, 지배구조를 고려한 ESG 투자가 주류가 되고 있습니다. 기업의 지속가능성을 평가하는 새로운 기준으로 자리잡고 있으며, 장기적 수익성과 사회적 가치 창출을 동시에 추구합니다.",
      request_c: "ESG 평가 기준의 표준화와 투명성 확보가 향후 과제로 남아있습니다.",
      honor_count: 25,
      recommend_count: 16,
      respect_count: 19,
      hug_count: 3,
      created_at: "2025-09-06T09:20:00Z",
      updated_at: "2025-09-06T09:20:00Z",
      profile: {
        full_name: "박준혁"
      }
    },
    {
      id: "5",
      user_id: "user5",
      request_a: "인공지능 기반 개인 자산관리 서비스의 혁신",
      request_b: "AI 로보어드바이저가 개인의 투자 성향과 목표를 분석하여 맞춤형 포트폴리오를 제안합니다. 시장 변동성에 실시간으로 대응하며 리밸런싱을 자동화합니다.",
      request_c: "개인화된 금융 상품 추천과 위험 관리를 통해 투자의 민주화를 실현합니다.",
      honor_count: 20,
      recommend_count: 13,
      respect_count: 11,
      hug_count: 9,
      created_at: "2025-09-05T16:15:00Z",
      updated_at: "2025-09-05T16:15:00Z",
      profile: {
        full_name: "정다은"
      }
    },
    {
      id: "6",
      user_id: "user6",
      request_a: "블록체인 기술을 활용한 투명한 금융 생태계 구축",
      request_b: "분산원장 기술로 금융 거래의 투명성과 보안성을 크게 향상시킬 수 있습니다. 스마트 계약을 통한 자동화된 금융 서비스와 중개 수수료 절감이 가능합니다.",
      request_c: "규제 환경 정비와 기술적 안정성 확보가 대중화의 핵심 요소입니다.",
      honor_count: 17,
      recommend_count: 11,
      respect_count: 13,
      hug_count: 6,
      created_at: "2025-09-04T13:40:00Z",
      updated_at: "2025-09-04T13:40:00Z",
      profile: {
        full_name: "최영준"
      }
    },
    {
      id: "7",
      user_id: "user7",
      request_a: "구독 경제 모델의 금융 서비스 적용 가능성",
      request_b: "Netflix, Spotify와 같은 구독 모델을 금융 서비스에 적용하면 고객의 예측 가능한 비용 지출과 서비스 제공자의 안정적 수익을 보장할 수 있습니다.",
      request_c: "개인화된 금융 패키지 서비스로 고객 만족도와 충성도를 높일 수 있습니다.",
      honor_count: 14,
      recommend_count: 8,
      respect_count: 12,
      hug_count: 4,
      created_at: "2025-09-03T10:25:00Z",
      updated_at: "2025-09-03T10:25:00Z",
      profile: {
        full_name: "강민아"
      }
    },
    {
      id: "8",
      user_id: "user8",
      request_a: "오픈뱅킹과 핀테크 생태계의 상생 발전 방안",
      request_b: "오픈뱅킹 API를 통해 핀테크 스타트업들이 혁신적인 금융 서비스를 개발할 수 있는 환경이 조성되었습니다. 기존 은행과 핀테크 기업 간의 협력이 새로운 가치를 창출합니다.",
      request_c: "데이터 보안과 개인정보 보호를 위한 강화된 규제 체계가 필요합니다.",
      honor_count: 21,
      recommend_count: 15,
      respect_count: 16,
      hug_count: 8,
      created_at: "2025-09-02T15:50:00Z",
      updated_at: "2025-09-02T15:50:00Z",
      profile: {
        full_name: "윤태민"
      }
    },
    {
      id: "9",
      user_id: "user9",
      request_a: "마이크로 투자와 소액 분산투자의 대중화",
      request_b: "소액으로도 다양한 자산에 투자할 수 있는 마이크로 투자 플랫폼이 투자의 문턱을 낮추고 있습니다. 잔돈 모으기, 목표 기반 저축 등 일상과 밀착된 투자 방식을 제공합니다.",
      request_c: "투자 교육과 리스크 인식 개선을 통해 건전한 투자 문화를 조성해야 합니다.",
      honor_count: 16,
      recommend_count: 10,
      respect_count: 9,
      hug_count: 11,
      created_at: "2025-09-01T12:30:00Z",
      updated_at: "2025-09-01T12:30:00Z",
      profile: {
        full_name: "손지혜"
      }
    },
    {
      id: "10",
      user_id: "user10",
      request_a: "디지털 자산과 전통 금융의 융합 서비스",
      request_b: "암호화폐와 같은 디지털 자산을 기존 금융 시스템에 통합하는 하이브리드 서비스가 등장하고 있습니다. 디지털 자산을 담보로 한 대출, 스테이킹 서비스 등이 새로운 수익 모델을 제시합니다.",
      request_c: "규제 불확실성 해소와 기술적 표준화가 시장 확산의 관건입니다.",
      honor_count: 19,
      recommend_count: 14,
      respect_count: 15,
      hug_count: 5,
      created_at: "2025-08-31T08:15:00Z",
      updated_at: "2025-08-31T08:15:00Z",
      profile: {
        full_name: "임수빈"
      }
    },
    {
      id: "11",
      user_id: "user11",
      request_a: "초개인화 금융 서비스와 고객 경험 혁신",
      request_b: "빅데이터와 AI 분석을 통해 개인의 소비 패턴, 라이프스타일, 금융 목표를 종합 분석하여 완전히 개인화된 금융 상품과 서비스를 제공합니다.",
      request_c: "실시간 맞춤형 알림과 추천으로 고객의 금융 의사결정을 지원합니다.",
      honor_count: 12,
      recommend_count: 7,
      respect_count: 10,
      hug_count: 13,
      created_at: "2025-08-30T17:45:00Z",
      updated_at: "2025-08-30T17:45:00Z",
      profile: {
        full_name: "배성호"
      }
    },
    {
      id: "12",
      user_id: "user12",
      request_a: "지속가능한 금융과 임팩트 투자의 확산",
      request_b: "사회적 가치 창출과 수익성을 동시에 추구하는 임팩트 투자가 주목받고 있습니다. 환경 보호, 사회 문제 해결 등에 기여하는 기업과 프로젝트에 대한 투자를 통해 지속가능한 성장을 도모합니다.",
      request_c: "임팩트 측정과 평가 기준의 표준화가 시장 발전의 핵심 과제입니다.",
      honor_count: 23,
      recommend_count: 18,
      respect_count: 17,
      hug_count: 6,
      created_at: "2025-08-29T14:20:00Z",
      updated_at: "2025-08-29T14:20:00Z",
      profile: {
        full_name: "조은진"
      }
    }
  ];

  // 타임스탬프 포맷팅 함수
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}. ${month}. ${day}(${dayName}) ${hours}:${minutes}`;
  };

  // 카드를 표시용으로 변환
  const convertToDisplayCard = (post: WisdomPost) => {
    const userInfo = post.profile 
      ? `${post.profile.full_name || '사용자'} / 남 / 23 / 한국대 / 표범학과 / 3 / 미디어 / 웹툰 / 일반 / 구글`
      : "사용자 / 남 / 23 / 한국대 / 표범학과 / 3 / 미디어 / 웹툰 / 일반 / 구글";
    
    return {
      ...post,
      userInfo,
      content: [
        `- ${post.request_a}`,
        `- ${post.request_b}`,
        `- ${post.request_c}`
      ],
      timestamp: formatTimestamp(post.created_at),
      stats: {
        honor: post.honor_count,
        recommend: post.recommend_count,
        respect: post.respect_count,
        hug: post.hug_count
      }
    };
  };

  const handleCardClick = (post: WisdomPost, event: React.MouseEvent<HTMLElement>) => {
    const clickedElement = event.currentTarget;
    const elementRect = clickedElement.getBoundingClientRect();
    const elementTop = elementRect.top + window.pageYOffset;
    
    setModalTopPosition(Math.max(50, elementTop - 50));
    setSelectedCard(post);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setSelectedReaction(null);
    setModalTopPosition(0);
  };

  const handleReactionSelect = (reactionType: string) => {
    setSelectedReaction(reactionType);
  };

  const handleSendReaction = async () => {
    if (!isWisdomCompleted) {
      alert("1단계를 먼저 완료해주세요!");
      return;
    }
    
    if (!selectedReaction || !selectedCard) {
      alert("표현행위를 선택해주세요!");
      return;
    }
    
    // 인증 확인
    if (requireAuth && onAuthRequired && !onAuthRequired()) {
      return;
    }
    
    try {
      // 실제 API 호출 대신 로컬 상태만 업데이트
      const newCount = reactionCount === 1 ? 12 : reactionCount + 1;
      setReactionCount(newCount);
      
      // 12번째 표현행위 완료 시 완료 팝업이 뜨도록 설정
      if (newCount >= 2) {
        setIsCompletePopup(true);
      } else {
        setIsCompletePopup(false);
      }
      
      setShowReactionPopup(true);
      
      // 3초 후 팝업 자동 닫기
      setTimeout(() => {
        closeReactionPopup();
      }, 3000);
      
    } catch (error) {
      console.error('표현행위 예외:', error);
      alert('표현행위 중 예상치 못한 오류가 발생했습니다.');
    }
  };

  // 모달이 열릴 때 스크롤 위치 조정
  useEffect(() => {
    if (selectedCard && modalTopPosition > 0) {
      const scrollToModal = () => {
        const targetScrollTop = modalTopPosition - 80;
        window.scrollTo({ 
          top: Math.max(0, targetScrollTop), 
          behavior: 'smooth' 
        });
      };
      setTimeout(scrollToModal, 150);
    }
  }, [selectedCard, modalTopPosition]);

  // 토스트 팝업이 뜰 때 자동 스크롤 처리
  useEffect(() => {
    if (showReactionPopup) {
      const scrollToToastPosition = () => {
        const targetScrollTop = Math.max(0, modalTopPosition + 100);
        window.scrollTo({ 
          top: targetScrollTop, 
          behavior: 'smooth' 
        });
      };
      setTimeout(scrollToToastPosition, 100);
      setTimeout(scrollToToastPosition, 300);
    }
  }, [showReactionPopup]);

  const closeReactionPopup = () => {
    setShowReactionPopup(false);
    
    // 12번째 완료 후 팝업을 닫을 때 상위 컴포넌트에 알림
    if (isCompletePopup && reactionCount >= 12 && onAllReactionsComplete) {
      setSelectedCard(null);
      setSelectedReaction(null);
      
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 500);
      
      onAllReactionsComplete();
    }
  };

  return (
    <>
      {/* 반응형 카드 그리드 */}
      <div className="w-full flex justify-center mb-[120px]">
        <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          
          {/* 데스크톱 레이아웃 (lg 이상) - 4행 3열 */}
          <div className="hidden lg:block">
            <div className="inline-flex flex-col justify-start items-center gap-3.5 w-full">
              {Array(4).fill(null).map((_, rowIndex) => (
                <div key={rowIndex} className="w-full inline-flex justify-center items-center gap-3.5">
                  {dummyWisdomPosts.slice(rowIndex * 3, (rowIndex + 1) * 3).map((post) => {
                    const card = convertToDisplayCard(post);
                    return (
                      <div 
                        key={post.id}
                        className="w-96 p-6 bg-stone-700 rounded-[20px] outline outline-1 outline-offset-[-0.50px] outline-neutral-900 inline-flex flex-col justify-start items-center gap-9 opacity-100 cursor-pointer hover:bg-stone-600 transition-colors duration-300"
                        onClick={(e) => handleCardClick(post, e)}
                      >
                        <div className="self-stretch flex flex-col justify-start items-center gap-5">
                          
                          {/* 프로필 및 콘텐츠 섹션 */}
                          <div className="flex flex-col justify-start items-start gap-4">
                            
                            {/* 프로필 */}
                            <div className="inline-flex justify-start items-center gap-3.5">
                              <img 
                                className="w-12 h-12 rounded-full" 
                                src="/images/boy.png"
                                alt="프로필 이미지"
                              />
                              <div className="w-80 justify-start text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight truncate">
                                {card.userInfo}
                              </div>
                            </div>
                            
                            {/* 콘텐츠 */}
                            <div className="w-96 flex flex-col justify-start items-start gap-3.5">
                              <div className="self-stretch justify-center text-white text-xl font-semibold font-['Pretendard'] leading-9 truncate">
                                - {post.request_a}
                              </div>
                              <div className="self-stretch justify-center text-white text-xl font-semibold font-['Pretendard'] leading-9 truncate">
                                - {post.request_b}
                              </div>
                              <div className="self-stretch justify-center text-white text-xl font-semibold font-['Pretendard'] leading-9 truncate">
                                - {post.request_c}
                              </div>
                              <div className="justify-center text-neutral-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                {card.timestamp}
                              </div>
                            </div>
                          </div>
                          
                          {/* 구분선 */}
                          <div className="w-96 h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
                          
                          {/* 표현 행위 통계 */}
                          <div className="self-stretch bg-neutral-900 rounded-[20px] inline-flex justify-center items-center">
                            <div className="w-28 p-3.5 bg-stone-700 inline-flex flex-col justify-center items-center gap-[5px]">
                              <img className="w-7 h-7" src="/images/honor-icon.png" alt="경의" />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center justify-start text-white text-3xl font-bold font-['Pretendard'] leading-10">
                                  {post.honor_count}
                                </div>
                                <div className="text-center justify-start text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                  경의
                                </div>
                              </div>
                            </div>
                            <div className="w-28 p-3.5 bg-stone-700 inline-flex flex-col justify-center items-center gap-[5px]">
                              <img className="w-7 h-7" src="/images/recommend-icon.png" alt="추천" />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center justify-start text-white text-3xl font-bold font-['Pretendard'] leading-10">
                                  {post.recommend_count}
                                </div>
                                <div className="text-center justify-start text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                  추천
                                </div>
                              </div>
                            </div>
                            <div className="w-28 p-3.5 bg-stone-700 inline-flex flex-col justify-center items-center gap-[5px]">
                              <img className="w-7 h-7" src="/images/respect-icon.png" alt="존중" />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center justify-start text-white text-3xl font-bold font-['Pretendard'] leading-10">
                                  {post.respect_count}
                                </div>
                                <div className="text-center justify-start text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                  존중
                                </div>
                              </div>
                            </div>
                            <div className="w-28 p-3.5 bg-stone-700 inline-flex flex-col justify-center items-center gap-[5px]">
                              <img className="w-7 h-7" src="/images/hug-icon.png" alt="응원" />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center justify-start text-white text-3xl font-bold font-['Pretendard'] leading-10">
                                  {post.hug_count}
                                </div>
                                <div className="text-center justify-start text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                  응원
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 자세히 보기 버튼 */}
                          <div className="w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-stone-800/60 transition-colors">
                            <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
                              자세히 보기
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 모바일/태블릿 레이아웃 (lg 미만) - 1열 */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 gap-6">
              {dummyWisdomPosts.map((post) => {
                const card = convertToDisplayCard(post);
                return (
                  <div 
                    key={post.id}
                    className="w-full bg-stone-700 rounded-[20px] outline outline-1 outline-offset-[-0.50px] outline-neutral-900 p-6 flex flex-col gap-9 opacity-100 cursor-pointer hover:bg-stone-600 transition-colors duration-300"
                    onClick={(e) => handleCardClick(post, e)}
                  >
                    <div className="flex flex-col justify-start items-center gap-5">
                      
                      {/* 모바일 프로필 및 콘텐츠 */}
                      <div className="w-full flex flex-col justify-start items-start gap-4">
                        
                        {/* 프로필 */}
                        <div className="w-full inline-flex justify-start items-center gap-3.5">
                          <img 
                            className="w-12 h-12 rounded-full flex-shrink-0" 
                            src="/images/boy.png"
                            alt="프로필 이미지"
                          />
                          <div className="flex-1 min-w-0 text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight truncate">
                            {card.userInfo}
                          </div>
                        </div>
                        
                        {/* 콘텐츠 */}
                        <div className="w-full flex flex-col justify-start items-start gap-3.5">
                          <div className="w-full text-white text-xl font-semibold font-['Pretendard'] leading-9">
                            - {post.request_a}
                          </div>
                          <div className="w-full text-white text-xl font-semibold font-['Pretendard'] leading-9">
                            - {post.request_b}
                          </div>
                          <div className="w-full text-white text-xl font-semibold font-['Pretendard'] leading-9">
                            - {post.request_c}
                          </div>
                          <div className="text-neutral-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                            {card.timestamp}
                          </div>
                        </div>
                      </div>
                      
                      {/* 구분선 */}
                      <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
                      
                      {/* 모바일 통계 */}
                      <div className="w-full bg-neutral-900 rounded-[20px] p-4">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <img className="w-7 h-7" src="/images/honor-icon.png" alt="경의" />
                            <div className="text-center text-white text-3xl font-bold font-['Pretendard'] leading-10">
                              {post.honor_count}
                            </div>
                            <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              경의
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <img className="w-7 h-7" src="/images/recommend-icon.png" alt="추천" />
                            <div className="text-center text-white text-3xl font-bold font-['Pretendard'] leading-10">
                              {post.recommend_count}
                            </div>
                            <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              추천
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <img className="w-7 h-7" src="/images/respect-icon.png" alt="존중" />
                            <div className="text-center text-white text-3xl font-bold font-['Pretendard'] leading-10">
                              {post.respect_count}
                            </div>
                            <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              존중
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <img className="w-7 h-7" src="/images/hug-icon.png" alt="응원" />
                            <div className="text-center text-white text-3xl font-bold font-['Pretendard'] leading-10">
                              {post.hug_count}
                            </div>
                            <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                              응원
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 모바일 버튼 */}
                      <button className="w-full h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-stone-800/60 transition-colors">
                        <div className="text-white text-xl font-semibold font-['Pretendard'] leading-9">
                          자세히 보기
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 모달 - 클릭한 위치 기준 */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center px-4 overflow-x-hidden bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            ref={modalRef}
            className="w-full max-w-lg sm:max-w-2xl bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 my-8 max-h-[85vh] overflow-y-auto p-4 sm:p-7"
            style={{ 
              marginTop: `${modalTopPosition}px`,
              marginBottom: '32px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex flex-col gap-4 sm:gap-6">
              
              {/* 모달 헤더 */}
              <div className="w-full flex justify-between items-start gap-4">
                <div className="flex-1 flex items-start gap-3">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" 
                    src="/images/boy.png"
                    alt="프로필 이미지"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] truncate">
                      {convertToDisplayCard(selectedCard).userInfo}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-stone-600 rounded"
                >
                  ✕
                </button>
              </div>

              {/* 모달 콘텐츠 */}
              <div className="w-full">
                <div className="text-white text-base sm:text-xl font-semibold font-['Pretendard'] leading-relaxed mb-3">
                  - {selectedCard.request_a}
                </div>
                <div className="text-white text-base sm:text-xl font-semibold font-['Pretendard'] leading-relaxed mb-3 whitespace-pre-line">
                  - {selectedCard.request_b}
                </div>
                <div className="text-white text-base sm:text-xl font-semibold font-['Pretendard'] leading-relaxed mb-3">
                  - {selectedCard.request_c}
                </div>
                <div className="text-neutral-400 text-xs sm:text-sm font-medium font-['Pretendard'] mt-4">
                  {formatTimestamp(selectedCard.created_at)}
                </div>
              </div>

              {/* 구분선 */}
              <div className="w-full h-0 border-t border-stone-500"></div>
              
              {/* 표현행위 선택 */}
              <div className="w-full bg-stone-700 rounded-[15px] sm:rounded-[20px] p-3 sm:p-4">
                <div className="grid grid-cols-4 gap-3">  
                  {[
                    { type: 'honor', count: selectedCard.honor_count, icon: '/images/honor-icon.png' },
                    { type: 'recommend', count: selectedCard.recommend_count, icon: '/images/recommend-icon.png' },
                    { type: 'respect', count: selectedCard.respect_count, icon: '/images/respect-icon.png' },
                    { type: 'hug', count: selectedCard.hug_count, icon: '/images/hug-icon.png' }
                  ].map(({ type, count, icon }) => (
                    <button
                      key={type}
                      onClick={() => handleReactionSelect(type)}
                      className={`p-3 flex flex-col items-center gap-2 transition-all duration-200 rounded-lg hover:bg-stone-600 ${
                        selectedReaction === type 
                          ? 'bg-[#ADFF00]/20 border-2 border-[#ADFF00]' 
                          : 'bg-stone-700'
                      }`}
                    >
                      <img 
                        className="w-6 h-6 sm:w-7 sm:h-7" 
                        src={icon}
                        alt={reactionLabels[type as keyof typeof reactionLabels]}
                      />
                      <div className="text-white text-lg sm:text-2xl font-bold font-['Pretendard']">
                        {count}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm font-semibold font-['Pretendard']">
                        {reactionLabels[type as keyof typeof reactionLabels]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 표현행위 보내기 버튼 */}
              <button 
                onClick={handleSendReaction}
                disabled={!selectedReaction}
                className={`w-full h-12 sm:h-14 px-4 py-2 bg-stone-900/60 border border-white/20 backdrop-blur-[6px] rounded-lg transition-colors ${
                  selectedReaction 
                    ? 'hover:bg-stone-800/60 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`text-base sm:text-xl font-semibold font-['Pretendard'] ${
                  selectedReaction ? 'text-[#ADFF00]' : 'text-gray-500'
                }`}>
                  표현행위 보내기
                </div>
              </button>

              {/* 표현행위 히스토리 - 모바일에서는 간소화 */}
              <div className="w-full">
                <h4 className="text-white text-base sm:text-lg font-semibold font-['Pretendard'] mb-3">최근 표현행위</h4>
                <div className="space-y-3">
                  {reactionHistory.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" 
                        src="/images/boy.png"
                        alt="프로필 이미지"
                      />
                      <div className="flex-1 text-white text-xs sm:text-sm font-['Pretendard'] truncate">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400"> 님이 </span>
                        <span className="text-[#ADFF00]">{item.reaction}</span>
                        <span className="text-gray-400">을 부여</span>
                      </div>
                      <img 
                        className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" 
                        src={
                          item.reaction === "경의" ? "/images/honor-icon.png" :
                          item.reaction === "추천" ? "/images/recommend-icon.png" :
                          item.reaction === "존중" ? "/images/respect-icon.png" :
                          "/images/hug-icon.png"
                        }
                        alt={item.reaction}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 표현행위 완료 토스트 팝업 - 모바일 최적화 */}
      {showReactionPopup && (
        <div 
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4"
          style={{ paddingTop: `${modalTopPosition + 200}px` }}
          onClick={closeReactionPopup}
        >
          <div 
            className="w-full max-w-md sm:max-w-lg px-6 sm:px-8 py-8 sm:py-12 bg-neutral-900 outline outline-2 outline-offset-[-1px] outline-[#ADFF00] rounded-[20px] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isCompletePopup ? (
              // 12장 모두 완료했을 때
              <div>
                <div className="text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-tight">
                  모든 표현 보내기가 완료 되었습니다!
                </div>
                <div className="text-gray-400 text-base sm:text-lg lg:text-2xl font-bold font-['Pretendard'] leading-tight mt-2">
                  *수정이 어려워요
                </div>
              </div>
            ) : (
              // 1~11번째일 때
              <div>
                <div className="text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-tight">
                  {reactionCount}번째 표현 보내기가 완료 되었습니다.
                </div>
                <div className="text-[#ADFF00] text-base sm:text-lg lg:text-2xl font-bold font-['Pretendard'] leading-tight mt-2">
                  {12 - reactionCount}번의 표현 보내기 완료 후<br/>자동으로 완료 처리 됩니다.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};