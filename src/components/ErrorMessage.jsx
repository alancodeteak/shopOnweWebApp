import { AlertCircle, WifiOff, Server, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ 
  message = "An unknown error occurred.", 
  statusCode = null,
  isNetworkError = false,
  isServerError = false,
  onRetry = null,
  className = "" 
}) {
  // Determine error type and icon
  const getErrorInfo = () => {
    if (isNetworkError) {
      return {
        icon: WifiOff,
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        iconColor: "text-orange-400",
        titleColor: "text-orange-700",
        textColor: "text-orange-600"
      };
    }
    
    if (isServerError || (statusCode && statusCode >= 500)) {
      return {
        icon: Server,
        title: "Server Under Maintenance",
        description: "Our servers are currently undergoing maintenance. Please try again later.",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-400",
        titleColor: "text-yellow-700",
        textColor: "text-yellow-600"
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
        textColor: "text-blue-600"
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
        textColor: "text-red-600"
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
        textColor: "text-red-600"
      };
    }
    
    if (statusCode === 422 || statusCode === 400) {
      return {
        icon: AlertCircle,
        title: "Invalid Request",
        description: message || "The request contains invalid data. Please check your input.",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-400",
        titleColor: "text-red-700",
        textColor: "text-red-600"
      };
    }
    
    // Default error
    return {
      icon: AlertCircle,
      title: "Something Went Wrong",
      description: message,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-400",
      titleColor: "text-red-700",
      textColor: "text-red-600"
    };
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 ${errorInfo.bgColor} border ${errorInfo.borderColor} rounded-lg ${className}`}>
      <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${errorInfo.iconColor} mb-2 sm:mb-3 md:mb-4`} />
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
              : errorInfo.iconColor === 'text-orange-400'
              ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
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