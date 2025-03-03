import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resim dosyasını optimize eder (boyutlandırır ve sıkıştırır)
 * @param {File} file - Optimize edilecek resim dosyası
 * @param {Object} options - Optimizasyon seçenekleri
 * @param {number} options.maxWidth - Maksimum genişlik (piksel)
 * @param {number} options.maxHeight - Maksimum yükseklik (piksel)
 * @param {number} options.quality - JPEG kalitesi (0-1 arası)
 * @returns {Promise<File>} - Optimize edilmiş resim dosyası
 */
export const optimizeImage = async (
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> => {
  const { 
    maxWidth = 1200, 
    maxHeight = 1200, 
    quality = 0.8 
  } = options;

  return new Promise((resolve, reject) => {
    // Dosya resim değilse, doğrudan döndür
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    // Dosya boyutu 100KB'dan küçükse, optimize etmeye gerek yok
    if (file.size < 100 * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Orijinal boyutlar
        let width = img.width;
        let height = img.height;
        
        // Boyutları orantılı olarak küçült
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Canvas oluştur ve resmi çiz
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context oluşturulamadı'));
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Canvas'ı blob'a dönüştür
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Blob oluşturulamadı'));
            }
            
            // Yeni dosya oluştur
            const optimizedFile = new File(
              [blob], 
              file.name, 
              { 
                type: file.type,
                lastModified: Date.now() 
              }
            );
            
            resolve(optimizedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Resim yüklenemedi'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };
  });
};

/**
 * Birden fazla resim dosyasını optimize eder
 * @param {File[]} files - Optimize edilecek resim dosyaları
 * @param {Object} options - Optimizasyon seçenekleri
 * @returns {Promise<File[]>} - Optimize edilmiş resim dosyaları
 */
export const optimizeImages = async (
  files: File[],
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File[]> => {
  const optimizedFiles = await Promise.all(
    Array.from(files).map(file => optimizeImage(file, options))
  );
  
  return optimizedFiles;
};
