/**
 * Image Processing Utility
 * Handles image resizing, compression, and validation
 */

export interface ImageProcessorConfig {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    maxOriginalSize: number;
    maxCompressedSize: number;
    timeout: number;
  }
  
  export const DEFAULT_IMAGE_CONFIG: ImageProcessorConfig = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8,
    maxOriginalSize: 20 * 1024 * 1024, // 20MB
    maxCompressedSize: 5 * 1024 * 1024, // 5MB
    timeout: 30000, // 30 seconds
  };
  
  export class ImageProcessorError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'ImageProcessorError';
    }
  }
  
  /**
   * Validates image file type and size
   */
  export const validateImageFile = (
    file: File,
    config: ImageProcessorConfig = DEFAULT_IMAGE_CONFIG
  ): void => {
    if (!file.type.startsWith('image/')) {
      throw new ImageProcessorError(
        '이미지 파일만 업로드 가능합니다.',
        'INVALID_TYPE'
      );
    }
  
    if (file.size > config.maxOriginalSize) {
      throw new ImageProcessorError(
        `원본 이미지가 너무 큽니다 (최대 ${config.maxOriginalSize / 1024 / 1024}MB).`,
        'FILE_TOO_LARGE'
      );
    }
  };
  
  /**
   * Calculates new dimensions while maintaining aspect ratio
   */
  const calculateDimensions = (
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } => {
    if (width > height) {
      if (width > maxWidth) {
        return {
          width: maxWidth,
          height: height * (maxWidth / width),
        };
      }
    } else {
      if (height > maxHeight) {
        return {
          width: width * (maxHeight / height),
          height: maxHeight,
        };
      }
    }
    
    return { width, height };
  };
  
  /**
   * Resizes and compresses image file
   */
  export const resizeAndCompressImage = async (
    file: File,
    config: ImageProcessorConfig = DEFAULT_IMAGE_CONFIG
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new ImageProcessorError(
          '이미지 처리 시간이 초과되었습니다.',
          'TIMEOUT'
        ));
      }, config.timeout);
  
      const reader = new FileReader();
  
      reader.onload = (e) => {
        console.log('📖 File read complete');
        const img = new Image();
        img.crossOrigin = 'anonymous';
  
        img.onload = () => {
          console.log(`🖼️ Image loaded: ${img.width}x${img.height}`);
  
          try {
            const { width, height } = calculateDimensions(
              img.width,
              img.height,
              config.maxWidth,
              config.maxHeight
            );
  
            console.log(`📐 Resizing to: ${width}x${height}`);
  
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
  
            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) {
              throw new ImageProcessorError(
                'Canvas context를 생성할 수 없습니다.',
                'CANVAS_ERROR'
              );
            }
  
            // White background for JPEG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
  
            console.log('🎨 Canvas rendering complete');
  
            // Convert to data URL (better Android compatibility)
            const dataUrl = canvas.toDataURL('image/jpeg', config.quality);
            console.log('📸 DataURL generated');
  
            // Convert data URL to Blob
            fetch(dataUrl)
              .then((res) => res.blob())
              .then((blob) => {
                const resizedFile = new File(
                  [blob],
                  file.name.replace(/\.\w+$/, '.jpg'),
                  { type: 'image/jpeg' }
                );
  
                console.log(
                  `✅ Resize complete: ${(file.size / 1024).toFixed(1)}KB → ${(resizedFile.size / 1024).toFixed(1)}KB`
                );
  
                clearTimeout(timeoutId);
                resolve(resizedFile);
              })
              .catch((err) => {
                clearTimeout(timeoutId);
                reject(new ImageProcessorError(
                  '이미지 변환 중 오류가 발생했습니다.',
                  'CONVERSION_ERROR'
                ));
              });
          } catch (error) {
            clearTimeout(timeoutId);
            reject(
              error instanceof ImageProcessorError
                ? error
                : new ImageProcessorError('알 수 없는 오류가 발생했습니다.', 'UNKNOWN_ERROR')
            );
          }
        };
  
        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new ImageProcessorError(
            '이미지를 로드할 수 없습니다.',
            'IMAGE_LOAD_ERROR'
          ));
        };
  
        const result = e.target?.result as string;
        if (!result) {
          clearTimeout(timeoutId);
          reject(new ImageProcessorError(
            '파일 데이터를 읽을 수 없습니다.',
            'READ_ERROR'
          ));
          return;
        }
  
        img.src = result;
      };
  
      reader.onerror = () => {
        clearTimeout(timeoutId);
        reject(new ImageProcessorError(
          '파일을 읽을 수 없습니다.',
          'FILE_READ_ERROR'
        ));
      };
  
      console.log('📂 Starting file read...');
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Gets user-friendly error message based on error code
   */
  export const getImageErrorMessage = (error: unknown): string => {
    if (!(error instanceof ImageProcessorError)) {
      return '이미지 처리 중 오류가 발생했습니다.';
    }
  
    switch (error.code) {
      case 'TIMEOUT':
        return '이미지 처리 시간이 너무 오래 걸립니다. 더 작은 사진을 선택해주세요.';
      case 'FILE_TOO_LARGE':
      case 'INVALID_TYPE':
        return error.message;
      case 'IMAGE_LOAD_ERROR':
        return '이미지를 불러올 수 없습니다. 다른 사진을 선택해주세요.';
      default:
        return '이미지 처리 중 오류가 발생했습니다. 다른 사진을 선택해주세요.';
    }
  };