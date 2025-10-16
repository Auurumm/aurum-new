import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

// ==================== 타입 정의 ====================
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ==================== 상수 정의 ====================
const MODAL_MESSAGES = {
  TITLE: '로그인',
  SUBTITLE: 'Google 계정으로 간편하게 시작하세요',
  LOGIN_BUTTON: 'Google로 계속하기',
  LOADING: '로그인 중...',
  TERMS: '로그인하면 서비스 이용약관 및\n개인정보처리방침에 동의하는 것으로 간주됩니다.',
  ERROR_LOGIN: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
  ERROR_UNEXPECTED: '예상치 못한 오류가 발생했습니다.'
} as const;

// ==================== 커스텀 훅: 모달 히스토리 관리 ====================
// useModalHistory 훅 수정
const useModalHistory = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!isOpen) {
      document.body.removeAttribute('data-modal-open');
      return;
    }

    // ❌ 이 줄 제거
    // document.body.setAttribute('data-modal-open', 'true');
    
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.removeAttribute('data-modal-open');
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
};

// ==================== 커스텀 훅: 로그인 성공 시 자동 닫기 ====================
const useAutoCloseOnLogin = (
  isOpen: boolean, 
  user: any, 
  onClose: () => void,
  setIsLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    if (user && isOpen) {
      console.log('✅ 사용자 로그인 감지, 모달 자동 닫기');
      setIsLoading(false);
      onClose();
    }
  }, [user, isOpen, onClose, setIsLoading]);
};

// ==================== 커스텀 훅: 모달 열릴 때 초기화 ====================
const useResetOnOpen = (isOpen: boolean, setIsLoading: (loading: boolean) => void) => {
  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
    }
  }, [isOpen, setIsLoading]);
};

// ==================== 서브 컴포넌트: Google 아이콘 ====================
const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// ==================== 서브 컴포넌트: 로딩 스피너 ====================
const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
);

// ==================== 서브 컴포넌트: 닫기 버튼 ====================
const CloseButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
}> = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
    disabled={disabled}
    aria-label="모달 닫기"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

// ==================== 서브 컴포넌트: 모달 헤더 ====================
const ModalHeader: React.FC = () => (
  <div className="text-center mb-8">
    <h2 className="text-2xl font-bold text-white mb-2">
      {MODAL_MESSAGES.TITLE}
    </h2>
    <p className="text-neutral-400">
      {MODAL_MESSAGES.SUBTITLE}
    </p>
  </div>
);

// ==================== 서브 컴포넌트: Google 로그인 버튼 ====================
const GoogleLoginButton: React.FC<{
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}> = ({ onClick, isLoading, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label={isLoading ? MODAL_MESSAGES.LOADING : MODAL_MESSAGES.LOGIN_BUTTON}
  >
    {isLoading ? (
      <>
        <LoadingSpinner />
        <span>{MODAL_MESSAGES.LOADING}</span>
      </>
    ) : (
      <>
        <GoogleIcon />
        <span>{MODAL_MESSAGES.LOGIN_BUTTON}</span>
      </>
    )}
  </button>
);

// ==================== 서브 컴포넌트: 약관 안내 ====================
const TermsNotice: React.FC = () => (
  <div className="mt-6 text-center">
    <p className="text-sm text-neutral-500 whitespace-pre-line">
      {MODAL_MESSAGES.TERMS}
    </p>
  </div>
);

// ==================== 메인 컴포넌트 ====================
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, loading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 커스텀 훅 사용
  useModalHistory(isOpen, onClose);
  useAutoCloseOnLogin(isOpen, user, onClose, setIsLoading);
  useResetOnOpen(isOpen, setIsLoading);

  // 히스토리를 고려한 닫기 함수
  const handleClose = useCallback(() => {
    setIsLoading(false);
    if (window.history.state?.modal === 'auth') {
      window.history.back();
    } else {
      onClose();
    }
  }, [onClose]);

  // Google 로그인 핸들러
  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Google 로그인 시작');
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('❌ 로그인 오류:', error.message);
        alert(MODAL_MESSAGES.ERROR_LOGIN);
        setIsLoading(false);
      }
      // ✅ 성공 시에는 useAutoCloseOnLogin 훅에서 모달을 닫음
    } catch (error) {
      console.error('❌ 예상치 못한 오류:', error);
      alert(MODAL_MESSAGES.ERROR_UNEXPECTED);
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 로딩 상태 통합 (내부 로딩 || AuthContext 로딩)
  const isLoginInProgress = isLoading || loading;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/70 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-neutral-900 rounded-lg p-8 max-w-md w-full relative border border-neutral-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* 닫기 버튼 */}
        <CloseButton 
          onClick={handleClose}
          disabled={isLoginInProgress}
        />

        {/* 헤더 */}
        <ModalHeader />

        {/* Google 로그인 버튼 */}
        <GoogleLoginButton
          onClick={handleGoogleLogin}
          isLoading={isLoginInProgress}
          disabled={isLoginInProgress}
        />

        {/* 약관 안내 */}
        <TermsNotice />
      </div>
    </div>
  );
};

export default AuthModal;