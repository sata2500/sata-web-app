'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/auth-context';
import { 
  getCollection, 
  getCollectionBlogPosts, 
  deleteCollection, 
  removeFromCollection 
} from '@/lib/collection-service';
import { Collection } from '@/types/collection';
import { BlogPost } from '@/types/blog';
import { formatRelativeTime } from '@/lib/utils';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';

export default function CollectionDetailPage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeItemDialogOpen, setRemoveItemDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  
  // Koleksiyon verilerini yükle
  useEffect(() => {
    const loadCollectionData = async () => {
      if (!user) return;
      
      const collectionId = params.collectionId;
      
      try {
        setIsLoading(true);
        
        // Koleksiyon bilgilerini getir
        const collectionData = await getCollection(collectionId);
        
        if (!collectionData) {
          setError('Koleksiyon bulunamadı');
          return;
        }
        
        // Özel koleksiyonlar için yetki kontrolü yap
        if (collectionData.isPrivate && collectionData.userId !== user.id) {
          setError('Bu koleksiyonu görüntüleme yetkiniz yok');
          return;
        }
        
        setCollection(collectionData);
        
        // Koleksiyondaki blog yazılarını getir
        const collectionPosts = await getCollectionBlogPosts(collectionId);
        setPosts(collectionPosts);
      } catch (err) {
        console.error('Koleksiyon verileri yüklenirken hata:', err);
        setError('Koleksiyon verileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadCollectionData();
    }
  }, [params.collectionId, user]);
  
  // Koleksiyon sahibi kontrolü
  const isOwner = user && collection && user.id === collection.userId;
  
  // Koleksiyon silme işlemi
  const confirmDeleteCollection = async () => {
    if (!collection || !isOwner) return;
    
    try {
      await deleteCollection(collection.id as string);
      router.push('/profil/koleksiyonlar');
    } catch (error) {
      console.error('Koleksiyon silinirken hata:', error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  // İçerik çıkarma işlemi
  const handleRemoveClick = (contentId: string) => {
    setItemToRemove(contentId);
    setRemoveItemDialogOpen(true);
  };
  
  const confirmRemoveItem = async () => {
    if (!user || !collection || !itemToRemove) return;
    
    try {
      await removeFromCollection(user.id, collection.id as string, itemToRemove);
      
      // Listeyi güncelle
      setPosts(posts.filter(post => post.id !== itemToRemove));
      
      // Koleksiyon öğe sayısını güncelle
      setCollection({
        ...collection,
        itemCount: Math.max(0, collection.itemCount - 1)
      });
    } catch (error) {
      console.error('İçerik çıkarılırken hata:', error);
    } finally {
      setItemToRemove(null);
      setRemoveItemDialogOpen(false);
    }
  };
  
  // Kullanıcı giriş yapmadıysa veya yükleme yapılıyorsa gösterme
  if (loading) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="animate-pulse">Yükleniyor...</div>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Hata</h1>
          <p className="mb-6">{error}</p>
          <Link href="/profil/koleksiyonlar">
            <Button>Koleksiyonlara Dön</Button>
          </Link>
        </div>
      </Container>
    );
  }
  
  if (isLoading) {
    return (
      <Container>
        <div className="py-12">
          <div className="h-8 bg-secondary/50 w-1/3 mb-4 rounded animate-pulse"></div>
          <div className="h-4 bg-secondary/30 w-2/3 mb-8 rounded animate-pulse"></div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-md border p-4 h-64 animate-pulse">
                <div className="h-24 bg-secondary/30 w-full mb-4 rounded"></div>
                <div className="h-4 bg-secondary/50 w-2/3 mb-2 rounded"></div>
                <div className="h-4 bg-secondary/30 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }
  
  if (!collection) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Koleksiyon Bulunamadı</h1>
          <p className="mb-6">İstediğiniz koleksiyon bulunamadı veya kaldırılmış olabilir.</p>
          <Link href="/profil/koleksiyonlar">
            <Button>Koleksiyonlara Dön</Button>
          </Link>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-12">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link 
                  href="/profil/koleksiyonlar" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Koleksiyonlar
                </Link>
                <span className="text-foreground/60">/</span>
                <h1 className="text-3xl font-bold">{collection.name}</h1>
                
                {collection.isPrivate && (
                  <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-full text-xs">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-3 h-3 mr-1"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Özel
                  </div>
                )}
              </div>
              
              {collection.description && (
                <p className="text-foreground/70 mb-2">{collection.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                <div className="flex items-center gap-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>{collection.itemCount} içerik</span>
                </div>
                
                <div className="flex items-center gap-1">
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
                  <span>Son güncelleme: {formatRelativeTime(collection.updatedAt)}</span>
                </div>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/profil/koleksiyonlar/${collection.id}/duzenle`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-4 h-4 mr-2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Düzenle
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-4 h-4 mr-2 text-destructive"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Sil
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-primary/5 rounded-lg">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1} 
              stroke="currentColor" 
              className="w-12 h-12 mx-auto mb-4 text-primary/50"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h2 className="text-xl font-medium mb-2">Bu Koleksiyonda Henüz İçerik Yok</h2>
            <p className="text-foreground/70 max-w-md mx-auto mb-6">
              Blog yazılarını okurken sağ üstteki kaydetme simgesine tıklayarak içerikleri bu koleksiyona ekleyebilirsiniz.
            </p>
            <Button asChild>
              <Link href="/blog">
                Blog Yazılarına Göz At
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
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
                  
                  {isOwner && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveClick(post.id as string)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-4 h-4 text-destructive"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  )}
                  
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
      
      {/* Koleksiyon silme dialogu */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Koleksiyonu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{collection.name}&quot; koleksiyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve koleksiyon içindeki tüm kayıtlar kaldırılacaktır. 
              <br /><br />
              <span className="font-medium">Not:</span> İçerikler kaydedilmiş olarak kalır, sadece bu koleksiyondan kaldırılır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCollection} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Koleksiyonu Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* İçerik çıkarma dialogu */}
      <AlertDialog open={removeItemDialogOpen} onOpenChange={setRemoveItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İçeriği Koleksiyondan Çıkar</AlertDialogTitle>
            <AlertDialogDescription>
              Bu içeriği koleksiyondan çıkarmak istediğinizden emin misiniz? İçerik kaydedilmiş olarak kalır, sadece bu koleksiyondan kaldırılır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveItemDialogOpen(false)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveItem}>
              Koleksiyondan Çıkar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}