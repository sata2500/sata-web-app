// src/components/layout/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Bu satırı ekledim
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/theme-switch';
import { Container } from '@/components/ui/container';

export const Header = () => {
  const { user, loading, signOut } = useAuth(); // logout yerine signOut kullanın
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(); // logout yerine signOut kullanın
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Çıkış yaparken hata oluştu:', err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-background'
    }`}>
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-heading text-xl font-bold">SaTA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/blog" className="text-foreground/70 hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/hakkimizda" className="text-foreground/70 hover:text-foreground transition-colors">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="text-foreground/70 hover:text-foreground transition-colors">
              İletişim
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <ThemeSwitch />
            
            {/* User Menu / Auth Buttons */}
            {!loading && (
              user ? (
                <div className="relative">
                  <Link href="/profil" className="flex items-center space-x-1">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        {user.displayName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden md:inline text-sm font-medium">
                      {user.displayName}
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button href="/giris" variant="ghost" size="sm">
                    Giriş
                  </Button>
                  <Button href="/kaydol" size="sm">
                    Kaydol
                  </Button>
                </div>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2 text-foreground/70"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/blog"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/hakkimizda"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link
                href="/iletisim"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                İletişim
              </Link>
              
              {user && (
                <>
                  <Link
                    href="/profil"
                    className="text-foreground/70 hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profilim
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="text-foreground/70 hover:text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Paneli
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left text-foreground/70 hover:text-foreground"
                  >
                    Çıkış Yap
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};