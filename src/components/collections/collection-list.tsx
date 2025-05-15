'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getUserCollections, deleteCollection } from '@/lib/collection-service';
import { Collection } from '@/types/collection';
import { CollectionCard } from '@/components/collections/collection-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

export function CollectionList() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  
  // Koleksiyonları yükle
  useEffect(() => {
    const loadCollections = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userCollections = await getUserCollections(user.id);
        setCollections(userCollections);
      } catch (error) {
        console.error('Koleksiyonlar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadCollections();
    }
  }, [user]);
  
  // Koleksiyon silme işlemi
  const handleDeleteClick = (id: string) => {
    setCollectionToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!collectionToDelete) return;
    
    try {
      await deleteCollection(collectionToDelete);
      
      // Listeden kaldır
      setCollections(collections.filter(collection => collection.id !== collectionToDelete));
    } catch (error) {
      console.error('Koleksiyon silinirken hata:', error);
    } finally {
      setCollectionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-md border p-4 animate-pulse">
            <div className="h-6 bg-secondary/50 w-1/3 mb-3 rounded"></div>
            <div className="h-4 bg-secondary/30 w-2/3 mb-2 rounded"></div>
            <div className="h-4 bg-secondary/30 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (collections.length === 0) {
    return (
      <div className="text-center py-12 bg-primary/5 rounded-lg">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1} 
          stroke="currentColor" 
          className="w-12 h-12 mx-auto mb-4 text-primary/50"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <h2 className="text-xl font-medium mb-2">Henüz Koleksiyonunuz Yok</h2>
        <p className="text-foreground/70 max-w-md mx-auto mb-6">
          Koleksiyonlar, beğendiğiniz ve kaydettiğiniz içerikleri düzenlemek için harika bir yoldur. Kendi koleksiyonlarınızı oluşturun ve içeriklerinizi organize edin.
        </p>
        <Button asChild>
          <Link href="/profil/koleksiyonlar/yeni">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-5 h-5 mr-2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Yeni Koleksiyon Oluştur
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>
      
      {/* Silme onay dialogu */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Koleksiyonu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu koleksiyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve koleksiyon içindeki tüm kayıtlar kaldırılacaktır. 
              <br /><br />
              <span className="font-medium">Not:</span> İçerikler kaydedilmiş olarak kalır, sadece bu koleksiyondan kaldırılır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Koleksiyonu Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}