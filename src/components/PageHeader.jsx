import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function PageHeader({ title, onBack, onRefresh, isLoading, children }) {
  return (
    <div className="max-w-screen-md mx-auto px-2 sm:px-4">
      <header className="bg-white flex items-center justify-between p-3 sm:p-4 shadow-sm rounded-b-2xl mb-4 sm:mb-6">
        {/* Back button on the left */}
        {onBack ? (
        <button onClick={onBack} className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-full">
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        ) : <div className="w-7 sm:w-9" />} {/* Spacer if no back button */}
        {/* Title and optional children (e.g., count badge) centered */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
          <h1 className="text-base sm:text-lg font-bold text-gray-800 text-center">{title}</h1>
          {children}
        </div>
        {/* Refresh button on the right */}
        {onRefresh ? (
          <button onClick={onRefresh} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-full transition">
            <RefreshCw size={20} className={`${isLoading ? 'animate-spin' : ''} sm:w-6 sm:h-6`} />
        </button>
        ) : <div className="w-7 sm:w-9" />} {/* Spacer if no refresh button */}
      </header>
    </div>
  );
} 