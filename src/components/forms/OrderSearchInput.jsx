import React from 'react';
import { Search, X } from 'lucide-react';

export default function OrderSearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search by customer name, phone, or order ID...",
  className
}) {
  return (
    <div className={className}>
      <div className="relative">
        <input
          type="text"
          className="w-full rounded-lg px-4 py-3 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 pr-12"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Search className="text-blue-500 w-5 h-5" />
        </div>
      </div>
    </div>
  );
} 