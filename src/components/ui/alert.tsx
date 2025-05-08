// src/components/ui/alert.tsx
import React from 'react';

type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'bg-background border-border',
  success: 'bg-success/10 border-success text-success',
  warning: 'bg-warning/10 border-warning text-warning',
  error: 'bg-error/10 border-error text-error',
  info: 'bg-info/10 border-info text-info',
};

const variantIconClasses = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export function Alert({ 
  variant = 'default', 
  title, 
  children, 
  className = '',
  ...props 
}: AlertProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {title && (
        <h5 className={`mb-1 font-medium leading-none tracking-tight ${variantIconClasses[variant]}`}>
          {title}
        </h5>
      )}
      <div className={`text-sm ${title ? 'mt-1' : ''}`}>{children}</div>
    </div>
  );
}

interface AlertIconProps {
  className?: string;
}

export function AlertIcon({ className = '' }: AlertIconProps) {
  return (
    <span className={`mr-2 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </span>
  );
}