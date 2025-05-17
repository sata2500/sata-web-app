// src/components/blog/blog-post-grid.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBlogPosts } from '@/lib/blog-service';
import { formatRelativeTime } from '@/lib/utils';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { FadeIn } from '@/components/ui/motion';
import { useIntersectionObserver } from '@/hooks/use-animation';

interface BlogPostGridProps {
  selectedTag?: string;
  layout?: 'grid' | 'list' | 'compact';
  postLimit?: number; // limit parametresini postLimit olarak değiştirdik
}

export const BlogPostGrid: React.FC<BlogPostGridProps> = ({ 
  selectedTag = '',
  layout = 'grid',
  postLimit
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<BlogPost> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Render sayısını takip etmek için ref
  const hasLoadedRef = useRef(false);
  
  // Önceki tag değerini saklamak için ref (dependency'leri azaltmak için)
  const prevTagRef = useRef(selectedTag);
  
  // lastDoc değerinin mutable bir referansı
  const lastDocRef = useRef(lastDoc);
  
  // Sonsuz yükleme için IntersectionObserver kullanımı
  const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    once: false,
  });
  
  // lastDoc değiştiğinde ref'i güncelleyin
  useEffect(() => {
    lastDocRef.current = lastDoc;
  }, [lastDoc]);

  // Blog yazılarını yükleme - useCallback ile memoize edilmiş
  const loadPosts = useCallback(async (loadMore = false) => {
    if (!loadMore) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log("Fetching posts with tag:", selectedTag, "loadMore:", loadMore); 
      
      const result = await getBlogPosts({
        status: 'published',
        tag: selectedTag,
        startAfterDoc: loadMore ? lastDocRef.current : null,
        perPage: postLimit // limit yerine perPage parametresini kullanıyoruz
      });

      if (loadMore) {
        setPosts(prevPosts => [...prevPosts, ...result.posts]);
      } else {
        setPosts(result.posts);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Blog yazıları yüklenirken hata oluştu:', err);
      setError('Blog yazıları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [selectedTag, postLimit]); // dependency'lere postLimit eklendi

  // Son post göründüğünde otomatik yükleme
  useEffect(() => {
    if (isLoadMoreVisible && hasMore && !loading) {
      loadPosts(true);
    }
  }, [isLoadMoreVisible, hasMore, loading, loadPosts]); // loadPosts dependency'lere eklendi

  // İlk yükleme ve tag değişikliklerini kontrol eden effect
  useEffect(() => {
    // Tag değişti mi diye kontrol
    if (prevTagRef.current !== selectedTag) {
      // Eğer tag değiştiyse, yeni bir yükleme yapmak için flag'i resetle
      hasLoadedRef.current = false;
      prevTagRef.current = selectedTag;
    }

    // İlk yükleme veya tag değiştiğinde yükleme yap
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPosts();
    }
  }, [selectedTag, loadPosts]); // loadPosts dependency'lere eklendi

  // Daha fazla yazı yükleme
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadPosts(true);
    }
  };

  if (error && posts.length === 0) {
    return (
      <FadeIn direction="up" className="text-center py-12 bg-error/5 rounded-lg">
        <p className="text-error mb-4">{error}</p>
        <Button onClick={() => loadPosts()} variant="primary">Yeniden Dene</Button>
      </FadeIn>
    );
  }

  // Layout seçenekleri - grid, list, compact
  const getGridLayout = () => {
    switch (layout) {
      case 'list':
        return 'flex flex-col space-y-6';
      case 'compact':
        return 'grid gap-4 md:grid-cols-3 lg:grid-cols-4';
      case 'grid':
      default:
        return 'grid gap-8 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Blog post kartı render etme fonksiyonu
  const renderBlogCard = (post: BlogPost, index: number) => {
    // Layout'a göre kart varyantı
    const cardProps = {
      grid: {
        variant: 'default' as const,
        isHoverable: true,
        className: 'h-full flex flex-col',
      },
      list: {
        variant: 'default' as const,
        isHoverable: true,
        orientation: 'horizontal' as const,
        className: 'flex flex-col md:flex-row',
      },
      compact: {
        variant: 'default' as const,
        isHoverable: true,
        className: 'h-full flex flex-col',
      },
    };

    // Gecikme hesaplama
    const delay = index * 0.1 > 0.5 ? 0.5 : index * 0.1;

    // Layout'a göre kartı render et
    if (layout === 'list') {
      return (
        <FadeIn key={post.id} direction="up" delay={delay} className="w-full">
          <Link href={`/blog/${post.slug}`} className="block w-full">
            <Card {...cardProps.list}>
              {post.coverImage && (
                <div className="md:w-1/3 h-48 md:h-full relative">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover rounded-t-lg md:rounded-t-none md:rounded-l-lg"
                    priority={index < 3}
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col p-6">
                <div className="flex gap-2 mb-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="subtle" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="outline" size="sm">+{post.tags.length - 2}</Badge>
                  )}
                </div>
                <CardTitle className="mb-2 line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="mb-4 text-sm text-foreground/60 flex items-center gap-2">
                  <span>{formatRelativeTime(post.publishedAt)}</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-foreground/30"></span>
                  <span>{post.author.name}</span>
                </CardDescription>
                <p className="text-foreground/80 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="mt-auto">
                  <span className="text-primary font-medium text-sm inline-flex items-center group">
                    Devamını Oku
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </FadeIn>
      );
    }
    
    if (layout === 'compact') {
      return (
        <FadeIn key={post.id} direction="up" delay={delay} className="w-full">
          <Link href={`/blog/${post.slug}`} className="block h-full">
            <Card {...cardProps.compact}>
              {post.coverImage && (
                <div className="relative h-32 w-full">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              )}
              <CardContent className="p-4 flex-1 flex flex-col">
                <Badge variant="subtle" size="sm" className="self-start mb-2">
                  {post.tags[0] || 'Genel'}
                </Badge>
                <h3 className="font-semibold text-base mb-1 line-clamp-2">{post.title}</h3>
                <p className="text-xs text-foreground/60 mb-1">{formatRelativeTime(post.publishedAt)}</p>
              </CardContent>
            </Card>
          </Link>
        </FadeIn>
      );
    }
    
    // Varsayılan grid görünümü
    return (
      <FadeIn key={post.id} direction="up" delay={delay} className="w-full">
        <Link href={`/blog/${post.slug}`} className="block h-full">
          <Card {...cardProps.grid}>
            {post.coverImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg group">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={index < 3} // İlk 3 resme priority ekledik
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
            <CardHeader className={post.coverImage ? "pb-3" : "pb-3 pt-6"}>
              <div className="flex gap-2 mb-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="subtle" size="sm">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="outline" size="sm">+{post.tags.length - 2}</Badge>
                )}
              </div>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="text-sm text-foreground/60 flex items-center gap-2">
                <span>{formatRelativeTime(post.publishedAt)}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-foreground/30"></span>
                <span>{post.author.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="py-0 flex-grow">
              <p className="text-foreground/80 line-clamp-3">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="pt-4">
              <span className="text-primary font-medium text-sm inline-flex items-center group">
                Devamını Oku
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </CardFooter>
          </Card>
        </Link>
      </FadeIn>
    );
  };

  return (
    <div>
      {posts.length === 0 && !loading ? (
        <FadeIn direction="up" className="text-center py-12 bg-primary/5 rounded-lg">
          <p className="mb-4 text-foreground/70">
            {selectedTag 
              ? `"${selectedTag}" etiketine sahip blog yazısı bulunamadı.` 
              : 'Henüz blog yazısı yok.'}
          </p>
          {selectedTag && (
            <Link href="/blog">
              <Button variant="outline">Tüm Yazıları Göster</Button>
            </Link>
          )}
        </FadeIn>
      ) : (
        <>
          <div className={getGridLayout()}>
            {posts.map((post, index) => renderBlogCard(post, index))}
          </div>

          {/* "Daha Fazla Yükle" butonu veya yükleniyor göstergesi */}
          {(hasMore || loading) && (
            <div ref={loadMoreRef} className="flex justify-center mt-12">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={loading}
                className="group"
              >
                {loading ? (
                  <>
                    <span className="mr-2">Yükleniyor</span>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  </>
                ) : (
                  <>
                    <span>Daha Fazla Yükle</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-2 transform group-hover:translate-y-1 transition-transform duration-200" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};