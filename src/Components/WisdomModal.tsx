import React, { useState, useEffect } from "react";
import { WisdomService, WisdomFormData } from "../services/WisdomService.ts";

interface WisdomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onWisdomSubmitted?: (wisdomPost: any) => void; // 새로 제출된 위즈덤 전달
  isLoggedIn?: boolean; // 로그인 상태를 props로 받음
}

export const WisdomModal: React.FC<WisdomModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  onWisdomSubmitted,
  isLoggedIn = true // 기본값을 true로 설정 (기존 동작 유지)
}) => {
  const [formData, setFormData] = useState<WisdomFormData>({
    requestA: "",
    requestB: "",
    requestC: ""
  });

  const [popupType, setPopupType] = useState<'temporary' | 'complete' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때 임시저장 내용 불러오기
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      loadDraftData();
    }
  }, [isOpen, isLoggedIn]);

  // 임시저장 내용 불러오기
  const loadDraftData = async () => {
    try {
      const { data: draft, error } = await WisdomService.loadDraft();
      
      if (error) {
        console.error('임시저장 불러오기 실패:', error);
        return;
      }

      if (draft) {
        setFormData({
          requestA: draft.request_a || "",
          requestB: draft.request_b || "",
          requestC: draft.request_c || ""
        });
        console.log('✅ 임시저장 내용 불러옴:', draft);
      }
    } catch (error) {
      console.error('임시저장 불러오기 예외:', error);
    }
  };

  const handleInputChange = (field: keyof WisdomFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCharCount = (text: string) => {
    return text.length;
  };

  const validateForm = () => {
    const { requestA, requestB, requestC } = formData;
    
    if (requestA.length < 10 || requestA.length > 40) return false;
    if (requestB.length < 10 || requestB.length > 150) return false;
    if (requestC.length < 10 || requestC.length > 40) return false;
    
    return true;
  };

  const handleTemporarySave = async () => {
    if (isLoading) return;
    
    console.log('임시 저장 버튼 클릭됨');
    console.log('현재 formData:', formData);
    console.log('검증 결과:', validateForm());
    
    // 비로그인 상태 체크 (폼 검증보다 먼저)
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능한 기능입니다. 로그인하신 뒤 임시 저장을 진행해 주세요.');
      return;
    }
    
    if (!validateForm()) {
      alert('모든 항목에 최소 10자 이상 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await WisdomService.saveDraft(formData);
      
      if (error) {
        console.error('임시 저장 실패:', error);
        alert('임시 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }
      
      console.log('팝업 표시 - temporary');
      setPopupType('temporary');
    } catch (error) {
      console.error('임시 저장 예외:', error);
      alert('임시 저장 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (isLoading) return;
    
    console.log('작성 완료 버튼 클릭됨');
    console.log('현재 formData:', formData);
    console.log('검증 결과:', validateForm());
    
    // 비로그인 상태 체크 (폼 검증보다 먼저)
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능한 기능입니다. 로그인하신 뒤 제출을 진행해 주세요.');
      return;
    }
    
    if (!validateForm()) {
      alert('모든 항목에 최소 10자 이상 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: wisdomPost, error } = await WisdomService.submitWisdom(formData);
      
      if (error) {
        console.error('작성 완료 실패:', error);
        alert('위즈덤 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }
      
      if (wisdomPost) {
        console.log('✅ 위즈덤 제출 성공:', wisdomPost);
        
        // 상위 컴포넌트에 새로 제출된 위즈덤 전달
        if (onWisdomSubmitted) {
          onWisdomSubmitted(wisdomPost);
        }
        
        console.log('팝업 표시 - complete');
        setPopupType('complete');
      }
    } catch (error) {
      console.error('작성 완료 예외:', error);
      alert('위즈덤 제출 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setPopupType(null);
    if (popupType === 'complete') {
      // 작성 완료 시 폼 데이터 초기화
      setFormData({
        requestA: "",
        requestB: "",
        requestC: ""
      });
      
      if (onComplete) {
        onComplete();
      }
      onClose();
    }
  };

  // 모달이 열릴 때 모달 최상단으로 스크롤
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const scaledContent = document.querySelector('.scaled-content');
        const modalElement = document.querySelector('[data-modal="wisdom"]');
        
        if (scaledContent && modalElement) {
          const modalRect = modalElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const modalTop = modalRect.top + scrollTop;
          
          window.scrollTo({
            top: modalTop - 50,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [isOpen]);

  // 토스트 팝업이 뜰 때 페이지 최상단으로 스크롤
  useEffect(() => {
    if (popupType) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  }, [popupType]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          data-modal="wisdom"
          className="px-8 lg:px-16 xl:px-28 py-8 lg:py-12 xl:py-16 bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 inline-flex flex-col justify-start items-start gap-2.5 max-h-[90vh] overflow-y-auto w-full max-w-[1000px] mx-4 mt-16"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col justify-center items-center gap-8 lg:gap-12 w-full">
            
            {/* 제목 */}
            <div className="justify-start text-white text-3xl lg:text-4xl xl:text-5xl font-bold font-['Pretendard'] leading-tight lg:leading-[72px] text-center">
              위즈덤 작성하기
            </div>
            
            <div className="w-full max-w-[916px] flex flex-col justify-start items-start gap-8 lg:gap-12">
              <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-10">
                
                {/* Request A */}
                <div className="w-full flex flex-col justify-start items-start gap-5">
                  <div className="w-28 h-10 px-1.5 py-2 bg-stone-900/60 border-t border-b border-white backdrop-blur-[6px] inline-flex justify-center items-center gap-12">
                    <div className="justify-start text-lime-400 text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed">
                      Request a
                    </div>
                  </div>
                  
                  <div className="self-stretch flex flex-col justify-start items-end gap-2">
                    <div className="self-stretch flex flex-col justify-start items-start gap-6">
                      <div className="self-stretch flex flex-col justify-center items-start gap-[5px]">
                        <div className="justify-start text-white text-lg lg:text-xl font-semibold font-['Pretendard'] leading-7 lg:leading-9">
                          이번 위즈덤 소재를 크루의 표현으로 한 줄 요약/정리하세요!
                        </div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                          *산업 상의 개념을 명확하고 충분하게 표현할 수 있는가? (1줄 권고, 최소 10자 ~ 최대 40자)
                        </div>
                      </div>
                      
                      <div className="self-stretch h-16 px-5 py-3.5 bg-neutral-900 border-t border-b border-white/20 inline-flex justify-start items-center gap-2.5">
                        <input
                          type="text"
                          value={formData.requestA}
                          onChange={(e) => handleInputChange('requestA', e.target.value)}
                          maxLength={40}
                          placeholder="소재를 한 줄로 요약해주세요..."
                          className="w-full justify-start text-white text-lg font-normal font-['Pretendard'] leading-relaxed bg-transparent outline-none placeholder-neutral-500"
                        />
                      </div>
                    </div>
                    
                    <div className="inline-flex justify-start items-center gap-0.5">
                      <div className="justify-start text-white text-sm font-medium font-['Pretendard'] leading-tight">
                        {getCharCount(formData.requestA)}
                      </div>
                      <div className="justify-start text-white text-sm font-medium font-['Pretendard'] leading-tight">
                        {" "}/ 40자
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request B */}
                <div className="w-full flex flex-col justify-start items-start gap-5">
                  <div className="w-28 h-10 px-1.5 py-2 bg-stone-900/60 border-t border-b border-white backdrop-blur-[6px] inline-flex justify-center items-center gap-12">
                    <div className="justify-start text-lime-400 text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed">
                      Request B
                    </div>
                  </div>
                  
                  <div className="self-stretch flex flex-col justify-start items-end gap-2">
                    <div className="self-stretch flex flex-col justify-start items-start gap-6">
                      <div className="self-stretch flex flex-col justify-center items-start gap-[5px]">
                        <div className="justify-start text-white text-lg lg:text-xl font-semibold font-['Pretendard'] leading-7 lg:leading-9">
                          이번 위즈덤 소재를 크루가 희망하는 '직무' 및 산업 분야와 접목하여 활용할 수 있는 인사이트, 상상을 펼쳐보세요!
                        </div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                          *산업 상의 정보를 업무에 녹여낼 잠재력이 있는가? (3 줄 권고, 최소 10자 ~ 최대 150자)
                        </div>
                      </div>
                      
                      <div className="self-stretch h-28 px-5 py-3.5 bg-neutral-900 border-t border-b border-white/20 inline-flex justify-start items-start gap-2.5">
                        <textarea
                          value={formData.requestB}
                          onChange={(e) => handleInputChange('requestB', e.target.value)}
                          maxLength={150}
                          placeholder="업무와 연결한 인사이트를 작성해주세요..."
                          className="w-full h-full justify-start text-white text-lg font-normal font-['Pretendard'] leading-relaxed bg-transparent outline-none resize-none placeholder-neutral-500"
                        />
                      </div>
                    </div>
                    
                    <div className="inline-flex justify-start items-center gap-0.5">
                      <div className="justify-start text-white text-sm font-medium font-['Pretendard'] leading-tight">
                        {getCharCount(formData.requestB)}
                      </div>
                      <div className="text-right justify-start text-white text-sm font-medium font-['Pretendard'] leading-tight">
                        {" "}/ 150자
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request C */}
                <div className="w-full flex flex-col justify-start items-start gap-5">
                  <div className="w-28 h-10 px-1.5 py-2 bg-stone-900/60 border-t border-b border-white backdrop-blur-[6px] inline-flex justify-center items-center gap-12">
                    <div className="justify-start text-lime-400 text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed">
                      Request c
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-start items-end gap-2">
                    <div className="self-stretch flex flex-col justify-start items-start gap-6">
                      <div className="flex flex-col justify-center items-start gap-[5px]">
                        <div className="justify-start text-white text-lg lg:text-xl font-semibold font-['Pretendard'] leading-7 lg:leading-9">
                          이번 위즈덤 소재를 기회로 그동안 몰랐던 지식과 지혜를 향해 나아갈 수 있는 지식, 새롭게 생긴 궁금증이 있다면?
                        </div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
                          *산업 상의 정보를 기회로 새로운 성장으로 나아갈 수 있는가? (1줄 권고, 최소 10자 ~ 최대 40자)
                        </div>
                      </div>
                      
                      <div className="self-stretch h-16 px-5 py-3.5 bg-neutral-900 border-t border-b border-white/20 inline-flex justify-start items-center gap-2.5">
                        <input
                          type="text"
                          value={formData.requestC}
                          onChange={(e) => handleInputChange('requestC', e.target.value)}
                          maxLength={40}
                          placeholder="새로운 궁금증이나 배운 점을 작성해주세요..."
                          className="w-full justify-start text-white text-lg font-normal font-['Pretendard'] leading-relaxed bg-transparent outline-none placeholder-neutral-500"
                        />
                      </div>
                    </div>
                    
                    <div className="inline-flex justify-start items-center gap-0.5">
                      <div className={`justify-start text-sm font-medium font-['Pretendard'] leading-tight ${
                        getCharCount(formData.requestC) > 0 ? 'text-white' : 'text-neutral-400'
                      }`}>
                        {getCharCount(formData.requestC)}
                      </div>
                      <div className="justify-start text-white text-sm font-medium font-['Pretendard'] leading-tight">
                        {" "}/ 40자
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 버튼들 */}
              <div className="self-stretch flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-4 sm:gap-20">
                <button 
                  onClick={handleTemporarySave}
                  disabled={isLoading}
                  className="w-full sm:w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] flex justify-center items-center gap-2.5 hover:bg-stone-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
                    {isLoading ? '저장중...' : '임시 저장'}
                  </div>
                </button>
                
                <button 
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="w-full sm:w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] flex justify-center items-center gap-2.5 hover:bg-stone-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="justify-start text-lime-400 text-xl font-semibold font-['Pretendard'] leading-9">
                    {isLoading ? '제출중...' : '작성 완료'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 토스트 팝업들 */}
      {popupType === 'temporary' && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={closePopup}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 px-6 py-8 sm:px-16 lg:px-28 sm:py-12 lg:py-20 bg-neutral-900 outline outline-2 outline-offset-[-1px] inline-flex flex-col justify-start items-start gap-2.5 w-[90%] max-w-2xl"
            style={{ top: '200px', outlineColor: '#ADFF00' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-center items-center gap-8 lg:gap-12 w-full">
              <div className="text-center justify-start text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-6 sm:leading-8 lg:leading-10">
                임시저장이 완료 되었습니다<br/>작성 완료 버튼을 누르시고, 최종 제출을 완료하세요
              </div>
            </div>
          </div>
        </div>
      )}

      {popupType === 'complete' && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={closePopup}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 px-6 py-8 sm:px-16 lg:px-28 sm:py-12 lg:py-20 bg-neutral-900 outline outline-2 outline-offset-[-1px] inline-flex flex-col justify-start items-start gap-2.5 w-[90%] max-w-2xl"
            style={{ top: '200px', outlineColor: '#ADFF00' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-center items-center gap-8 lg:gap-12 w-full">
              <div className="justify-start text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-6 sm:leading-8 lg:leading-10 text-center">
                위즈덤 작성이 완료 되었습니다 :) !
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};