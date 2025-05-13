// src/app/admin/kategoriler/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CategoryForm } from '@/components/admin/category-form';
import { getCategoryById } from '@/lib/blog-service';
import { Category } from '@/types/blog';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(params.id);
        setCategory(data);
      } catch (err) {
        console.error('Kategori bilgileri yüklenirken hata oluştu:', err);
        setError('Kategori bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [params.id]);
  
  const handleSuccess = () => {
    router.push('/admin/kategoriler');
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !category) {
    return (
      <AdminLayout>
        <div className="container py-8">
          <div className="bg-error/10 text-error p-4 rounded-md">
            {error || 'Kategori bulunamadı.'}
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Kategori Düzenle: {category.name}</h1>
        
        <CategoryForm 
          initialData={category} 
          onSuccess={handleSuccess} 
        />
      </div>
    </AdminLayout>
  );
}