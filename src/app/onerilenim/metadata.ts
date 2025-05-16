// src/app/onerilenim/metadata.ts
import { createMetadata } from '@/app/metadata';

export const metadata = createMetadata({
  title: 'Önerilerim',
  description: 'Size özel kişiselleştirilmiş içerik önerileri',
  path: '/onerilenim',
  noIndex: true // Kullanıcıya özel sayfa olduğu için indekslemeyi engelle
});