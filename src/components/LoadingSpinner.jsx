import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

export default function LoadingSpinner({ 
  size = "medium", 
  message = "Loading...", 
  className = "",
  showMessage = true 
}) {
  const [animationData, setAnimationData] = useState(null);
  const [animationError, setAnimationError] = useState(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/loading.json');
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.status}`);
        }
        const data = await response.json();
        setAnimationData(data);
        setAnimationError(null);
      } catch (error) {
        console.error('Loading animation error:', error);
        setAnimationError(error.message);
      }
    };

    loadAnimation();
  }, []);

  // Responsive size classes - larger by default and responsive
  const sizeClasses = {
    small: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28",
    medium: "w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48", 
    large: "w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64",
    xlarge: "w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 2xl:w-80 2xl:h-80"
  };

  // Responsive container classes
  const containerClasses = {
    small: "p-4 sm:p-6 md:p-8",
    medium: "p-6 sm:p-8 md:p-10 lg:p-12", 
    large: "p-8 sm:p-10 md:p-12 lg:p-16 xl:p-20",
    xlarge: "p-10 sm:p-12 md:p-16 lg:p-20 xl:p-24 2xl:p-28"
  };

  // Responsive text classes
  const textClasses = "text-gray-600 text-sm sm:text-base md:text-lg mt-2 sm:mt-3 md:mt-4 text-center";

  if (animationError) {
    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
        <div className={`${sizeClasses[size]} flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-full w-full border-b-2 border-blue-600"></div>
        </div>
        {showMessage && (
          <p className={textClasses}>{message}</p>
        )}
      </div>
    );
  }

  if (!animationData) {
    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
        <div className={`${sizeClasses[size]} flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-full w-full border-b-2 border-blue-600"></div>
        </div>
        {showMessage && (
          <p className={textClasses}>Loading animation...</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {showMessage && (
        <p className={textClasses}>{message}</p>
      )}
    </div>
  );
} 