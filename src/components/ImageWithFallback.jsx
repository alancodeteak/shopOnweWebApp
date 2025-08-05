import React, { useState, useEffect } from 'react';
import { getImageUrl, createInitialsAvatar, handleImageError } from '@/utils/imageUtils';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  partnerName = '', 
  fallbackSrc = null,
  onLoad = null,
  onError = null,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate fallback avatar if no fallback src provided
  const defaultFallback = fallbackSrc || (partnerName ? createInitialsAvatar(...partnerName.split(' ')) : createInitialsAvatar('', ''));

  useEffect(() => {
    if (src) {
      setCurrentSrc(getImageUrl(src));
      setHasError(false);
      setIsLoading(true);
    } else {
      setCurrentSrc(defaultFallback);
      setHasError(false);
      setIsLoading(false);
    }
  }, [src, defaultFallback]);

  const handleImageLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    // Check if it's an S3 URL that might have expired
    const isS3Url = e.target.src.includes('amazonaws.com') || e.target.src.includes('s3.');
    
    setHasError(true);
    setIsLoading(false);
    setCurrentSrc(defaultFallback);
    
    if (onError) onError(e);
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-full">
          <span className="text-xs text-gray-500">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback; 