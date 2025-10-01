import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.ts';

// 프로필 타입 정의 (username으로 통일)
interface Profile {
  id: string;
  username: string | null;
  gender: string | null;
  age: number | null;
  company: string | null;
  avatar_url: string | null;
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
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 프로필 조회 함수
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('프로필 조회 시작:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('프로필 조회 실패:', error);
        return null;
      }

      console.log('프로필 조회 성공:', data);
      return data;
    } catch (error) {
      console.error('프로필 조회 예외:', error);
      return null;
    }
  };

  // 프로필 생성 함수
  const createProfile = async (user: User): Promise<Profile | null> => {
    const profileData = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      gender: null,
      age: null,
      company: null
    };

    try {
      console.log('프로필 생성 시도:', profileData);
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) {
        console.error('프로필 생성 실패:', error);
        return profileData as Profile;
      }

      console.log('프로필 생성 성공:', data);
      return data;
    } catch (error) {
      console.error('프로필 생성 예외:', error);
      return profileData as Profile;
    }
  };

  // 프로필 새로고침 함수
  const refreshProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        console.log('프로필 새로고침 시작:', currentUser.email);
        const profileData = await fetchProfile(currentUser.id);
        
        if (profileData) {
          setProfile(profileData);
          console.log('프로필 새로고침 완료:', profileData);
        } else {
          console.warn('프로필 데이터를 찾을 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('프로필 새로고침 오류:', error);
    }
  };

  // 세션 및 프로필 초기화
  const initializeAuth = async (currentSession: Session | null) => {
    console.log('인증 초기화 시작:', currentSession?.user?.email);
    
    if (currentSession?.user) {
      setUser(currentSession.user);
      setSession(currentSession);
      
      try {
        // 프로필 조회
        let profileData = await fetchProfile(currentSession.user.id);
        
        // 프로필이 없으면 생성
        if (!profileData) {
          console.log('프로필이 없어 새로 생성합니다.');
          profileData = await createProfile(currentSession.user);
        }
        
        setProfile(profileData);
        console.log('인증 초기화 완료:', {
          user: currentSession.user.email,
          profile: profileData?.username
        });
      } catch (error) {
        console.error('프로필 처리 실패:', error);
      }
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('인증 초기화: 로그아웃 상태');
    }
    
    setLoading(false);
  };

  // 초기 세션 확인 및 인증 상태 변경 감지
  useEffect(() => {
    let mounted = true;
    let initializing = true;

    const hardStop = setTimeout(() => {
      if (mounted && initializing) {
        console.warn('인증 초기화 타임아웃');
        setLoading(false);
      }
    }, 5000);

    // 초기 세션 확인
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('세션 조회 오류:', error);
        }
        
        if (mounted) {
          await initializeAuth(data.session);
        }
      } catch (error) {
        console.error('세션 초기화 예외:', error);
        if (mounted) {
          setLoading(false);
        }
      } finally {
        initializing = false;
        clearTimeout(hardStop);
      }
    };

    initSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('인증 상태 변경:', event);
        
        if (!mounted || initializing) return;

        if (event === 'SIGNED_IN' && currentSession) {
          // 로그인 시
          await initializeAuth(currentSession);
        } else if (event === 'SIGNED_OUT') {
          // 로그아웃 시
          setUser(null);
          setProfile(null);
          setSession(null);
        } else if (event === 'USER_UPDATED' && currentSession) {
          // 사용자 정보 업데이트 시
          setUser(currentSession.user);
          await refreshProfile();
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(hardStop);
      subscription.unsubscribe();
    };
  }, []);

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      setError(null);
      console.log('Google 로그인 시작');
      
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
      console.log('로그아웃 시작');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 오류:', error);
        setError(error.message);
      } else {
        console.log('로그아웃 성공');
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
      
      // 예외 발생 시에도 상태 초기화
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
    refreshProfile
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