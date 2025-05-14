// src/components/blog/blog-view-tracker.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { addView } from '@/lib/interaction-service';

interface BlogViewTrackerProps {
  postId: string;
  incrementServerCount?: boolean;
}

export function BlogViewTracker({ postId, incrementServerCount = true }: BlogViewTrackerProps) {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    const startTime = performance.now();
    let viewRecorded = false;
    
    // Görüntülenme süresini hesaplamak için
    const recordView = async (duration?: number) => {
      if (viewRecorded) return;
      viewRecorded = true;
      
      // Anonim kullanıcılar için yalnızca sunucu tarafında sayacı artır
      if (!user && incrementServerCount) {
        try {
          // Sunucuya istek gönder (API route eklenebilir)
          await fetch(`/api/blog/view?postId=${postId}`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Görüntülenme kaydedilirken hata:', error);
        }
        return;
      }
      
      // Giriş yapmış kullanıcı için görüntülenme kaydı
      if (user) {
        try {
          await addView(user.id, postId, 'blog_post', duration);
        } catch (error) {
          console.error('Görüntülenme kaydedilirken hata:', error);
        }
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !viewRecorded) {
        const duration = Math.floor((performance.now() - startTime) / 1000);
        recordView(duration);
      }
    };
    
    // Sayfadaki görünürlük değişikliklerini dinle
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Zaman aşımı: 15 saniye sonra kaydet
    const timeoutId = setTimeout(() => {
      if (!viewRecorded) {
        const duration = Math.floor((performance.now() - startTime) / 1000);
        recordView(duration);
      }
    }, 15000);
    
    // Sayfa yüklendiğinde görüntülenme kaydı için
    if (!loading) {
      recordView();
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
      
      // Sayfa kapanırken görüntülenme süresi kaydı
      if (!viewRecorded) {
        const duration = Math.floor((performance.now() - startTime) / 1000);
        recordView(duration);
      }
    };
  }, [postId, user, loading, incrementServerCount]);
  
  // Görsel olarak hiçbir şey render etme
  return null;
}