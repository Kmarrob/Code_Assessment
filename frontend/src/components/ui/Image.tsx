// frontend/src/components/ui/Image.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallbackSrc,
  lazy = true,
  className,
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

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      onError={handleError}
      onLoad={handleLoad}
      className={cn(
        'transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  );
};

export const LogoImage: React.FC<{ className?: string }> = ({ className }) => (
  <Image
    src="/logo.svg"
    alt="Code_Assessment - Logo"
    fallbackSrc="/logo-fallback.png"
    className={className}
  />
);

export const HeroImage: React.FC<{ className?: string }> = ({ className }) => (
  <Image
    src="/hero-image.svg"
    alt="Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001"
    fallbackSrc="/hero-image-fallback.png"
    className={className}
  />
);

export const OgImage: React.FC<{ className?: string }> = ({ className }) => (
  <Image
    src="/og-image.jpg"
    alt="Code_Assessment - Compartilhe a avaliação de maturidade ISO 27001"
    fallbackSrc="/og-image-fallback.png"
    className={className}
  />
);
