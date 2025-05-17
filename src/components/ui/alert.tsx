// src/components/ui/alert.tsx
import React, { forwardRef } from 'react';
import { Motion, FadeIn } from '@/components/ui/motion';

type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type AlertSize = 'sm' | 'md' | 'lg';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  size?: AlertSize;
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animated?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className = '', 
    children, 
    variant = 'default',
    size = 'md',
    title,
    icon,
    onClose,
    dismissible = false,
    rounded = 'md',
    animated = true,
    ...props 
  }, ref) => {
    // Variants
    const variantClasses = {
      default: 'bg-foreground/5 text-foreground border-foreground/10',
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      error: 'bg-error/10 text-error border-error/20',
      info: 'bg-info/10 text-info border-info/20',
    };
    
    // Size
    const sizeClasses = {
      sm: 'p-3 text-sm',
      md: 'p-4',
      lg: 'p-5 text-lg',
    };
    
    // Rounded
    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };
    
    // Alert Icons
    const AlertIcon = () => {
      if (icon) return <>{icon}</>;
      
      // Default icons per variant
      switch (variant) {
        case 'success':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          );
        case 'warning':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
              <path d="M3.58 14.67c-.22.67.05 1.41.65 1.79l7.12 4.42c.6.37 1.35.37 1.95 0l7.12-4.42c.6-.38.87-1.12.65-1.79l-2.78-8.5c-.22-.67-.84-1.13-1.55-1.13h-8.84c-.71 0-1.33.46-1.55 1.13l-2.78 8.5Z"></path>
            </svg>
          );
        case 'error':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          );
        case 'info':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          );
        default:
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          );
      }
    };
    
    // Close button
    const CloseButton = () => (
      <button
        type="button"
        onClick={onClose}
        className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-foreground/10 transition-colors ${
          size === 'sm' ? 'text-sm' : ''
        }`}
        aria-label="Kapat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    );
    
    // Alert component
    const alertContent = (
      <div
        ref={ref}
        className={`border ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]} flex items-start gap-3 ${className}`}
        role="alert"
        {...props}
      >
        <div className="shrink-0 mt-0.5">
          <AlertIcon />
        </div>
        
        <div className="flex-1">
          {title && (
            <h3 className={`font-medium ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : ''}`}>
              {title}
            </h3>
          )}
          
          {title && children && <div className="mt-1">{children}</div>}
          {!title && children}
        </div>
        
        {(onClose || dismissible) && <CloseButton />}
      </div>
    );
    
    // Animate if needed
    if (animated) {
      return (
        <FadeIn direction="up" duration={0.3} className="w-full">
          {alertContent}
        </FadeIn>
      );
    }
    
    return alertContent;
  }
);

Alert.displayName = 'Alert';

// AlertIcon component
export const AlertIcon = ({ className = '' }: { className?: string }) => (
  <span className={`shrink-0 mt-0.5 ${className}`} />
);

// Toast component - Alert with auto-dismiss
interface ToastProps extends AlertProps {
  duration?: number;  // Auto-dismiss duration in ms
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const Toast = ({
  duration = 5000,
  position = 'bottom-right',
  onClose,
  ...props
}: ToastProps) => {
  // Auto-dismiss logic using useEffect
  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  // Position classes
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2',
  };
  
  return (
    <Motion
      initial={{ opacity: 0, transform: `translateY(${position.startsWith('top') ? '-20px' : '20px'})` }}
      animate={{ opacity: 1, transform: 'translateY(0)' }}
      className={`z-50 max-w-md shadow-lg ${positionClasses[position]}`}
    >
      <Alert {...props} onClose={onClose} dismissible />
    </Motion>
  );
};