import React from 'react';
import { cn } from '@/utils/cn';

export default function Card({
  children,
  className,
  onClick,
  hover = true,
  padding = 'p-4',
  shadow = 'shadow-md',
  rounded = 'rounded-xl',
  bg = 'bg-white',
  border = 'border',
  ...props
}) {
  return (
    <div
      className={cn(
        bg,
        border,
        shadow,
        rounded,
        padding,
        hover && 'hover:shadow-lg transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
} 