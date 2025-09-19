import React from "react";

export const FooterSection = (): JSX.Element => {
  const usefulLinks = ["Home", "About Us", "Appointment", "Services", "Blog"];
  const utilityPages = ["FAQ/Return", "Privacy/Terms", "Gift Cards", "Sizing Guide", "Accessibility"];
  const miscellaneous = ["Community", "FAQs", "License", "Privacy", "Contact Us"];

  return (
    <footer className="w-full bg-[#111410] py-8 lg:py-16">
      {/* 상단 구분선 */}
      <div className="w-full h-px bg-white/20 mb-8 lg:mb-16"></div>
      
      <div className="max-w-[1920px] mx-auto content-padding relative">
        
        {/* 데스크톱 레이아웃 (lg 이상) */}
        <div className="hidden lg:block relative h-[350px] overflow-hidden">
          
          {/* 로고 및 브랜드 섹션 - 단일 이미지로 대체 */}
          <div className="absolute top-0 left-0 w-[531px] h-[271px]">
            <img 
              src="/images/Description.png" 
              alt="Footer Brand Section" 
              className="w-[531px] h-[271px] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
              }}
            />
            {/* 폴백: 이미지가 없을 때 표시될 내용 */}
            <div className="hidden w-[531px] h-[271px] bg-neutral-800 border border-white/20 rounded flex items-center justify-center">
              <div className="text-center text-[#bababa]">
                <div className="text-xl font-bold mb-2">Brand Section</div>
                <div className="text-sm">531 x 271px</div>
              </div>
            </div>
          </div>

          {/* Useful Links */}
          <div className="absolute top-0 left-[min(678px,40%)] w-[152px] h-[274px] flex flex-col gap-[13px]">
            <h3 className="text-white text-xl font-bold font-['Chakra_Petch'] uppercase leading-loose mb-4">
              Useful Links
            </h3>
            <ul className="text-[#bababa] text-base font-normal font-['Sora'] leading-10 space-y-2">
              {usefulLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Utility Pages */}
          <div className="absolute top-0 left-[min(972px,60%)] w-[174px] h-[274px] flex flex-col gap-[13px]">
            <h3 className="text-white text-xl font-bold font-['Chakra_Petch'] uppercase leading-loose mb-4">
              Utility Pages
            </h3>
            <ul className="text-[#bababa] text-base font-normal font-['Sora'] leading-10 space-y-2">
              {utilityPages.map((page, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    {page}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Miscellaneous */}
          <div className="absolute top-0 right-0 w-[196px] h-[274px] flex flex-col gap-[13px]">
            <h3 className="text-white text-xl font-bold font-['Chakra_Petch'] uppercase leading-loose mb-4">
              Miscellaneous
            </h3>
            <ul className="text-[#bababa] text-base font-normal font-['Sora'] leading-10 space-y-2">
              {miscellaneous.map((item, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 모바일 레이아웃 (lg 미만) */}
        <div className="lg:hidden flex flex-col items-center gap-6">
          {/* 로고 */}
          <div className="w-204 h-440">
            <img src="/images/Description-mobile.png" alt="Footer Brand Section" className="w-204 h-440 object-cover" />
          </div>
        </div>
      </div>

      {/* 하단 구분선 */}
      <div className="w-full h-px bg-white/20 mt-8 lg:mt-16"></div>
    </footer>
  );
};