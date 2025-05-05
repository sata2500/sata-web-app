'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { ThemeSwitch } from '@/components/theme-switch';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl mr-6">
            SaTA
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/blog" 
              className={`transition-colors hover:text-primary ${
                pathname === '/blog' ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Blog
            </Link>
            <Link 
              href="/hakkimizda" 
              className={`transition-colors hover:text-primary ${
                pathname === '/hakkimizda' ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Hakkımızda
            </Link>
            <Link 
              href="/iletisim" 
              className={`transition-colors hover:text-primary ${
                pathname === '/iletisim' ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              İletişim
            </Link>
          </nav>
        </div>
        
        {/* Mobil menü butonu */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        <div className="hidden md:flex items-center space-x-4">
          <ThemeSwitch />
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link 
                href="/profil" 
                className="transition-colors hover:text-primary"
              >
                {user.displayName || user.email?.split('@')[0] || 'Profil'}
              </Link>
              <button 
                onClick={() => logout()} 
                className="btn btn-outline"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                href="/giris" 
                className="btn btn-outline"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/kaydol" 
                className="btn btn-primary"
              >
                Kaydol
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobil menü */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="border-t p-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/blog" 
                className={`transition-colors hover:text-primary ${
                  pathname === '/blog' ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/hakkimizda" 
                className={`transition-colors hover:text-primary ${
                  pathname === '/hakkimizda' ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link 
                href="/iletisim" 
                className={`transition-colors hover:text-primary ${
                  pathname === '/iletisim' ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
            </nav>
            
            <div className="flex items-center justify-between border-t pt-4 pb-2">
              <span className="text-sm">Tema</span>
              <ThemeSwitch />
            </div>
            
            <div className="border-t pt-4">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/profil" 
                    className="btn btn-outline w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.displayName || user.email?.split('@')[0] || 'Profil'}
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }} 
                    className="btn btn-primary w-full"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/giris" 
                    className="btn btn-outline w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/kaydol" 
                    className="btn btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kaydol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}