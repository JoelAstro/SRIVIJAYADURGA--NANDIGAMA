import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/special_dum_biryani.png', // high quality local fallback
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when source changes
    if (src) {
      setImgSrc(src);
      setLoading(true);
      setError(false);
    } else {
      setImgSrc(fallbackSrc);
      setLoading(false);
      setError(true);
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
      setLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden w-full h-full bg-neutral-100 dark:bg-neutral-800 ${className}`}>
      {/* Skeleton screen loader */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 animate-pulse z-10">
          <div className="w-8 h-8 rounded-full border-2 border-maroon/20 dark:border-saffron/20 border-t-maroon dark:border-t-saffron animate-spin"></div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={imgSrc}
        alt={alt || 'Food Dish'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        loading="lazy"
        {...props}
      />

      {/* Decorative gradient overlay for premium feel */}
      {!loading && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default ImageWithFallback;
