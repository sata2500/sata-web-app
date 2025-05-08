// src/app/blog/page.tsx

import { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { BlogPostGrid } from '@/components/blog/blog-post-grid';
import { BlogTagFilter } from '@/components/blog/blog-tag-filter';
import { SchemaMarkup } from '@/components/seo/schema-markup';
import { getBlogTags } from '@/lib/blog-service';
import { createMetadata } from '@/app/metadata';

// Meta veri
export const metadata: Metadata = createMetadata({
  title: 'Blog',
  description: 'Yazılım ve teknoloji dünyasından en güncel haberler, makaleler ve öğreticiler.',
  path: '/blog'
});

export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: { tag?: string } 
}) {
  // searchParams'ı await et - Next.js 15'te zorunlu
  const params = await searchParams;
  const selectedTag = params.tag || '';
  const tags = await getBlogTags();
  
  return (
    <>
      <SchemaMarkup type="blog" />
      
      <Container>
        <div className="py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
          
          {/* Etiket filtresi */}
          <div className="mb-12">
            <BlogTagFilter tags={tags} selectedTag={selectedTag} />
          </div>
          
          {/* Blog yazıları grid */}
          <BlogPostGrid selectedTag={selectedTag} />
        </div>
      </Container>
    </>
  );
}