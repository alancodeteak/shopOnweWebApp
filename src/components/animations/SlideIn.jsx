import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

export default function SlideIn({
  children,
  direction = 'up', // up, down, left, right
  delay = 0,
  duration = 300,
  distance = 20,
  className,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`;
        case 'down':
          return `translateY(-${distance}px)`;
        case 'left':
          return `translateX(${distance}px)`;
        case 'right':
          return `translateX(-${distance}px)`;
        default:
          return `translateY(${distance}px)`;
      }
    }
    return 'translateY(0) translateX(0)';
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
} 