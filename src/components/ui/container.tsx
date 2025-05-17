// src/components/ui/container.tsx
import React, { forwardRef, ElementType } from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: ElementType;
  withGutter?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className = '', 
    children, 
    size = 'lg',
    as: Component = 'div',
    withGutter = true,
    ...props 
  }, ref) => {
    // Size sınıfları
    const sizeClasses = {
      sm: 'max-w-screen-sm', // 640px
      md: 'max-w-screen-md', // 768px
      lg: 'max-w-screen-lg', // 1024px
      xl: 'max-w-screen-xl', // 1280px
      full: 'max-w-full',    // Tam genişlik
    };
    
    // Kenar boşluğu sınıfları
    const gutterClasses = withGutter ? 'px-4 md:px-6 lg:px-8' : '';
    
    return (
      <Component
        ref={ref}
        className={`mx-auto w-full ${sizeClasses[size]} ${gutterClasses} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';

// Section bileşeni - Container'ı içeren ve dikey boşluk ekleyen bileşen
interface SectionProps extends ContainerProps {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  bgColor?: string;
  fullWidth?: boolean;
}

const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ 
    className = '', 
    children, 
    spacing = 'lg',
    bgColor,
    fullWidth = false,
    size = fullWidth ? 'full' : 'lg',
    ...props 
  }, ref) => {
    // Dikey boşluk sınıfları
    const spacingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24',
    };
    
    // Arka plan rengi sınıfı
    const bgColorClass = bgColor ? `bg-${bgColor}` : '';
    
    return (
      <section className={`w-full ${bgColorClass} ${spacingClasses[spacing]} ${className}`}>
        <Container ref={ref} size={size} {...props}>
          {children}
        </Container>
      </section>
    );
  }
);

Section.displayName = 'Section';

// Container varyantları
interface ContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

// Blog içeriği için optimize edilmiş container
const ContentContainer = forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`max-w-3xl mx-auto w-full ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ContentContainer.displayName = 'ContentContainer';

// Dar container - form ve küçük içerikler için
const NarrowContainer = forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`max-w-md mx-auto w-full ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NarrowContainer.displayName = 'NarrowContainer';

// İki kolonlu layout için container
const TwoColumnContainer = forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TwoColumnContainer.displayName = 'TwoColumnContainer';

export { 
  Container, 
  Section, 
  ContentContainer, 
  NarrowContainer,
  TwoColumnContainer
};