import React from 'react';
import { cn } from '@/utils/cn';

export default function PageContainer({
  children,
  className,
  maxWidth = 'max-w-screen-md',
  padding = 'px-4',
  background = 'bg-white',
  minHeight = 'min-h-screen',
  topPadding = 'pt-16',
  bottomPadding = 'pb-24',
  center = true,
  ...props
}) {
  return (
    <div
      className={cn(
        minHeight,
        background,
        className
      )}
      {...props}
    >
      <div className={cn(
        maxWidth,
        padding,
        topPadding,
        bottomPadding,
        center && 'mx-auto'
      )}>
        {children}
      </div>
    </div>
  );
} 