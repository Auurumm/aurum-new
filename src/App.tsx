// 실제 인증 시스템 연결 - 주석 해제
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { AuthModal } from './Components/AuthModal.tsx'; 

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
import { WisdomPost } from './services/WisdomService.ts';
import { WisdomModal } from './Components/WisdomModal.tsx';

// 메인 앱 컴포넌트 - 실제 인증 로직 사용
const AppContent = () => {
  const [showWisdomModal, setShowWisdomModal] = useState(false);
  const [newWisdomPost, setNewWisdomPost] = useState<WisdomPost | null>(null);
  // 실제 인증 시스템 사용
  const { user, profile, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 기존 상태들
  const [isWisdomCompleted, setIsWisdomCompleted] = useState(false);
  const [isAllReactionsCompleted, setIsAllReactionsCompleted] = useState(false);
  const [showMotionEffect, setShowMotionEffect] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });

  // 뷰포트 크기 추적 (스케일링 대신 반응형 접근)
  useEffect(() => {
    const updateViewportDimensions = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportDimensions();
    window.addEventListener('resize', updateViewportDimensions);
    
    // body 스타일 초기화 - 자연스러운 높이 설정
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'visible';
    
    return () => {
      window.removeEventListener('resize', updateViewportDimensions);
    };
  }, []);

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

  // 인증이 필요한 액션 처리
  const handleAuthRequired = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

    // 개선된 로그아웃 처리
    const handleSignOut = async () => {
      if (isSigningOut) return; // 중복 실행 방지
      
      setIsSigningOut(true);
      console.log('🚪 로그아웃 시작...');
      
      try {
        const { error } = await signOut();
        
        if (error) {
          console.error('❌ 로그아웃 실패:', error);
          alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
        } else {
          console.log('✅ 로그아웃 성공');
          
          // 상태 초기화 (필요시)
          setShowAuthModal(false);
          setIsWisdomCompleted(false);
          setIsAllReactionsCompleted(false);
          setShowMotionEffect(false);
          
          // 페이지 새로고침으로 확실한 상태 초기화
          setTimeout(() => {
            window.location.replace(window.location.origin); // ← 해시 없이 도메인 루트로
            // 또는: window.location.href = '/';
          }, 200);
        }
      } catch (error) {
        console.error('❌ 로그아웃 예외:', error);
        alert('로그아웃 중 예상치 못한 오류가 발생했습니다.');
      } finally {
        setIsSigningOut(false);
      }
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

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // 별 떨어지는 효과 - 개선된 버전
  useEffect(() => {
    if (!showMotionEffect) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'star-canvas';
    
    const motionElement = document.querySelector('.motion-effect');
    if (!motionElement) return;
    
    motionElement.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    const resizeCanvas = () => {
      const rect = motionElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const size = [15, 40];
    const shineDir = [0.02, 0.08];
    const angSpeed = [0.02, 0.06];
    
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
  }, [showMotionEffect, viewportDimensions]);

  // 위즈덤 제출 처리
  const handleWisdomSubmitted = (wisdomPost: WisdomPost) => {
    console.log('✅ 새 위즈덤 포스트 받음:', wisdomPost);
    setNewWisdomPost(wisdomPost);
    setShowWisdomModal(false);
    
    // 잠시 후 null로 리셋하여 중복 추가 방지
    setTimeout(() => setNewWisdomPost(null), 100);
  };

  return (
    <div 
      className="w-full min-h-screen bg-gradient-to-b from-[#111410] to-black"
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* 반응형 컨테이너 - 스케일링 대신 자연스러운 반응형 레이아웃 사용 */}
      <div 
        className="w-full flex-1 flex flex-col"
        style={{
          maxWidth: '100vw',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div className="w-full relative z-20">
          <Header 
            onLoginClick={() => setShowAuthModal(true)}   // ✅ 로그인 모달 열기
            onLogoutClick={handleSignOut}                 // ✅ App의 커스텀 로그아웃 로직 사용
          />
        </div>
        
        {/* 메인 콘텐츠 영역 */}
        <div className="w-full flex-1 transition-all duration-1000 relative">
          {/* ⭐ ProgressSection을 motion-effect로 감싸기 */}
          <div className={`relative ${showMotionEffect ? 'motion-effect' : ''}`}>
            <ProgressSection 
              isCompleted={isWisdomCompleted} 
              isAllReactionsCompleted={isAllReactionsCompleted}
            />
          </div>
          
          <div id="countdown-section" className="w-full">
            <CountDown 
              isCompleted={isWisdomCompleted}
              onComplete={() => setIsWisdomCompleted(true)}
            />
          </div>

          <MainContentSection />

          <div id="navigation-section" className="w-full">
            <NavigationSection isAllReactionsCompleted={isAllReactionsCompleted} />
          </div>
          
          <ReactionCardsSection />
          
          <WisdomCardGrid 
            isWisdomCompleted={isWisdomCompleted}
            onAllReactionsComplete={handleAllReactionsComplete}
            newWisdomPost={newWisdomPost}  // ✅ 이 줄 추가
            requireAuth={true}
            onAuthRequired={handleAuthRequired}
          />
        </div>
        
        {/* 푸터 - 항상 하단에 위치하도록 보장 */}
        <div className="w-full mt-auto relative z-20">
          <FooterSection />
        </div>
      </div>

      {/* 실제 인증 모달 */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* 위즈덤 작성 모달 */}
      <WisdomModal
        isOpen={showWisdomModal}
        onClose={() => setShowWisdomModal(false)}
        onWisdomSubmitted={handleWisdomSubmitted}
        isLoggedIn={!!user}
      />
    </div>
  );
};


// 실제 AuthProvider로 감싸기
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;