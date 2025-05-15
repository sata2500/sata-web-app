// src/app/profil/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { getUserNotificationSettings, updateUserNotificationSettings } from '@/lib/notification-service';
import { getFollowStats } from '@/lib/follow-service';
import { NotificationPreferences } from '@/types/notification';
import { FollowSuggestions } from '@/components/follow/follow-suggestions';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, userProfile } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/profil');
    }
  }, [user, loading, router]);
  
  // Bildirim ayarlarını ve takipçi istatistiklerini yükle
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        // Paralel olarak bildirim ayarlarını ve takip istatistiklerini yükle
        const [settings, stats] = await Promise.all([
          getUserNotificationSettings(user.id),
          getFollowStats(user.id)
        ]);
        
        setNotificationSettings(settings);
        setFollowStats(stats);
      } catch (error) {
        console.error('Profil bilgileri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadProfileData();
    }
  }, [user]);
  
  // Bildirim ayarlarını güncelle
  const handleUpdateNotificationSettings = async (
    key: keyof NotificationPreferences, 
    value: boolean
  ) => {
    if (!user || !notificationSettings) return;
    
    const updatedSettings = {
      ...notificationSettings,
      [key]: value
    };
    
    setNotificationSettings(updatedSettings);
    
    try {
      await updateUserNotificationSettings(user.id, {
        [key]: value
      });
    } catch (error) {
      console.error('Bildirim ayarları güncellenirken hata:', error);
      // Hata durumunda eski değeri geri yükle
      setNotificationSettings(notificationSettings);
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
  
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-3xl font-bold mb-8">Profilim</h1>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sol kolon - Kullanıcı bilgileri */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="mb-4">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName}
                      width={100}
                      height={100}
                      className="rounded-full mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                      {user.displayName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                <p className="text-foreground/60 mt-1">{user.email}</p>
                
                {/* Takipçi/Takip istatistikleri */}
                <div className="flex justify-center gap-6 mt-4">
                  <Link href="/profil/takipcilerim" className="flex flex-col items-center">
                    <span className="font-bold text-lg">{followStats.followersCount}</span>
                    <span className="text-foreground/60 text-sm">Takipçi</span>
                  </Link>
                  <Link href="/profil/takip-ettiklerim" className="flex flex-col items-center">
                    <span className="font-bold text-lg">{followStats.followingCount}</span>
                    <span className="text-foreground/60 text-sm">Takip</span>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 mt-4">
                  <Button href="/profil/duzenle" variant="outline" className="w-full">
                    Profili Düzenle
                  </Button>
                  <Button href="/profil/kaydedilenler" variant="outline" className="w-full">
                    Kaydedilen İçerikler
                  </Button>
                  {/* YENİ: Koleksiyonlar link'i */}
                  <Button href="/profil/koleksiyonlar" variant="outline" className="w-full">
                    Koleksiyonlarım
                  </Button>
                  <Button href="/bildirimler" variant="outline" className="w-full">
                    Bildirimlerim
                  </Button>
                  
                  {/* Admin için ekstra link */}
                  {userProfile?.role === 'admin' && (
                    <Button href="/admin" variant="primary" className="w-full">
                      Admin Paneli
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Takip Önerileri Kartı */}
            <div className="mt-6">
              <FollowSuggestions limit={3} />
            </div>
          </div>
          
          {/* Sağ kolon - Bildirim tercihleri */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Tercihleri</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin h-5 w-5 border-2 border-primary border-r-transparent rounded-full mb-2"></div>
                    <p>Ayarlar yükleniyor...</p>
                  </div>
                ) : notificationSettings && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Bildirim Kanalları</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">E-posta Bildirimleri</div>
                            <div className="text-sm text-foreground/60">E-posta adresinize bildirim gönderin</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={notificationSettings.email}
                              onChange={(e) => handleUpdateNotificationSettings('email', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Uygulama İçi Bildirimler</div>
                            <div className="text-sm text-foreground/60">Web sitesindeki bildirimler</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={notificationSettings.inApp}
                              onChange={(e) => handleUpdateNotificationSettings('inApp', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Bildirim Türleri</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Beğeniler</div>
                            <div className="text-sm text-foreground/60">İçerikleriniz beğenildiğinde bildirim alın</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={notificationSettings.likes}
                              onChange={(e) => handleUpdateNotificationSettings('likes', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Yorumlar</div>
                            <div className="text-sm text-foreground/60">İçeriklerinize yorum yapıldığında bildirim alın</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={notificationSettings.comments}
                              onChange={(e) => handleUpdateNotificationSettings('comments', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Yanıtlar</div>
                            <div className="text-sm text-foreground/60">Yorumlarınıza yanıt verildiğinde bildirim alın</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={notificationSettings.replies}
                              onChange={(e) => handleUpdateNotificationSettings('replies', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        {/* Yeni: Takip bildirimleri */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Takip Bildirimleri</div>
                            <div className="text-sm text-foreground/60">Biri sizi takip ettiğinde bildirim alın</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={notificationSettings.follows}
                              onChange={(e) => handleUpdateNotificationSettings('follows', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Sistem Bildirimleri</div>
                            <div className="text-sm text-foreground/60">Yeni özellikler ve sistem güncellemeleri hakkında bilgilendirme alın</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={notificationSettings.system}
                              onChange={(e) => handleUpdateNotificationSettings('system', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}