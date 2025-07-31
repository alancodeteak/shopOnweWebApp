import React from 'react';
import { cn } from '@/utils/cn';

const statusConfig = {
  // Order statuses
  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
  'Assigned': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  'Completed': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  'Delivered': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  'Cancelled': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  
  // Urgency levels
  'Normal': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Urgent': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
  
  // Ticket statuses
  'Open': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
  'Resolved': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  
  // Default
  'default': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
};

export default function StatusBadge({
  status,
  size = 'sm', // sm, md, lg
  variant = 'default', // default, pill, outline
  className,
  ...props
}) {
  const config = statusConfig[status] || statusConfig.default;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  const variantClasses = {
    default: `${config.bg} ${config.text}`,
    pill: `${config.bg} ${config.text} rounded-full`,
    outline: `bg-transparent ${config.text} ${config.border} border`
  };
  
  return (
    <span
      className={cn(
        'font-medium rounded',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {status}
    </span>
  );
} 