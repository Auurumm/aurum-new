import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { AuthModal } from './Components/AuthModal.tsx';
import { Header } from './Components/Header/Header.tsx';
import { ProgressSection } from './Components/ProgressSection/ProgressSection.tsx';
import { CountDown } from './Components/CountDown/CountDown.tsx';
import { MainContentSection } from './Components/MainContent/MainContentSection.tsx';
import { NavigationSection} from './Components/NavigationSection/NavigationSection.tsx';
import { ReactionCardsSection } from './Components/NavigationSection/ReactionCardsSection.tsx';
import { WisdomCardGrid } from './Components/NavigationSection/CardsSection.tsx';
import { FooterSection } from './Components/Footer/FooterSection.tsx';
import { WisdomModal } from './Components/WisdomModal.tsx';
import { WisdomPost } from './services/WisdomService.ts';
import { supabase } from './lib/supabase.ts';
import './styles/index.css';

const AppContent = () => {
  const { user, profile, signOut, loading } = useAuth();

  // 초기 로딩 완료 여부 (sessionStorage로 탭 전환 시에도 유지)
  const [initialLoadComplete, setInitialLoadComplete] = useState(() => {
    return sessionStorage.getItem('initialLoadComplete') === 'true';
  });

  // 모달 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWisdomModal, setShowWisdomModal] = useState(false);

  // 위즈덤 상태
  const [newWisdomPost, setNewWisdomPost] = useState<WisdomPost | null>(null);
  const [isWisdomCompleted, setIsWisdomCompleted] = useState(false);

  // 반응 완료 상태
  const [isAllReactionsCompleted, setIsAllReactionsCompleted] = useState(false);
  const [showMotionEffect, setShowMotionEffect] = useState(false);

  // 로그아웃 진행 상태
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 뷰포트 크기 (모션 효과용)
  const [viewportDimensions, setViewportDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // 초기 로딩 완료 시 sessionStorage에 저장
  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
      sessionStorage.setItem('initialLoadComplete', 'true');
    }
  }, [loading, initialLoadComplete]);

  // 사용자 위즈덤 완료 여부 확인
  useEffect(() => {
    if (!user) {
      setIsWisdomCompleted(false);
      return;
    }

    const checkWisdom = async () => {
      const { data } = await supabase
        .from('wisdom_posts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsWisdomCompleted(!!data);
    };

    checkWisdom();
  }, [user]);

  // 사용자 반응 완료 여부 확인
  useEffect(() => {
    if (!user) {
      setIsAllReactionsCompleted(false);
      return;
    }

    const checkReactions = async () => {
      const { data } = await supabase
        .from('user_reactions')
        .select('honor_sent, recommend_sent, respect_sent, hug_sent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const total = (data.honor_sent || 0) + (data.recommend_sent || 0) + 
                     (data.respect_sent || 0) + (data.hug_sent || 0);
        setIsAllReactionsCompleted(total >= 12);
      }
    };

    checkReactions();
  }, [user]);

  // 뷰포트 크기 추적
  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'visible';

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 모션 효과 CSS 추가
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .motion-effect { position: relative; overflow: hidden; }
      .star-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
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
    if (!ctx) return;

    let animationId: number;
    const resizeCanvas = () => {
      const rect = motionElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Star {
      size: number; x: number; y: number; vy: number; vx: number; ay: number;
      shine: number; shineDir: number; color: string; rot: number; omega: number;
      use(): void;
    }

    const stars: Star[] = [];
    let frame = (Math.random() * 360) | 0;
    const pentaRadiant = Math.PI * 2 / 5;

    function StarConstructor(this: Star) {
      this.size = Math.random() * 25 + 15;
      this.x = Math.random() * canvas.width;
      this.y = -this.size * 2;
      this.vy = this.size / 8;
      this.vx = Math.random() * 4 - 2;
      this.ay = this.size / 3000;
      this.shine = 0;
      this.shineDir = Math.random() * 0.06 + 0.02;
      this.color = `hsla(${(frame % 360)}, 80%, 60%, 0.8)`;
      this.rot = Math.random() * 2 * Math.PI;
      this.omega = (Math.random() * 0.04 + 0.02) * (Math.random() < 0.5 ? -1 : 1);
    }

    StarConstructor.prototype.use = function(this: Star) {
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

      for (let i = 0; i < 5; i++) {
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
        stars.push(new (StarConstructor as any)());
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
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.remove();
    }, 10000);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(cleanup);
      canvas.remove();
    };
  }, [showMotionEffect, viewportDimensions]);

  // 핸들러 함수들
  const handleAllReactionsComplete = () => {
    setIsAllReactionsCompleted(true);
    setShowMotionEffect(true);
    setTimeout(() => setShowMotionEffect(false), 10000);
  };

  const handleShowMotion = () => {
    setShowMotionEffect(true);
    setTimeout(() => setShowMotionEffect(false), 10000);
  };

  const handleAuthRequired = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    const { error } = await signOut();

    if (error) {
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSigningOut(false);
    } else {
      setShowAuthModal(false);
      setIsWisdomCompleted(false);
      setIsAllReactionsCompleted(false);
      setShowMotionEffect(false);
      setTimeout(() => window.location.replace(window.location.origin), 200);
    }
  };

  const handleWisdomSubmitted = (wisdomPost: WisdomPost) => {
    setNewWisdomPost(wisdomPost);
    setShowWisdomModal(false);
    setIsWisdomCompleted(true);
    setTimeout(() => setNewWisdomPost(null), 100);
  };

  // 최초 1회만 로딩 화면 표시
  if (!initialLoadComplete && loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-[#111410] to-black flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#111410] to-black flex flex-col">
      <div className="w-full flex-1 flex flex-col max-w-full overflow-hidden">
        <div className="w-full relative z-20">
          <Header 
            onLoginClick={() => setShowAuthModal(true)}
            onLogoutClick={handleSignOut}
          />
        </div>

        <div className="w-full flex-1 transition-all duration-1000 relative">
          <div className={`relative ${showMotionEffect ? 'motion-effect' : ''}`}>
            <ProgressSection 
              isCompleted={isWisdomCompleted} 
              isAllReactionsCompleted={isAllReactionsCompleted}
              onShowMotion={handleShowMotion}
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
            newWisdomPost={newWisdomPost}
            requireAuth={true}
            onAuthRequired={handleAuthRequired}
          />
        </div>

        <div className="w-full mt-auto relative z-20">
          <FooterSection />
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <WisdomModal
        isOpen={showWisdomModal}
        onClose={() => setShowWisdomModal(false)}
        onWisdomSubmitted={handleWisdomSubmitted}
        isLoggedIn={!!user}
      />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;