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

const App: React.FC = () => {
  const [isWisdomCompleted, setIsWisdomCompleted] = useState(false);
  const [isAllReactionsCompleted, setIsAllReactionsCompleted] = useState(false);
  const [showMotionEffect, setShowMotionEffect] = useState(false);

  const handleAllReactionsComplete = () => {
    console.log('🔥 App.tsx - handleAllReactionsComplete 호출됨!');
    console.log('이전 상태:', { isWisdomCompleted, isAllReactionsCompleted, showMotionEffect });
    
    setIsAllReactionsCompleted(true);
    setShowMotionEffect(true);
    
    console.log('상태 변경 완료 - 모션 효과 시작');
    
    // 10초 후 모션 효과 제거
    setTimeout(() => {
      console.log('10초 후 모션 효과 제거');
      setShowMotionEffect(false);
    }, 10000);
  };

  // 컴포넌트가 마운트될 때 CSS 스타일 추가
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

    // 컴포넌트 언마운트 시 스타일 제거
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 별 떨어지는 효과
  useEffect(() => {
    if (!showMotionEffect) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'star-canvas';
    
    const motionElement = document.querySelector('.motion-effect');
    if (!motionElement) return;
    
    motionElement.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // null 체크 추가
    
    let animationId: number;
    
    const resizeCanvas = () => {
      canvas.width = motionElement.clientWidth;
      canvas.height = motionElement.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const size = [15, 40];
    const shineDir = [0.02, 0.08];
    const angSpeed = [0.02, 0.06];
    
    // 타입 정의
    interface StarType {
      size: number;
      x: number;
      y: number;
      vy: number;
      vx: number;
      ay: number;
      shine: number;
      shineDir: number;
      color: string;
      rot: number;
      omega: number;
      use(): void;
    }
    
    const stars: StarType[] = [];
    let frame = (Math.random() * 360) | 0;
    const pentaRadiant = Math.PI * 2 / 5;
    
    function rand(ar: number[]): number {
      return Math.random() * (ar[1] - ar[0]) + ar[0];
    }
    
    function Star(this: StarType) {
      this.size = rand(size);
      this.x = Math.random() * canvas.width;
      this.y = -this.size * 2;
      this.vy = this.size / 8;
      this.vx = Math.random() * 4 - 2;
      this.ay = this.size / 3000;
      this.shine = 0;
      this.shineDir = rand(shineDir);
      this.color = `hsla(${(frame % 360)}, 80%, 60%, 0.8)`;
      this.rot = Math.random() * 2 * Math.PI;
      this.omega = rand(angSpeed);
      if (Math.random() < 0.5) this.omega *= -1;
    }
    
    Star.prototype.use = function(this: StarType) {
      if (!ctx) return;
      
      this.x += this.vx;
      this.y += this.vy += this.ay;
      
      const newShine = this.shine + this.shineDir;
      if (newShine < 0 || newShine > 1) this.shineDir *= -1;
      else this.shine = newShine;
      this.rot += this.omega;
      
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color.replace('60%', `${(30 + this.shine * 40)}%`);
      ctx.beginPath();
      ctx.moveTo(this.size, 0);
      
      for (let i = 0; i < 5; ++i) {
        const rad = pentaRadiant * i;
        const halfRad = rad + pentaRadiant / 2;
        ctx.lineTo(Math.cos(rad) * this.size, Math.sin(rad) * this.size);
        ctx.lineTo(Math.cos(halfRad) * this.size / 2, Math.sin(halfRad) * this.size / 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    
    function animate() {
      if (!ctx) return;
      
      frame++;
      
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      
      if (Math.random() < 0.4) {
        const newStar = new (Star as any)() as StarType;
        stars.push(newStar);
      }
      
      for (let s = stars.length - 1; s >= 0; s--) {
        stars[s].use();
        
        if (stars[s].y > canvas.height + stars[s].size || 
            stars[s].x < -stars[s].size || 
            stars[s].x > canvas.width + stars[s].size) {
          stars.splice(s, 1);
        }
      }
      
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // 10초 후 정리
    const cleanup = setTimeout(() => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }, 10000);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(cleanup);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [showMotionEffect]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111410] to-black">
      <Header />
      
      {/* 모션 효과가 적용되는 영역 */}
      <div className={`transition-all duration-1000 ${showMotionEffect ? 'motion-effect' : ''}`}>
        <ProgressSection 
          isCompleted={isWisdomCompleted} 
          isAllReactionsCompleted={isAllReactionsCompleted}
        />
        <div id="countdown-section">
          <CountDown 
            isCompleted={isWisdomCompleted}
            onComplete={() => setIsWisdomCompleted(true)} 
          />
        </div>
      </div>
      
      <MainContentSection />
      <div id="navigation-section">
        <NavigationSection isAllReactionsCompleted={isAllReactionsCompleted} />
      </div>
      <ReactionCardsSection />
      <WisdomCardGrid 
        isWisdomCompleted={isWisdomCompleted}
        onAllReactionsComplete={handleAllReactionsComplete}
      />
      <FooterSection />
    </div>
  );
};

export default App;