// frontend/src/components/ui/OptimizedImage.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fallbackSrc,
  lazy = true,
  className,
  objectFit = 'cover',
  ...props
}) => {
  const [error, setError] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const handleError = () => {
    if (fallbackSrc && !error) {
      setError(true);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const finalSrc = error && fallbackSrc ? fallbackSrc : src;
  const safeAlt = alt || 'Imagem';

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{ width, height }}
    >
      <img
        src={finalSrc}
        alt={safeAlt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <OptimizedImage
    src="/logo.svg"
    alt="Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001"
    fallbackSrc="/logo-fallback.png"
    width={40}
    height={40}
    className={className}
  />
);

export const HeroIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <OptimizedImage
    src="/hero-illustration.svg"
    alt="Ilustração do Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001"
    fallbackSrc="/hero-illustration-fallback.png"
    width={600}
    height={400}
    className={className}
  />
);

export const FeatureIcon: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    fallbackSrc="/icon-fallback.png"
    width={48}
    height={48}
    className={className}
  />
);
