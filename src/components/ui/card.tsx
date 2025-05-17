// src/components/ui/card.tsx
import React, { forwardRef } from 'react';
import { Motion, InteractiveElement } from '@/components/ui/motion';
import Image from 'next/image';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'interactive' | 'outline' | 'flat' | 'glass';
  orientation?: 'horizontal' | 'vertical';
  isHoverable?: boolean;
  hasShadow?: boolean;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className = '', 
    children, 
    variant = 'default',
    orientation = 'vertical',
    isHoverable = false,
    hasShadow = true,
    ...props 
  }, ref) => {
    // Variant class'ları
    const variantClasses = {
      default: 'bg-card text-card-foreground border border-border',
      interactive: 'bg-card text-card-foreground border border-border hover:border-primary/50 hover:bg-card/80',
      outline: 'bg-transparent border border-border text-foreground',
      flat: 'bg-background/50 text-foreground border-none',
      glass: 'bg-background/30 backdrop-blur-md border border-white/10 text-foreground'
    };
    
    // Orientation class'ları
    const orientationClasses = {
      horizontal: 'flex flex-row',
      vertical: 'flex flex-col'
    };
    
    // Shadow class'ı
    const shadowClass = hasShadow ? 'shadow-sm hover:shadow-md' : '';
    
    // Hover class'ı
    const hoverClass = isHoverable ? 'transition-all duration-300 hover:-translate-y-1' : '';
    
    // Tüm class'ları birleştir
    const cardClasses = `
      rounded-lg 
      ${variantClasses[variant]} 
      ${shadowClass}
      ${hoverClass}
      ${orientationClasses[orientation]}
      ${className}
    `;
    
    // Interactive card ise InteractiveElement ile sar
    if (variant === 'interactive') {
      return (
        <div ref={ref} {...props}>
          <InteractiveElement
            className={cardClasses}
            hoverScale={1.02}
            tapScale={0.98}
          >
            {children}
          </InteractiveElement>
        </div>
      );
    }

    // Hoverable card ise Motion ile sar
    if (isHoverable) {
      return (
        <div ref={ref} className={cardClasses} {...props}>
          <Motion
            whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
          >
            {children}
          </Motion>
        </div>
      );
    }

    // Standart card
    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
};

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`flex flex-col space-y-1.5 pb-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', as = 'h3', children, ...props }, ref) => {
    const Component = as;
    return (
      <Component 
        ref={ref}
        className={`font-heading text-xl font-semibold tracking-tight ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: string;
  children: React.ReactNode;
};

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p 
        ref={ref}
        className={`text-sm text-foreground/60 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
};

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`pt-0 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
};

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`flex items-center pt-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Yeni: Image card bileşeni
type CardImageProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  src: string;
  alt: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9';
  position?: 'top' | 'bottom';
  overlay?: boolean;
};

const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  ({ className = '', src, alt, aspectRatio = '16:9', position = 'top', overlay = false, ...props }, ref) => {
    // Aspect ratio class'ları
    const aspectRatioClasses = {
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]',
      '16:9': 'aspect-video',
      '21:9': 'aspect-[21/9]'
    };
    
    // Position class'ları
    const positionClasses = {
      top: 'rounded-t-lg',
      bottom: 'rounded-b-lg order-last'
    };
    
    return (
      <div 
        ref={ref}
        className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${positionClasses[position]} ${className}`}
        {...props}
      >
        <Image
          src={src} 
          alt={alt} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        )}
      </div>
    );
  }
);

CardImage.displayName = 'CardImage';

// Yeni: Badge kartı
type CardBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
};

const CardBadge = forwardRef<HTMLDivElement, CardBadgeProps>(
  ({ className = '', children, position = 'top-right', variant = 'primary', ...props }, ref) => {
    // Position class'ları
    const positionClasses = {
      'top-right': 'absolute top-2 right-2',
      'top-left': 'absolute top-2 left-2',
      'bottom-right': 'absolute bottom-2 right-2',
      'bottom-left': 'absolute bottom-2 left-2'
    };
    
    // Variant class'ları
    const variantClasses = {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      success: 'bg-success text-white',
      warning: 'bg-warning text-white',
      error: 'bg-error text-white',
      outline: 'bg-background border border-primary text-primary'
    };
    
    return (
      <div 
        ref={ref}
        className={`
          px-2 py-1 text-xs font-medium rounded-md
          ${positionClasses[position]}
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBadge.displayName = 'CardBadge';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardImage,
  CardBadge
};