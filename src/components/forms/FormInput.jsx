import React from 'react';
import { cn } from '@/utils/cn';

export default function FormInput({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  min,
  step,
  error,
  className,
  autoComplete,
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
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 text-gray-400" size={18} />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          min={min}
          step={step}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            Icon && "pl-10",
            disabled && "bg-gray-100 cursor-not-allowed",
            readOnly && "bg-gray-100",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
} 