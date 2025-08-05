import { useState, useEffect, useCallback } from 'react';

const useNetworkError = (retryInterval = 10000) => {
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkNetworkConnection = useCallback(async () => {
    // Simply check if the browser reports being online
    if (navigator.onLine) {
      setHasNetworkError(false);
      setRetryCount(0);
      setIsRetrying(false);
      return true;
    } else {
      setHasNetworkError(true);
      return false;
    }
  }, []);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    const success = await checkNetworkConnection();
    
    if (!success) {
      // Schedule next retry
      setTimeout(() => {
        setIsRetrying(false);
      }, retryInterval);
    }
  }, [checkNetworkConnection, retryInterval]);

  // Initial network check
  useEffect(() => {
    checkNetworkConnection();
  }, [checkNetworkConnection]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setHasNetworkError(false);
      setRetryCount(0);
      setIsRetrying(false);
    };

    const handleOffline = () => {
      setHasNetworkError(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry when network error is detected
  useEffect(() => {
    if (hasNetworkError && !isRetrying) {
      const timer = setTimeout(() => {
        handleRetry();
      }, retryInterval);
      
      return () => clearTimeout(timer);
    }
  }, [hasNetworkError, isRetrying, handleRetry, retryInterval]);

  return {
    hasNetworkError,
    isRetrying,
    retryCount,
    handleRetry,
    checkNetworkConnection
  };
};

export default useNetworkError; 