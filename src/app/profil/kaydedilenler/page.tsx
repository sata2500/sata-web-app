// src/app/profil/kaydedilenler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { getUserSaves } from '@/lib/interaction-service';
import { getBlogPostById } from '@/lib/blog-service';
import { BlogPost } from '@/types/blog';
import { formatRelativeTime } from '@/lib/utils';

export default function SavedContentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/profil/kaydedilenler');
    }
  }, [user, loading, router]);
  
  // Kaydedilen içerikleri yükle
  useEffect(() => {
    const loadSavedContent = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Kullanıcının kaydettiği blog yazılarının ID'lerini al
        const savedBlogIds = await getUserSaves(user.id, 'blog_post');
        
        // Her bir blog yazısının detaylarını al
        const postPromises = savedBlogIds.map(id => getBlogPostById(id));
        const posts = await Promise.all(postPromises);
        
        // null değerleri filtrele ve durumu "published" olanları al
        const validPosts = posts
          .filter((post): post is BlogPost => !!post)
          .filter(post => post.status === 'published');
        
        setSavedPosts(validPosts);
      } catch (error) {
        console.error('Kaydedilen içerikler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadSavedContent();
    }
  }, [user]);
  
  // Kullanıcı giriş yapmadıysa veya yükleme yapılıyorsa gösterme
  if (loading || !user) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="animate-pulse">Yükleniyor...</div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kaydedilen İçerikler</h1>
          <p className="text-foreground/70">
            Daha sonra okumak veya başvurmak için kaydettiğiniz içerikler burada listelenir.
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-2 border-primary border-r-transparent rounded-full mb-4"></div>
            <p>İçerikler yükleniyor...</p>
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="text-center py-12 bg-primary/5 rounded-lg">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1} 
              stroke="currentColor" 
              className="w-12 h-12 mx-auto mb-4 text-primary/50"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <h2 className="text-xl font-medium mb-2">Henüz Kaydedilen İçerik Yok</h2>
            <p className="text-foreground/70 max-w-md mx-auto mb-6">
              Blog yazılarını okurken sağ üstteki yer işareti simgesine tıklayarak istediğiniz içerikleri kaydedebilirsiniz.
            </p>
            <Button href="/blog">
              Blog Yazılarına Göz At
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedPosts.map(post => (
              <Card key={post.id} className="h-full flex flex-col">
                {post.coverImage && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                    <Image 
                      src={post.coverImage} 
                      alt={post.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader className={post.coverImage ? "pb-3" : "pb-3 pt-6"}>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="py-0 flex-grow">
                  <p className="text-foreground/80 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-foreground/60">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatRelativeTime(post.publishedAt)}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button 
                    href={`/blog/${post.slug}`} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Okumaya Devam Et
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}