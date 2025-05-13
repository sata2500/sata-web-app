// src/lib/permissions.ts
import { UserProfile } from '@/types/user';

// Tüm izinleri içeren enum
export enum Permission {
  // Blog izinleri
  BLOG_CREATE = 'blog:create',
  BLOG_EDIT = 'blog:edit',
  BLOG_EDIT_OWN = 'blog:edit:own',
  BLOG_DELETE = 'blog:delete',
  BLOG_DELETE_OWN = 'blog:delete:own',
  BLOG_PUBLISH = 'blog:publish',
  
  // Yorum izinleri
  COMMENT_MODERATE = 'comment:moderate',
  
  // Kategori izinleri
  CATEGORY_MANAGE = 'category:manage',
  
  // Etiket izinleri
  TAG_MANAGE = 'tag:manage',
  
  // Kullanıcı izinleri
  USER_VIEW = 'user:view',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',
  
  // Ayarlar izinleri
  SETTINGS_MANAGE = 'settings:manage',
  
  // Sistem izinleri
  ADMIN_ACCESS = 'admin:access',
  SUPER_ADMIN = 'super:admin'
}

// Önce her rol için izinleri ayrı ayrı tanımlayalım, böylece kullanmadan önce tanımlanmış olurlar
const userPermissions: Permission[] = [
  Permission.BLOG_EDIT_OWN,
  Permission.BLOG_DELETE_OWN
];

const editorPermissions: Permission[] = [
  ...userPermissions, // Kullanıcı izinlerini devral
  Permission.BLOG_CREATE,
  Permission.BLOG_EDIT,
  Permission.BLOG_PUBLISH,
  Permission.COMMENT_MODERATE
];

const adminPermissions: Permission[] = [
  // Tüm izinler
  ...Object.values(Permission)
];

// Her rol için izinler haritası
const rolePermissions: Record<string, Permission[]> = {
  'user': userPermissions,
  'editor': editorPermissions,
  'admin': adminPermissions
};

// Kullanıcının belirli bir izne sahip olup olmadığını kontrol et
export function hasPermission(user: UserProfile | null, permission: Permission): boolean {
  // Kullanıcı yoksa izin verilmez
  if (!user) return false;
  
  // Kullanıcının rolünü al
  const role = user.role || 'user';
  
  // Admin her şeyi yapabilir
  if (role === 'admin') return true;
  
  // Rolün izinlerini kontrol et
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

// Kullanıcının izinlerini al
export function getUserPermissions(user: UserProfile | null): Permission[] {
  if (!user) return [];
  
  const role = user.role || 'user';
  return rolePermissions[role] || [];
}

// Kullanıcının admin paneline erişim izni var mı?
export function canAccessAdmin(user: UserProfile | null): boolean {
  return hasPermission(user, Permission.ADMIN_ACCESS);
}