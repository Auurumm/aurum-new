import React, { useState, useEffect } from 'react';
import { Header } from './Components/Header/Header.tsx';
import { ProgressSection } from './Components/ProgressSection/ProgressSection.tsx';
import { CountDown } from './Components/CountDown/CountDown.tsx';
import { MainContentSection } from './Components/MainContent/MainContentSection.tsx';
import { NavigationSection} from './Components/NavigationSection/NavigationSection.tsx';
import { ReactionCardsSection } from './Components/NavigationSection/ReactionCardsSection.tsx';
import { WisdomCardGrid } from './Components/NavigationSection/CardsSection.tsx';
import { FooterSection } from './Components/Footer/FooterSection.tsx';
import './styles/index.css';

const App = () => {
  const [isWisdomCompleted, setIsWisdomCompleted] = useState(false);
  const [isAllReactionsCompleted, setIsAllReactionsCompleted] = useState(false);
  const [showMotionEffect, setShowMotionEffect] = useState(false);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState('auto');

  // 브라우저 크기에 따른 스케일 계산
  useEffect(() => {
    const updateScale = () => {
      const designWidth = 1920; // 피그마 디자인 기준 너비
      const currentWidth = window.innerWidth;
      
      // 최소/최대 스케일 제한
      const newScale = Math.min(Math.max(currentWidth / designWidth, 0.5), 2);
      setScale(newScale);
      
      // 컨텐츠 래퍼의 실제 높이를 측정하고 조정
      setTimeout(() => {
        const contentWrapper = document.querySelector('.scaled-content');
        if (contentWrapper) {
          const actualHeight = contentWrapper.scrollHeight;
          const scaledHeight = actualHeight * newScale;
          setContentHeight(`${scaledHeight}px`);
        }
      }, 100); // 렌더링 완료 후 측정
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, [isWisdomCompleted, isAllReactionsCompleted]); // 콘텐츠 변경 시에도 재계산

  const handleAllReactionsComplete = () => {
    console.log('🔥 App.tsx - handleAllReactionsComplete 호출됨!');
    console.log('이전 상태:', { isWisdomCompleted, isAllReactionsCompleted, showMotionEffect });
    
    setIsAllReactionsCompleted(true);
    setShowMotionEffect(true);
    
    console.log('상태 변경 완료 - 모션 효과 시작');
    
    setTimeout(() => {
      console.log('10초 후 모션 효과 제거');
      setShowMotionEffect(false);
    }, 10000);
  };

  // 기존 useEffect들...
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .motion-effect {
        position: relative;
        overflow: hidden;
      }
      
      .star-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 별 떨어지는 효과 useEffect... (기존과 동일)

  return (
    <div 
      className="w-full bg-gradient-to-b from-[#111410] to-black overflow-hidden"
      style={{
        height: contentHeight,
        minHeight: '100vh',
      }}
    >
      {/* 전체 앱을 스케일링하는 래퍼 */}
      <div 
        className="scaled-content transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: '1920px', // 피그마 디자인 기준 너비
          margin: '0 auto',
          overflow: 'visible', // 컨텐츠가 잘리지 않도록
        }}
      >
        <Header />
        
        <div className={`w-full transition-all duration-1000 ${showMotionEffect ? 'motion-effect' : ''}`}>
          <ProgressSection 
            isCompleted={isWisdomCompleted} 
            isAllReactionsCompleted={isAllReactionsCompleted}
          />
          
          <div id="countdown-section" className="w-full">
            <CountDown 
              isCompleted={isWisdomCompleted}
              onComplete={() => setIsWisdomCompleted(true)} 
            />
          </div>
        </div>
        
        <MainContentSection />
        
        <div id="navigation-section" className="w-full">
          <NavigationSection isAllReactionsCompleted={isAllReactionsCompleted} />
        </div>
        
        <ReactionCardsSection />
        
        <WisdomCardGrid 
          isWisdomCompleted={isWisdomCompleted}
          onAllReactionsComplete={handleAllReactionsComplete}
        />
        
        <FooterSection />
      </div>
    </div>
  );
};

export default App;