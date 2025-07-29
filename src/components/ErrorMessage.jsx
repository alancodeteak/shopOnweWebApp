import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message = "An unknown error occurred.", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-red-400 mb-2 sm:mb-3 md:mb-4" />
      <h3 className="text-base sm:text-lg font-semibold text-red-700 mb-1.5 sm:mb-2">Oops! Something went wrong.</h3>
      <p className="text-xs sm:text-sm text-red-600">{message}</p>
    </div>
  );
} 