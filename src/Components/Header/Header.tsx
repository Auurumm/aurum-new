import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.tsx";

const navigationItems = [
  { label: "HOME", href: "#home" },
  { label: "WISDOM", href: "#wisdom" },
  { label: "LIBRARY", href: "#library" },
  { label: "BLOG", href: "#blog" },
  { label: "SHOP", href: "#shop" },
];

export const Header: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  <button disabled={loading} onClick={user ? signOut : () => setShowAuthModal(true)}>
    {loading ? '로딩 중…' : user ? '로그아웃' : '로그인'}
  </button>
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full h-72 sm:h-[350px] lg:h-[493px] relative overflow-hidden">
      {/* Desktop Background */}
      <div 
        className="hidden sm:block absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/images/header.png)",
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Mobile Background - 384px x 288px (w-96 h-72) */}
      <div className="sm:hidden w-96 h-72 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/header-mobile.png)",
          }}
        >
          {/* 모바일 시안에 따른 오버레이 */}
          <div className="absolute inset-0 bg-black/5 border-t border-b border-white/20"></div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="w-full h-16 sm:h-20 lg:h-24 top-0 absolute bg-stone-900/60 border-b border-white/20 backdrop-blur-[6px] z-20">
        
        {/* Logo */}
        <div className="w-8 h-5 sm:w-9 sm:h-6 lg:w-11 lg:h-7 left-3 sm:left-4 lg:left-[23px] top-1/2 -translate-y-1/2 absolute">
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

        {/* 로그인/로그아웃 버튼 */}
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-3 right-[135px]">
          {loading ? (
            <span className="text-white text-sm">로딩 중…</span>
          ) : user ? (
            <>
              <span className="text-white text-sm">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => alert("로그인 모달 열기")} // AuthModal 연동 필요
              className="px-4 py-2 bg-[#ADFF00] text-black rounded-lg hover:bg-[#9AE600] transition-colors font-medium"
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
        <div className="lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-40 touch-optimized">
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white text-2xl font-light"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
          
          {/* Menu items */}
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

      {/* Main content area */}
      <div className="absolute left-1/2 top-[60%] sm:top-1/2 lg:top-[280px] -translate-x-1/2 -translate-y-1/2 lg:translate-y-0 w-[90%] max-w-96 flex flex-col items-center z-10 px-4">
        {/* 모바일에서는 더 컴팩트한 레이아웃 */}
        <h1 className="text-center text-white font-bold font-['Chakra_Petch'] uppercase leading-tight mb-2 sm:mb-4 text-3xl sm:text-5xl lg:text-6xl">
          WISDOM
        </h1>
        <p className="text-center text-neutral-400 font-semibold font-['Pretendard'] leading-snug sm:leading-relaxed text-xs sm:text-lg lg:text-xl lg:leading-9 break-keep max-w-80 sm:max-w-none whitespace-nowrap">
          영상을 보고, 위즈덤을 작성해서 활동을 완료해 주세요
        </p>
      </div>
    </header>
  );
};