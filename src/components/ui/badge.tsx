// src/components/ui/badge.tsx
import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'bg-primary/10 text-primary',
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  outline: 'bg-transparent border border-border text-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
};

export function Badge({ 
  variant = 'default', 
  children, 
  className = '',
  ...props 
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}