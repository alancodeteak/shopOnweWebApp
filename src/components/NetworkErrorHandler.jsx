import React, { useState, useEffect } from 'react';
import useNetworkError from '@/hooks/useNetworkError';
import ErrorDisplay from './ErrorDisplay';

const NetworkErrorHandler = ({ children }) => {
  const { hasNetworkError, isRetrying, handleRetry } = useNetworkError(10000);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Only show network error if we're actually offline
    if (hasNetworkError && !navigator.onLine) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [hasNetworkError]);

  const handleRetryClick = () => {
    handleRetry();
  };

  if (showError) {
    return (
      <ErrorDisplay
        errorType="network"
        onRetry={handleRetryClick}
      />
    );
  }

  return children;
};

export default NetworkErrorHandler; 