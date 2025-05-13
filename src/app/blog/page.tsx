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
  searchParams: Promise<{ tag?: string }> 
}) {
  // searchParams'ı await et - Next.js 15'te zorunlu
  const params = await searchParams;
  // searchParams'tan tag değerini string olarak al
  const selectedTag = params.tag || '';
  const tags = await getBlogTags();
  
  return (
    <>
      {/* data prop'unu ekliyoruz */}
      <SchemaMarkup 
        type="website" 
        data={{
          name: 'SaTA Blog',
          url: 'https://sata.com/blog',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://sata.com/blog/arama?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }}
      />
      
      <Container>
        <div className="py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
          
          {/* Etiket filtresi */}
          <div className="mb-12">
            <BlogTagFilter tags={tags} selectedTag={selectedTag} />
          </div>
          
          {/* Blog yazıları grid - key ekleyerek React'a yeniden render etmesini sağla */}
          <BlogPostGrid selectedTag={selectedTag} key={`blog-grid-${selectedTag}`} />
        </div>
      </Container>
    </>
  );
}