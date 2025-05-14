// src/lib/utils.ts
import { format, formatDistanceToNow, formatDistance, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

/**
 * CSS sınıflarını birleştirmek için yardımcı fonksiyon
 */
export function cn(...classes: (string | undefined | boolean | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Sunucu saati için Unix timestamp döndürür
 */
export const getServerTimestamp = (): Timestamp => {
  return Timestamp.now();
};

/**
 * Verilen tarih için göreceli zaman formatını döndürür
 * Örnek: "5 dakika önce", "3 saat önce", "2 gün önce"
 */
export const formatRelativeTime = (date: Date | Timestamp | string | number): string => {
  try {
    let parsedDate: Date;
    
    if (date instanceof Timestamp) {
      parsedDate = date.toDate();
    } else if (date instanceof Date) {
      parsedDate = date;
    } else if (typeof date === 'string') {
      parsedDate = parseISO(date);
    } else if (typeof date === 'number') {
      parsedDate = new Date(date);
    } else {
      throw new Error('Geçersiz tarih tipi');
    }
    
    // 1 günden daha yeni ise rölatif zaman kullan
    const isRecent = Date.now() - parsedDate.getTime() < 24 * 60 * 60 * 1000;
    if (isRecent) {
      return formatDistanceToNow(parsedDate, { addSuffix: true, locale: tr });
    }
    // Daha eski ise tam tarih göster
    return format(parsedDate, 'd MMMM yyyy', { locale: tr });
  } catch (error) {
    console.error('Tarih biçimlendirme hatası:', error);
    return '';
  }
};

/**
 * İki tarih arasındaki mesafeyi biçimlendir
 */
export const formatDateDistance = (
  start: Date | Timestamp | string, 
  end: Date | Timestamp | string
): string => {
  try {
    let parsedStart: Date;
    let parsedEnd: Date;
    
    if (start instanceof Timestamp) {
      parsedStart = start.toDate();
    } else if (start instanceof Date) {
      parsedStart = start;
    } else if (typeof start === 'string') {
      parsedStart = parseISO(start);
    } else {
      throw new Error('Geçersiz başlangıç tarihi tipi');
    }
    
    if (end instanceof Timestamp) {
      parsedEnd = end.toDate();
    } else if (end instanceof Date) {
      parsedEnd = end;
    } else if (typeof end === 'string') {
      parsedEnd = parseISO(end);
    } else {
      throw new Error('Geçersiz bitiş tarihi tipi');
    }
    
    return formatDistance(parsedStart, parsedEnd, { locale: tr });
  } catch (error) {
    console.error('Tarih mesafesi biçimlendirme hatası:', error);
    return '';
  }
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
 * Metni belirli bir uzunlukta kısalt
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Belirli bir uzunlukta rastgele ID oluşturur
 */
export const generateId = (length: number = 20): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
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
 * Compact number formatting (1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M, etc.)
 */
export const formatCompactNumber = (num: number): string => {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = Math.sign(num);
  
  if (absNum < 1000) {
    return String(num);
  } else if (absNum < 10000) {
    // 1000-9999 arası bir ondalık basamak göster
    return `${(sign * Math.floor(absNum / 100) / 10).toFixed(1)}B`;
  } else if (absNum < 1000000) {
    // 10000-999999 arası ondalık gösterme
    return `${sign * Math.floor(absNum / 1000)}B`;
  } else if (absNum < 10000000) {
    // 1M-9.9M arası bir ondalık basamak göster
    return `${(sign * Math.floor(absNum / 100000) / 10).toFixed(1)}M`;
  } else {
    // 10M+ ondalık gösterme
    return `${sign * Math.floor(absNum / 1000000)}M`;
  }
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

/**
 * E-posta doğrulama
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * URL doğrulama
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Rastgele bir renk kodu oluştur
 */
export const generateRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

/**
 * Metni slug formatına dönüştür
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Belirli bir aralıkta rastgele sayı üret
 */
export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};