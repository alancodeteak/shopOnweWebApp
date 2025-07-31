import React from 'react';
import { cn } from '@/utils/cn';

export default function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  maxLength,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  className,
  showCounter = true,
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        className={cn(
          "w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none",
          disabled && "bg-gray-100 cursor-not-allowed",
          readOnly && "bg-gray-100",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500"
        )}
        {...props}
      />
      {showCounter && maxLength && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {value?.length || 0}/{maxLength}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
} 