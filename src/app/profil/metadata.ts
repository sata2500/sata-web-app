// src/app/profil/metadata.ts
import { createMetadata } from '@/app/metadata';

export const metadata = createMetadata({
  title: 'Profil',
  description: 'SaTA kullanıcı profil sayfası',
  path: '/profil',
  noIndex: true, // Kullanıcı profilleri indekslenmemeli
});