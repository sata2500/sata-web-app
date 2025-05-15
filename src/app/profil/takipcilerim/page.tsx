// src/app/profil/takipcilerim/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FollowersList } from '@/components/follow/followers-list';
import { useAuth } from '@/context/auth-context';

export default function MyFollowersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    // Kullanıcı giriş yapmadıysa login sayfasına yönlendir
    if (mounted && !loading && !user) {
      router.push('/giris?redirect=/profil/takipcilerim');
    }
  }, [mounted, user, loading, router]);
  
  if (loading || !mounted) {
    return (
      <Container>
        <div className="py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-secondary rounded-lg mb-8 max-w-xs"></div>
            <div className="h-64 bg-secondary rounded-lg"></div>
          </div>
        </div>
      </Container>
    );
  }
  
  if (!user) {
    return null; // Yönlendirme yapılacak, bu kısım render edilmeyecek
  }
  
  return (
    <Container>
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Takipçilerim</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Geri
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Takipçilerim</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowersList userId={user.id} limit={50} />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}