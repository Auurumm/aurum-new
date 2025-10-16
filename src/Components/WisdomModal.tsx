import React, { useState, useEffect, useCallback, useRef } from "react";
import { WisdomService, WisdomFormData } from "../services/WisdomService.ts";

// ==================== 타입 정의 ====================
interface WisdomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onWisdomSubmitted?: (wisdomPost: any) => void;
  isLoggedIn?: boolean;
}

type PopupType = 'temporary' | 'complete' | null;

interface RequestConfig {
  id: keyof WisdomFormData;
  label: string;
  title: string;
  description: string;
  placeholder: string;
  maxLength: number;
  inputType: 'text' | 'textarea';
  height?: string;
}

// ==================== 상수 정의 ====================
const MODAL_MESSAGES = {
  TITLE: '위즈덤 작성하기',
  TEMP_SAVE: '임시 저장',
  TEMP_SAVING: '저장중...',
  SUBMIT: '작성 완료',
  SUBMITTING: '제출중...',
  TEMP_SUCCESS: '임시저장이 완료 되었습니다\n작성 완료 버튼을 누르시고, 최종 제출을 완료하세요',
  SUBMIT_SUCCESS: '위즈덤 작성이 완료 되었습니다 :) !',
  ERROR_NOT_LOGGED_IN: '로그인 후 이용 가능한 기능입니다.',
  ERROR_VALIDATION: '모든 항목에 최소 10자 이상 입력해주세요.',
  ERROR_TEMP_SAVE: '임시 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
  ERROR_SUBMIT: '위즈덤 제출 중 오류가 발생했습니다. 다시 시도해주세요.',
  ERROR_UNEXPECTED: '예상치 못한 오류가 발생했습니다.'
} as const;

const VALIDATION_RULES = {
  requestA: { min: 10, max: 40 },
  requestB: { min: 10, max: 150 },
  requestC: { min: 10, max: 40 }
} as const;

const REQUEST_CONFIGS: RequestConfig[] = [
  {
    id: 'requestA',
    label: 'Request a',
    title: '이번 위즈덤 소재를 크루의 표현으로 한 줄 요약/정리하세요!',
    description: '*산업 상의 개념을 명확하고 충분하게 표현할 수 있는가? (1줄 권고, 최소 10자 ~ 최대 40자)',
    placeholder: '소재를 한 줄로 요약해주세요...',
    maxLength: 40,
    inputType: 'text',
    height: 'h-16'
  },
  {
    id: 'requestB',
    label: 'Request B',
    title: '이번 위즈덤 소재를 크루가 희망하는 \'직무\' 및 산업 분야와 접목하여 활용할 수 있는 인사이트, 상상을 펼쳐보세요!',
    description: '*산업 상의 정보를 업무에 녹여낼 잠재력이 있는가? (3 줄 권고, 최소 10자 ~ 최대 150자)',
    placeholder: '업무와 연결한 인사이트를 작성해주세요...',
    maxLength: 150,
    inputType: 'textarea',
    height: 'h-28'
  },
  {
    id: 'requestC',
    label: 'Request c',
    title: '이번 위즈덤 소재를 기회로 그동안 몰랐던 지식과 지혜를 향해 나아갈 수 있는 지식, 새롭게 생긴 궁금증이 있다면?',
    description: '*산업 상의 정보를 기회로 새로운 성장으로 나아갈 수 있는가? (1줄 권고, 최소 10자 ~ 최대 40자)',
    placeholder: '새로운 궁금증이나 배운 점을 작성해주세요...',
    maxLength: 40,
    inputType: 'text',
    height: 'h-16'
  }
];

// ==================== 유틸리티 함수 ====================
const validateForm = (formData: WisdomFormData): boolean => {
  return Object.entries(VALIDATION_RULES).every(([field, rule]) => {
    const value = formData[field as keyof WisdomFormData];
    return value.length >= rule.min && value.length <= rule.max;
  });
};

// ==================== 커스텀 훅: 모달 히스토리 관리 ====================
// useModalHistory 훅 수정
const useModalHistory = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!isOpen) {
      document.body.removeAttribute('data-modal-open');
      return;
    }

    // ❌ 이 줄 제거 - 속성 추가하지 않음
    // document.body.setAttribute('data-modal-open', 'true');
    
    window.history.pushState({ modal: 'wisdom' }, '', window.location.href);
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.removeAttribute('data-modal-open');
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
};

// ==================== 커스텀 훅: 팝업 히스토리 관리 ====================
const usePopupHistory = (popupType: PopupType) => {
  useEffect(() => {
    if (!popupType) return;

    const handlePopState = () => {
      // 팝업이 있으면 팝업만 닫기
      return;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [popupType]);
};

// ==================== 커스텀 훅: Draft 로더 ====================
const useDraftLoader = (isOpen: boolean, isLoggedIn: boolean, setFormData: React.Dispatch<React.SetStateAction<WisdomFormData>>) => {
  useEffect(() => {
    if (!isOpen || !isLoggedIn) return;

    const loadDraft = async () => {
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

    loadDraft();
  }, [isOpen, isLoggedIn, setFormData]);
};

// ==================== 커스텀 훅: 스크롤 관리 ====================
const useScrollToTop = (isOpen: boolean, popupType: PopupType, onClose: () => void) => {
  const scrollPositionRef = useRef<number>(0);

  // 모달 열릴 때 현재 스크롤 위치 저장 및 최상단으로 이동
  useEffect(() => {
    if (isOpen) {
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
      
      // 모달 열릴 때 스크롤을 최상단으로 이동
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  }, [isOpen]);

  // 팝업(임시저장/완료) 뜰 때도 스크롤
  useEffect(() => {
    if (!popupType) return;

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, [popupType]);
};

// ==================== 서브 컴포넌트: Request Field ====================
const RequestField: React.FC<{
  config: RequestConfig;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}> = ({ config, value, onChange, disabled }) => (
  <div className="w-full flex flex-col justify-start items-start gap-5">
    {/* Label */}
    <div className="w-28 h-10 px-1.5 py-2 bg-stone-900/60 border-t border-b border-white backdrop-blur-[6px] inline-flex justify-center items-center gap-12">
      <div className="justify-start text-lime-400 text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed">
        {config.label}
      </div>
    </div>
    
    {/* Input Area */}
    <div className="self-stretch flex flex-col justify-start items-end gap-2">
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        {/* Title & Description */}
        <div className="self-stretch flex flex-col justify-center items-start gap-[5px]">
          <div className="justify-start text-white text-lg lg:text-xl font-semibold font-['Pretendard'] leading-7 lg:leading-9">
            {config.title}
          </div>
          <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Pretendard'] leading-tight">
            {config.description}
          </div>
        </div>
        
        {/* Input/Textarea */}
        <div className={`self-stretch ${config.height} px-5 py-3.5 bg-neutral-900 border-t border-b border-white/20 inline-flex justify-start items-${config.inputType === 'textarea' ? 'start' : 'center'} gap-2.5`}>
          {config.inputType === 'text' ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              maxLength={config.maxLength}
              placeholder={config.placeholder}
              disabled={disabled}
              className="w-full justify-start text-white text-lg font-normal font-['Pretendard'] leading-relaxed bg-transparent outline-none placeholder-neutral-500"
            />
          ) : (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              maxLength={config.maxLength}
              placeholder={config.placeholder}
              disabled={disabled}
              className="w-full h-full justify-start text-white text-lg font-normal font-['Pretendard'] leading-relaxed bg-transparent outline-none resize-none placeholder-neutral-500"
            />
          )}
        </div>
      </div>
      
      {/* Character Counter */}
      <CharCounter current={value.length} max={config.maxLength} />
    </div>
  </div>
);

// ==================== 서브 컴포넌트: Character Counter ====================
const CharCounter: React.FC<{ current: number; max: number }> = ({ current, max }) => (
  <div className="inline-flex justify-start items-center gap-0.5">
    <div className={`justify-start text-sm font-medium font-['Pretendard'] leading-tight ${
      current > 0 ? 'text-white' : 'text-neutral-400'
    }`}>
      {current}
    </div>
    <div className="justify-start text-white text-sm font-medium font-['Pretendard'] leading-tight">
      {" "}/ {max}자
    </div>
  </div>
);

// ==================== 서브 컴포넌트: Action Buttons ====================
const ActionButtons: React.FC<{
  onTemporarySave: () => void;
  onComplete: () => void;
  isLoading: boolean;
}> = ({ onTemporarySave, onComplete, isLoading }) => (
  <div className="self-stretch flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-4 sm:gap-20">
    <button 
      onClick={onTemporarySave}
      disabled={isLoading}
      className="w-full sm:w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] flex justify-center items-center gap-2.5 hover:bg-stone-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="justify-start text-white text-xl font-semibold font-['Pretendard'] leading-9">
        {isLoading ? MODAL_MESSAGES.TEMP_SAVING : MODAL_MESSAGES.TEMP_SAVE}
      </div>
    </button>
    
    <button 
      onClick={onComplete}
      disabled={isLoading}
      className="w-full sm:w-96 h-14 px-9 py-3 bg-stone-900/60 border-t border-b border-white/20 backdrop-blur-[6px] flex justify-center items-center gap-2.5 hover:bg-stone-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="justify-start text-lime-400 text-xl font-semibold font-['Pretendard'] leading-9">
        {isLoading ? MODAL_MESSAGES.SUBMITTING : MODAL_MESSAGES.SUBMIT}
      </div>
    </button>
  </div>
);

// ==================== 서브 컴포넌트: Notification Popup ====================
const NotificationPopup: React.FC<{
  type: 'temporary' | 'complete';
  onClose: () => void;
}> = ({ type, onClose }) => {
  const message = type === 'temporary' 
    ? MODAL_MESSAGES.TEMP_SUCCESS 
    : MODAL_MESSAGES.SUBMIT_SUCCESS;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 px-6 py-8 sm:px-16 lg:px-28 sm:py-12 lg:py-20 bg-neutral-900 outline outline-2 outline-offset-[-1px] inline-flex flex-col justify-start items-start gap-2.5 w-[90%] max-w-2xl"
        style={{ top: '200px', outlineColor: '#ADFF00' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col justify-center items-center gap-8 lg:gap-12 w-full">
          <div className="text-center justify-start text-white text-lg sm:text-2xl lg:text-3xl font-bold font-['Pretendard'] leading-6 sm:leading-8 lg:leading-10 whitespace-pre-line">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== 메인 컴포넌트 ====================
export const WisdomModal: React.FC<WisdomModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  onWisdomSubmitted,
  isLoggedIn = true
}) => {
  // 상태 관리
  const [formData, setFormData] = useState<WisdomFormData>({
    requestA: "",
    requestB: "",
    requestC: ""
  });
  const [popupType, setPopupType] = useState<PopupType>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 커스텀 훅 사용
  useModalHistory(isOpen, onClose);
  usePopupHistory(popupType);
  useDraftLoader(isOpen, isLoggedIn, setFormData);
  useScrollToTop(isOpen, popupType, onClose);

  // 히스토리를 고려한 닫기 함수
  const handleClose = useCallback(() => {
    // 스크롤을 맨 위로 복원
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);

    if (window.history.state?.modal === 'wisdom') {
      window.history.back();
    } else {
      onClose();
    }
  }, [onClose]);

  // 폼 필드 업데이트
  const handleInputChange = useCallback((field: keyof WisdomFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 임시 저장 핸들러
  const handleTemporarySave = useCallback(async () => {
    if (isLoading) return;

    console.log('📝 임시 저장 버튼 클릭');

    // 로그인 체크
    if (!isLoggedIn) {
      alert(MODAL_MESSAGES.ERROR_NOT_LOGGED_IN);
      return;
    }

    // 유효성 검사
    if (!validateForm(formData)) {
      alert(MODAL_MESSAGES.ERROR_VALIDATION);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await WisdomService.saveDraft(formData);

      if (error) {
        console.error('❌ 임시 저장 실패:', error);
        alert(MODAL_MESSAGES.ERROR_TEMP_SAVE);
        return;
      }

      console.log('✅ 임시 저장 성공');
      setPopupType('temporary');
      window.history.pushState({ popup: 'temporary' }, '', window.location.href);
    } catch (error) {
      console.error('❌ 임시 저장 예외:', error);
      alert(MODAL_MESSAGES.ERROR_UNEXPECTED);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isLoggedIn, formData]);

  // 작성 완료 핸들러
  const handleComplete = useCallback(async () => {
    if (isLoading) return;

    console.log('✅ 작성 완료 버튼 클릭');

    // 로그인 체크
    if (!isLoggedIn) {
      alert(MODAL_MESSAGES.ERROR_NOT_LOGGED_IN);
      return;
    }

    // 유효성 검사
    if (!validateForm(formData)) {
      alert(MODAL_MESSAGES.ERROR_VALIDATION);
      return;
    }

    setIsLoading(true);

    try {
      const { data: wisdomPost, error } = await WisdomService.submitWisdom(formData);

      if (error) {
        console.error('❌ 작성 완료 실패:', error);
        alert(MODAL_MESSAGES.ERROR_SUBMIT);
        return;
      }

      if (wisdomPost) {
        console.log('✅ 위즈덤 제출 성공:', wisdomPost);

        if (onWisdomSubmitted) {
          onWisdomSubmitted(wisdomPost);
        }

        setPopupType('complete');
        window.history.pushState({ popup: 'complete' }, '', window.location.href);
      }
    } catch (error) {
      console.error('❌ 작성 완료 예외:', error);
      alert(MODAL_MESSAGES.ERROR_UNEXPECTED);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isLoggedIn, formData, onWisdomSubmitted]);

  // 팝업 닫기 핸들러
  const closePopup = useCallback(() => {
    // 히스토리 정리
    if (window.history.state?.popup) {
      window.history.back();
    }

    const wasComplete = popupType === 'complete';
    setPopupType(null);

    if (wasComplete) {
      // 작성 완료 시 폼 초기화 및 모달 닫기
      setFormData({
        requestA: "",
        requestB: "",
        requestC: ""
      });

      if (onComplete) {
        onComplete();
      }

      // 스크롤을 맨 위로
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);

      handleClose();
    }
  }, [popupType, onComplete, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 메인 모달 */}
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div 
          data-modal="wisdom"
          className="px-8 lg:px-16 xl:px-28 py-8 lg:py-12 xl:py-16 bg-neutral-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-stone-500 inline-flex flex-col justify-start items-start gap-2.5 max-h-[90vh] overflow-y-auto w-full max-w-[1000px] mx-4 mt-40"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wisdom-modal-title"
        >
          <div className="flex flex-col justify-center items-center gap-8 lg:gap-12 w-full">
            
            {/* 제목 */}
            <h2 
              id="wisdom-modal-title"
              className="justify-start text-white text-3xl lg:text-4xl xl:text-5xl font-bold font-['Pretendard'] leading-tight lg:leading-[72px] text-center"
            >
              {MODAL_MESSAGES.TITLE}
            </h2>
            
            <div className="w-full max-w-[916px] flex flex-col justify-start items-start gap-8 lg:gap-12">
              <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-10">
                
                {/* Request Fields */}
                {REQUEST_CONFIGS.map((config) => (
                  <RequestField
                    key={config.id}
                    config={config}
                    value={formData[config.id]}
                    onChange={(value) => handleInputChange(config.id, value)}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <ActionButtons
                onTemporarySave={handleTemporarySave}
                onComplete={handleComplete}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Popups */}
      {popupType && (
        <NotificationPopup
          type={popupType}
          onClose={closePopup}
        />
      )}
    </>
  );
};