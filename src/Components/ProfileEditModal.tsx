import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ProfileService } from '../services/ProfileService.ts';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    age: '',
    company: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기존 프로필 데이터 로드
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        fullName: profile.username || '',  // 이 줄 추가
        gender: profile.gender || '',
        age: profile.age?.toString() || '',
        company: profile.company || ''
      });
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [isOpen, profile]);

  // 아바타 파일 선택 핸들러
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setAvatarFile(file);
    
    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!formData.gender) {
      setError('성별을 선택해주세요.');
      return;
    }
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      setError('올바른 나이를 입력해주세요 (1-120).');
      return;
    }
    if (!formData.company || formData.company.trim().length < 2) {
      setError('관심 기업을 2자 이상 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // 아바타 이미지 업로드 (선택된 경우)
    if (avatarFile) {
        setUploadingAvatar(true);
        const { url, error: uploadError } = await ProfileService.uploadAvatar(avatarFile);
        setUploadingAvatar(false);
    
        if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
        }
    
        avatarUrl = url || '';
    }

      // 프로필 업데이트
      const { error: updateError } = await ProfileService.updateProfile({
        username: formData.fullName.trim(),  // full_name → username 변경
        gender: formData.gender,
        age: parseInt(formData.age),
        company: formData.company.trim(),
        avatar_url: avatarUrl
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // 프로필 새로고침
      if (refreshProfile) {
        await refreshProfile();
      }

      alert('프로필이 성공적으로 업데이트되었습니다!');
      onClose();
    } catch (err) {
      setError('프로필 업데이트 중 오류가 발생했습니다.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start pt-40 justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#3B4236] rounded-[20px] p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
        >
          ✕
        </button>

        {/* 제목 */}
        <h2 className="text-white text-2xl font-bold font-['Pretendard'] mb-6">
          프로필 수정
        </h2>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 프로필 이미지 */}
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
                    {profile?.full_name?.charAt(0) || '?'}
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
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400 text-center">
              JPG, PNG 파일 (최대 5MB)
            </p>
            {uploadingAvatar && (
              <p className="mt-2 text-sm text-[#ADFF00]">업로드 중...</p>
            )}
          </div>

        {/* 이름 */}
        <div>
        <label className="block text-white text-sm font-semibold mb-2">
            이름 *
        </label>
        <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full py-3 px-4 bg-stone-800/50 border-2 border-stone-600 rounded-lg text-white placeholder-gray-500 focus:border-[#ADFF00] focus:outline-none transition-colors"
            placeholder="이름을 입력하세요"
            maxLength={30}
        />
        </div>

          {/* 성별 */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              성별 *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender: '남' }))}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  formData.gender === '남'
                    ? 'bg-[#ADFF00]/20 border-[#ADFF00] text-white'
                    : 'bg-stone-800/50 border-stone-600 text-gray-400 hover:border-stone-500'
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender: '여' }))}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  formData.gender === '여'
                    ? 'bg-[#ADFF00]/20 border-[#ADFF00] text-white'
                    : 'bg-stone-800/50 border-stone-600 text-gray-400 hover:border-stone-500'
                }`}
              >
                여성
              </button>
            </div>
          </div>

          {/* 나이 */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              나이 *
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full py-3 px-4 bg-stone-800/50 border-2 border-stone-600 rounded-lg text-white placeholder-gray-500 focus:border-[#ADFF00] focus:outline-none transition-colors"
              placeholder="나이를 입력하세요"
            />
          </div>

          {/* 관심 기업 */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              관심 기업 *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full py-3 px-4 bg-stone-800/50 border-2 border-stone-600 rounded-lg text-white placeholder-gray-500 focus:border-[#ADFF00] focus:outline-none transition-colors"
              placeholder="예: 카카오, 네이버, 삼성전자"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-400">
              현재 재직 중이거나 관심 있는 기업명을 입력하세요
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#ADFF00] hover:bg-[#9AE600] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || uploadingAvatar}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};