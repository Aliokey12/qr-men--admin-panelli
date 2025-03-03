import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/firebaseUtils';

interface ImageUploadProps {
  initialImage?: string;
  folder: string;
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  maxSizeInMB?: number;
}

export function ImageUpload({
  initialImage,
  folder,
  onImageUploaded,
  className = '',
  aspectRatio = 'square',
  maxSizeInMB = 5
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(initialImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-w-1 aspect-h-1',
    video: 'aspect-w-16 aspect-h-9',
    wide: 'aspect-w-2 aspect-h-1'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      setError(`Dosya boyutu ${maxSizeInMB}MB'dan küçük olmalıdır.`);
      return;
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Dosya adını benzersiz yap
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const path = `${folder}/${fileName}`;

      // Resmi yükle
      const url = await uploadImage(file, path);
      setImageUrl(url);
      onImageUploaded(url);
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      setError('Resim yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div className={`relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden ${aspectRatioClasses[aspectRatio]}`}>
        {imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="Yüklenen resim"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
            >
              <span className="text-white text-sm font-medium">Değiştir</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerFileInput}
            className="absolute inset-0 flex flex-col items-center justify-center p-4"
          >
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-2 text-sm text-gray-500">
              {isUploading ? 'Yükleniyor...' : 'Resim Yükle'}
            </span>
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 