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
  /**
   * Resizes and compresses image file (Android-compatible version)
   */
  export const resizeAndCompressImage = async (
    file: File,
    config: ImageProcessorConfig = DEFAULT_IMAGE_CONFIG
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      console.log('  📂 Starting image processing...');
      console.log('  📊 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      
      const timeoutId = setTimeout(() => {
        console.error('  ⏰ TIMEOUT after 30 seconds');
        reject(new ImageProcessorError(
          '이미지 처리 시간이 초과되었습니다.',
          'TIMEOUT'
        ));
      }, config.timeout);
  
      // 🔥 안드로이드 호환성: FileReader 대신 createObjectURL 사용
      console.log('  🔄 Creating Blob URL...');
      let blobUrl: string;
      try {
        blobUrl = URL.createObjectURL(file);
        console.log('  ✅ Blob URL created:', blobUrl.substring(0, 50) + '...');
      } catch (blobError) {
        console.error('  ❌ Blob URL creation failed:', blobError);
        clearTimeout(timeoutId);
        reject(new ImageProcessorError(
          'Blob URL 생성 실패',
          'BLOB_URL_ERROR'
        ));
        return;
      }
  
      const img = new Image();
      img.crossOrigin = 'anonymous';
  
      img.onload = () => {
        console.log(`  ✅ Image loaded: ${img.width}x${img.height}`);
        
        // Blob URL 해제
        URL.revokeObjectURL(blobUrl);
        console.log('  🗑️ Blob URL revoked');
  
        try {
          const { width, height } = calculateDimensions(
            img.width,
            img.height,
            config.maxWidth,
            config.maxHeight
          );
  
          console.log(`  📐 Target dimensions: ${width}x${height}`);
  
          const canvas = document.createElement('canvas');
          console.log('  ✅ Canvas created');
          
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d', { 
            alpha: false,
            willReadFrequently: false 
          });
          
          if (!ctx) {
            console.error('  ❌ Failed to get canvas context');
            clearTimeout(timeoutId);
            reject(new ImageProcessorError(
              'Canvas context를 생성할 수 없습니다.',
              'CANVAS_ERROR'
            ));
            return;
          }
          console.log('  ✅ Canvas context acquired');
  
          // White background for JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          console.log('  ✅ Background filled');
          
          ctx.drawImage(img, 0, 0, width, height);
          console.log('  ✅ Image drawn to canvas');
  
          // Convert to blob directly (better than dataURL)
          console.log('  🔄 Converting canvas to blob...');
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error('  ❌ toBlob returned null');
                clearTimeout(timeoutId);
                reject(new ImageProcessorError(
                  'Canvas를 Blob으로 변환할 수 없습니다.',
                  'TOBLOB_ERROR'
                ));
                return;
              }
  
              console.log('  ✅ Blob created, size:', blob.size);
              
              const resizedFile = new File(
                [blob],
                file.name.replace(/\.\w+$/, '.jpg'),
                { type: 'image/jpeg', lastModified: Date.now() }
              );
  
              console.log(
                `  ✅ Final: ${(file.size / 1024).toFixed(1)}KB → ${(resizedFile.size / 1024).toFixed(1)}KB`
              );
  
              clearTimeout(timeoutId);
              resolve(resizedFile);
            },
            'image/jpeg',
            config.quality
          );
        } catch (error) {
          console.error('  ❌ Canvas processing error:', error);
          clearTimeout(timeoutId);
          reject(
            error instanceof ImageProcessorError
              ? error
              : new ImageProcessorError('Canvas 처리 중 오류', 'CANVAS_PROCESSING_ERROR')
          );
        }
      };
  
      img.onerror = (imgError) => {
        console.error('  ❌ Image load error:', imgError);
        URL.revokeObjectURL(blobUrl);
        clearTimeout(timeoutId);
        reject(new ImageProcessorError(
          '이미지를 로드할 수 없습니다.',
          'IMAGE_LOAD_ERROR'
        ));
      };
  
      console.log('  🔄 Setting image src to Blob URL...');
      img.src = blobUrl;
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