// src/components/admin/category-form.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { getCategories, createCategory, updateCategory } from '@/lib/blog-service';
import { Category } from '@/types/blog';

interface CategoryFormProps {
  initialData?: Category;
  onSuccess?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ 
  initialData, 
  onSuccess 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [parentId, setParentId] = useState<string | null>(initialData?.parentId || null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Eğer düzenleme modundaysa, şu anki kategoriyi filtreliyoruz (kendisini üst kategori olarak seçemesin)
        const filteredCategories = initialData 
          ? data.filter(category => category.id !== initialData.id) 
          : data;
        setCategories(filteredCategories);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchCategories();
  }, [initialData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Kategori adı boş olamaz.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (initialData) {
        // Güncelleme işlemi
        await updateCategory(initialData.id!, {
          name,
          slug: slug || undefined, // Slug boşsa otomatik oluşturulsun
          description,
          parentId
        });
        setSuccessMessage('Kategori başarıyla güncellendi.');
      } else {
        // Oluşturma işlemi
        await createCategory({
          name,
          slug,
          description,
          parentId
        });
        setSuccessMessage('Kategori başarıyla oluşturuldu.');
        
        // Formu temizle (sadece oluşturma işleminde)
        if (!initialData) {
          setName('');
          setSlug('');
          setDescription('');
          setParentId(null);
        }
      }
      
      // Başarı fonksiyonunu çağır
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
        } catch (err: unknown) { // any yerine unknown kullandık
        const error = err as Error;
        console.error('Kategori kaydedilirken hata oluştu:', err);
        setError(error.message || 'Kategori kaydedilirken bir hata oluştu.');
        } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-card border border-border rounded-lg p-6">
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Kategori Adı <span className="text-error">*</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kategori adını girin"
            required
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug (URL)
          </label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="kategori-slug (boş bırakılırsa otomatik oluşturulur)"
          />
          <small className="text-foreground/60 text-xs">
            Boş bırakırsanız kategori adından otomatik oluşturulur.
          </small>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Açıklama
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bu kategori hakkında kısa bir açıklama"
          />
        </div>
        
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium mb-1">
            Üst Kategori
          </label>
          <select
            id="parentId"
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value || null)}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Ana Kategori (Üst kategori yok)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
          >
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2">
                  {initialData ? 'Güncelleniyor' : 'Oluşturuluyor'}
                </span>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              </>
            ) : (
              initialData ? 'Güncelle' : 'Oluştur'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};