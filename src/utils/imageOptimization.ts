
// Image optimization utilities
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg';
  maxFileSize?: number; // in KB
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 0.8,
  format: 'webp',
  maxFileSize: 300
};

export const optimizeImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const { width: newWidth, height: newHeight } = calculateDimensions(
        img.width,
        img.height,
        opts.maxWidth,
        opts.maxHeight
      );
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Try WebP first, fallback to JPEG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          
          // Check file size
          const fileSizeKB = blob.size / 1024;
          if (fileSizeKB > opts.maxFileSize) {
            // Reduce quality and try again
            const newQuality = Math.max(0.3, opts.quality - 0.2);
            if (newQuality < opts.quality) {
              optimizeImage(file, { ...options, quality: newQuality })
                .then(resolve)
                .catch(reject);
              return;
            }
          }
          
          const optimizedFile = new File([blob], file.name, {
            type: blob.type,
            lastModified: Date.now()
          });
          
          resolve(optimizedFile);
        },
        `image/${opts.format}`,
        opts.quality
      );
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

export const validateImageFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Plik musi być obrazem';
  }
  
  // Check file size (50MB max for processing)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return 'Plik jest zbyt duży (maksymalnie 50MB)';
  }
  
  return null;
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Could not read file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
};
