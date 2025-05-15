// src/components/interactions/interaction-bar.tsx
'use client';

import { useEffect, useState } from 'react';
import { getInteractionStats } from '@/lib/interaction-service';
import { LikeButton } from './like-button';
import { SaveButton } from './save-button';
import { ShareButton } from './share-button';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';

interface InteractionBarProps {
  contentId: string;
  contentType: 'blog_post';
  contentTitle: string;
  contentUrl: string;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InteractionBar({
  contentId,
  contentType,
  contentTitle,
  contentUrl,
  variant = 'horizontal',
  size = 'md',
  className = ''
}: InteractionBarProps) {
  const [stats, setStats] = useState({
    likeCount: 0,
    saveCount: 0,
    viewCount: 0,
    shareCount: 0
  });
  
  useEffect(() => {
    // İstatistikleri yükle
    const loadStats = async () => {
      try {
        const interactionStats = await getInteractionStats(contentId, contentType);
        setStats(interactionStats);
      } catch (error) {
        console.error('İstatistikler yüklenirken hata oluştu:', error);
      }
    };
    
    loadStats();
  }, [contentId, contentType]);
  
  const containerClass = variant === 'horizontal'
    ? `flex items-center gap-6 ${className}`
    : `flex flex-col gap-4 ${className}`;
    
  // buttonVariant değişkenini kaldırdık, doğrudan "outline" kullanıyoruz
  // Button boyutu için ise mevcut size değişkenini kullanıyoruz
  
  return (
    <div className={containerClass}>
      <LikeButton
        contentId={contentId}
        contentType={contentType}
        initialCount={stats.likeCount}
        variant="icon"
        size={size}
      />
      
      <SaveButton
        contentId={contentId}
        contentType={contentType}
        initialCount={stats.saveCount}
        variant="icon"
        size={size}
      />
      
      <ShareButton
        contentId={contentId}
        contentType={contentType}
        contentTitle={contentTitle}
        contentUrl={contentUrl}
        initialCount={stats.shareCount}
        variant="icon"
        size={size}
      />
      
      {/* Yeni: Koleksiyona Ekle butonu */}
      <AddToCollectionButton
        contentId={contentId}
        contentType={contentType}
        variant="outline"
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'sm'}
      />
      
      {stats.viewCount > 0 && (
        <div className="flex items-center gap-1.5 text-foreground/60">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}>
            {stats.viewCount.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}