import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { ProfileEditModal } from "../ProfileEditModal.tsx";

const navigationItems = [
  { label: "HOME", href: "#home" },
  { label: "WISDOM", href: "#wisdom" },
  { label: "LIBRARY", href: "#library" },
  { label: "BLOG", href: "#blog" },
  { label: "SHOP", href: "#shop" },
];

interface HeaderProps {
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onLogoutClick }) => {
  const { user, profile, loading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // 프로필 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleProfileEditClick = () => {
    setShowProfileMenu(false);
    document.body.setAttribute('data-modal-open', 'true');
    setShowProfileEditModal(true);
    window.history.pushState({ modal: 'profile-edit' }, '', window.location.href);
  };

  const handleLogoutClick = async () => {
    setShowProfileMenu(false);
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      await signOut();
    }
  };

  // 표시할 사용자 이름 결정 (우선순위: username > 이메일)
  const displayName = profile?.username || user?.email?.split('@')[0] || '사용자';
  
  // 프로필 이미지 또는 기본 아바타
  const avatarUrl = profile?.avatar_url;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* 고정 네비게이션 바 */}
      <nav className="w-full h-16 sm:h-20 lg:h-24 fixed top-0 left-0 right-0 bg-stone-900/60 border-b border-white/20 backdrop-blur-[6px] z-50">
        
        {/* Logo */}
        <div className="w-8 h-5 sm:w-9 sm:h-6 lg:w-11 lg:h-7 left-3 sm:left-4 lg:left-[10px] top-1/2 -translate-y-1/2 absolute">
          <img 
            src="/images/Logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-14">
          {navigationItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-white text-base font-bold font-['Chakra_Petch'] uppercase leading-relaxed hover:text-[#ADFF00] transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* 로그인/프로필 영역 */}
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-3 right-[52px] sm:right-[56px] lg:right-[100px]">
          {loading ? (
            <div className="flex items-center gap-2 text-white text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="hidden sm:inline">로딩 중…</span>
            </div>
          ) : user ? (
            <div className="relative" ref={profileMenuRef}>
              {/* 프로필 버튼 */}
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-stone-800/50 hover:bg-stone-700/50 rounded-lg transition-colors min-w-[120px] sm:min-w-[140px]"
              >
                {/* 프로필 이미지 */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="프로필" 
                      className="w-full h-full rounded-full object-cover border-2 border-[#ADFF00]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#ADFF00] to-[#7CB500] flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {avatarInitial}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 이름 */}
                <span className="text-white text-sm flex-1 truncate text-left">
                  {displayName}
                </span>
                
                {/* 화살표 아이콘 */}
                <svg 
                  className={`w-4 h-4 text-white transition-transform flex-shrink-0 ${showProfileMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#3B4236] rounded-lg shadow-xl border border-stone-600 overflow-hidden z-30">
                  <button
                    onClick={handleProfileEditClick}
                    className="w-full px-4 py-3 text-left text-white hover:bg-stone-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">프로필<br className="sm:hidden" /> 수정</span>
                  </button>
                  <div className="h-px bg-stone-600"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-3 text-left text-red-400 hover:bg-stone-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">로그<br className="sm:hidden" />아웃</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-[#ADFF00] text-black rounded-lg hover:bg-[#9AE600] transition-colors font-medium text-sm sm:text-base"
            >
              로그인
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden w-5 h-4 sm:w-6 sm:h-5 right-3 sm:right-4 top-1/2 -translate-y-1/2 absolute z-30 touch-optimized"
          aria-label="Toggle menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <img 
            src="/images/Menu.png" 
            alt="Menu" 
            className="w-full h-full object-contain"
          />
        </button>

        {/* Desktop Menu Button */}
        <button 
          className="hidden lg:block w-7 h-6 right-[23px] top-1/2 -translate-y-1/2 absolute"
          aria-label="Menu"
        >
          <img 
            src="/images/Menu.png" 
            alt="Menu" 
            className="w-full h-full object-contain"
          />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] touch-optimized">
          <button 
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white text-2xl font-light"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
          
          <div className="flex flex-col items-center justify-center h-full gap-6 sm:gap-8">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-white text-lg sm:text-xl font-bold font-['Chakra_Petch'] uppercase hover:text-[#ADFF00] transition-colors duration-200 touch-optimized py-2 px-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 헤더 콘텐츠 - 네비게이션 바 아래 */}
      <header className="w-full h-72 sm:h-[350px] lg:h-[493px] relative overflow-hidden mt-16 sm:mt-20 lg:mt-24">
        {/* Desktop Background */}
        <div 
          className="hidden sm:block absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/header.png)",
            backgroundPosition: "center 80%", // 세로 위치 조정
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Mobile Background */}
        <div className="sm:hidden w-full h-full relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url(/images/header-mobile.png)",
              backgroundPosition: "center 50%", // 세로 위치 조정
            }}
          >
            <div className="absolute inset-0 bg-black/5 border-t border-b border-white/20"></div>
          </div>
        </div>

        {/* Main content area */}
        <div className="absolute left-1/2 top-[45%] sm:top-[45%] lg:top-[45%] -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-96 flex flex-col items-center z-10 px-4">
          <h1 className="text-center text-white font-bold font-['Chakra_Petch'] uppercase leading-tight mb-2 sm:mb-4 text-3xl sm:text-5xl lg:text-6xl">
            WISDOM
          </h1>
          <p className="text-center text-neutral-400 font-semibold font-['Pretendard'] leading-snug sm:leading-relaxed text-xs sm:text-lg lg:text-xl lg:leading-9 break-keep max-w-80 sm:max-w-none whitespace-nowrap">
            영상을 보고, 위즈덤을 작성해서 활동을 완료해 주세요
          </p>
        </div>
      </header>

      {/* 프로필 수정 모달 */}
      <ProfileEditModal 
        isOpen={showProfileEditModal}
        onClose={() => setShowProfileEditModal(false)}
      />
    </>
  );
};