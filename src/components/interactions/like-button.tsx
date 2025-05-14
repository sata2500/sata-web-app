// src/components/interactions/like-button.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { toggleLike, checkUserInteraction } from '@/lib/interaction-service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCompactNumber } from '@/lib/utils';

interface LikeButtonProps {
  contentId: string;
  contentType: 'blog_post' | 'comment';
  initialLiked?: boolean;
  initialCount?: number;
  variant?: 'icon' | 'button' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LikeButton({
  contentId,
  contentType,
  initialLiked = false,
  initialCount = 0,
  variant = 'icon',
  size = 'md',
  className = ''
}: LikeButtonProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Kullanıcı giriş yaptıysa beğeni durumunu kontrol et
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user && !isInitialized) {
        try {
          const hasLiked = await checkUserInteraction(
            user.id,
            contentId,
            contentType,
            'like'
          );
          setLiked(hasLiked);
          setIsInitialized(true);
        } catch (error) {
          console.error('Beğeni durumu kontrol edilirken hata:', error);
        }
      }
    };
    
    if (!loading) {
      checkLikeStatus();
    }
  }, [user, contentId, contentType, loading, isInitialized]);
  
  const handleLike = async () => {
    if (!user) {
      // Kullanıcı giriş yapmadıysa giriş sayfasına yönlendir
      router.push('/giris?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await toggleLike(user.id, contentId, contentType);
      setLiked(result.liked);
      setLikeCount(result.count);
    } catch (error) {
      console.error('Beğenme işlemi sırasında hata:', error);
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
        onClick={handleLike}
        disabled={isLoading}
        aria-label={liked ? 'Beğeniyi kaldır' : 'Beğen'}
        className={`inline-flex items-center gap-1.5 transition-colors ${
          liked ? 'text-primary' : 'text-foreground/70 hover:text-primary/80'
        } ${sizeClasses[size]} ${className}`}
      >
        {liked ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={iconSize[size]}
          >
            <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM6 10.5h6m-5 3h5M3 3l18 18" />
          </svg>
        )}
        {likeCount > 0 && (
          <span>{formatCompactNumber(likeCount)}</span>
        )}
      </button>
    );
  } else if (variant === 'button') {
    return (
      <Button
        onClick={handleLike}
        disabled={isLoading}
        variant={liked ? 'primary' : 'outline'}
        size={size === 'lg' ? 'md' : 'sm'}
        className={className}
      >
        {liked ? 'Beğenildi' : 'Beğen'} {likeCount > 0 && `(${formatCompactNumber(likeCount)})`}
      </Button>
    );
  } else {
    // 'text' varyantı
    return (
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`text-foreground/70 hover:text-primary transition-colors ${
          liked ? 'font-medium text-primary' : ''
        } ${sizeClasses[size]} ${className}`}
      >
        {liked ? 'Beğenildi' : 'Beğen'} {likeCount > 0 && `(${formatCompactNumber(likeCount)})`}
      </button>
    );
  }
}