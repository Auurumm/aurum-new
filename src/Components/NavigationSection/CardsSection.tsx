import React, { useState, useEffect, useRef } from "react";
import { WisdomService, WisdomPost, fetchWisdomPosts } from "../../services/WisdomService.ts";
import { supabase } from "../../lib/supabase";

interface WisdomCardGridProps {
  isWisdomCompleted?: boolean;
  onAllReactionsComplete?: () => void;
  requireAuth?: boolean;
  onAuthRequired?: () => boolean;
  newWisdomPost?: WisdomPost | null;
}

// 히스토리 아이템 인터페이스
interface ReactionHistoryItem {
  id: string;
  name: string;
  gender: string;
  age: number;
  company: string;
  avatar_url: string;
  reaction: string;
  created_at: string;
}

export const WisdomCardGrid = ({ 
  isWisdomCompleted = false, 
  onAllReactionsComplete, 
  requireAuth = false, 
  onAuthRequired,
  newWisdomPost 
}: WisdomCardGridProps): JSX.Element => {
  // 카드 상태
  const [selectedCard, setSelectedCard] = useState<WisdomPost | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [isCompletePopup, setIsCompletePopup] = useState(false);
  const [modalTopPosition, setModalTopPosition] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // 위즈덤 포스트 상태
  const [wisdomPosts, setWisdomPosts] = useState<WisdomPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 히스토리 상태
  const [reactionHistory, setReactionHistory] = useState<ReactionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  // 초기 위즈덤 포스트 로드
  useEffect(() => {
    const loadWisdomPosts = async () => {
      try {
        setLoading(true);
        const posts = await fetchWisdomPosts();
        setWisdomPosts(posts);
      } catch (error) {
        console.error('위즈덤 포스트 로딩 실패:', error);
        setWisdomPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadWisdomPosts();
  }, []);

  // 새 포스트가 추가되었을 때 리스트에 반영
  useEffect(() => {
    if (newWisdomPost) {
      setWisdomPosts(prev => [newWisdomPost, ...prev]);
    }
  }, [newWisdomPost]);

  // 선택된 카드의 히스토리 로드
  useEffect(() => {
    const loadReactionHistory = async () => {
      if (!selectedCard) {
        setReactionHistory([]);
        return;
      }

      try {
        setLoadingHistory(true);
        const { data, error } = await WisdomService.getReactionHistory(selectedCard.id);

        if (error || !data) {
          console.error('히스토리 로드 실패:', error);
          setReactionHistory([]);
          return;
        }

        // 데이터 포맷팅 - 이름 우선순위: display_name > username > full_name
        const formattedHistory: ReactionHistoryItem[] = data.map(item => ({
          id: item.id,
          name: item.profile?.username || 
                item.profile?.full_name || 
                '사용자',
          gender: item.profile?.gender || '남',
          age: item.profile?.age || 23,
          company: item.profile?.company || '회사명',
          avatar_url: item.profile?.avatar_url || '/images/Ellipse 79.png',
          reaction: reactionLabels[item.reaction_type as keyof typeof reactionLabels] || item.reaction_type,
          created_at: item.created_at
        }));

        setReactionHistory(formattedHistory);
      } catch (error) {
        console.error('히스토리 로드 예외:', error);
        setReactionHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (selectedCard) {
      loadReactionHistory();
    }
  }, [selectedCard]);

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
    const userName = post.profile?.username || post.profile?.full_name || '사용자';
    const avatarUrl = post.profile?.avatar_url || '/images/boy.png';
    const gender = post.profile?.gender || '남';
    const age = post.profile?.age || 23;
    const company = post.profile?.company || '회사명';
    
    const userInfo = `${userName} / ${gender} / ${age} / ${company}`;
    
    return {
      ...post,
      userInfo,
      userName,
      avatarUrl,
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
    
    if (requireAuth && onAuthRequired && !onAuthRequired()) {
      return;
    }
    
    try {
      const reactionField = `${selectedReaction}_count` as keyof Pick<WisdomPost, 'honor_count' | 'recommend_count' | 'respect_count' | 'hug_count'>;
      const currentCount = selectedCard[reactionField];
      
      const { error } = await WisdomService.addReaction(
        selectedCard.id, 
        selectedReaction as 'honor' | 'recommend' | 'respect' | 'hug'
      );
      
      if (error) {
        let userMessage = '표현행위 전송에 실패했습니다.';
        
        if (error.message.includes('이미 이 게시물에 반응')) {
          userMessage = '⚠️ 이미 이 게시물에 표현행위를 보냈습니다.\n다른 게시물을 선택해주세요.';
        } else if (error.message.includes('본인의 게시물')) {
          userMessage = '⚠️ 본인이 작성한 위즈덤에는 표현행위를 할 수 없습니다.\n다른 크루의 위즈덤을 선택해주세요.';
        } else if (error.message.includes('위즈덤을 먼저 작성')) {
          userMessage = '⚠️ 먼저 1단계에서 위즈덤을 작성해주세요.';
        } else if (error.message.includes('로그인')) {
          userMessage = '⚠️ 로그인이 필요합니다.';
        }
        
        console.error('❌ 표현행위 전송 실패 (상세):', error);
        alert(userMessage);
        return;
      }
      
      // 로컬 상태 업데이트
      setWisdomPosts(prev => prev.map(post => 
        post.id === selectedCard.id 
          ? { ...post, [reactionField]: currentCount + 1 }
          : post
      ));
      
      setSelectedCard(prev => prev ? { ...prev, [reactionField]: currentCount + 1 } : null);
      
      // 히스토리 즉시 다시 로드
      const { data } = await WisdomService.getReactionHistory(selectedCard.id);
      if (data) {
        const formattedHistory: ReactionHistoryItem[] = data.map(item => ({
          id: item.id,
          name: item.profile?.username || item.profile?.full_name || '사용자',
          gender: item.profile?.gender || '남',
          age: item.profile?.age || 23,
          company: item.profile?.company || '회사명',
          avatar_url: item.profile?.avatar_url || '/images/Ellipse 79.png',
          reaction: reactionLabels[item.reaction_type as keyof typeof reactionLabels] || item.reaction_type,
          created_at: item.created_at
        }));
        setReactionHistory(formattedHistory);
      }
      
      const newCount = reactionCount + 1;
      setReactionCount(newCount);
      
      if (newCount >= 12) {
        setIsCompletePopup(true);
      } else {
        setIsCompletePopup(false);
      }
      
      setShowReactionPopup(true);
      
      setTimeout(() => {
        closeReactionPopup();
      }, 3000);
      
    } catch (error) {
      console.error('❌ 표현행위 전송 중 예외 발생:', error);
      
      let errorMessage = '표현행위 전송 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorMessage = '⚠️ 네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '⚠️ 서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      
      alert(errorMessage);
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
  }, [showReactionPopup, modalTopPosition]);

  const closeReactionPopup = () => {
    setShowReactionPopup(false);
    
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

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[500px]">
        <div className="text-white text-xl">위즈덤 포스트를 불러오는 중...</div>
      </div>
    );
  }

  // 데이터가 없을 때 표시
  if (wisdomPosts.length === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-[500px]">
        <div className="text-white text-xl">아직 등록된 위즈덤 포스트가 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      {/* 반응형 카드 그리드 */}
      <div className="w-full flex justify-center mb-[120px]">
        <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          
          {/* 데스크탑 레이아웃 (lg 이상) - 4행 3열 */}
          <div className="hidden lg:block">
            <div className="inline-flex flex-col justify-start items-center gap-3.5 w-full">
              {Array(Math.ceil(wisdomPosts.length / 3)).fill(null).map((_, rowIndex) => (
                <div key={rowIndex} className="w-full inline-flex justify-center items-center gap-3.5">
                  {wisdomPosts.slice(rowIndex * 3, (rowIndex + 1) * 3).map((post) => {
                    const card = convertToDisplayCard(post);
                    return (
                      <div
                        key={post.id}
                        className="w-[470px] h-[523px] p-[25px] bg-[#3B4236] 
                                  rounded-[20px] border border-[#141612] 
                                  inline-flex flex-col justify-start items-center gap-[35px] cursor-pointer
                                  hover:bg-stone-600 transition-colors duration-300"
                        onClick={(e) => handleCardClick(post, e)}
                      >
                        <div className="self-stretch flex flex-col justify-start items-center gap-5">
                          <div className="flex flex-col justify-start items-start gap-4">
                            <div className="inline-flex justify-start items-center gap-3.5">
                              <img className="w-12 h-12 rounded-full" src={card.avatarUrl} alt="프로필 이미지" />
                              <div className="w-[408px] text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight truncate">
                                {card.userInfo}
                              </div>
                            </div>

                            <div className="w-[408px] flex flex-col justify-start items-start gap-3.5 overflow-hidden">
                              <div className="self-stretch text-white text-xl font-semibold font-['Pretendard'] leading-9 truncate">
                                - {post.request_a}
                              </div>
                              <div className="self-stretch text-white text-xl font-semibold font-['Pretendard'] leading-9 truncate">
                                - {post.request_b}
                              </div>
                              <div className="self-stretch text-white text-xl font-semibold font-['Pretendard'] leading-9 truncate">
                                - {post.request_c}
                              </div>
                              <div className="text-neutral-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                                {card.timestamp}
                              </div>
                            </div>
                          </div>

                          <div className="w-[420px] h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>

                          <div className="self-stretch bg-neutral-900 rounded-[20px] inline-flex justify-center items-center">
                            <div className="w-28 p-3.5 bg-[#3B4236] inline-flex flex-col justify-center items-center gap-[5px]">
                            <img 
                              className="w-7 h-7" 
                              src="/images/honor-icon.png"  // 직접 경로 지정
                              alt="경의" 
                            />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center text-white text-3xl font-bold leading-10">{post.honor_count}</div>
                                <div className="text-center text-gray-400 text-sm font-semibold leading-none">경의</div>
                              </div>
                            </div>
                            <div className="w-28 p-3.5 bg-[#3B4236] inline-flex flex-col justify-center items-center gap-[5px]">
                              <img className="w-7 h-7" src="/images/recommend-icon.png" alt="추천" />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center text-white text-3xl font-bold leading-10">{post.recommend_count}</div>
                                <div className="text-center text-gray-400 text-sm font-semibold leading-none">추천</div>
                              </div>
                            </div>
                            <div className="w-28 p-3.5 bg-[#3B4236] inline-flex flex-col justify-center items-center gap-[5px]">
                              <img className="w-7 h-7" src="/images/respect-icon.png" alt="존중" />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center text-white text-3xl font-bold leading-10">{post.respect_count}</div>
                                <div className="text-center text-gray-400 text-sm font-semibold leading-none">존중</div>
                              </div>
                            </div>
                            <div className="w-28 p-3.5 bg-[#3B4236] inline-flex flex-col justify-center items-center gap-[5px]">
                              <img className="w-7 h-7" src="/images/hug-icon.png" alt="응원" />
                              <div className="self-stretch flex flex-col justify-center items-center">
                                <div className="text-center text-white text-3xl font-bold leading-10">{post.hug_count}</div>
                                <div className="text-center text-gray-400 text-sm font-semibold leading-none">응원</div>
                              </div>
                            </div>
                          </div>

                          <div className="w-[420px] h-14 px-9 py-3 
                                        bg-[#1C1F18]/60
                                        border-t border-b border-white/20 
                                        inline-flex justify-center items-center gap-2.5 
                                        cursor-pointer mt-[10px]">
                            <div className="text-white text-xl font-semibold leading-9">
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
              {wisdomPosts.map((post) => {
                const card = convertToDisplayCard(post);
                return (
                  <div 
                    key={post.id}
                    className="w-full bg-[#3B4236] rounded-[20px] outline outline-1 outline-offset-[-0.50px] outline-neutral-900 p-6 flex flex-col gap-9 opacity-100 cursor-pointer hover:bg-stone-600 transition-colors duration-300"
                    onClick={(e) => handleCardClick(post, e)}
                  >
                    <div className="flex flex-col justify-start items-center gap-5">
                      <div className="w-full flex flex-col justify-start items-start gap-4">
                        <div className="w-full inline-flex justify-start items-center gap-3.5">
                          <img 
                            className="w-12 h-12 rounded-full" 
                            src={card.avatarUrl} 
                            alt="프로필 이미지" 
                          />
                          <div className="flex-1 min-w-0 text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight truncate">
                            {card.userInfo}
                          </div>
                        </div>
                        
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
                      
                      <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500"></div>
                      
                      <div className="w-full bg-neutral-900 rounded-[20px] p-4">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="flex flex-col items-center gap-1">
                          <img 
                            className="w-7 h-7" 
                            src="/images/honor-icon.png"  // 직접 경로 지정
                            alt="경의" 
                          />
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

      {/* 상세 모달 */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center px-4 overflow-x-hidden bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            ref={modalRef}
            className="w-[589px] bg-[#3B4236] rounded-[20px] 
                        outline outline-1 outline-offset-[-1px] outline-stone-500 
                        my-8 p-[45px]"
            style={{ 
              marginTop: `${modalTopPosition}px`,
              marginBottom: '10px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex flex-col justify-start items-center gap-[10px]">
              <div className="w-full flex flex-col justify-start items-start gap-6">
                
                {/* 모달 헤더 */}
                <div className="self-stretch inline-flex justify-between items-center gap-2.5">
                  <div className="flex-1 flex justify-start items-center gap-3.5">
                    <img 
                      className="w-12 h-12 rounded-full" 
                      src={convertToDisplayCard(selectedCard).avatarUrl}
                      alt="프로필 이미지"
                    />
                    <div className="text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                      {convertToDisplayCard(selectedCard).userInfo}
                    </div>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="w-6 h-6 relative overflow-hidden text-white hover:bg-[#3B4236] rounded flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                {/* 모달 콘텐츠 */}
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                    <div className="self-stretch text-white text-xl font-semibold font-['Pretendard'] leading-9">
                      - {selectedCard.request_a}
                    </div>
                    <div className="self-stretch text-white text-xl font-semibold font-['Pretendard'] leading-9 whitespace-pre-line">
                      - {selectedCard.request_b}
                    </div>
                    <div className="self-stretch text-white text-xl font-semibold font-['Pretendard'] leading-9">
                      - {selectedCard.request_c}
                    </div>
                  </div>
                  <div className="self-stretch text-left text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                    {formatTimestamp(selectedCard.created_at)}
                  </div>
                </div>
              </div>

              <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-500 my-[25px]"></div>
              
              {/* 표현행위 선택 */}
              <div className="bg-[#3B4236] rounded-[20px] inline-flex justify-center items-center">
                <div className="w-96 h-32 rounded-[20px] flex justify-center items-center">
                  {[
                    { type: 'honor', count: selectedCard.honor_count, icon: '/images/honor-icon.png' },
                    { type: 'recommend', count: selectedCard.recommend_count, icon: '/images/recommend-icon.png' },
                    { type: 'respect', count: selectedCard.respect_count, icon: '/images/respect-icon.png' },
                    { type: 'hug', count: selectedCard.hug_count, icon: '/images/hug-icon.png' }
                  ].map(({ type, count, icon }) => (
                    <button
                      key={type}
                      onClick={() => handleReactionSelect(type)}
                      className={`w-28 p-3.5 inline-flex flex-col justify-center items-center gap-[5px] transition-all duration-200 ${
                        selectedReaction === type 
                          ? 'bg-[#ADFF00]/20 border-2 border-[#ADFF00] rounded-lg' 
                          : 'bg-[#3B4236] hover:bg-stone-600'
                      }`}
                    >
                      <img 
                        className="w-7 h-7" 
                        src={icon}
                        alt={reactionLabels[type as keyof typeof reactionLabels]}
                      />
                      <div className="self-stretch flex flex-col justify-center items-center">
                        <div className="text-center text-white text-3xl font-bold font-['Pretendard'] leading-10">
                          {count}
                        </div>
                        <div className="text-center text-gray-400 text-sm font-semibold font-['Pretendard'] capitalize leading-none">
                          {reactionLabels[type as keyof typeof reactionLabels]}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 표현행위 보내기 버튼 */}
              <button 
                onClick={handleSendReaction}
                disabled={!selectedReaction}
                className={`w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] inline-flex justify-center items-center gap-2.5 transition-colors my-[15px] ${
                  selectedReaction 
                    ? 'hover:bg-stone-800/60 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`text-xl font-semibold font-['Pretendard'] leading-9 ${
                  selectedReaction ? 'text-[#ADFF00]' : 'text-gray-500'
                }`}>
                  표현행위 보내기
                </div>
              </button>

              {/* 표현행위 히스토리 */}
              <div className="history-scrollbar relative flex flex-col justify-start items-start gap-[15px] 
                              w-full h-[250px] overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#777777 transparent'
                    }}
                  >
                {loadingHistory ? (
                  <div className="w-full flex justify-center items-center h-full">
                    <div className="text-white text-sm">로딩 중...</div>
                  </div>
                ) : reactionHistory.length === 0 ? (
                  <div className="w-full flex justify-center items-center h-full">
                    <div className="text-gray-400 text-sm">아직 표현행위가 없습니다.</div>
                  </div>
                ) : (
                  reactionHistory.map((item) => (
                    <div key={item.id} className="w-full flex flex-col justify-start items-start">
                      <div className="w-full inline-flex justify-start items-center gap-3.5">
                        <div className="flex-1 h-[50px] flex justify-start items-center gap-2">
                          <img 
                            className="w-12 h-12 rounded-full object-cover" 
                            src={item.avatar_url}
                            alt="프로필 이미지"
                            onError={(e) => {
                              // 이미지 로드 실패 시 기본 이미지로 대체
                              e.currentTarget.src = '/images/Ellipse 79.png';
                            }}
                          />
                          <div className="flex-1 text-white text-sm font-medium font-['Pretendard'] leading-tight">
                            {item.name} ({item.gender} / {item.age} / {item.company}) 님이 {item.reaction}을 부여하였습니다
                          </div>
                        </div>
                        <img 
                          className="w-7 h-7" 
                          src={reactionIcons[item.reaction as keyof typeof reactionIcons]}
                          alt={item.reaction}
                          onError={(e) => {
                            console.error('아이콘 로드 실패:', item.reaction);
                            // 아이콘 로드 실패 시 기본 처리
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 표현행위 완료 토스트 팝업 */}
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
              <div>
                <div className="text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-tight">
                  모든 표현 보내기가 완료 되었습니다!
                </div>
                <div className="text-gray-400 text-base sm:text-lg lg:text-2xl font-bold font-['Pretendard'] leading-tight mt-2">
                  *수정이 어려워요
                </div>
              </div>
            ) : (
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