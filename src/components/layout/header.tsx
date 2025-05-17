// src/components/layout/header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/theme-switch';
import { Container } from '@/components/ui/container';
import { AdminOnly } from '@/components/ui/authorization';
import { SearchBar } from '@/components/search/search-bar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useScrollBasedStyles } from '@/hooks/use-animation';
import { FadeIn } from '@/components/ui/motion';

export const Header = () => {
  const { user, loading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // useScrollBasedStyles hooks'una doğru parametreleri ekleyelim
  const { isScrolled } = useScrollBasedStyles({ 
    threshold: 10,
    className: 'scrolled', // Eksik olan className parametresi
    applyToElement: null   // Eksik olan applyToElement parametresi
  });

  // Mobil menü açıldığında body scroll'u devre dışı bırak
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Çıkış yaparken hata oluştu:', err);
    }
  };

  // ESC tuşu ile mobil menüyü kapat
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm'
          : 'bg-background'
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-20">
            <FadeIn direction="right" duration={0.3}>
              <span className="font-heading text-xl font-bold tracking-tight">
                SaTA
              </span>
            </FadeIn>
          </Link>

          {/* Search Bar - Sadece desktop görünümünde */}
          <FadeIn direction="none" duration={0.4} delay={0.1} className="hidden md:flex mx-4 flex-1 justify-center">
            <SearchBar />
          </FadeIn>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <FadeIn direction="down" duration={0.3} delay={0.2}>
              <Link 
                href="/blog" 
                className="text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                Blog
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            </FadeIn>
            
            <FadeIn direction="down" duration={0.3} delay={0.3}>
              <Link 
                href="/hakkimizda" 
                className="text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                Hakkımızda
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            </FadeIn>
            
            <FadeIn direction="down" duration={0.3} delay={0.4}>
              <Link 
                href="/iletisim" 
                className="text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                İletişim
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            </FadeIn>
            
            {/* Desktop Admin Link - Sadece admin yetkisi olanlar görebilir */}
            {!loading && user && (
              <AdminOnly>
                <FadeIn direction="down" duration={0.3} delay={0.5}>
                  <Link 
                    href="/admin" 
                    className="text-foreground/80 hover:text-foreground transition-colors relative group"
                  >
                    Admin
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </FadeIn>
              </AdminOnly>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4 z-20">
            <FadeIn direction="left" duration={0.3}>
              <ThemeSwitch />
            </FadeIn>
            
            {/* Bildirim Zili - Giriş yapmış kullanıcılar için */}
            {!loading && user && (
              <FadeIn direction="left" duration={0.3} delay={0.1}>
                <NotificationBell />
              </FadeIn>
            )}
            
            {/* User Menu / Auth Buttons */}
            {!loading && (
              user ? (
                <FadeIn direction="left" duration={0.3} delay={0.2}>
                  <div className="relative">
                    <Link href="/profil" className="flex items-center space-x-1 group">
                      <div className="relative overflow-hidden rounded-full transform transition-transform duration-300 group-hover:scale-105">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={user.displayName}
                            width={32}
                            height={32}
                            className="rounded-full ring-2 ring-background"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                            {user.displayName?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-full"></div>
                      </div>
                      <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate group-hover:text-primary transition-colors duration-200">
                        {user.displayName}
                      </span>
                    </Link>
                  </div>
                </FadeIn>
              ) : (
                <div className="flex items-center space-x-2">
                  <FadeIn direction="left" duration={0.3} delay={0.2}>
                    <Button href="/giris" variant="ghost" size="sm">
                      Giriş
                    </Button>
                  </FadeIn>
                  <FadeIn direction="left" duration={0.3} delay={0.3}>
                    <Button href="/kaydol" size="sm">
                      Kaydol
                    </Button>
                  </FadeIn>
                </div>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative z-20 p-2 -mr-2 text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Menüyü aç/kapat"
            >
              <div className="w-6 flex flex-col items-end justify-center">
                <span
                  className={`block h-0.5 bg-current rounded-full transition-all duration-300 ease-out ${
                    isMobileMenuOpen
                      ? 'w-6 -rotate-45 translate-y-1'
                      : 'w-6'
                  }`}
                ></span>
                <span
                  className={`block h-0.5 bg-current rounded-full mt-1 transition-all duration-300 ease-out ${
                    isMobileMenuOpen ? 'w-6 opacity-0' : 'w-4'
                  }`}
                ></span>
                <span
                  className={`block h-0.5 bg-current rounded-full mt-1 transition-all duration-300 ease-out ${
                    isMobileMenuOpen
                      ? 'w-6 rotate-45 -translate-y-1'
                      : 'w-5'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Ekranı kaplayan versiyonu */}
        <div
          className={`fixed inset-0 md:hidden bg-background z-10 transition-transform duration-500 ease-in-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-16"></div> {/* Header yüksekliği kadar boşluk */}
          <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            {/* Mobil arama çubuğu */}
            <div className="mb-8 pt-2">
              <SearchBar fullWidth placeholder="Ara..." />
            </div>
            
            <nav className="flex flex-col space-y-6 mt-4 text-lg">
              <Link
                href="/blog"
                className="text-foreground/90 hover:text-foreground transition-all hover:translate-x-1 duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-foreground/60">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Blog
              </Link>
              
              <Link
                href="/hakkimizda"
                className="text-foreground/90 hover:text-foreground transition-all hover:translate-x-1 duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-foreground/60">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                Hakkımızda
              </Link>
              
              <Link
                href="/iletisim"
                className="text-foreground/90 hover:text-foreground transition-all hover:translate-x-1 duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-foreground/60">
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                </svg>
                İletişim
              </Link>
              
              {user && (
                <>
                  <Link
                    href="/profil"
                    className="text-foreground/90 hover:text-foreground transition-all hover:translate-x-1 duration-200 flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-foreground/60">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profilim
                  </Link>
                  
                  <Link
                    href="/bildirimler"
                    className="text-foreground/90 hover:text-foreground transition-all hover:translate-x-1 duration-200 flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-foreground/60">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                    </svg>
                    Bildirimler
                  </Link>
                  
                  {/* Admin Linki - AdminOnly bileşeniyle izin kontrolü */}
                  <AdminOnly>
                    <Link
                      href="/admin"
                      className="text-foreground/90 hover:text-foreground transition-all hover:translate-x-1 duration-200 flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-foreground/60">
                        <path d="M12 2H2v10h10V2z"></path>
                        <path d="M22 12h-4v10h4V12z"></path>
                        <path d="M14 12h-4v10h4V12z"></path>
                        <path d="M14 2h8v6h-8V2z"></path>
                      </svg>
                      Admin Paneli
                    </Link>
                  </AdminOnly>
                  
                  <button
                    onClick={handleLogout}
                    className="text-foreground/90 hover:text-foreground transition-all hover:translate-x-1 duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-foreground/60">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Çıkış Yap
                  </button>
                </>
              )}
            </nav>
            
            {/* Mobil menü alt bilgi */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex justify-center space-x-4">
                <a 
                  href="https://github.com/sataweb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-foreground transition-colors"
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
                  className="text-foreground/60 hover:text-foreground transition-colors"
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
                  className="text-foreground/60 hover:text-foreground transition-colors"
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
              <p className="mt-4 text-center text-sm text-foreground/60">
                &copy; {new Date().getFullYear()} SaTA. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};