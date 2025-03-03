import React from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onClick?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
  objectPosition = 'center',
  onClick
}: OptimizedImageProps) {
  // Varsayılan boyutlar (fill=false ise)
  const defaultWidth = width || 300;
  const defaultHeight = height || 200;

  // Eğer src boş veya geçersizse, placeholder göster
  const imageSrc = src && src.trim() !== '' 
    ? src 
    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2UyZThmMCIvPjxwYXRoIGQ9Ik01NCA0MiAzNiA2NmwyNCAzMGg0MmwtMjQtMzZ6IiBmaWxsPSIjOTRhM2I4Ii8+PGNpcmNsZSBjeD0iNDIiIGN5PSIzNiIgcj0iOCIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';

  return (
    <div 
      className={`relative ${className}`} 
      style={{ 
        width: fill ? '100%' : defaultWidth, 
        height: fill ? '100%' : defaultHeight 
      }}
      onClick={onClick}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={!fill ? defaultWidth : undefined}
        height={!fill ? defaultHeight : undefined}
        className={`${objectFit !== 'none' ? `object-${objectFit}` : ''}`}
        style={{ objectPosition }}
        priority={priority}
        quality={quality}
        sizes={sizes}
      />
    </div>
  );
} 