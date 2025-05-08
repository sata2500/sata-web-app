// src/components/blog/blog-tag-filter.tsx
'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface BlogTagFilterProps {
  tags: string[];
  selectedTag: string;
}

export const BlogTagFilter: React.FC<BlogTagFilterProps> = ({ 
  tags, 
  selectedTag 
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleTagSelect = (tag: string) => {
    // Zaten seçili etiketi tekrar seçince filtreyi kaldır
    if (tag === selectedTag) {
      router.push(pathname);
    } else {
      router.push(`${pathname}?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* Badge'i bir button içine sarmalayarak onClick özelliğini butona ekliyoruz */}
      <button 
        onClick={() => router.push(pathname)}
        className="cursor-pointer"
        type="button"
      >
        <Badge 
          variant={!selectedTag ? 'primary' : 'outline'}
          className="text-sm py-1 px-3"
        >
          Tümü
        </Badge>
      </button>
      
      {tags.map((tag) => (
        <button 
          key={tag}
          onClick={() => handleTagSelect(tag)}
          className="cursor-pointer"
          type="button"
        >
          <Badge
            variant={tag === selectedTag ? 'primary' : 'outline'}
            className="text-sm py-1 px-3"
          >
            {tag}
          </Badge>
        </button>
      ))}
    </div>
  );
};