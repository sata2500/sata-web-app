// src/components/profile/user-activity.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { getComments, getBlogPosts } from '@/lib/blog-service';

// Etkinlik tipi tanımlaması
type ActivityType = 'comment' | 'post' | 'like';

// Etkinlik modeli
interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  content: string;
  timestamp: number;
  url: string;
}

interface UserActivityProps {
  userId: string;
}

export function UserActivity({ userId }: UserActivityProps) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Tüm yorumları al
        const allComments = await getComments();
        // author.id ile filtreleme yapıyoruz
        const userComments = allComments.filter(comment => 
          comment.author && comment.author.id === userId && comment.id
        );
        
        // Blog yazılarını al
        const postsResult = await getBlogPosts({});
        const userPosts = postsResult.posts.filter(post => 
          post.author && post.author.id === userId && post.id
        );
        
        // Yorumları etkinliklere dönüştür
        const commentActivities: Activity[] = userComments.map(comment => {
          if (!comment.id) return null;
          
          return {
            id: comment.id,
            type: 'comment' as ActivityType,
            title: 'Yorum yaptı',
            content: comment.content,
            timestamp: comment.createdAt,
            url: `/blog/${comment.postId}#comment-${comment.id}`
          };
        }).filter((item): item is Activity => item !== null);
        
        // Blog yazılarını etkinliklere dönüştür
        const postActivities: Activity[] = userPosts.map(post => {
          if (!post.id || !post.slug) return null;
          
          return {
            id: post.id,
            type: 'post' as ActivityType,
            title: post.title,
            content: post.excerpt || post.title,
            timestamp: post.publishedAt || post.updatedAt || 0,
            url: `/blog/${post.slug}`
          };
        }).filter((item): item is Activity => item !== null);
        
        // Tüm etkinlikleri birleştir ve tarih sırasına göre sırala
        const allActivities = [...commentActivities, ...postActivities].sort(
          (a, b) => b.timestamp - a.timestamp
        );
        
        setActivities(allActivities);
      } catch (err) {
        console.error('Kullanıcı etkinlikleri alınırken hata oluştu:', err);
        setError('Etkinlikler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p className="mt-2 text-muted-foreground">Etkinlikler yükleniyor...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">Henüz hiçbir etkinlik bulunmuyor.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Son Etkinlikler</h2>
      
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={`${activity.type}-${activity.id}`} className="relative pl-6 pb-6 border-l border-border">
            {/* Zaman çizelgesi noktası */}
            <div className="absolute top-0 left-0 w-3 h-3 -translate-x-1.5 rounded-full bg-primary"></div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {/* Etkinlik tipine göre ikon */}
                  {activity.type === 'comment' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  
                  <h3 className="font-medium">
                    {activity.type === 'comment' ? 'Yorum yaptı' : activity.title}
                  </h3>
                </div>
                
                <time className="text-sm text-muted-foreground">
                  {formatRelativeTime(activity.timestamp)}
                </time>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {activity.content}
                </p>
              </div>
              
              <div className="mt-3">
                <Link 
                  href={activity.url} 
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  {activity.type === 'comment' ? 'Yorumu görüntüle' : 'Yazıyı görüntüle'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}