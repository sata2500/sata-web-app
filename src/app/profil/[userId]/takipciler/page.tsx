// src/app/profil/[userId]/takipciler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FollowersList } from '@/components/follow/followers-list';
import { getUserProfile } from '@/lib/user-service';
import { UserProfile } from '@/types/user';

export default function UserFollowersPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const router = useRouter();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile(userId);
        setUser(profile);
      } catch (err) {
        console.error('Kullanıcı profili yüklenirken hata:', err);
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [userId]);
  
  if (loading) {
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
  
  if (error || !user) {
    return (
      <Container>
        <div className="py-12 text-center">
          <p className="text-error mb-4">{error || 'Kullanıcı bulunamadı.'}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Geri
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{user.displayName} - Takipçiler</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Geri
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{user.displayName} - Takipçiler</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowersList userId={userId} limit={100} />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}