import React, { useState } from "react";

const navigationItems = [
  { label: "HOME", href: "#home" },
  { label: "WISDOM", href: "#wisdom" },
  { label: "LIBRARY", href: "#library" },
  { label: "BLOG", href: "#blog" },
  { label: "SHOP", href: "#shop" },
];

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full max-w-[1920px] h-[350px] sm:h-[400px] lg:h-[493px] relative mx-auto overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/images/header.png)",
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Navigation bar */}
      <nav className="w-full h-20 lg:h-24 top-0 absolute bg-stone-900/60 border-b border-white/20 backdrop-blur-[6px] z-20">
        
        {/* Logo */}
        <div className="w-9 h-6 lg:w-11 lg:h-7 left-4 lg:left-[23px] top-1/2 -translate-y-1/2 absolute">
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

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden w-6 h-5 right-4 top-1/2 -translate-y-1/2 absolute z-30"
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
        <div className="lg:hidden absolute inset-0 bg-black/80 backdrop-blur-sm z-40">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-white text-xl font-bold font-['Chakra_Petch'] uppercase hover:text-[#ADFF00] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="absolute left-1/2 top-1/2 lg:top-[280px] -translate-x-1/2 -translate-y-1/2 lg:translate-y-0 w-[90%] max-w-96 flex flex-col items-center z-10">
        <h1 className="text-center text-white text-6xl font-bold font-['Chakra_Petch'] uppercase leading-[70px] mb-4">
          WISDOM
        </h1>
        <p className="text-center text-neutral-400 text-xl font-semibold font-['Pretendard'] leading-9 px-4 whitespace-nowrap">
          영상을 보고, 위즈덤을 작성해서 활동을 완료해 주세요
        </p>
      </div>
    </header>
  );
};