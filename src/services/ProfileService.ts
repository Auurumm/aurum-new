import { supabase } from '../lib/supabase.ts';

export interface ProfileUpdateData {
  username?: string;  // full_name → username 변경
  gender: string;
  age: number;
  company: string;
  avatar_url?: string;
}

export interface ServiceError {
  code: string;
  message: string;
  type?: 'AUTH' | 'VALIDATION' | 'SERVER' | 'NETWORK';
}

export class ProfileService {
  /**
   * 현재 사용자 인증 확인
   */
  private static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * 아바타 이미지 업로드
   */
  static async uploadAvatar(file: File): Promise<{ url: string | null; error: ServiceError | null }> {
    try {
      // 인증 확인
      const { user, error: authError } = await this.getCurrentUser();
      if (authError || !user) {
        return {
          url: null,
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
            type: 'AUTH'
          }
        };
      }

      // 파일 확장자 추출
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 기존 아바타 삭제 (선택사항)
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // 새 아바타 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('아바타 업로드 오류:', uploadError);
        return {
          url: null,
          error: {
            code: 'UPLOAD_AVATAR_FAILED',
            message: '아바타 업로드 중 오류가 발생했습니다.',
            type: 'SERVER'
          }
        };
      }

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl, error: null };

    } catch (error) {
      console.error('아바타 업로드 예외:', error);
      return {
        url: null,
        error: {
          code: 'UPLOAD_AVATAR_EXCEPTION',
          message: '아바타 업로드 중 예상치 못한 오류가 발생했습니다.',
          type: 'NETWORK'
        }
      };
    }
  }

  /**
   * 프로필 정보 업데이트
   */
  static async updateProfile(profileData: ProfileUpdateData): Promise<{ error: ServiceError | null }> {
    try {
      // 인증 확인
      const { user, error: authError } = await this.getCurrentUser();
      console.log('🔵 updateProfile 시작');
      console.log('👤 User ID:', user?.id);
      console.log('📊 업데이트할 데이터:', profileData);
      
      if (authError || !user) {
        console.error('❌ 인증 실패:', authError);
        return {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
            type: 'AUTH'
          }
        };
      }

      // 유효성 검사
      if (profileData.username && profileData.username.trim().length < 2) {
        return {
          error: {
            code: 'INVALID_NAME',
            message: '이름을 2자 이상 입력해주세요.',
            type: 'VALIDATION'
          }
        };
      }

      if (!profileData.gender || !['남', '여'].includes(profileData.gender)) {
        return {
          error: {
            code: 'INVALID_GENDER',
            message: '올바른 성별을 선택해주세요.',
            type: 'VALIDATION'
          }
        };
      }

      if (!profileData.age || profileData.age < 1 || profileData.age > 120) {
        return {
          error: {
            code: 'INVALID_AGE',
            message: '올바른 나이를 입력해주세요 (1-120).',
            type: 'VALIDATION'
          }
        };
      }

      if (!profileData.company || profileData.company.trim().length < 2) {
        return {
          error: {
            code: 'INVALID_COMPANY',
            message: '관심 기업을 2자 이상 입력해주세요.',
            type: 'VALIDATION'
          }
        };
      }

      // Supabase 프로필 업데이트
      const updateData: any = {
        gender: profileData.gender,
        age: profileData.age,
        company: profileData.company.trim(),
        updated_at: new Date().toISOString()
      };

      // username이 제공된 경우에만 업데이트
    if (profileData.username) {
        updateData.username = profileData.username.trim();
    }
      // avatar_url이 제공된 경우에만 업데이트
      if (profileData.avatar_url) {
        updateData.avatar_url = profileData.avatar_url;
      }

      console.log('📤 Supabase로 전송할 데이터:', updateData);

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select();

      console.log('📥 Supabase 응답:', { data, error });

      if (error) {
        console.error('❌ 프로필 업데이트 오류:', error);
        return {
          error: {
            code: 'UPDATE_PROFILE_FAILED',
            message: '프로필 업데이트 중 오류가 발생했습니다.',
            type: 'SERVER'
          }
        };
      }

      console.log('✅ 프로필 업데이트 완료:', data);
      return { error: null };

    } catch (error) {
      console.error('❌ 프로필 업데이트 예외:', error);
      return {
        error: {
          code: 'UPDATE_PROFILE_EXCEPTION',
          message: '프로필 업데이트 중 예상치 못한 오류가 발생했습니다.',
          type: 'NETWORK'
        }
      };
    }
  }

  /**
   * 프로필 조회
   */
  static async getProfile(userId: string): Promise<{ 
    data: any | null; 
    error: ServiceError | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('프로필 조회 오류:', error);
        return {
          data: null,
          error: {
            code: 'GET_PROFILE_FAILED',
            message: '프로필 조회 중 오류가 발생했습니다.',
            type: 'SERVER'
          }
        };
      }

      return { data, error: null };

    } catch (error) {
      console.error('프로필 조회 예외:', error);
      return {
        data: null,
        error: {
          code: 'GET_PROFILE_EXCEPTION',
          message: '프로필 조회 중 예상치 못한 오류가 발생했습니다.',
          type: 'NETWORK'
        }
      };
    }
  }

  /**
   * 프로필 완성도 확인 (성별, 나이, 회사 모두 입력되었는지)
   */
  static async isProfileComplete(userId: string): Promise<boolean> {
    try {
      const { data } = await this.getProfile(userId);
      
      if (!data) return false;

      return !!(data.gender && data.age && data.company);
    } catch (error) {
      console.error('프로필 완성도 확인 예외:', error);
      return false;
    }
  }
}