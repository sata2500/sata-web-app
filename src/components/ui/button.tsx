// src/components/ui/button.tsx
import React, { forwardRef, ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';

// Varyant ve boyut tipleri
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

// Özel props tipini tanımla
type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  asChild?: boolean; // Radix UI ve PopoverTrigger ile uyumlu olmak için
};

// HTML button elementinin özelliklerinden ButtonOwnProps'u çıkart
type ButtonProps = ButtonOwnProps & Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonOwnProps>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  href,
  asChild,
  ...props
}, ref) => {
  // Temel sınıflar
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs rounded',
    md: 'h-10 px-4 text-sm rounded-md',
    lg: 'h-12 px-6 text-base rounded-lg',
  };
  
  // Varyant sınıfları - danger varyantını ekleyelim
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'border border-border bg-transparent hover:bg-foreground/5',
    ghost: 'bg-transparent hover:bg-foreground/5',
    link: 'bg-transparent underline-offset-4 hover:underline text-primary hover:text-primary-dark p-0 h-auto',
    danger: 'bg-error text-white hover:bg-error/90', // Tehlikeli eylemler için kırmızı buton
  };
  
  // Yükleniyor durumu
  const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  
  // Devre dışı durumu
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${loadingClass}
    ${disabledClass}
    ${className}
  `;

  // Buton içeriği
  const buttonContent = (
    <>
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  // Eğer asChild özelliği varsa ve children geçerli bir React elementi ise
  if (asChild && React.isValidElement(children)) {
    // children'a sınıfları aktararak döndür
    return children;
  }
  
  // Eğer href varsa Link olarak render et
  if (href) {
    return (
      <Link href={href} className={classes}>
        {buttonContent}
      </Link>
    );
  }
  
  // Normal button olarak render et
  // props'u filtrelemeye gerek yok, çünkü yukarıda zaten tipi doğru tanımladık
  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };