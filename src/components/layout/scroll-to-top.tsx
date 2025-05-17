// src/components/layout/scroll-to-top.tsx
'use client'

import React from 'react';

export function ScrollToTop() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center" onClick={handleClick}>
      <span>Yukarı Çık</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    </a>
  );
}