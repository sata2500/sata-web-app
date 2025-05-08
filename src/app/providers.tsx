// src/app/providers.tsx
'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}