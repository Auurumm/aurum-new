import React, { useState } from "react";

interface WisdomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const WisdomModal: React.FC<WisdomModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    requestA: "",
    requestB: "",
    requestC: ""
  });

  const [popupType, setPopupType] = useState<'temporary' | 'complete' | null>(null);

  const handleInputChange = (field: string, value: string) => {
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
    
    if (requestA.length < 10) return false;
    if (requestB.length < 10) return false;
    if (requestC.length < 10) return false;
    
    return true;
  };

  const handleTemporarySave = () => {
    console.log('임시 저장 버튼 클릭됨');
    console.log('현재 formData:', formData);
    console.log('검증 결과:', validateForm());
    
    if (!validateForm()) {
      alert('모든 항목에 최소 10자 이상 입력해주세요.');
      return;
    }
    console.log('팝업 표시 - temporary');
    setPopupType('temporary');
  };

  const handleComplete = () => {
    console.log('작성 완료 버튼 클릭됨');
    console.log('현재 formData:', formData);
    console.log('검증 결과:', validateForm());
    
    if (!validateForm()) {
      alert('모든 항목에 최소 10자 이상 입력해주세요.');
      return;
    }
    console.log('팝업 표시 - complete');
    setPopupType('complete');
  };

  const closePopup = () => {
    setPopupType(null);
    if (popupType === 'complete') {
      if (onComplete) {
        onComplete();
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="px-28 py-20 bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 inline-flex flex-col justify-start items-start gap-2.5 max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col justify-center items-center gap-12">
            
            {/* 제목 */}
            <div className="justify-start text-white text-5xl font-bold font-['Pretendard'] leading-[72px]">
              위즈덤 작성하기
            </div>
            
            <div className="w-[916px] flex flex-col justify-start items-start gap-12">
              <div className="self-stretch flex flex-col justify-start items-start gap-10">
                
                {/* Request A */}
                <div className="w-[916px] flex flex-col justify-start items-start gap-5">
                  <div className="w-28 h-10 px-1.5 py-2 bg-stone-900/60 border-t border-b border-white backdrop-blur-[6px] inline-flex justify-center items-center gap-12">
                    <div className="justify-start text-lime-400 text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed">
                      Request a
                    </div>
                  </div>
                  
                  <div className="self-stretch flex flex-col justify-start items-end gap-2">
                    <div className="self-stretch flex flex-col justify-start items-start gap-6">
                      <div className="self-stretch flex flex-col justify-center items-start gap-[5px]">
                        <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
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
                <div className="w-[916px] flex flex-col justify-start items-start gap-5">
                  <div className="w-28 h-10 px-1.5 py-2 bg-stone-900/60 border-t border-b border-white backdrop-blur-[6px] inline-flex justify-center items-center gap-12">
                    <div className="justify-start text-lime-400 text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed">
                      Request B
                    </div>
                  </div>
                  
                  <div className="self-stretch flex flex-col justify-start items-end gap-2">
                    <div className="self-stretch flex flex-col justify-start items-start gap-6">
                      <div className="self-stretch flex flex-col justify-center items-start gap-[5px]">
                        <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
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
                <div className="w-[916px] flex flex-col justify-start items-start gap-5">
                  <div className="w-28 h-10 px-1.5 py-2 bg-stone-900/60 border-t border-b border-white backdrop-blur-[6px] inline-flex justify-center items-center gap-12">
                    <div className="justify-start text-lime-400 text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed">
                      Request c
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-start items-end gap-2">
                    <div className="self-stretch flex flex-col justify-start items-start gap-6">
                      <div className="flex flex-col justify-center items-start gap-[5px]">
                        <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
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
              <div className="self-stretch inline-flex justify-start items-center gap-20">
                <button 
                  onClick={handleTemporarySave}
                  className="w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] flex justify-center items-center gap-2.5 hover:bg-stone-800/60 transition-colors"
                >
                  <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
                    임시 저장
                  </div>
                </button>
                
                <button 
                  onClick={handleComplete}
                  className="w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] flex justify-center items-center gap-2.5 hover:bg-stone-800/60 transition-colors"
                >
                  <div className="justify-start text-lime-400 text-xl font-semibold font-['Pretendard'] leading-9">
                    작성 완료
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 팝업 */}
      {popupType === 'temporary' && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closePopup}
        >
          <div 
            className="px-28 py-20 bg-neutral-900 outline outline-2 outline-offset-[-1px] outline-stone-500 inline-flex flex-col justify-start items-start gap-2.5 rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-center items-center gap-12">
              <div className="text-white text-3xl font-bold font-['Pretendard'] leading-10 text-center">
                임시저장이 완료 되었습니다<br/>작성 완료 버튼을 누르시고, 최종 제출을 완료하세요
              </div>
            </div>
          </div>
        </div>
      )}

      {popupType === 'complete' && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closePopup}
        >
          <div 
            className="px-28 py-20 bg-neutral-900 outline outline-2 outline-offset-[-1px] outline-stone-500 inline-flex flex-col justify-start items-start gap-2.5 rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-center items-center gap-12">
              <div className="text-white text-3xl font-bold font-['Pretendard'] leading-10 text-center">
                위즈덤 작성이 완료 되었습니다 :) !
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};