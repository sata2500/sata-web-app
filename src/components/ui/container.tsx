// src/components/ui/container.tsx
import React from 'react';

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function Container({ className = '', children, ...props }: ContainerProps) {
  return (
    <div 
      className={`container mx-auto px-4 md:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}