// src/app/profil/koleksiyonlar/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { CollectionList } from '@/components/collections/collection-list';

export default function CollectionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/profil/koleksiyonlar');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Koleksiyonlarım</h1>
            <p className="text-foreground/70">
              İçeriklerinizi düzenlemek ve kategorilere ayırmak için koleksiyonlar oluşturun.
            </p>
          </div>
          
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
              Yeni Koleksiyon
            </Link>
          </Button>
        </div>
        
        <CollectionList />
      </div>
    </Container>
  );
}