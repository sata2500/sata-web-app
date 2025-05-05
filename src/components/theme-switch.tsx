'use client';

import { useEffect, useState } from 'react';

export function ThemeSwitch() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  // İlk komponent montajında çalışır
  useEffect(() => {
    // Hydration işlemi tamamlandı
    setIsMounted(true);
    
    // LocalStorage'dan tema tercihi alınıyor
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      // Kaydedilmiş tema varsa onu kullan
      if (savedTheme) {
        setTheme(savedTheme);
      } 
      // Yoksa sistem tercihine bak
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch (error) {
      console.error('Tema okunamadı:', error);
    }
  }, []);

  // Tema değiştiğinde HTML belgesinin sınıfını günceller
  useEffect(() => {
    if (!isMounted) return;
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Tema kaydedilemedi:', error);
    }
  }, [theme, isMounted]);

  // Tema değiştirme fonksiyonu
  function toggleTheme() {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }

  // Hydration sorunlarını önlemek için, ilk render sırasında basit bir buton göster
  if (!isMounted) {
    return (
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md border"
        aria-label="Tema değiştir"
      >
        <span className="sr-only">Tema değiştir</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-md border"
      aria-label={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'}
    >
      {theme === 'light' ? (
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
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
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
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}