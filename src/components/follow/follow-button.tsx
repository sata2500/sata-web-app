// src/components/follow/follow-button.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, checkIfFollowing } from '@/lib/follow-service';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({
  userId,
  initialFollowing = false,
  variant = 'primary',
  size = 'md',
  className = '',
  onFollowChange
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Takip durumunu kontrol et
    const checkFollowStatus = async () => {
      if (!user) return;
      
      try {
        const following = await checkIfFollowing(user.id, userId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Takip durumu kontrol edilirken hata:', error);
      }
    };
    
    if (user && user.id !== userId) {
      checkFollowStatus();
    }
  }, [user, userId]);
  
  const handleFollowToggle = async () => {
    if (!user) {
      // Kullanıcı giriş yapmadıysa, giriş sayfasına yönlendir
      router.push('/giris?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    setLoading(true);
    
    try {
      if (isFollowing) {
        await unfollowUser(user.id, userId);
        setIsFollowing(false);
      } else {
        await followUser(user.id, userId);
        setIsFollowing(true);
      }
      
      // Değişikliği bildir
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Takip işlemi sırasında hata:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Kendi profilinde takip butonu gösterme
  if (user && user.id === userId) {
    return null;
  }
  
  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      className={className}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center gap-1">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          <span>İşlem...</span>
        </span>
      ) : isFollowing ? (
        'Takibi Bırak'
      ) : (
        'Takip Et'
      )}
    </Button>
  );
}