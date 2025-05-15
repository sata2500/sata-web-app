// src/app/profil/koleksiyonlar/metadata.ts
import { createMetadata } from '@/app/metadata';

export const metadata = createMetadata({
  title: 'Koleksiyonlarım',
  description: 'İçeriklerinizi düzenlemek ve kategorilere ayırmak için özel koleksiyonlar oluşturun.',
  path: '/profil/koleksiyonlar',
  noIndex: true, // Kişisel sayfalar indexlenmemeli
});