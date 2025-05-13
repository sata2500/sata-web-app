// src/components/search/search-bar.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

export function SearchBar({ className = '', placeholder = 'Ara...', fullWidth = false }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const handleSearch = useCallback(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/arama?q=${encodeURIComponent(trimmedQuery)}`);
    }
  }, [searchQuery, router]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);
  
  return (
    <div className={`relative flex items-center ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      <Input 
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`pr-10 ${fullWidth ? 'w-full' : 'w-48 md:w-64'}`}
      />
      <button
        type="button"
        onClick={handleSearch}
        className="absolute right-2 p-1 rounded-md text-foreground/70 hover:text-foreground"
        aria-label="Ara"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </div>
  );
}