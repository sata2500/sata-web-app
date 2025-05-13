// src/app/admin/kategoriler/yeni/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CategoryForm } from '@/components/admin/category-form';

export default function NewCategoryPage() {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/admin/kategoriler');
  };
  
  return (
    <AdminLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Yeni Kategori Ekle</h1>
        
        <CategoryForm onSuccess={handleSuccess} />
      </div>
    </AdminLayout>
  );
}