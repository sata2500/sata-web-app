// src/app/profil/koleksiyonlar/[collectionId]/duzenle/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { CollectionForm } from '@/components/collections/collection-form';
import { getCollection } from '@/lib/collection-service';
import { useAuth } from '@/context/auth-context';

export default function EditCollectionPage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Koleksiyonu kontrol et
  useEffect(() => {
    const checkCollection = async () => {
      if (!user) return;
      
      const collectionId = params.collectionId;
      
      try {
        setIsLoading(true);
        
        // Koleksiyon bilgilerini getir
        const collection = await getCollection(collectionId);
        
        if (!collection) {
          setError('Koleksiyon bulunamadı');
          return;
        }
        
        // Kullanıcı bu koleksiyonun sahibi mi kontrol et
        if (collection.userId !== user.id) {
          setError('Bu koleksiyonu düzenleme yetkiniz yok');
          return;
        }
      } catch (err) {
        console.error('Koleksiyon kontrolü sırasında hata:', err);
        setError('Koleksiyon kontrol edilirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkCollection();
    }
  }, [params.collectionId, user]);
  
  // Kullanıcı giriş yapmadıysa veya yükleme yapılıyorsa gösterme
  if (loading || isLoading) {
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
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Geri Dön
          </button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Koleksiyonu Düzenle</h1>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <CollectionForm 
              mode="edit" 
              collectionId={params.collectionId} 
            />
          </div>
        </div>
      </div>
    </Container>
  );
}