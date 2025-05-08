// src/components/theme-switch.tsx
'use client';

import { useTheme } from '@/context/theme-context';
import { useEffect, useState } from 'react';

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // İlk komponent montajında çalışır
  useEffect(() => {
    // Hydration işlemi tamamlandı
    setIsMounted(true);
  }, []);

  // Tema değiştirme fonksiyonu
  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
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