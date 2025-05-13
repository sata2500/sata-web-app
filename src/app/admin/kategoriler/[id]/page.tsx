// src/app/admin/kategoriler/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CategoryEditor } from '@/components/admin/category-editor';

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params?.id as string;
  
  return (
    <AdminLayout>
      <div className="container py-8">
        <CategoryEditor categoryId={categoryId} />
      </div>
    </AdminLayout>
  );
}