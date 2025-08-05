import { AlertCircle, WifiOff, Server, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { isNetworkError as isNetworkErrorUtil, isServerError as isServerErrorUtil } from '@/utils/errorHandler';

export default function ErrorMessage({ 
  message = "An unknown error occurred.", 
  statusCode = null,
  isNetworkError = false,
  isServerError = false,
  onRetry = null,
  className = "" 
}) {
  const [animationData, setAnimationData] = useState(null);
  const [animationError, setAnimationError] = useState(null);

  // Extract message from error object if needed
  const getDisplayMessage = () => {
    if (typeof message === 'string') {
      return message;
    }
    if (message && typeof message === 'object' && message.message) {
      return message.message;
    }
    return "An unknown error occurred.";
  };

  // Determine if this is a network error
  const isActuallyNetworkError = isNetworkError || isNetworkErrorUtil(message) || (message && typeof message === 'object' && message.isNetworkError);

  // Load no_connection animation for network errors
  useEffect(() => {
    if (isActuallyNetworkError) {
      const loadAnimation = async () => {
        try {
          const response = await fetch('/animations/no_connection.json');
          if (!response.ok) {
            throw new Error(`Failed to load animation: ${response.status}`);
          }
          const data = await response.json();
          setAnimationData(data);
          setAnimationError(null);
        } catch (error) {
          console.error('❌ No connection animation error:', error);
          setAnimationError(error.message);
        }
      };

      loadAnimation();
    }
  }, [isActuallyNetworkError]);

  // Determine error type and icon
  const getErrorInfo = () => {
    if (isActuallyNetworkError) {
      return {
        icon: WifiOff,
        title: "Connection Lost",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        bgColor: "bg-blue-50",
        borderColor: "",
        iconColor: "text-blue-400",
        titleColor: "text-blue-700",
        textColor: "text-blue-600",
        showAnimation: true
      };
    }
    
    if (isServerError || isServerErrorUtil(message) || (statusCode && statusCode >= 500)) {
      return {
        icon: Server,
        title: "Server Under Maintenance",
        description: "Our servers are currently undergoing maintenance. Please try again later.",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-400",
        titleColor: "text-yellow-700",
        textColor: "text-yellow-600",
        showAnimation: false
      };
    }
    
    if (statusCode === 404) {
      return {
        icon: AlertCircle,
        title: "Not Found",
        description: "The requested resource was not found.",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-400",
        titleColor: "text-blue-700",
        textColor: "text-blue-600",
        showAnimation: false
      };
    }
    
    if (statusCode === 401) {
      return {
        icon: AlertCircle,
        title: "Unauthorized",
        description: "You are not authorized to access this resource. Please log in again.",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-400",
        titleColor: "text-red-700",
        textColor: "text-red-600",
        showAnimation: false
      };
    }
    
    if (statusCode === 403) {
      return {
        icon: AlertCircle,
        title: "Access Denied",
        description: "You don't have permission to access this resource.",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-400",
        titleColor: "text-red-700",
        textColor: "text-red-600",
        showAnimation: false
      };
    }
    
    if (statusCode === 422 || statusCode === 400) {
      return {
        icon: AlertCircle,
        title: "Invalid Request",
        description: getDisplayMessage() || "The request contains invalid data. Please check your input.",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-400",
        titleColor: "text-red-700",
        textColor: "text-red-600",
        showAnimation: false
      };
    }
    
    // Default error
    return {
      icon: AlertCircle,
      title: "Something Went Wrong",
      description: getDisplayMessage(),
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-400",
      titleColor: "text-red-700",
      textColor: "text-red-600",
      showAnimation: false
    };
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 ${errorInfo.bgColor} ${errorInfo.borderColor ? `border ${errorInfo.borderColor}` : ''} rounded-lg ${className}`}>
      {/* Show animation for network errors, fallback to icon */}
      {errorInfo.showAnimation && animationData && !animationError ? (
        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-4 sm:mb-6">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${errorInfo.iconColor} mb-2 sm:mb-3 md:mb-4`} />
      )}
      
      <h3 className={`text-base sm:text-lg font-semibold ${errorInfo.titleColor} mb-1.5 sm:mb-2`}>
        {errorInfo.title}
      </h3>
      <p className={`text-xs sm:text-sm ${errorInfo.textColor} mb-3`}>
        {errorInfo.description}
      </p>
      
      {/* Status Code Display */}
      {statusCode && (
        <div className={`text-xs ${errorInfo.textColor} mb-3 font-mono bg-white/50 px-2 py-1 rounded`}>
          Error Code: {statusCode}
        </div>
      )}
      
      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            errorInfo.iconColor === 'text-red-400' 
              ? 'bg-red-100 hover:bg-red-200 text-red-700'
              : errorInfo.iconColor === 'text-yellow-400'
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
} 