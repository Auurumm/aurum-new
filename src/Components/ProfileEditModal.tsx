import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ProfileService } from '../services/ProfileService.ts';
// 🔥 추가: imageProcessor import
import { 
  resizeAndCompressImage, 
  validateImageFile, 
  getImageErrorMessage,
  ImageProcessorError 
} from '../utils/imageProcessor.ts';

// ==================== 타입 정의 ====================
interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  gender: string;
  age: string;
  company: string;
}

interface FormErrors {
  fullName?: string;
  gender?: string;
  age?: string;
  company?: string;
  general?: string;
}

// ==================== 유효성 검사 ====================
const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = '이름을 2자 이상 입력해주세요.';
  }

  if (!data.gender) {
    errors.gender = '성별을 선택해주세요.';
  }

  const age = parseInt(data.age);
  if (!data.age || age < 1 || age > 120) {
    errors.age = '올바른 나이를 입력해주세요 (1-120).';
  }

  if (!data.company || data.company.trim().length < 2) {
    errors.company = '관심 기업을 2자 이상 입력해주세요.';
  }

  return errors;
};

// ==================== 커스텀 훅: 모달 히스토리 관리 ====================
const useModalHistory = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modal: 'profile-edit' }, '', window.location.href);
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);
};

// ==================== 커스텀 훅: 프로필 데이터 로드 ====================
const useProfileData = (isOpen: boolean, profile: any) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    gender: '',
    age: '',
    company: ''
  });

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        fullName: profile.username || '',
        gender: profile.gender || '',
        age: profile.age?.toString() || '',
        company: profile.company || ''
      });
    }
  }, [isOpen, profile]);

  return [formData, setFormData] as const;
};

// ==================== 서브 컴포넌트: 프로필 이미지 ====================
const ProfileImageSection: React.FC<{
  avatarPreview: string;
  displayName: string;
  loading: boolean;
  uploadingAvatar: boolean;
  onAvatarChange: (file: File) => void;
}> = ({ avatarPreview, displayName, loading, uploadingAvatar, onAvatarChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarChange(file);
  };

  return (
    <div className="flex flex-col items-center">
      <label className="block text-white text-sm font-semibold mb-3">
        프로필 이미지
      </label>
      
      <div className="relative">
        {avatarPreview ? (
          <img 
            src={avatarPreview} 
            alt="프로필 미리보기" 
            className="w-32 h-32 rounded-full object-cover border-4 border-[#ADFF00]"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ADFF00] to-[#7CB500] flex items-center justify-center border-4 border-stone-600">
            <span className="text-black font-bold text-4xl">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <label 
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 w-10 h-10 bg-[#ADFF00] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#9AE600] transition-colors"
        >
          <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </label>
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading || uploadingAvatar}
        />
      </div>
      
      <p className="mt-2 text-xs text-gray-400 text-center">
        JPG, PNG, WEBP (자동 압축됨)
      </p>
      
      {uploadingAvatar && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ADFF00]" />
            <p className="text-sm text-[#ADFF00]">이미지 처리 및 업로드 중...</p>
          </div>
          <p className="text-xs text-gray-500">잠시만 기다려주세요</p>
        </div>
      )}
    </div>
  );
};

// ==================== 서브 컴포넌트: 텍스트 입력 ====================
const TextInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  type?: 'text' | 'number';
  min?: string;
  max?: string;
}> = ({ label, value, onChange, placeholder, error, disabled, maxLength, type = 'text', min, max }) => (
  <div>
    <label className="block text-white text-sm font-semibold mb-2">
      {label} *
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full py-3 px-4 bg-stone-800/50 border-2 rounded-lg text-white placeholder-gray-500 focus:border-[#ADFF00] focus:outline-none transition-colors ${
        error ? 'border-red-500' : 'border-stone-600'
      }`}
      placeholder={placeholder}
      maxLength={maxLength}
      min={min}
      max={max}
      disabled={disabled}
    />
    {error && (
      <p className="mt-1 text-xs text-red-400">{error}</p>
    )}
  </div>
);

// ==================== 서브 컴포넌트: 성별 선택 ====================
const GenderSelector: React.FC<{
  value: string;
  onChange: (gender: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, disabled }) => (
  <div>
    <label className="block text-white text-sm font-semibold mb-2">
      성별 *
    </label>
    <div className="flex gap-3">
      {['남', '여'].map((gender) => (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender)}
          disabled={disabled}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            value === gender
              ? 'bg-[#ADFF00]/20 border-[#ADFF00] text-white font-semibold'
              : 'bg-stone-800/50 border-stone-600 text-gray-400 hover:border-stone-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {gender === '남' ? '남성' : '여성'}
        </button>
      ))}
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-400">{error}</p>
    )}
  </div>
);

// ==================== 메인 컴포넌트 ====================
export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, refreshProfile } = useAuth();
  
  const [formData, setFormData] = useProfileData(isOpen, profile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useModalHistory(isOpen, onClose);

  useEffect(() => {
    if (isOpen && profile?.avatar_url) {
      setAvatarPreview(profile.avatar_url);
    }
  }, [isOpen, profile?.avatar_url]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setAvatarFile(null);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    // ✅ 속성 제거만 유지
    document.body.removeAttribute('data-modal-open');
    
    if (window.history.state?.modal === 'profile-edit') {
      window.history.back();
    } else {
      onClose();
    }
  }, [onClose]);

  // 🔥 수정: imageProcessor 사용
  const handleAvatarChange = useCallback(async (file: File) => {
    console.log('🎬 handleAvatarChange 시작');
    setUploadingAvatar(true);
    setErrors({});

    try {
      console.log('📸 이미지 처리 시작:', file.name);

      // 1단계: 파일 유효성 검사
      validateImageFile(file);

      // 2단계: 리사이징 및 압축 (Android 호환 버전)
      const resizedFile = await resizeAndCompressImage(file);
      console.log('✅ 리사이징 완료:', resizedFile.name, resizedFile.size);

      // 3단계: 상태 업데이트
      setAvatarFile(resizedFile);

      // 4단계: 미리보기 생성 (Android 버그 우회)
      try {
        const previewUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          let completed = false;

          const cleanup = () => {
            completed = true;
          };

          reader.onload = () => {
            if (!completed && reader.result) {
              cleanup();
              console.log('📸 미리보기 생성 완료 (onload)');
              resolve(reader.result as string);
            }
          };

          reader.onloadend = () => {
            if (!completed && reader.result) {
              cleanup();
              console.log('📸 미리보기 생성 완료 (onloadend)');
              resolve(reader.result as string);
            }
          };

          reader.onerror = () => {
            if (!completed) {
              cleanup();
              reject(new Error('파일 읽기 실패'));
            }
          };

          // Android 타임아웃 대응
          setTimeout(() => {
            if (!completed && reader.result) {
              cleanup();
              console.log('📸 미리보기 생성 완료 (timeout fallback)');
              resolve(reader.result as string);
            } else if (!completed) {
              cleanup();
              reject(new Error('미리보기 생성 시간 초과'));
            }
          }, 3000);

          reader.readAsDataURL(resizedFile);
        });

        setAvatarPreview(previewUrl);
        console.log('✅ 미리보기 설정 완료');

      } catch (previewError) {
        console.error('❌ 미리보기 생성 오류:', previewError);
        // 미리보기 실패해도 파일은 저장됨
      }

      // 5단계: 로딩 종료 (반드시 실행)
      setUploadingAvatar(false);
      console.log('✅ 이미지 처리 완료 - 저장 버튼을 눌러주세요');

    } catch (error) {
      console.error('❌ 이미지 처리 오류:', error);
      const errorMessage = getImageErrorMessage(error);
      setErrors(prev => ({ ...prev, general: errorMessage }));
      setUploadingAvatar(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        setUploadingAvatar(true);
        console.log('📤 이미지 업로드 시작...');
        
        try {
          const { url, error: uploadError } = await ProfileService.uploadAvatar(avatarFile);
          setUploadingAvatar(false);
      
          if (uploadError) {
            console.error('❌ 업로드 실패:', uploadError);
            setErrors({ general: uploadError.message });
            setLoading(false);
            return;
          }
      
          avatarUrl = url || '';
          console.log('✅ 이미지 업로드 성공:', avatarUrl);
        } catch (error) {
          console.error('❌ 업로드 예외:', error);
          setUploadingAvatar(false);
          setErrors({ general: '이미지 업로드 중 오류가 발생했습니다.' });
          setLoading(false);
          return;
        }
      }

      const { error: updateError } = await ProfileService.updateProfile({
        username: formData.fullName.trim(),
        gender: formData.gender,
        age: parseInt(formData.age),
        company: formData.company.trim(),
        avatar_url: avatarUrl ?? undefined
      });

      if (updateError) {
        setErrors({ general: updateError.message });
        return;
      }

      if (refreshProfile) {
        await refreshProfile();
      }

      alert('프로필이 성공적으로 업데이트되었습니다!');
      handleClose();
    } catch (err) {
      setErrors({ general: '프로필 업데이트 중 오류가 발생했습니다.' });
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
    }
  };

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, [setFormData]);

  if (!isOpen) return null;

  const displayName = profile?.username || user?.email?.split('@')[0] || '사용자';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start pt-20 sm:pt-32 lg:pt-40 justify-center bg-black/70 backdrop-blur-sm px-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md bg-[#3B4236] rounded-[20px] p-6 sm:p-8 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          disabled={loading}
        >
          ✕
        </button>

        <h2 className="text-white text-2xl font-bold font-['Pretendard'] mb-6">
          프로필 수정
        </h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-5">
          <ProfileImageSection
            avatarPreview={avatarPreview}
            displayName={displayName}
            loading={loading}
            uploadingAvatar={uploadingAvatar}
            onAvatarChange={handleAvatarChange}
          />

          <TextInput
            label="이름"
            value={formData.fullName}
            onChange={(value) => updateField('fullName', value)}
            placeholder="이름을 입력하세요"
            error={errors.fullName}
            disabled={loading}
            maxLength={30}
          />

          <GenderSelector
            value={formData.gender}
            onChange={(value) => updateField('gender', value)}
            error={errors.gender}
            disabled={loading}
          />

          <TextInput
            label="나이"
            type="number"
            value={formData.age}
            onChange={(value) => updateField('age', value)}
            placeholder="나이를 입력하세요"
            error={errors.age}
            disabled={loading}
            min="1"
            max="120"
          />

          <div>
            <TextInput
              label="관심 기업"
              value={formData.company}
              onChange={(value) => updateField('company', value)}
              placeholder="예: 카카오, 네이버, 삼성전자"
              error={errors.company}
              disabled={loading}
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-400">
              관심 있는 기업명을 입력하세요
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-[#ADFF00] hover:bg-[#9AE600] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || uploadingAvatar}
            >
              {loading ? '저장 중...' : uploadingAvatar ? '이미지 처리 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};