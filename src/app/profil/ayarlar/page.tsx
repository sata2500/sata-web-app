// src/app/profil/ayarlar/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/profile-form';
import { PasswordForm } from '@/components/profile/password-form';
import { NotificationSettings } from '@/components/profile/notification-settings';
import { AccountSettings } from '@/components/profile/account-settings';
import { useAuth } from '@/context/auth-context';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Kullanıcı oturum açmamışsa giriş sayfasına yönlendir
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/profil/ayarlar');
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
  
  if (!user) {
    return null; // useEffect içinde yönlendirme yapılacak
  }
  
  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">Profil Ayarları</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none gap-1">
          <TabsTrigger value="profile">Profil Bilgileri</TabsTrigger>
          <TabsTrigger value="password">Şifre</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="account">Hesap</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profil Bilgileri</h2>
            <ProfileForm user={user} />
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Şifre Değiştir</h2>
            <PasswordForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Bildirim Ayarları</h2>
            <NotificationSettings userId={user.id} />
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Hesap Ayarları</h2>
            <AccountSettings userId={user.id} />
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}