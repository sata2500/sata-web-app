// src/components/ui/button.tsx
import React, { forwardRef, ComponentPropsWithoutRef, ReactElement } from 'react';
import Link from 'next/link';

// Varyant ve boyut tipleri
type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'success'
  | 'warning'
  | 'error'
  | 'outline' 
  | 'ghost' 
  | 'link'
  | 'subtle' 
  | 'gradient';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

// Özel props tipini tanımla
type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
  isLoading?: boolean;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  asChild?: boolean; // Radix UI ve PopoverTrigger ile uyumlu olmak için
  external?: boolean; // Harici link için
};

// HTML button elementinin özelliklerinden ButtonOwnProps'u çıkart
type ButtonProps = ButtonOwnProps & Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonOwnProps>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  radius = 'md',
  isLoading = false,
  isDisabled = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  href,
  external = false,
  asChild,
  ...props
}, ref) => {
  // Butonun devre dışı olup olmadığını belirle
  const isButtonDisabled = isDisabled || disabled || isLoading;
  
  // Temel sınıflar
  const baseClasses = `
    inline-flex items-center justify-center 
    font-medium transition-all duration-200 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
    ${isFullWidth ? 'w-full' : ''}
  `;
  
  // Boyut sınıfları
  const sizeClasses = {
    xs: 'h-7 px-2.5 text-xs',
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
    xl: 'h-12 px-6 text-base',
  };
  
  // Yuvarlaklık sınıfları
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  
  // Varyant sınıfları
  const variantClasses = {
    primary: `bg-primary text-white hover:bg-primary-dark active:bg-primary-dark/90 disabled:bg-primary/70`,
    secondary: `bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark/90 disabled:bg-secondary/70`,
    accent: `bg-accent text-white hover:bg-accent/90 active:bg-accent/80 disabled:bg-accent/70`,
    success: `bg-success text-white hover:bg-success/90 active:bg-success/80 disabled:bg-success/70`,
    warning: `bg-warning text-white hover:bg-warning/90 active:bg-warning/80 disabled:bg-warning/70`,
    error: `bg-error text-white hover:bg-error/90 active:bg-error/80 disabled:bg-error/70`,
    outline: `bg-transparent border border-border text-foreground hover:bg-foreground/5 active:bg-foreground/10 disabled:text-foreground/50 disabled:border-border/50`,
    ghost: `bg-transparent text-foreground hover:bg-foreground/5 active:bg-foreground/10 disabled:text-foreground/50`,
    link: `bg-transparent underline-offset-4 hover:underline text-primary hover:text-primary-dark p-0 h-auto disabled:text-primary/60`,
    subtle: `bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30 disabled:bg-primary/5 disabled:text-primary/60`,
    gradient: `bg-gradient-to-r from-primary to-secondary text-white hover:brightness-105 active:brightness-95 disabled:brightness-90 disabled:opacity-80`,
  };
  
  // Devre dışı durumu
  const disabledClass = isButtonDisabled ? 'cursor-not-allowed pointer-events-none' : '';
  
  // Tüm sınıfları birleştir
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${radiusClasses[radius]}
    ${variantClasses[variant]}
    ${disabledClass}
    ${className}
  `;

  // Buton içeriği
  const buttonContent = (
    <>
      {isLoading && (
        <div className="mr-2 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        </div>
      )}
      {!isLoading && leftIcon && (
        <span className={`mr-2 text-current ${size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {leftIcon}
        </span>
      )}
      <span className={isLoading ? 'opacity-90' : ''}>{children}</span>
      {!isLoading && rightIcon && (
        <span className={`ml-2 text-current ${size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {rightIcon}
        </span>
      )}
    </>
  );

  // Eğer asChild özelliği varsa ve children geçerli bir React elementi ise
  if (asChild && React.isValidElement(children)) {
    // children'a sınıfları aktararak döndür
    return React.cloneElement(children as ReactElement<{ className?: string }>, {
      className: `${classes} ${(children as ReactElement<{ className?: string }>).props.className || ''}`,
    });
  }
  
  // Eğer href varsa Link olarak render et
  if (href) {
    // External link ise normal <a> etiketi kullan
    if (external) {
      return (
        <a 
          href={href} 
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {buttonContent}
        </a>
      );
    }
    
    // Dahili link ise Next.js Link kullan
    return (
      <Link href={href} className={classes}>
        {buttonContent}
      </Link>
    );
  }
  
  // Normal button olarak render et
  return (
    <button
      ref={ref}
      className={classes}
      disabled={isButtonDisabled}
      type={props.type || 'button'}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

// IconButton bileşeni - Sadece ikon içeren yuvarlak buton
type IconButtonProps = Omit<ButtonProps, 'leftIcon' | 'rightIcon'> & {
  icon: React.ReactNode;
  tooltip?: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  className = '',
  icon,
  tooltip,
  size = 'md',
  ...props
}, ref) => {
  // Boyuta göre buton sınıfları
  const iconButtonSizeClasses = {
    xs: 'h-7 w-7',
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
    xl: 'h-11 w-11',
  };
  
  // Icon button için özel class'lar
  const iconButtonClass = `p-0 flex items-center justify-center ${iconButtonSizeClasses[size]} ${className}`;
  
  // Tooltip var mı kontrol et
  const hasTooltip = Boolean(tooltip);
  
  const button = (
    <Button
      ref={ref}
      className={iconButtonClass}
      radius={props.radius || 'full'}
      {...props}
    >
      {icon}
    </Button>
  );
  
  // Tooltip varsa sar
  if (hasTooltip) {
    return (
      <div className="relative group">
        {button}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
          <div className="bg-foreground/90 text-background text-xs rounded py-1 px-2 whitespace-nowrap">
            {tooltip}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/90 rotate-45"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return button;
});

IconButton.displayName = 'IconButton';

// ButtonGroup bileşeni
type ButtonGroupProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  orientation?: 'horizontal' | 'vertical';
  attached?: boolean;
};

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
  children,
  className = '',
  variant,
  size,
  orientation = 'horizontal',
  attached = false,
  ...props
}, ref) => {
  // Attachment sınıfları
  const attachmentClass = attached ? 
    orientation === 'horizontal' ? 'child:border-r-0 child:last:border-r child:first:rounded-r-none child:last:rounded-l-none child:not:first:not:last:rounded-none' : 
    'child:border-b-0 child:last:border-b child:first:rounded-b-none child:last:rounded-t-none child:not:first:not:last:rounded-none' : 
    '';
  
  const orientationClass = orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col';
  
  // ButtonGroup içindeki butonlara variant ve size prop'larını aktar
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as ReactElement<ButtonProps>, {
        variant: (child.props as ButtonProps).variant || variant,
        size: (child.props as ButtonProps).size || size,
      });
    }
    return child;
  });
  
  return (
    <div 
      ref={ref}
      className={`${orientationClass} ${attachmentClass} ${className}`}
      {...props}
    >
      {childrenWithProps}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export { Button, IconButton, ButtonGroup, type ButtonProps, type ButtonVariant, type ButtonSize };