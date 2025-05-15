// src/lib/notification-service.ts

import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument, 
  queryCollection,
  getCollectionRef
} from '@/lib/firebase-service';
import { generateId } from '@/lib/utils';
import { onSnapshot, query, where, orderBy, limit, Unsubscribe } from 'firebase/firestore';
import { 
  Notification, 
  NotificationPreferences
} from '@/types/notification';
import { getUserProfile } from '@/lib/user-service'; // Takip bildirimi için eklendi

// Koleksiyon adları
const NOTIFICATION_COLLECTION = 'notifications';
const NOTIFICATION_PREFERENCES_COLLECTION = 'notification_preferences';

// Unix timestamp alındığından emin olmak için yardımcı fonksiyon
const getCurrentTimestamp = (): number => {
  return Date.now();
};

// Bildirim oluşturma
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<string> => {
  const notificationId = generateId(20);
  const timestamp = getCurrentTimestamp();
  
  // Bildirim tercihleri kontrolü (gerçek uygulamada bunu kontrol edebilirsiniz)
  // const preferences = await getNotificationPreferences(notification.recipientId);
  // if (!preferences.inApp || !preferences[notification.type]) {
  //   return ''; // Kullanıcı bu tür bildirimleri almak istemiyor
  // }
  
  const newNotification: Notification = {
    id: notificationId,
    createdAt: timestamp,
    ...notification
  };
  
  await setDocument(NOTIFICATION_COLLECTION, notificationId, newNotification);
  return notificationId;
};

// Bildirimi okundu olarak işaretleme
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  await updateDocument(NOTIFICATION_COLLECTION, notificationId, {
    status: 'read'
  });
};

// Tüm bildirimleri okundu olarak işaretleme
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  const notifications = await queryCollection<Notification>({
    collectionPath: NOTIFICATION_COLLECTION,
    conditions: [
      { field: 'recipientId', operator: '==', value: userId },
      { field: 'status', operator: '==', value: 'unread' }
    ],
    limitCount: 100
  });
  
  // Okundu olarak işaretle
  const updatePromises = notifications.data.map(notification => 
    updateDocument(NOTIFICATION_COLLECTION, notification.id as string, {
      status: 'read'
    })
  );
  
  await Promise.all(updatePromises);
};

// Bildirim silme
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await deleteDocument(NOTIFICATION_COLLECTION, notificationId);
};

// Kullanıcının tüm bildirimlerini silme
export const deleteAllNotifications = async (
  userId: string
): Promise<void> => {
  const notifications = await queryCollection<Notification>({
    collectionPath: NOTIFICATION_COLLECTION,
    conditions: [
      { field: 'recipientId', operator: '==', value: userId }
    ],
    limitCount: 500
  });
  
  // Sil
  const deletePromises = notifications.data.map(notification => 
    deleteDocument(NOTIFICATION_COLLECTION, notification.id as string)
  );
  
  await Promise.all(deletePromises);
};

// Kullanıcının bildirimlerini getirme
export const getUserNotifications = async (
  userId: string,
  limit: number = 20,
  onlyUnread: boolean = false
): Promise<Notification[]> => {
  const conditions = [
    { field: 'recipientId', operator: '==', value: userId }
  ];
  
  if (onlyUnread) {
    conditions.push({ field: 'status', operator: '==', value: 'unread' });
  }
  
  const result = await queryCollection<Notification>({
    collectionPath: NOTIFICATION_COLLECTION,
    conditions,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: limit
  });
  
  return result.data;
};

// Okunmamış bildirim sayısını getirme
export const getUnreadNotificationCount = async (
  userId: string
): Promise<number> => {
  const result = await queryCollection<Notification>({
    collectionPath: NOTIFICATION_COLLECTION,
    conditions: [
      { field: 'recipientId', operator: '==', value: userId },
      { field: 'status', operator: '==', value: 'unread' }
    ],
    limitCount: 100
  });
  
  return result.data.length;
};

// Kullanıcının bildirimlerine gerçek zamanlı abone olma
export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe => {
  const notificationsRef = getCollectionRef<Notification>(NOTIFICATION_COLLECTION);
  
  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback(notifications);
  });
};

// Okunmamış bildirim sayısına gerçek zamanlı abone olma
export const subscribeToUnreadNotificationCount = (
  userId: string,
  callback: (count: number) => void
): Unsubscribe => {
  const notificationsRef = getCollectionRef<Notification>(NOTIFICATION_COLLECTION);
  
  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    where('status', '==', 'unread')
  );
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.length);
  });
};

// Bildirim tercihlerini getirme
export const getUserNotificationSettings = async (
  userId: string
): Promise<NotificationPreferences> => {
  const preferences = await getDocument<NotificationPreferences>(
    NOTIFICATION_PREFERENCES_COLLECTION, 
    userId
  );
  
  if (preferences) {
    return preferences;
  }
  
  // Varsayılan bildirim tercihleri
  const defaultPreferences: NotificationPreferences = {
    userId,
    email: true,
    push: true,
    inApp: true,
    likes: true,
    comments: true,
    replies: true,
    mentions: true,
    follows: true,
    system: true
  };
  
  // Varsayılan tercihleri kaydet
  await setDocument(NOTIFICATION_PREFERENCES_COLLECTION, userId, defaultPreferences);
  
  return defaultPreferences;
};

// Bildirim tercihlerini güncelleme
export const updateUserNotificationSettings = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  await updateDocument(NOTIFICATION_PREFERENCES_COLLECTION, userId, preferences);
};

// Tüm bildirimleri açma/kapama
export const toggleAllNotifications = async (
  userId: string,
  enabled: boolean
): Promise<void> => {
  const allTypes = {
    email: enabled,
    push: enabled,
    inApp: enabled,
    likes: enabled,
    comments: enabled,
    replies: enabled,
    mentions: enabled,
    follows: enabled,
    system: enabled
  };
  
  await updateUserNotificationSettings(userId, allTypes);
};

// Hoş geldin bildirimi oluşturma (örneğin, yeni kayıtlarda)
export const createWelcomeNotification = async (
  userId: string,
  userName: string
): Promise<void> => {
  await createNotification({
    recipientId: userId,
    type: 'welcome',
    title: 'SaTA\'ya Hoş Geldiniz',
    message: `Merhaba ${userName}! SaTA platformuna hoş geldiniz. Blog yazılarını keşfetmeye başlayabilir, kendi içeriklerinizi oluşturabilirsiniz.`,
    link: '/',
    status: 'unread',
  });
};

// Zamanaşımına uğramış bildirimleri temizleme (örn. bir zamanlanmış işlemde kullanılabilir)
export const cleanupExpiredNotifications = async (): Promise<void> => {
  try {
    const now = getCurrentTimestamp();
    
    const result = await queryCollection<Notification>({
      collectionPath: NOTIFICATION_COLLECTION,
      conditions: [
        { field: 'expiresAt', operator: '<', value: now }
      ],
      limitCount: 500
    });
    
    const deletePromises = result.data.map(notification => 
      deleteDocument(NOTIFICATION_COLLECTION, notification.id as string)
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Bildirimleri temizlerken hata:', error);
  }
};

// Takip bildirimini oluşturma fonksiyonu
export const createFollowNotification = async (followerId: string, followedId: string): Promise<void> => {
  try {
    // Takipçi bilgilerini al
    const follower = await getUserProfile(followerId);
    
    if (!follower) return;
    
    // Takip edilen kullanıcı için bildirim oluştur
    await createNotification({
      recipientId: followedId,
      senderId: followerId,
      senderName: follower.displayName,
      senderPhoto: follower.photoURL || undefined,
      type: 'follow',
      title: 'Yeni Takipçi',
      message: `${follower.displayName} sizi takip etmeye başladı.`,
      link: `/profil/${followerId}`,
      status: 'unread',
    });
  } catch (error) {
    console.error('Takip bildirimi oluşturulurken hata:', error);
  }
};