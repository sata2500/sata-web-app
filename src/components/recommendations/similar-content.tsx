// src/components/recommendations/similar-content.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSimilarContent } from '@/lib/recommendation-service';
import { BlogPost } from '@/types/blog';

interface SimilarContentProps {
  contentId: string;
  limit?: number;
  className?: string;
}

export function SimilarContent({ contentId, limit = 3, className }: SimilarContentProps) {
  const [similarPosts, setSimilarPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSimilarContent = async () => {
      setLoading(true);
      
      try {
        const posts = await getSimilarContent(contentId, limit);
        setSimilarPosts(posts);
      } catch (error) {
        console.error('Benzer içerikler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (contentId) {
      loadSimilarContent();
    }
  }, [contentId, limit]);
  
  if (loading) {
    return (
      <div className={className}>
        <h3 className="text-xl font-bold mb-4">Benzer İçerikler</h3>
        <div className="grid gap-4">
          {Array(limit).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-20 bg-secondary/20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (similarPosts.length === 0) {
    return null;
  }
  
  return (
    <div className={className}>
      <h3 className="text-xl font-bold mb-4">Benzer İçerikler</h3>
      <div className="grid gap-4">
        {similarPosts.map(post => (
          <Card key={post.id} className="overflow-hidden">
            <div className="flex">
              {post.coverImage ? (
                <div className="w-20 h-20 shrink-0 relative">
                  <Image 
                    src={post.coverImage} 
                    alt={post.title} 
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-secondary/20 shrink-0 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1} 
                    stroke="currentColor" 
                    className="w-8 h-8 text-secondary"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              )}
              
              <div className="flex flex-col justify-between p-4 flex-grow">
                <CardContent className="p-0">
                  <h4 className="font-medium line-clamp-2">{post.title}</h4>
                </CardContent>
                <CardFooter className="p-0 mt-2">
                  <Button variant="link" asChild className="h-auto p-0">
                    <Link href={`/blog/${post.slug}`}>
                      Oku &rarr;
                    </Link>
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}