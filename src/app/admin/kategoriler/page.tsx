// src/app/admin/kategoriler/page.tsx - ESLint hatalarını düzelt
'use client';

import React, { useState, useEffect } from 'react';
// Link yalnızca Button'ın href prop'u içinde kullanılıyor, ayrıca import etmiyoruz
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { getCategories, deleteCategory } from '@/lib/blog-service';
import { Category } from '@/types/blog';

export default function CategoriesPage() {
  // router kullanılmadığı için kaldırdık
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Kategorileri getir
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Kategoriler yüklenirken hata oluştu:', err);
      setError('Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde kategorileri getir
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Kategori silme işlemi
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await deleteCategory(id);
      setSuccessMessage('Kategori başarıyla silindi.');
      // Kategori listesini güncelle
      fetchCategories();
      
      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // any tipini Error ile değiştirdik
      const error = err as Error;
      setError(error.message || 'Kategori silinirken bir hata oluştu.');
      setTimeout(() => setError(null), 5000);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Kategoriler</h1>
          <Button href="/admin/kategoriler/yeni">
            Yeni Kategori Ekle
          </Button>
        </div>
        
        {successMessage && (
          <Alert 
            variant="success" 
            title="Başarılı" 
            className="mb-6"
          >
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert 
            variant="error" 
            title="Hata" 
            className="mb-6"
          >
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-foreground/60">Henüz hiç kategori bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                    Kategori Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                    Üst Kategori
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => {
                  // Üst kategori adını bul
                  const parentCategory = category.parentId 
                    ? categories.find(c => c.id === category.parentId) 
                    : null;
                  
                  return (
                    <tr key={category.id} className="hover:bg-background/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="text-xs text-foreground/60">/{category.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground/80">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parentCategory ? (
                          <span className="text-sm">{parentCategory.name}</span>
                        ) : (
                          <span className="text-xs text-foreground/60">Ana Kategori</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="link"
                          size="sm"
                          href={`/admin/kategoriler/${category.id}`}
                          className="mr-2"
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-error"
                          onClick={() => handleDeleteCategory(category.id!)}
                        >
                          Sil
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}