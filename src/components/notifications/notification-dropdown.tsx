// src/components/notifications/notification-dropdown.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { 
  getUserNotifications, 
  markAllNotificationsAsRead, 
  subscribeToUserNotifications
} from '@/lib/notification-service';
import { Notification } from '@/types/notification';
import { NotificationItem } from './notification-item';
import { Button } from '@/components/ui/button';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Kullanıcı bildirimleri yükleme
  useEffect(() => {
    if (!user || !isOpen) return;
    
    const loadNotifications = async () => {
      setLoading(true);
      
      try {
        const userNotifications = await getUserNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
    
    // Gerçek zamanlı bildirim aboneliği
    const unsubscribe = subscribeToUserNotifications(user.id, (updatedNotifications) => {
      setNotifications(updatedNotifications);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user, isOpen]);
  
  // Dışarı tıklama ile kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Bildirim okundu olarak işaretleme
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
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
    >
      {/* Başlık */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="font-medium">Bildirimler</h3>
        <Button 
          onClick={handleMarkAllAsRead} 
          variant="ghost" 
          size="sm"
          className="text-xs"
        >
          Tümünü okundu işaretle
        </Button>
      </div>
      
      {/* Bildirim listesi */}
      <div className="overflow-y-auto max-h-[350px]">
        {loading ? (
          <div className="p-4 text-center text-foreground/70">
            <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Bildirimler yükleniyor...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-foreground/70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Bildiriminiz bulunmuyor
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleNotificationRead}
            />
          ))
        )}
      </div>
      
      {/* Alt kısım */}
      <div className="border-t border-border p-3 text-center">
        <Button 
          variant="link" 
          size="sm"
          className="text-xs"
          href="/bildirimler"
          onClick={onClose}
        >
          Tüm bildirimleri gör
        </Button>
      </div>
    </div>
  );
}