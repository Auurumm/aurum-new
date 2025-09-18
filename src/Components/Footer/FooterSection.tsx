import React from "react";

export const FooterSection = (): JSX.Element => {
  return (
    <div className="self-stretch py-7 bg-neutral-900 inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden">
      
      {/* Useful links */}
      <div className="justify-start text-white text-xl font-bold font-['Chakra_Petch'] uppercase leading-loose">
        Useful links
      </div>
      <div className="justify-start text-zinc-400 text-base font-normal font-['Sora'] leading-10">
        Home<br/>About Us<br/>Appointment<br/>Services<br/>Blog
      </div>
      
      {/* Utility Pages */}
      <div className="justify-start text-white text-xl font-bold font-['Chakra_Petch'] uppercase leading-loose">
        Utility Pages
      </div>
      <div className="justify-start text-zinc-400 text-base font-normal font-['Sora'] leading-10">
        FAQ/Return<br/>Privacy/Terms<br/>Gift Cards<br/>Sizing Guide<br/>Accessibility
      </div>
      
      {/* Miscellaneous */}
      <div className="justify-start text-white text-xl font-bold font-['Chakra_Petch'] uppercase leading-loose">
        Miscellaneous
      </div>
      <div className="justify-start text-zinc-400 text-base font-normal font-['Sora'] leading-10">
        Community<br/>FAQs<br/>License<br/>Privacy<br/>Contact Us
      </div>
      
      {/* 저작권 */}
      <div className="justify-start text-zinc-400 text-base font-normal font-['Sora'] leading-relaxed">
        ©Designthemes all rights Reserved
      </div>
      
      {/* 정책 링크 */}
      <div className="inline-flex justify-center items-center gap-7">
        <div className="justify-start text-zinc-400 text-base font-normal font-['Sora'] leading-relaxed">
          Privacy policy
        </div>
        <div className="w-4 h-0 origin-top-left rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white/20"></div>
        <div className="justify-start text-zinc-400 text-base font-normal font-['Sora'] leading-relaxed">
          Terms & Conditions
        </div>
      </div>
      
      {/* 소셜 미디어 아이콘 그룹 이미지 */}
      <img 
        src="/images/footer-group.png" 
        alt="Social Media Icons" 
        className="w-auto h-10 object-contain"
      />
      
      {/* Description 이미지 - 로고, 브랜드, 설명, 앱 다운로드 포함 */}
      <img 
        src="/images/Description.png" 
        alt="Brand Description with Logo and App Downloads" 
        className="w-auto h-auto max-w-full object-contain"
      />
      
      {/* 구분선들 */}
      <div className="w-[1920px] h-0 outline outline-1 outline-offset-[-0.50px] outline-white/20"></div>
      <div className="w-[1920px] h-0 outline outline-1 outline-offset-[-0.50px] outline-white/20"></div>
    </div>
  );
};