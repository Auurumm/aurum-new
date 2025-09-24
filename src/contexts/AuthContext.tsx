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

  // 프로필 정보 가져오기
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('프로필을 찾을 수 없어 새로 생성합니다.');
        return null;
      }

      return data;
    } catch (error) {
      console.error('프로필 가져오기 오류:', error);
      return null;
    }
  };

  // 프로필 생성
  const createProfile = async (user: User) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        username: user.user_metadata?.preferred_username || user.user_metadata?.user_name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('프로필 생성 오류:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('프로필 생성 중 오류:', error);
      return null;
    }
  };

  // 세션 변경 감지
  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // 프로필 정보 로드
        fetchProfile(session.user.id).then(async (profile) => {
          if (!profile) {
            // 프로필이 없으면 생성
            profile = await createProfile(session.user);
          }
          setProfile(profile);
        });
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('인증 상태 변경:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // 프로필 정보 로드 또는 생성
        let profile = await fetchProfile(session.user.id);
        if (!profile) {
          profile = await createProfile(session.user);
        }
        setProfile(profile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      return { error };
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      return { error };
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
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