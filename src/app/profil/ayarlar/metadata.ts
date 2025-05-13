// src/app/profil/ayarlar/metadata.ts
import { createMetadata } from '@/app/metadata';

export const metadata = createMetadata({
  title: 'Profil Ayarları',
  description: 'SaTA hesap ayarlarınızı yönetin',
  path: '/profil/ayarlar',
  noIndex: true, // Kullanıcı profil sayfaları indekslenmemeli
});