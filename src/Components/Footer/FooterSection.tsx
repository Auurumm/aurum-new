import React from "react";

export const FooterSection = (): JSX.Element => {
  const usefulLinks = ["Home", "About Us", "Appointment", "Services", "Blog"];
  const utilityPages = ["FAQ/Return", "Privacy/Terms", "Gift Cards", "Sizing Guide", "Accessibility"];
  const miscellaneous = ["Community", "FAQs", "License", "Privacy", "Contact Us"];

  return (
    <footer className="w-full bg-[#111410] py-8 lg:py-16">
      {/* 상단 구분선 */}
      <div className="w-full h-px bg-white/20 mb-8 lg:mb-16"></div>
      
      <div className="max-w-[1920px] mx-auto px-4 lg:px-60 relative">
        
        {/* 데스크톱 레이아웃 (lg 이상) */}
        <div className="hidden lg:block relative h-[350px]">
          
          {/* 로고 및 설명 섹션 */}
          <div className="absolute top-0 left-0 w-[533px] h-[271px] flex flex-col">
            {/* 로고 */}
            <div className="w-[179px] h-[104px] mb-4 relative overflow-hidden">
              <svg width="179" height="104" viewBox="0 0 45 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <g clipPath="url(#clip0_8334_29616)">
                  <path d="M9.60339 25.1065C5.91908 24.9626 3.25619 24.7323 2.6998 24.3937C1.65623 23.7584 0.867332 21.8937 0.427668 19.5648C0.049364 17.5626 -0.095499 15.1774 0.064127 12.9514C0.226521 10.6811 0.709551 8.55199 1.58842 7.10889C2.21539 6.07871 3.04535 5.38023 4.10691 5.17954C5.60536 4.89674 14.7114 4.72419 23.5153 4.73342L34.7099 0L29.934 4.77586L26.3097 8.39974C24.9958 8.39513 23.6491 8.39374 22.3034 8.39513C14.3041 8.40528 6.34813 8.52615 5.27135 8.75037C4.92303 8.8228 4.63331 9.09268 4.39571 9.49867C3.79827 10.5192 3.55652 12.2644 3.53207 14.1094C3.50716 16.006 3.71799 17.9851 4.01556 19.4153C4.2144 20.3712 4.39064 21.0037 4.48798 21.0605C4.91888 21.3128 8.47171 21.4651 13.1659 21.544L9.60293 25.1065H9.60339Z" fill="#ADFF00"/>
                  <path d="M41.1257 5.3015C42.4853 5.69226 43.4357 7.25761 43.9985 9.35674C44.4492 11.0393 44.6688 13.1024 44.6568 15.1554C44.6448 17.2121 44.4013 19.2632 43.9261 20.9172C43.3452 22.9393 42.3916 24.4289 41.0454 24.7897C39.8907 25.0988 30.3408 25.3203 21.0959 25.3L9.9834 29.9988L14.7399 25.2423L18.3836 21.599C27.8205 21.6535 38.6169 21.4703 39.6143 21.2466C40.1103 21.1354 40.5329 19.9972 40.8244 18.4614C41.0403 17.3242 41.152 16.0034 41.1488 14.6968C41.1455 13.3958 41.0293 12.1114 40.788 11.0402C40.4973 9.74658 40.0669 8.81558 39.5036 8.70855C38.8028 8.57568 35.6647 8.48572 31.5458 8.43681L35.1037 4.87891C38.2021 4.97118 40.4604 5.10958 41.1266 5.30104" fill="white"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.376 12.8398H19.281C19.8784 12.8398 20.367 13.3284 20.367 13.9259V16.0979C20.367 16.6953 19.8784 17.1839 19.281 17.1839H10.376C9.77861 17.1839 9.29004 16.6953 9.29004 16.0979V13.9259C9.29004 13.3284 9.77861 12.8398 10.376 12.8398Z" fill="#ADFF00"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M25.3751 12.8398H34.2805C34.8779 12.8398 35.3665 13.3284 35.3665 13.9259V16.0979C35.3665 16.6953 34.8779 17.1839 34.2805 17.1839H25.3751C24.7776 17.1839 24.2891 16.6953 24.2891 16.0979V13.9259C24.2891 13.3284 24.7776 12.8398 25.3751 12.8398Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_8334_29616">
                    <rect width="44.6565" height="30" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>

            {/* 설명 텍스트 또는 이미지 */}
            <div className="w-[531px] h-[52px] mb-[30px]">
              <img 
                src="./static/Description.png" 
                alt="Description" 
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                }}
              />
              <p className="text-[#bababa] text-base font-normal font-['Sora'] leading-relaxed hidden">
                Sed libero odio, sollicitudin a porttitor ac, tempor eu nisi. Nulla sit amet suscipit dolormentum mauris in, rutrum augue.
              </p>
            </div>

            {/* 앱 다운로드 버튼들 */}
            <div className="flex gap-4">
              <a href="#" className="flex items-center justify-center w-[206px] h-[69px] border border-white/20 bg-neutral-800 rounded hover:opacity-80 transition-opacity">
                <div className="text-center">
                  <div className="text-[#bababa] text-sm font-normal font-['Sora']">Get it on</div>
                  <div className="text-white text-lg font-semibold">Google Play</div>
                </div>
              </a>
              <a href="#" className="flex items-center justify-center w-[186px] h-[69px] border border-white/20 bg-neutral-800 rounded hover:opacity-80 transition-opacity">
                <div className="text-center">
                  <div className="text-[#bababa] text-sm font-normal font-['Sora']">Get it on</div>
                  <div className="text-white text-lg font-semibold">App Store</div>
                </div>
              </a>
            </div>
          </div>

          {/* Useful Links */}
          <div className="absolute top-0 left-[678px] w-[148px] h-[274px] flex flex-col gap-[13px]">
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
          <div className="absolute top-0 left-[972px] w-[152px] h-[274px] flex flex-col gap-[13px]">
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
          <div className="absolute top-0 right-0 w-[174px] h-[274px] flex flex-col gap-[13px]">
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
          <div className="w-24 h-16">
            <svg width="45" height="30" viewBox="0 0 45 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <g clipPath="url(#clip0_mobile)">
                <path d="M9.60339 25.1065C5.91908 24.9626 3.25619 24.7323 2.6998 24.3937C1.65623 23.7584 0.867332 21.8937 0.427668 19.5648C0.049364 17.5626 -0.095499 15.1774 0.064127 12.9514C0.226521 10.6811 0.709551 8.55199 1.58842 7.10889C2.21539 6.07871 3.04535 5.38023 4.10691 5.17954C5.60536 4.89674 14.7114 4.72419 23.5153 4.73342L34.7099 0L29.934 4.77586L26.3097 8.39974C24.9958 8.39513 23.6491 8.39374 22.3034 8.39513C14.3041 8.40528 6.34813 8.52615 5.27135 8.75037C4.92303 8.8228 4.63331 9.09268 4.39571 9.49867C3.79827 10.5192 3.55652 12.2644 3.53207 14.1094C3.50716 16.006 3.71799 17.9851 4.01556 19.4153C4.2144 20.3712 4.39064 21.0037 4.48798 21.0605C4.91888 21.3128 8.47171 21.4651 13.1659 21.544L9.60293 25.1065H9.60339Z" fill="#ADFF00"/>
                <path d="M41.1257 5.3015C42.4853 5.69226 43.4357 7.25761 43.9985 9.35674C44.4492 11.0393 44.6688 13.1024 44.6568 15.1554C44.6448 17.2121 44.4013 19.2632 43.9261 20.9172C43.3452 22.9393 42.3916 24.4289 41.0454 24.7897C39.8907 25.0988 30.3408 25.3203 21.0959 25.3L9.9834 29.9988L14.7399 25.2423L18.3836 21.599C27.8205 21.6535 38.6169 21.4703 39.6143 21.2466C40.1103 21.1354 40.5329 19.9972 40.8244 18.4614C41.0403 17.3242 41.152 16.0034 41.1488 14.6968C41.1455 13.3958 41.0293 12.1114 40.788 11.0402C40.4973 9.74658 40.0669 8.81558 39.5036 8.70855C38.8028 8.57568 35.6647 8.48572 31.5458 8.43681L35.1037 4.87891C38.2021 4.97118 40.4604 5.10958 41.1266 5.30104" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10.376 12.8398H19.281C19.8784 12.8398 20.367 13.3284 20.367 13.9259V16.0979C20.367 16.6953 19.8784 17.1839 19.281 17.1839H10.376C9.77861 17.1839 9.29004 16.6953 9.29004 16.0979V13.9259C9.29004 13.3284 9.77861 12.8398 10.376 12.8398Z" fill="#ADFF00"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M25.3751 12.8398H34.2805C34.8779 12.8398 35.3665 13.3284 35.3665 13.9259V16.0979C35.3665 16.6953 34.8779 17.1839 34.2805 17.1839H25.3751C24.7776 17.1839 24.2891 16.6953 24.2891 16.0979V13.9259C24.2891 13.3284 24.7776 12.8398 25.3751 12.8398Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_mobile">
                  <rect width="44.6565" height="30" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>

          {/* 네비게이션 섹션들 */}
          <div className="grid grid-cols-1 gap-8 text-center max-w-md">
            <div>
              <h3 className="text-white text-lg font-bold font-['Chakra_Petch'] uppercase leading-loose mb-4">
                Useful Links
              </h3>
              <ul className="text-[#bababa] text-sm font-normal font-['Sora'] space-y-2">
                {usefulLinks.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-bold font-['Chakra_Petch'] uppercase leading-loose mb-4">
                Utility Pages
              </h3>
              <ul className="text-[#bababa] text-sm font-normal font-['Sora'] space-y-2">
                {utilityPages.map((page, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors duration-200">
                      {page}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-bold font-['Chakra_Petch'] uppercase leading-loose mb-4">
                Miscellaneous
              </h3>
              <ul className="text-[#bababa] text-sm font-normal font-['Sora'] space-y-2">
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

          {/* 모바일 앱 다운로드 */}
          <div className="flex flex-col gap-3">
            <a href="#" className="block w-48 h-16 border border-white/20 bg-neutral-800 rounded text-center text-[#bababa] text-sm">
              Get it on Google Play
            </a>
            <a href="#" className="block w-48 h-16 border border-white/20 bg-neutral-800 rounded text-center text-[#bababa] text-sm">
              Get it on App Store
            </a>
          </div>
        </div>

        {/* 하단 정보 (공통) */}
        <div className="mt-12 lg:mt-20 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* 저작권 및 정책 링크 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8">
            <div className="text-[#bababa] text-base font-normal font-['Sora']">
              ©Designthemes all rights Reserved
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[#bababa] text-base font-normal font-['Sora'] hover:text-white transition-colors">
                Privacy policy
              </a>
              <div className="w-px h-4 bg-white/20"></div>
              <a href="#" className="text-[#bababa] text-base font-normal font-['Sora'] hover:text-white transition-colors">
                Terms & Conditions
              </a>
            </div>
          </div>

          {/* 소셜 미디어 아이콘 */}
          <div className="flex items-center">
            <img 
              src="./static/footer-group.png" 
              alt="Social Media Icons" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
              }}
            />
            <div className="hidden gap-2">
              <div className="w-10 h-10 bg-lime-400 rounded border border-white/20"></div>
              <div className="w-10 h-10 bg-lime-400 rounded border border-white/20"></div>
              <div className="w-10 h-10 bg-lime-400 rounded border border-white/20"></div>
              <div className="w-10 h-10 bg-lime-400 rounded border border-white/20"></div>
              <div className="w-10 h-10 bg-lime-400 rounded border border-white/20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 구분선 */}
      <div className="w-full h-px bg-white/20 mt-8 lg:mt-16"></div>
    </footer>
  );
};