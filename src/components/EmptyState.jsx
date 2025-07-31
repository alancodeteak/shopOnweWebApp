import React from 'react';
import { cn } from '@/utils/cn';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconSize = 48,
  iconColor = 'text-gray-400',
  ...props
}) {
  return (
    <div className={cn('text-center py-12', className)} {...props}>
      {Icon && (
        <Icon size={iconSize} className={cn('mx-auto mb-4', iconColor)} />
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-500 mb-4">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
} 