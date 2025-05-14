// src/types/notification.ts

// Bildirim tipleri
export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'reply' 
  | 'mention' 
  | 'follow' 
  | 'system' 
  | 'welcome';

// Bildirim durumları
export type NotificationStatus = 'unread' | 'read';

// Bildirim modeli
export interface Notification {
  id?: string;
  recipientId: string; // Bildirimin alıcısı
  senderId?: string;   // Bildirimi tetikleyen kullanıcı (sistem bildirimleri için boş olabilir)
  senderName?: string; // Gönderenin adı (UI için)
  senderPhoto?: string; // Gönderenin fotoğrafı (UI için)
  type: NotificationType;
  contentId?: string;  // İlgili içeriğin ID'si (blog yazısı, yorum vb.)
  contentType?: string; // İçerik tipi (blog_post, comment vb.)
  title: string;       // Bildirim başlığı
  message: string;     // Bildirim mesajı
  link?: string;       // Yönlendirme linki
  status: NotificationStatus;
  createdAt: number;   // Unix timestamp
  expiresAt?: number;  // Opsiyonel son geçerlilik tarihi - Unix timestamp
}

// Bildirim tercihleri
export interface NotificationPreferences {
  userId: string;
  email: boolean;      // E-posta bildirimleri aktif mi?
  push: boolean;       // Push bildirimleri aktif mi?
  inApp: boolean;      // Uygulama içi bildirimler aktif mi?
  
  // Bildirim kategorileri
  likes: boolean;      // Beğeni bildirimleri
  comments: boolean;   // Yorum bildirimleri
  replies: boolean;    // Yanıt bildirimleri
  mentions: boolean;   // Etiketlenme bildirimleri
  follows: boolean;    // Takip bildirimleri
  system: boolean;     // Sistem bildirimleri
}