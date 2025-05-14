// src/components/notifications/notification-item.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { Notification } from '@/types/notification';
import { markNotificationAsRead } from '@/lib/notification-service';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Tarih formatını oluştur
  const formattedDate = notification.createdAt 
    ? formatRelativeTime(notification.createdAt) 
    : '';
  
  // Bildirim simgesini belirle
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'reply':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.404 14.596A6.5 6.5 0 1116.5 10a1.25 1.25 0 01-2.5 0 4 4 0 10-.571 2.06A2.75 2.75 0 0018 10a8 8 0 10-2.343 5.657.75.75 0 00-1.06-1.06 6.5 6.5 0 01-9.193 0zM10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'welcome':
      case 'system':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  // Okundu olarak işaretle
  const handleMarkAsRead = async () => {
    if (notification.status === 'read' || isLoading) return;
    
    setIsLoading(true);
    
    try {
      await markNotificationAsRead(notification.id as string);
      if (onRead) {
        onRead(notification.id as string);
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bildirim içeriği
  const notificationContent = (
    <div 
      className={`flex p-3 gap-3 border-b border-border transition-colors hover:bg-primary/5 cursor-pointer ${
        notification.status === 'unread' ? 'bg-primary/5' : ''
      }`}
      onClick={handleMarkAsRead}
    >
      {/* Bildirim gönderen veya simge */}
      {notification.senderPhoto ? (
        <Image
          src={notification.senderPhoto}
          alt={notification.senderName || 'Kullanıcı'}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        getIcon()
      )}
      
      {/* Bildirim içeriği */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm line-clamp-2">{notification.message}</div>
        <div className="text-xs text-foreground/60 mt-1">{formattedDate}</div>
      </div>
      
      {/* Okunmamış göstergesi */}
      {notification.status === 'unread' && (
        <div className="w-2 h-2 rounded-full bg-primary self-center"></div>
      )}
    </div>
  );
  
  return notification.link ? (
    <Link href={notification.link} onClick={handleMarkAsRead}>
      {notificationContent}
    </Link>
  ) : (
    notificationContent
  );
}