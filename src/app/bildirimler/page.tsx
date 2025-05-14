// src/app/bildirimler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/components/notifications/notification-item';
import { useAuth } from '@/context/auth-context';
import { 
  getUserNotifications, 
  markAllNotificationsAsRead, 
  deleteAllNotifications 
} from '@/lib/notification-service';
import { Notification } from '@/types/notification';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/bildirimler');
    }
  }, [user, loading, router]);
  
  // Bildirimleri yükle
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const userNotifications = await getUserNotifications(user.id, 100);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadNotifications();
    }
  }, [user]);
  
  // Bildirimi okundu olarak işaretle
  const handleNotificationRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id 
          ? { ...notification, status: 'read' } 
          : notification
      )
    );
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      
      // UI'da güncelle
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          status: 'read'
        }))
      );
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
    }
  };
  
  // Tüm bildirimleri temizle
  const handleClearAll = async () => {
    if (!user || !window.confirm('Tüm bildirimlerinizi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteAllNotifications(user.id);
      setNotifications([]);
    } catch (error) {
      console.error('Bildirimler silinirken hata:', error);
    }
  };
  
  // Filtrelenen bildirimleri al
  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(notification => notification.status === 'unread');
  
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
      <div className="max-w-3xl mx-auto py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Bildirimlerim</h1>
          
          <div className="flex flex-wrap gap-2">
            {/* Filtre butonları */}
            <div className="inline-flex rounded-md border p-1 mr-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tümü
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Okunmamış
              </Button>
            </div>
            
            {/* İşlem butonları */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={notifications.every(n => n.status === 'read')}
            >
              Tümünü Okundu İşaretle
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Tümünü Temizle
            </Button>
          </div>
        </div>
        
        {/* Bildirim listesi */}
        <div className="border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin h-6 w-6 border-2 border-primary border-r-transparent rounded-full mb-2"></div>
              <p>Bildirimler yükleniyor...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1} 
                stroke="currentColor" 
                className="w-12 h-12 mx-auto mb-4 text-foreground/30"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <p className="text-lg font-medium mb-1">Bildirim Bulunamadı</p>
              <p className="text-foreground/60">
                {filter === 'unread' 
                  ? 'Okunmamış bildiriminiz bulunmuyor.' 
                  : 'Henüz hiç bildiriminiz bulunmuyor.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onRead={handleNotificationRead}
              />
            ))
          )}
        </div>
      </div>
    </Container>
  );
}