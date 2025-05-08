// src/lib/utils.ts
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Sunucu saati için Unix timestamp döndürür
 */
export const getServerTimestamp = (): number => {
  return Date.now();
};

/**
 * Verilen tarih için göreceli zaman formatını döndürür
 * Örnek: "5 dakika önce", "3 saat önce", "2 gün önce"
 */
export const formatRelativeTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  // 1 günden daha yeni ise rölatif zaman kullan
  const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
  if (isRecent) {
    return formatDistanceToNow(date, { addSuffix: true, locale: tr });
  }
  // Daha eski ise tam tarih göster
  return format(date, 'd MMMM yyyy', { locale: tr });
};

/**
 * HTML içeriğinden düz metin oluşturur
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * HTML içeriğinden kısaltılmış özetini oluşturur
 */
export const createExcerpt = (html: string, maxLength: number = 160): string => {
  const text = stripHtml(html).trim();
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Belirli bir uzunlukta rastgele ID oluşturur
 */
export const generateId = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

/**
 * Verilen nesneyi belirli alanlara göre sıralar
 */
export const sortByField = <T>(array: T[], field: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Dosya boyutunu okunaklı formata dönüştürür
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Bir metin içinde belirli bir anahtar kelimeye göre vurgulama yapar
 */
export const highlightText = (text: string, query: string): string => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  // index parametresini (_) ile belirttik, çünkü kullanmıyoruz
  return parts.map((part) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return `<mark>${part}</mark>`;
    }
    return part;
  }).join('');
};