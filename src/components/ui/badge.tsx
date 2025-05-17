// src/components/ui/badge.tsx
import React, { forwardRef } from 'react';
import Link from 'next/link';

type BadgeVariant = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline'
  | 'subtle'
  | 'ghost';

type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  radius?: 'default' | 'sm' | 'lg' | 'full';
  withDot?: boolean;
  dotColor?: string;
  href?: string;
  isInteractive?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className = '', 
    children, 
    variant = 'default',
    size = 'md',
    radius = 'full',
    withDot = false,
    dotColor,
    href,
    isInteractive = false,
    removable = false,
    onRemove,
    ...props 
  }, ref) => {
    // Variant sınıfları
    const variantClasses = {
      default: 'bg-foreground/10 text-foreground',
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      success: 'bg-success text-white',
      warning: 'bg-warning text-white',
      error: 'bg-error text-white',
      outline: 'bg-transparent border border-current text-foreground/70',
      subtle: 'bg-primary/10 text-primary font-medium',
      ghost: 'bg-transparent text-foreground/70',
    };
    
    // Size sınıfları
    const sizeClasses = {
      xs: 'h-5 text-xs px-1.5',
      sm: 'h-6 text-xs px-2',
      md: 'h-7 text-sm px-2.5',
      lg: 'h-8 text-sm px-3',
    };
    
    // Radius sınıfları
    const radiusClasses = {
      default: 'rounded',
      sm: 'rounded-sm',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };
    
    // Dot renk sınıfı
    const dotColorClass = dotColor ? `bg-${dotColor}` : 'bg-current';
    
    // Etkileşimli badge sınıfı
    const interactiveClass = isInteractive || href ? 
      'cursor-pointer hover:opacity-80 transition-opacity duration-200' : '';
    
    // Temel badge sınıfları
    const badgeClasses = `
      inline-flex items-center justify-center font-medium
      ${sizeClasses[size]}
      ${radiusClasses[radius]}
      ${variantClasses[variant]}
      ${interactiveClass}
      ${className}
    `;
    
    // Badge içeriği
    const badgeContent = (
      <>
        {withDot && (
          <span 
            className={`mr-1.5 block h-2 w-2 rounded-full ${dotColorClass}`} 
            aria-hidden="true"
          />
        )}
        {children}
        {removable && (
          <button
            type="button"
            className="ml-1 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-foreground/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label="Kaldır"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        )}
      </>
    );
    
    // Eğer href prop'u varsa, bir Link olarak render et
    if (href) {
      return (
        // Link bileşenini doğrudan döndür, içine badge içeriğini normal bir span olarak saralım
        <Link href={href} className={badgeClasses} passHref>
          <span ref={ref}>{badgeContent}</span>
        </Link>
      );
    }
    
    // Standart badge olarak render et
    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {badgeContent}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };