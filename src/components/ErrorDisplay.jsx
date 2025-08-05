import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const ErrorDisplay = ({ errorType = 'network', error, onRetry }) => {
  const [retryCountdown, setRetryCountdown] = useState(10);
  const [isRetrying, setIsRetrying] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [animationLoading, setAnimationLoading] = useState(true);

  // Load animation data
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/no_connection.json');
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.status}`);
        }
        const data = await response.json();
        setAnimationData(data);
        setAnimationLoading(false);
      } catch (error) {
        console.error('Animation loading error:', error);
        setAnimationLoading(false);
      }
    };
    
    loadAnimation();
  }, []);

  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (retryCountdown === 0 && !isRetrying) {
      handleAutoRetry();
    }
  }, [retryCountdown, isRetrying]);

  const handleAutoRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    }
  };

  const handleManualRetry = () => {
    setRetryCountdown(10);
    setIsRetrying(false);
    if (onRetry) {
      onRetry();
    }
  };

  const getErrorMessage = () => {
    if (errorType === 'network') {
      return 'Network Error';
    } else if (errorType === 'javascript') {
      return 'Application Error';
    }
    return 'Something went wrong';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center max-w-md mx-auto">
        {/* Animation */}
        <div className="mb-6">
          {animationLoading ? (
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">Loading animation...</div>
            </div>
          ) : animationData ? (
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">Animation unavailable</div>
            </div>
          )}
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {getErrorMessage()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {errorType === 'network' 
            ? 'Unable to connect to the server. Please check your internet connection.'
            : 'Something unexpected happened. Please try again.'
          }
        </p>

        {/* Retry Information */}
        <div className="mb-6">
          {retryCountdown > 0 && !isRetrying ? (
            <p className="text-sm text-gray-500 mb-4">
              Retrying automatically in {retryCountdown} seconds...
            </p>
          ) : isRetrying ? (
            <p className="text-sm text-gray-500 mb-4">
              Retrying...
            </p>
          ) : null}
        </div>

        {/* Manual Retry Button */}
        <button
          onClick={handleManualRetry}
          disabled={isRetrying}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isRetrying ? 'Retrying...' : 'Retry Now'}
        </button>

        {/* Additional Help */}
        <div className="mt-6 text-xs text-gray-400">
          <p>If the problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 