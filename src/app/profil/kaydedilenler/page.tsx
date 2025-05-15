// src/app/profil/kaydedilenler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getUserSaves } from '@/lib/interaction-service';
import { getBlogPostById } from '@/lib/blog-service';
import { getUserCollections, getCollectionBlogPosts } from '@/lib/collection-service';
import { BlogPost } from '@/types/blog';
import { Collection } from '@/types/collection';
import { formatRelativeTime } from '@/lib/utils';
// Koleksiyona ekle butonunu import et
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';

export default function SavedContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection');
  
  const { user, loading } = useAuth();
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(collectionId);
  const [isLoading, setIsLoading] = useState(true);
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/profil/kaydedilenler');
    }
  }, [user, loading, router]);
  
  // Koleksiyonları yükle
  useEffect(() => {
    const loadCollections = async () => {
      if (!user) return;
      
      try {
        const userCollections = await getUserCollections(user.id);
        setCollections(userCollections);
      } catch (error) {
        console.error('Koleksiyonlar yüklenirken hata:', error);
      }
    };
    
    if (user) {
      loadCollections();
    }
  }, [user]);
  
  // Kaydedilen içerikleri yükle
  useEffect(() => {
    const loadSavedContent = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        let posts: BlogPost[] = [];
        
        if (selectedCollection) {
          // Belirli bir koleksiyonun içeriğini yükle
          posts = await getCollectionBlogPosts(selectedCollection);
        } else {
          // Tüm kaydedilen içerikleri yükle
          const savedBlogIds = await getUserSaves(user.id, 'blog_post');
          const postPromises = savedBlogIds.map(id => getBlogPostById(id));
          
          const allPosts = await Promise.all(postPromises);
          posts = allPosts.filter((post): post is BlogPost => !!post)
            .filter(post => post.status === 'published');
        }
        
        setSavedPosts(posts);
      } catch (error) {
        console.error('Kaydedilen içerikler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadSavedContent();
    }
  }, [user, selectedCollection]);
  
  // Koleksiyon değişikliğinde URL'i güncelle
  const handleCollectionChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    setSelectedCollection(newValue);
    
    // URL'i güncelle
    if (newValue) {
      router.push(`/profil/kaydedilenler?collection=${newValue}`);
    } else {
      router.push('/profil/kaydedilenler');
    }
  };
  
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
  
  // Koleksiyon seçici oluştur
  const renderCollectionSelector = () => (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">Koleksiyon:</div>
        <Select
          value={selectedCollection || 'all'}
          onValueChange={handleCollectionChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tüm Kaydedilenler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kaydedilenler</SelectItem>
            {collections.map(collection => (
              <SelectItem key={collection.id} value={collection.id as string}>
                {collection.name}
                {collection.isPrivate && ' (Özel)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <Link href="/profil/koleksiyonlar">
            Koleksiyonlarımı Yönet
          </Link>
        </Button>
      </div>
    </div>
  );
  
  return (
    <Container>
      <div className="py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kaydedilen İçerikler</h1>
          <p className="text-foreground/70">
            Daha sonra okumak veya başvurmak için kaydettiğiniz içerikler burada listelenir.
          </p>
        </div>
        
        {collections.length > 0 && renderCollectionSelector()}
        
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
            <h2 className="text-xl font-medium mb-2">
              {selectedCollection 
                ? "Bu Koleksiyonda Henüz İçerik Yok" 
                : "Henüz Kaydedilen İçerik Yok"}
            </h2>
            <p className="text-foreground/70 max-w-md mx-auto mb-6">
              {selectedCollection
                ? "Blog yazılarını okurken, içerikleri bu koleksiyona ekleyebilirsiniz."
                : "Blog yazılarını okurken sağ üstteki yer işareti simgesine tıklayarak istediğiniz içerikleri kaydedebilirsiniz."}
            </p>
            <Button asChild>
              <Link href="/blog">
                Blog Yazılarına Göz At
              </Link>
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
                <CardFooter className="pt-4 flex gap-2">
                  <Button 
                    asChild
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      Okumaya Devam Et
                    </Link>
                  </Button>
                  
                  {/* Koleksiyona ekle butonu */}
                  <AddToCollectionButton 
                    contentId={post.id as string}
                    contentType="blog_post"
                    size="sm"
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}