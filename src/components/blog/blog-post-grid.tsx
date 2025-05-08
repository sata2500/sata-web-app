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

interface BlogPostGridProps {
  selectedTag?: string;
}

export const BlogPostGrid: React.FC<BlogPostGridProps> = ({ selectedTag = '' }) => {
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
        startAfterDoc: loadMore ? lastDocRef.current : null
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
  }, [selectedTag]); // Sadece selectedTag'e bağımlı, lastDoc için useRef kullanıyoruz

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
  }, [selectedTag, loadPosts]); // loadPosts artık dependency olabilir çünkü useCallback ile memoize edildi

  // Daha fazla yazı yükleme
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadPosts(true);
    }
  };

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-12 bg-error/5 rounded-lg">
        <p className="text-error mb-4">{error}</p>
        <Button onClick={() => loadPosts()}>Yeniden Dene</Button>
      </div>
    );
  }

  return (
    <div>
      {posts.length === 0 && !loading ? (
        <div className="text-center py-12 bg-primary/5 rounded-lg">
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
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="transition-transform hover:-translate-y-1">
                <Card className="h-full flex flex-col">
                  {post.coverImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                      <Image 
                        src={post.coverImage} 
                        alt={post.title} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={index < 3} // İlk 3 resme priority ekledik
                      />
                    </div>
                  )}
                  <CardHeader className={post.coverImage ? "pb-3" : "pb-3 pt-6"}>
                    <div className="flex gap-2 mb-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="outline">+{post.tags.length - 2}</Badge>
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
                    <span className="text-primary font-medium text-sm">Devamını Oku &rarr;</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* "Daha Fazla Yükle" butonu */}
          {(hasMore || loading) && (
            <div className="flex justify-center mt-12">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="mr-2">Yükleniyor</span>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  </>
                ) : (
                  'Daha Fazla Yükle'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};