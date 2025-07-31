import React from 'react';
import { cn } from '@/utils/cn';

export default function InfoRow({
  icon: Icon,
  label,
  value,
  className,
  iconSize = 16,
  iconColor = 'text-blue-500',
  labelColor = 'text-gray-700',
  valueColor = 'text-gray-700',
  ...props
}) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      {Icon && (
        <Icon size={iconSize} className={iconColor} />
      )}
      {label && (
        <span className={cn('text-sm font-medium', labelColor)}>
          {label}:
        </span>
      )}
      <span className={cn('text-sm', valueColor)}>
        {value}
      </span>
    </div>
  );
} 