// src/app/profil/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserActivity } from '@/components/profile/user-activity';
import { useAuth } from '@/context/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  
  // Kullanıcı oturum açmamışsa giriş sayfasına yönlendir
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/profil');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }
  
  if (!user || !userProfile) {
    return null; // useEffect içinde yönlendirme yapılacak
  }
  
  return (
    <Container className="py-10">
      <h1 className="sr-only">Kullanıcı Profili</h1>
      
      <ProfileHeader
        photoURL={userProfile.photoURL || null}
        displayName={userProfile.displayName}
        email={userProfile.email}
        role={userProfile.role}
        joinDate={userProfile.createdAt}
      />
      
      <Tabs defaultValue="activity" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="activity">Etkinlikler</TabsTrigger>
          <TabsTrigger value="posts">Yazılarım</TabsTrigger>
          <TabsTrigger value="comments">Yorumlarım</TabsTrigger>
          <TabsTrigger value="favorites">Favoriler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              <UserActivity userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="posts">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Yazılarım</h2>
              <p className="text-muted-foreground">Henüz yayınlanmış bir yazınız bulunmuyor.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comments">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Yorumlarım</h2>
              <p className="text-muted-foreground">Henüz bir yorum yapmadınız.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Favori İçerikler</h2>
              <p className="text-muted-foreground">Henüz favori içerik eklemediniz.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <a href="/profil/ayarlar" className="text-primary hover:underline">
          Profil Ayarları
        </a>
      </div>
    </Container>
  );
}