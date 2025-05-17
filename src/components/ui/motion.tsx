// src/components/ui/motion.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

// Genel Tip Tanımlamaları
type MotionVariants = {
  hidden: React.CSSProperties;
  visible: React.CSSProperties;
};

type TransitionProps = {
  duration?: number;
  delay?: number;
  ease?: string;
};

type MotionProps = {
  children: React.ReactNode;
  className?: string;
  variants?: MotionVariants;
  transition?: TransitionProps;
  viewport?: {
    once?: boolean;
    margin?: string;
  };
  initial?: 'hidden' | 'visible' | React.CSSProperties;
  animate?: 'hidden' | 'visible' | React.CSSProperties;
  whileHover?: React.CSSProperties;
  whileTap?: React.CSSProperties;
};

// Varsayılan animasyon varyantları
const defaultVariants: MotionVariants = {
  hidden: { opacity: 0, transform: 'translateY(20px)' },
  visible: { opacity: 1, transform: 'translateY(0)' },
};

// Varsayılan geçiş ayarları
const defaultTransition: TransitionProps = {
  duration: 0.5,
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
};

// Yardımcı fonksiyon - stil nesnelerini birleştirme
const mergeStyles = (...styles: (React.CSSProperties | undefined)[]): React.CSSProperties => {
  return Object.assign({}, ...styles.filter(Boolean));
};

/**
 * Basit bir animasyon bileşeni
 * CSS transitions kullanarak animasyonlar oluşturur
 */
export function Motion({
  children,
  className = '',
  variants = defaultVariants,
  transition = defaultTransition,
  viewport = { once: true, margin: '0px 0px -100px 0px' },
  initial = 'hidden',
  animate = 'visible',
  whileHover,
  whileTap,
  ...props
}: MotionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Başlangıç ve hedef stilleri hazırla
  const initialStyle = typeof initial === 'string' ? variants[initial] : initial;
  const animateStyle = typeof animate === 'string' ? variants[animate] : animate;

  // CSS geçiş özelliğini oluştur
  const getTransitionProperty = () => {
    const { duration = 0.5, delay = 0, ease = 'cubic-bezier(0.25, 0.1, 0.25, 1.0)' } = transition;
    return `all ${duration}s ${ease} ${delay}s`;
  };

  // Etkin stil hesaplama
  const getActiveStyle = (): React.CSSProperties => {
    if (!isVisible) {
      return initialStyle;
    }

    if (isPressed && whileTap) {
      return mergeStyles(animateStyle, whileTap);
    }

    if (isHovering && whileHover) {
      return mergeStyles(animateStyle, whileHover);
    }

    return animateStyle;
  };

  // IntersectionObserver ile viewport kontrolü
  useEffect(() => {
    const { once = true, margin = '0px' } = viewport;
    const currentElement = elementRef.current;

    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        rootMargin: margin,
        threshold: 0.1,
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [viewport]);

  // Stil objesi oluştur
  const style: React.CSSProperties = {
    ...getActiveStyle(),
    transition: getTransitionProperty(),
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={style}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </div>
  );
}

// Hazır animasyon bileşenleri
export function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.5,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
} & Omit<MotionProps, 'variants' | 'transition' | 'initial' | 'animate'>) {
  // Yön bazlı varyantlar
  const directionOffset = 20;
  const getTransform = (dir: 'up' | 'down' | 'left' | 'right' | 'none'): string => {
    switch (dir) {
      case 'up': return `translateY(${directionOffset}px)`;
      case 'down': return `translateY(-${directionOffset}px)`;
      case 'left': return `translateX(${directionOffset}px)`;
      case 'right': return `translateX(-${directionOffset}px)`;
      case 'none': return '';
      default: return '';
    }
  };

  const fadeVariants: MotionVariants = {
    hidden: {
      opacity: 0,
      transform: getTransform(direction),
    },
    visible: {
      opacity: 1,
      transform: direction === 'none' ? '' : 'translate(0, 0)',
    },
  };

  return (
    <Motion
      className={className}
      variants={fadeVariants}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </Motion>
  );
}

// Skale animasyonu
export function ScaleIn({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
} & Omit<MotionProps, 'variants' | 'transition' | 'initial' | 'animate'>) {
  const scaleVariants: MotionVariants = {
    hidden: {
      opacity: 0,
      transform: 'scale(0.9)',
    },
    visible: {
      opacity: 1,
      transform: 'scale(1)',
    },
  };

  return (
    <Motion
      className={className}
      variants={scaleVariants}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </Motion>
  );
}

// Hover ve tap ile etkileşim sağlayan bileşen
export function InteractiveElement({
  children,
  className = '',
  hoverScale = 1.05,
  tapScale = 0.95,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  tapScale?: number;
} & Omit<MotionProps, 'whileHover' | 'whileTap'>) {
  return (
    <Motion
      className={className}
      whileHover={{ transform: `scale(${hoverScale})` }}
      whileTap={{ transform: `scale(${tapScale})` }}
      {...props}
    >
      {children}
    </Motion>
  );
}

// Staggered list animasyonu için container bileşeni
export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            style: {
              ...((child as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.style || {}),
              animationDelay: `${index * staggerDelay}s`,
            },
          });
        }
        return child;
      })}
    </div>
  );
}