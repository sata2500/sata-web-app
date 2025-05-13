// src/components/blog/blog-categories.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCategories } from '@/lib/blog-service';
import { Category } from '@/types/blog';

interface BlogCategoriesProps {
  className?: string;
}

export const BlogCategories: React.FC<BlogCategoriesProps> = ({ 
  className = '' 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get('kategori');
  
  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Sadece kök kategorileri göster
        const rootCategories = data.filter(cat => !cat.parentId);
        setCategories(rootCategories);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  if (loading) {
    return (
      <div className={`flex overflow-x-auto pb-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="h-8 w-20 bg-background/80 animate-pulse rounded-md mx-1"
          ></div>
        ))}
      </div>
    );
  }
  
  if (categories.length === 0) {
    return null;
  }
  
  return (
    <div className={`flex overflow-x-auto pb-2 ${className}`}>
      <Link 
        href={pathname}
        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium mr-2 whitespace-nowrap transition-colors ${
          !currentCategoryId
            ? 'bg-primary text-white' 
            : 'bg-background hover:bg-background/80'
        }`}
      >
        Tümü
      </Link>
      
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`${pathname}?kategori=${category.id}`}
          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium mr-2 whitespace-nowrap transition-colors ${
            currentCategoryId === category.id
              ? 'bg-primary text-white' 
              : 'bg-background hover:bg-background/80'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};