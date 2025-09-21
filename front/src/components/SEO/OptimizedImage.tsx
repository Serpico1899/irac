'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { optimizeImageProps, IMAGE_SIZES, IMAGE_QUALITY, generateBlurDataURL } from '@/lib/seo/performance';

export interface OptimizedImageProps {
  // Basic image props
  src: string;
  alt: string;
  alt_en?: string;
  width?: number;
  height?: number;

  // Performance props
  priority?: boolean;
  quality?: keyof typeof IMAGE_QUALITY;
  size?: keyof typeof IMAGE_SIZES;
  lazy?: boolean;

  // Layout props
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;

  // Responsive props
  sizes?: string;
  responsive?: boolean;

  // Style props
  className?: string;
  style?: React.CSSProperties;
  rounded?: boolean;
  shadow?: boolean;

  // Error handling
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;

  // SEO props
  schema?: boolean;
  caption?: string;
  caption_en?: string;

  // Custom blur placeholder
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';

  // Container props
  containerClassName?: string;
  aspectRatio?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  alt_en,
  width,
  height,
  priority = false,
  quality = 'medium',
  size = 'medium',
  lazy = true,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  sizes,
  responsive = true,
  className = '',
  style,
  rounded = false,
  shadow = false,
  fallbackSrc = '/images/placeholder.jpg',
  onError,
  onLoad,
  schema = false,
  caption,
  caption_en,
  blurDataURL,
  placeholder = 'blur',
  containerClassName = '',
  aspectRatio,
}) => {
  const locale = useLocale();
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get localized alt text
  const localizedAlt = locale === 'fa' ? alt : (alt_en || alt);

  // Get localized caption
  const localizedCaption = locale === 'fa' ? caption : (caption_en || caption);

  // Handle image error
  const handleError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Generate optimized image props
  const getOptimizedProps = () => {
    if (width && height) {
      return {
        width,
        height,
        quality: IMAGE_QUALITY[quality],
        priority,
        sizes: sizes || (responsive ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined),
      };
    }

    return optimizeImageProps(imageSrc, localizedAlt, size, quality, priority);
  };

  // Generate blur placeholder
  const getBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'empty') return undefined;

    const imgSize = size ? IMAGE_SIZES[size] : { width: width || 600, height: height || 400 };
    return generateBlurDataURL(imgSize.width, imgSize.height);
  };

  // Container styles with flexbox
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...(aspectRatio && {
      aspectRatio,
    }),
    ...(rounded && {
      borderRadius: '8px',
    }),
    ...(shadow && {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
  };

  // Image styles
  const imageStyles: React.CSSProperties = {
    objectFit,
    objectPosition,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0.8,
    ...style,
  };

  // Image className
  const imageClasses = [
    className,
    'transition-opacity duration-300 ease-in-out',
    rounded && 'rounded-lg',
    shadow && 'shadow-lg',
  ].filter(Boolean).join(' ');

  // Generate schema markup for image
  useEffect(() => {
    if (schema && isLoaded && typeof window !== 'undefined') {
      const imageSchema = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        url: imageSrc,
        name: localizedAlt,
        description: localizedCaption || localizedAlt,
        width: width || IMAGE_SIZES[size].width,
        height: height || IMAGE_SIZES[size].height,
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(imageSchema);
      script.id = `image-schema-${imageSrc.replace(/[^a-zA-Z0-9]/g, '')}`;

      // Remove existing schema
      const existing = document.getElementById(script.id);
      if (existing) existing.remove();

      document.head.appendChild(script);

      return () => {
        const element = document.getElementById(script.id);
        if (element) element.remove();
      };
    }
  }, [schema, isLoaded, imageSrc, localizedAlt, localizedCaption, width, height, size]);

  const optimizedProps = getOptimizedProps();
  const blurPlaceholder = getBlurPlaceholder();

  return (
    <figure className={`flex flex-col ${containerClassName}`} style={containerStyles}>
      <div className="relative flex-1 flex items-center justify-center">
        {fill ? (
          <Image
            src={imageSrc}
            alt={localizedAlt}
            fill
            quality={IMAGE_QUALITY[quality]}
            priority={priority}
            sizes={sizes || '100vw'}
            className={imageClasses}
            style={imageStyles}
            placeholder={placeholder}
            blurDataURL={blurPlaceholder}
            onError={handleError}
            onLoad={handleLoad}
          />
        ) : (
          <Image
            {...optimizedProps}
            src={imageSrc}
            alt={localizedAlt}
            className={imageClasses}
            style={imageStyles}
            placeholder={placeholder}
            blurDataURL={blurPlaceholder}
            onError={handleError}
            onLoad={handleLoad}
          />
        )}

        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-secondary animate-pulse">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-secondary">
                {locale === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
              </span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
            <div className="flex flex-col items-center space-y-2 p-4 text-center">
              <svg
                className="w-12 h-12 text-text-lightest"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-text-secondary">
                {locale === 'fa' ? 'خطا در بارگذاری تصویر' : 'Failed to load image'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {localizedCaption && (
        <figcaption className="mt-2 text-sm text-text-secondary text-center px-2">
          {localizedCaption}
        </figcaption>
      )}
    </figure>
  );
};

// Gallery component for multiple optimized images
export const OptimizedImageGallery: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    alt_en?: string;
    caption?: string;
    caption_en?: string;
  }>;
  className?: string;
  columns?: 2 | 3 | 4;
  gap?: number;
}> = ({ images, className = '', columns = 3, gap = 4 }) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols[columns]} ${gapClass} ${className}`}>
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          alt_en={image.alt_en}
          caption={image.caption}
          caption_en={image.caption_en}
          size="medium"
          quality="high"
          responsive
          rounded
          shadow
          schema
          className="w-full h-auto"
        />
      ))}
    </div>
  );
};

// Hero image component with optimized loading
export const OptimizedHeroImage: React.FC<{
  src: string;
  alt: string;
  alt_en?: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}> = ({
  src,
  alt,
  alt_en,
  className = '',
  overlay = false,
  overlayOpacity = 0.4
}) => {
  return (
    <div className={`relative w-full h-[60vh] lg:h-[70vh] overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        alt_en={alt_en}
        fill
        priority
        quality="high"
        objectFit="cover"
        objectPosition="center"
        sizes="100vw"
        className="absolute inset-0"
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
};

// Avatar component with optimized loading
export const OptimizedAvatar: React.FC<{
  src: string;
  alt: string;
  alt_en?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
}> = ({ src, alt, alt_en, size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const pixelSizes = {
    small: 32,
    medium: 48,
    large: 64,
    xl: 96,
  };

  return (
    <div className={`relative ${sizes[size]} ${className} flex-shrink-0`}>
      <OptimizedImage
        src={src}
        alt={alt}
        alt_en={alt_en}
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        quality="high"
        rounded
        className="rounded-full object-cover"
        fallbackSrc="/images/default-avatar.jpg"
      />
    </div>
  );
};

export default OptimizedImage;
