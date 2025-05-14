// src/components/interactions/save-button.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { toggleSave, checkUserInteraction } from '@/lib/interaction-service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCompactNumber } from '@/lib/utils';

interface SaveButtonProps {
  contentId: string;
  contentType: 'blog_post' | 'comment';
  initialSaved?: boolean;
  initialCount?: number;
  variant?: 'icon' | 'button' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SaveButton({
  contentId,
  contentType,
  initialSaved = false,
  initialCount = 0,
  variant = 'icon',
  size = 'md',
  className = ''
}: SaveButtonProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Kullanıcı giriş yaptıysa kaydetme durumunu kontrol et
  useEffect(() => {
    const checkSaveStatus = async () => {
      if (user && !isInitialized) {
        try {
          const hasSaved = await checkUserInteraction(
            user.id,
            contentId,
            contentType,
            'save'
          );
          setSaved(hasSaved);
          setIsInitialized(true);
        } catch (error) {
          console.error('Kaydetme durumu kontrol edilirken hata:', error);
        }
      }
    };
    
    if (!loading) {
      checkSaveStatus();
    }
  }, [user, contentId, contentType, loading, isInitialized]);
  
  const handleSave = async () => {
    if (!user) {
      // Kullanıcı giriş yapmadıysa giriş sayfasına yönlendir
      router.push('/giris?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await toggleSave(user.id, contentId, contentType);
      setSaved(result.saved);
      setSaveCount(result.count);
    } catch (error) {
      console.error('Kaydetme işlemi sırasında hata:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  // Butonu oluştur
  if (variant === 'icon') {
    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
    return (
      <button
        onClick={handleSave}
        disabled={isLoading}
        aria-label={saved ? 'Kaydı kaldır' : 'Kaydet'}
        className={`inline-flex items-center gap-1.5 transition-colors ${
          saved ? 'text-primary' : 'text-foreground/70 hover:text-primary/80'
        } ${sizeClasses[size]} ${className}`}
      >
        {saved ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={iconSize[size]}
          >
            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className={iconSize[size]}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        )}
        {saveCount > 0 && (
          <span>{formatCompactNumber(saveCount)}</span>
        )}
      </button>
    );
  } else if (variant === 'button') {
    return (
      <Button
        onClick={handleSave}
        disabled={isLoading}
        variant={saved ? 'primary' : 'outline'}
        size={size === 'lg' ? 'md' : 'sm'}
        className={className}
      >
        {saved ? 'Kaydedildi' : 'Kaydet'} {saveCount > 0 && `(${formatCompactNumber(saveCount)})`}
      </Button>
    );
  } else {
    // 'text' varyantı
    return (
      <button
        onClick={handleSave}
        disabled={isLoading}
        className={`text-foreground/70 hover:text-primary transition-colors ${
          saved ? 'font-medium text-primary' : ''
        } ${sizeClasses[size]} ${className}`}
      >
        {saved ? 'Kaydedildi' : 'Kaydet'} {saveCount > 0 && `(${formatCompactNumber(saveCount)})`}
      </button>
    );
  }
}