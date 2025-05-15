// src/components/interactions/share-button.tsx
'use client'; // En başta 'use client' direktifini ekleyin

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { addShare } from '@/lib/interaction-service';
import { useAuth } from '@/context/auth-context';

interface ShareButtonProps {
  contentId: string;
  contentType: 'blog_post';
  contentTitle: string;
  contentUrl: string;
  initialCount: number;
  variant?: 'icon' | 'text' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ShareButton({
  contentId,
  contentType,
  contentTitle,
  contentUrl,
  initialCount = 0,
  variant = 'full',
  size = 'md',
  className = ''
}: ShareButtonProps) {
  const [count, setCount] = useState(initialCount);
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // İstemci tarafında monte edilip edilmediğini kontrol et
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const shareContent = async () => {
    try {
      // Web Share API kullanılabilir mi kontrol et
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: contentTitle,
          text: `${contentTitle} - SaTA`,
          url: `${window.location.origin}${contentUrl}`
        });
        
        // Paylaşım başarılı olursa, etkileşimi kaydet
        if (user) {
          const newCount = await addShare(user.id, contentId, contentType, 'web_share_api');
          setCount(newCount);
        }
      } else {
        // Web Share API yoksa URL'yi panoya kopyala
        const fullUrl = `${window.location.origin}${contentUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        
        alert('Bağlantı panoya kopyalandı!');
        
        // Paylaşım başarılı olursa, etkileşimi kaydet
        if (user) {
          const newCount = await addShare(user.id, contentId, contentType, 'clipboard');
          setCount(newCount);
        }
      }
    } catch (error) {
      console.error('Paylaşım sırasında hata:', error);
    }
  };
  
  // Sunucu tarafında render ediliyorsa boş div döndür
  if (!isMounted) {
    return null;
  }
  
  // Variant'a göre buton içeriği
  let buttonContent;
  
  switch (variant) {
    case 'icon':
      buttonContent = (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          {count > 0 && (
            <span className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}>
              {count}
            </span>
          )}
        </>
      );
      break;
    case 'text':
      buttonContent = (
        <>
          <span>Paylaş</span>
          {count > 0 && (
            <span className="ml-1">({count})</span>
          )}
        </>
      );
      break;
    default:
      buttonContent = (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          <span>Paylaş</span>
          {count > 0 && (
            <span className="ml-1">({count})</span>
          )}
        </>
      );
  }
  
  return (
    <Button 
      variant="ghost" 
      size={size} 
      onClick={shareContent}
      className={`flex items-center gap-1.5 ${className}`}
    >
      {buttonContent}
    </Button>
  );
}