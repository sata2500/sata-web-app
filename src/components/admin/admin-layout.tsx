// src/components/admin/admin-layout.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';
import { useAuth } from '@/context/auth-context';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Sidebar'ı geniş ekranlarda varsayılan olarak açık tut
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    // İlk yükleme
    handleResize();

    // Pencere boyutu değiştiğinde
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sayfa değiştiğinde mobil görünümde sidebar'ı kapat
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Yükleme durumunda veya yetkisiz erişimde gösterilen içerik
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.isAdmin && !user?.isEditor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erişim Reddedildi</h1>
          <p className="mb-6">Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.</p>
          <a href="/" className="text-primary font-medium">
            Ana Sayfaya Dön &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Ana içerik */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Üst çubuk */}
        <header className="bg-card border-b border-border h-16 flex items-center">
          <div className="px-4 flex items-center justify-between w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
            <div className="text-lg font-semibold lg:hidden">SaTA Admin</div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden sm:block">
                {user?.displayName || user?.email}
              </span>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Kullanıcı'}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {(user?.displayName || user?.email || 'K')[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* İçerik */}
        <main className="flex-1 overflow-y-auto py-6">
          {children}
        </main>
      </div>
    </div>
  );
};