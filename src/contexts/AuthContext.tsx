import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.ts';

// 프로필 타입 정의
interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
}

// AuthContext 타입 정의
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetchProfile 함수 수정
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('프로필 조회 실패:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('프로필 조회 예외:', error);
      return null;
    }
  };

  // createProfile 함수 수정  
  const createProfile = async (user: User) => {
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      username: user.user_metadata?.preferred_username || user.user_metadata?.user_name || '',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    };

    try {
      // 최대 3회까지만 시도
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' })
          .select()
          .single();

        if (!error) {
          return data;
        }
        
        attempts++;
        console.warn(`프로필 생성 실패 (${attempts}/${maxAttempts}):`, error);
        
        if (attempts >= maxAttempts) {
          break;
        }
        
        // 잠시 대기 후 재시도
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 프로필 생성에 실패해도 기본 정보로 진행
      console.warn('프로필 생성 최종 실패, 기본 정보 사용');
      return profileData;
      
    } catch (error) {
      console.error('프로필 생성 예외:', error);
      // 예외 발생 시에도 기본 정보로 진행
      return profileData;
    }
  };

  // 세션 및 프로필 초기화
  const initializeAuth = async (session: Session | null) => {
    console.log('인증 초기화 시작:', session?.user?.email);
    
    if (session?.user) {
      setUser(session.user);
      setSession(session);
      
      // 프로필 로드 또는 생성 (한 번만 시도)
      try {
        let profileData = await fetchProfile(session.user.id);
        if (!profileData) {
          console.log('프로필이 없어 새로 생성합니다.');
          profileData = await createProfile(session.user);
        }
        setProfile(profileData);
        console.log('인증 초기화 완료:', { user: session.user.email, profile: profileData?.full_name });
      } catch (error) {
        console.error('프로필 처리 실패:', error);
        // 프로필 처리 실패해도 사용자 인증은 유지
        setProfile({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || '',
        });
      }
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('인증 초기화: 로그아웃 상태');
    }
    
    setLoading(false);
  };

  // 세션 변경 감지
  useEffect(() => {
    let mounted = true;

    // 초기 세션 가져오기
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('세션 가져오기 오류:', error);
          setError(error.message);
        }
        
        if (mounted) {
          await initializeAuth(session);
        }
      } catch (error) {
        console.error('초기 세션 로드 오류:', error);
        if (mounted) {
          setError('인증 초기화에 실패했습니다.');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('인증 상태 변경:', event, session?.user?.email);
      
      if (mounted) {
        // OAuth 리다이렉션 후 토큰 교환 처리
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('로그인/토큰 갱신 감지, 인증 상태 업데이트');
          await initializeAuth(session);
        } else if (event === 'SIGNED_OUT') {
          console.log('로그아웃 감지');
          await initializeAuth(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google 로그인 오류:', error);
        setError(error.message);
      }

      return { error };
    } catch (error) {
      console.error('Google 로그인 예외:', error);
      const errorMessage = 'Google 로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      setError(null);
      console.log('Supabase 로그아웃 요청...');
      
      // 로컬 스토리지 정리
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 오류:', error);
        setError(error.message);
      } else {
        console.log('Supabase 로그아웃 성공');
        
        // 상태 즉시 초기화
        setUser(null);
        setProfile(null);
        setSession(null);
        setLoading(false);
      }
      
      return { error };
    } catch (error) {
      console.error('로그아웃 예외:', error);
      const errorMessage = '로그아웃 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      // 예외 발생 시에도 상태 초기화 (강제)
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      return { error: { message: errorMessage } };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다.');
  }
  return context;
};