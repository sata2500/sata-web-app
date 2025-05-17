// src/components/ui/input.tsx
import React, { forwardRef } from 'react';

// Omit kullanarak HTMLInput'un size özelliğini kaldıralım ve 
// kendi size prop'umuzu tanımlayalım
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline' | 'underlined' | 'unstyled';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    error, 
    label,
    hint,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    variant = 'default',
    size = 'md',
    isFullWidth = true,
    ...props 
  }, ref) => {
    // Variant sınıfları
    const variantClasses = {
      default: 'border border-border bg-background rounded-md',
      filled: 'border-none bg-foreground/5 rounded-md',
      outline: 'border border-border bg-transparent rounded-md',
      underlined: 'border-t-0 border-r-0 border-l-0 border-b border-border bg-transparent rounded-none',
      unstyled: 'border-none bg-transparent'
    };
    
    // Size sınıfları
    const sizeClasses = {
      sm: 'h-8 px-3 py-1 text-xs',
      md: 'h-10 px-3 py-2 text-sm',
      lg: 'h-12 px-4 py-3 text-base'
    };
    
    // Focus sınıfı
    const focusClass = variant !== 'unstyled' ? 
      'focus:outline-none focus:ring-2 focus:ring-primary/30' + 
      (variant === 'underlined' ? ' focus:border-primary' : '') :
      '';
    
    // Hata sınıfı
    const errorClass = error ? 
      (variant === 'underlined' ? 'border-error focus:border-error' : 'border-error focus:ring-error/30') : 
      '';
    
    // Disabled sınıfı
    const disabledClass = props.disabled ? 'cursor-not-allowed opacity-50' : '';
    
    // Full width sınıfı
    const fullWidthClass = isFullWidth ? 'w-full' : '';
    
    // Icon veya addon var mı?
    const hasLeftElement = leftIcon || leftAddon;
    const hasRightElement = rightIcon || rightAddon || props.type === 'password';
    
    // Left padding sınıfı
    const leftPaddingClass = hasLeftElement ? 'pl-9' : '';
    
    // Right padding sınıfı
    const rightPaddingClass = hasRightElement ? 'pr-9' : '';
    
    // Input sınıfları
    const inputClasses = `
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${focusClass}
      ${errorClass}
      ${disabledClass}
      ${fullWidthClass}
      ${leftPaddingClass}
      ${rightPaddingClass}
      placeholder:text-foreground/50
      transition-colors duration-200
      ${className}
    `;
    
    // Label sınıfları
    const labelClasses = 'block text-sm font-medium mb-1.5';
    
    // Hint sınıfları
    const hintClasses = 'mt-1.5 text-xs text-foreground/60';
    
    // Hata mesajı sınıfları
    const errorMessageClasses = 'mt-1.5 text-xs text-error';
    
    // Left element sınıfları
    const leftElementClasses = 'absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50';
    
    // Right element sınıfları
    const rightElementClasses = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50';
    
    return (
      <div className={`${isFullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className={labelClasses}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon or Addon */}
          {hasLeftElement && (
            <div className={leftElementClasses}>
              {leftIcon || leftAddon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {/* Right Icon or Addon */}
          {hasRightElement && (
            <div className={rightElementClasses}>
              {rightIcon || rightAddon}
            </div>
          )}
        </div>
        
        {/* Help text or error message */}
        {error ? (
          <p className={errorMessageClasses}>{error}</p>
        ) : hint ? (
          <p className={hintClasses}>{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };