import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function FormButton({
  children,
  type = 'button',
  variant = 'primary', // primary, secondary, danger
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  icon: Icon,
  ...props
}) {
  const baseClasses = "rounded-lg font-semibold transition-colors flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {Icon && !loading && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
} 