// src/components/interactions/share-button.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { addShare } from '@/lib/interaction-service';
import { Button } from '@/components/ui/button';
import { formatCompactNumber } from '@/lib/utils';

interface ShareButtonProps {
  contentId: string;
  contentType: 'blog_post';
  contentTitle: string;
  contentUrl: string;
  initialCount?: number;
  variant?: 'icon' | 'button' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ShareButton({
  contentId,
  contentType,
  contentTitle,
  contentUrl,
  initialCount = 0,
  variant = 'icon',
  size = 'md',
  className = ''
}: ShareButtonProps) {
  const { user } = useAuth();
  const [shareCount, setShareCount] = useState(initialCount);
  const [isOpen, setIsOpen] = useState(false);
  
  // Tam URL oluştur
  const shareUrl = contentUrl.startsWith('http') 
    ? contentUrl 
    : `${window.location.origin}${contentUrl}`;
  
  // Paylaşım seçenekleri
  const shareOptions = [
    {
      name: 'Twitter',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1DA1F2]">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(contentTitle)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1877F2]">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A66C2]">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect width="4" height="12" x="2" y="9"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#25D366]">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(`${contentTitle} ${shareUrl}`)}`
    }
  ];
  
  // Kopyalama özelliği
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link kopyalandı!');
      
      // Paylaşım sayısını güncelle
      if (user) {
        const newCount = await addShare(user.id, contentId, contentType, 'copy');
        setShareCount(newCount);
      }
    } catch (err) {
      console.error('Link kopyalanırken hata oluştu:', err);
    }
  };
  
  // Sosyal medyada paylaşım
  const shareOnPlatform = async (platform: string, url: string) => {
    // Yeni pencerede paylaşım URL'sini aç
    window.open(url, '_blank', 'width=600,height=400');
    
    // Paylaşım sayısını güncelle
    if (user) {
      const newCount = await addShare(user.id, contentId, contentType, platform);
      setShareCount(newCount);
    }
    
    setIsOpen(false);
  };
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  // Paylaşım menüsünü aç/kapat
  const toggleShareMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Simge sınıfları
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  // Butonu oluştur
  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={toggleShareMenu}
          aria-label="Paylaş"
          className={`inline-flex items-center gap-1.5 text-foreground/70 hover:text-primary/80 transition-colors ${sizeClasses[size]} ${className}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className={iconSize[size]}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          {shareCount > 0 && (
            <span>{formatCompactNumber(shareCount)}</span>
          )}
        </button>
        
        {/* Paylaşım menüsü */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-10">
            <div className="flex flex-col space-y-1">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => shareOnPlatform(option.name.toLowerCase(), option.url)}
                  className="flex items-center gap-2 p-2 hover:bg-primary/5 rounded transition-colors"
                >
                  {option.icon}
                  <span>{option.name}</span>
                </button>
              ))}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 p-2 hover:bg-primary/5 rounded transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
                <span>Linki Kopyala</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } else if (variant === 'button') {
    return (
      <div className="relative">
        <Button
          onClick={toggleShareMenu}
          variant="outline"
          size={size === 'lg' ? 'md' : 'sm'}
          className={className}
        >
          Paylaş {shareCount > 0 && `(${formatCompactNumber(shareCount)})`}
        </Button>
        
        {/* Paylaşım menüsü */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-10">
            <div className="flex flex-col space-y-1">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => shareOnPlatform(option.name.toLowerCase(), option.url)}
                  className="flex items-center gap-2 p-2 hover:bg-primary/5 rounded transition-colors"
                >
                  {option.icon}
                  <span>{option.name}</span>
                </button>
              ))}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 p-2 hover:bg-primary/5 rounded transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
                <span>Linki Kopyala</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    // 'text' varyantı
    return (
      <div className="relative">
        <button
          onClick={toggleShareMenu}
          className={`text-foreground/70 hover:text-primary transition-colors ${sizeClasses[size]} ${className}`}
        >
          Paylaş {shareCount > 0 && `(${formatCompactNumber(shareCount)})`}
        </button>
        
        {/* Paylaşım menüsü */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-10">
            <div className="flex flex-col space-y-1">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => shareOnPlatform(option.name.toLowerCase(), option.url)}
                  className="flex items-center gap-2 p-2 hover:bg-primary/5 rounded transition-colors"
                >
                  {option.icon}
                  <span>{option.name}</span>
                </button>
              ))}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 p-2 hover:bg-primary/5 rounded transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
                <span>Linki Kopyala</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}