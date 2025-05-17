// src/hooks/use-animation.ts
'use client';

import {
  useState,
  useEffect,
  useRef,
  RefObject,
  MutableRefObject
} from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/**
 * Bir DOM elementinin viewport'ta görünüp görünmediğini takip eden hook
 */
export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    once = true
  } = options;

  // initial value olarak null, ama tipimiz T | null
  const elementRef: MutableRefObject<T | null> = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && once) {
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [root, rootMargin, threshold, once]);

  return [elementRef, isIntersecting];
}

/**
 * Sekme (tab) bazlı bir bileşeni yöneten hook
 */
export function useTabs<T extends string | number>(defaultTab: T): {
  activeTab: T;
  setActiveTab: (tab: T) => void;
  isActive: (tab: T) => boolean;
} {
  const [activeTab, setActiveTab] = useState<T>(defaultTab);
  const isActive = (tab: T) => activeTab === tab;
  return { activeTab, setActiveTab, isActive };
}

/**
 * Sayfa yüklendiğinde geçiş animasyonunu kontrol eden hook
 */
export function usePageTransition(): { isLoaded: boolean } {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    return () => {
      setIsLoaded(false);
    };
  }, []);

  return { isLoaded };
}

type MousePositionResult<T extends Element> = {
  ref: MutableRefObject<T | null>;
  x: number;
  y: number;
  isHovering: boolean;
};

/**
 * Fare pozisyonuna göre interaktif efektler oluşturan hook
 */
export function useMousePosition<T extends Element>(): MousePositionResult<T> {
  const ref = useRef<T | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
    isHovering: boolean;
  }>({ x: 0, y: 0, isHovering: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y, isHovering: true });
    };

    const handleMouseLeave = () => {
      setMousePosition(prev => ({ ...prev, isHovering: false }));
    };

    element.addEventListener('mousemove', handleMouseMove as EventListener);
    element.addEventListener('mouseleave', handleMouseLeave as EventListener);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove as EventListener);
      element.removeEventListener('mouseleave', handleMouseLeave as EventListener);
    };
  }, [ref]);

  return { ref, ...mousePosition };
}

/**
 * Kaydırma konumuna göre arka plan rengini veya özelliklerini değiştiren hook
 */
export function useScrollBasedStyles(options = {
  threshold: 100,
  className: 'scrolled',
  applyToElement: null as Element | null
}): { isScrolled: boolean } {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const { threshold, className, applyToElement } = options;
    const target = applyToElement || document.body;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const newIsScrolled = scrollPosition > threshold;

      if (newIsScrolled !== isScrolled) {
        setIsScrolled(newIsScrolled);

        if (newIsScrolled) {
          target.classList.add(className);
        } else {
          target.classList.remove(className);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      target.classList.remove(className);
    };
  }, [isScrolled, options]);

  return { isScrolled };
}

/**
 * Sayfada belirli bir yere kaydırma yapan hook
 */
export function useScrollToElement(): {
  scrollToElement: (selector: string, offset?: number) => void;
  scrollToTop: (smooth?: boolean) => void;
} {
  const scrollToElement = (selector: string, offset = 0) => {
    const element = document.querySelector(selector);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const scrollToTop = (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  return { scrollToElement, scrollToTop };
}