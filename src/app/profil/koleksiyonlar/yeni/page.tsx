// src/app/profil/koleksiyonlar/yeni/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { CollectionForm } from '@/components/collections/collection-form';
import { useAuth } from '@/context/auth-context';

export default function NewCollectionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/profil/koleksiyonlar/yeni');
    }
  }, [user, loading, router]);
  
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Yeni Koleksiyon Oluştur</h1>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <CollectionForm mode="create" />
          </div>
        </div>
      </div>
    </Container>
  );
}