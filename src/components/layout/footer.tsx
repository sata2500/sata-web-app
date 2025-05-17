// src/components/layout/footer.tsx
import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { FadeIn, StaggerContainer } from '@/components/ui/motion';
import { ScrollToTop } from '@/components/layout/scroll-to-top';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-12 bg-background/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <FadeIn direction="up" delay={0.1} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-semibold text-sm">S</span>
              </div>
              <h3 className="font-heading font-bold text-xl">SaTA</h3>
            </div>
            <p className="text-foreground/70 text-sm max-w-xs">
              Blog ve çeşitli uygulamalar sunan modern bir web platformu. Öğrenme, gelişim ve paylaşım için tek adres.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://github.com/sataweb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </a>
              <a 
                href="https://twitter.com/sataweb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/sataweb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.2} className="space-y-4">
            <h4 className="font-heading font-semibold text-lg relative inline-block">
              Platformlar
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary/50"></span>
            </h4>
            <ul className="space-y-3">
              <StaggerContainer staggerDelay={0.05}>
                <li className="transform transition-transform duration-200 hover:translate-x-1">
                  <Link href="/blog" className="text-foreground/70 hover:text-primary transition-colors text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-primary/70 mr-2"></span>
                    SaTA Blog
                  </Link>
                </li>
                <li className="transform transition-transform duration-200">
                  <span className="text-foreground/40 text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-foreground/30 mr-2"></span>
                    SaTA ÖYS
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-foreground/5 text-foreground/50 rounded-full">
                      Yakında
                    </span>
                  </span>
                </li>
                <li className="transform transition-transform duration-200">
                  <span className="text-foreground/40 text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-foreground/30 mr-2"></span>
                    SaTA Müzik
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-foreground/5 text-foreground/50 rounded-full">
                      Yakında
                    </span>
                  </span>
                </li>
                <li className="transform transition-transform duration-200">
                  <span className="text-foreground/40 text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-foreground/30 mr-2"></span>
                    Seher AI
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-foreground/5 text-foreground/50 rounded-full">
                      Yakında
                    </span>
                  </span>
                </li>
              </StaggerContainer>
            </ul>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.3} className="space-y-4">
            <h4 className="font-heading font-semibold text-lg relative inline-block">
              Bağlantılar
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary/50"></span>
            </h4>
            <ul className="space-y-3">
              <StaggerContainer staggerDelay={0.05}>
                <li className="transform transition-transform duration-200 hover:translate-x-1">
                  <Link href="/hakkimizda" className="text-foreground/70 hover:text-primary transition-colors text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-primary/70 mr-2"></span>
                    Hakkımızda
                  </Link>
                </li>
                <li className="transform transition-transform duration-200 hover:translate-x-1">
                  <Link href="/iletisim" className="text-foreground/70 hover:text-primary transition-colors text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-primary/70 mr-2"></span>
                    İletişim
                  </Link>
                </li>
                <li className="transform transition-transform duration-200 hover:translate-x-1">
                  <Link href="/kullanim-kosullari" className="text-foreground/70 hover:text-primary transition-colors text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-primary/70 mr-2"></span>
                    Kullanım Koşulları
                  </Link>
                </li>
                <li className="transform transition-transform duration-200 hover:translate-x-1">
                  <Link href="/gizlilik-politikasi" className="text-foreground/70 hover:text-primary transition-colors text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full bg-primary/70 mr-2"></span>
                    Gizlilik Politikası
                  </Link>
                </li>
              </StaggerContainer>
            </ul>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.4} className="space-y-4">
            <h4 className="font-heading font-semibold text-lg relative inline-block">
              İletişim
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary/50"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:info@sata.com.tr" 
                  className="text-foreground/70 hover:text-primary transition-colors text-sm flex items-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-foreground/50 group-hover:text-primary transition-colors">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  info@sata.com.tr
                </a>
              </li>
              <li>
                <a 
                  href="tel:+905001234567" 
                  className="text-foreground/70 hover:text-primary transition-colors text-sm flex items-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-foreground/50 group-hover:text-primary transition-colors">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  (0500) 123 45 67
                </a>
              </li>
              <li className="pt-2">
                <form className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="E-posta adresiniz" 
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-primary text-white text-sm px-3 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Abone Ol
                  </button>
                </form>
                <p className="mt-2 text-xs text-foreground/50">
                  Güncellemeler için bültenimize abone olun.
                </p>
              </li>
            </ul>
          </FadeIn>
        </div>
        
        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60">
            &copy; {currentYear} SaTA. Tüm hakları saklıdır.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <ScrollToTop />
          </div>
        </div>
      </Container>
    </footer>
  );
}