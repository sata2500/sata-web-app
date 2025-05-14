// src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { CommentSection } from '@/components/blog/comment-section';
import { SchemaMarkup } from '@/components/seo/schema-markup';
import { BlogViewTracker } from '@/components/blog/blog-view-tracker';
import { InteractionBar } from '@/components/interactions/interaction-bar';
import { getBlogPostBySlug } from '@/lib/blog-service';
import { createMetadata } from '@/app/metadata';

// Dinamik meta veri oluşturma
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  // params'ı await et - Next.js 15'te zorunlu
  const paramsData = await params;
  
  const post = await getBlogPostBySlug(paramsData.slug);
  if (!post) {
    return createMetadata({
      title: 'Yazı Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı.',
      path: `/blog/${paramsData.slug}`,
      noIndex: true
    });
  }
  
  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    ogImage: post.coverImage || undefined,
  });
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // params'ı await et - Next.js 15'te zorunlu
  const paramsData = await params;
  
  const post = await getBlogPostBySlug(paramsData.slug);
  if (!post || post.status !== 'published') {
    notFound();
  }
  
  const publishDate = new Date(post.publishedAt);
  const updateDate = new Date(post.updatedAt);
  const isUpdated = updateDate.getTime() > publishDate.getTime() + 1000 * 60 * 5; // 5 dakikadan daha sonra güncellendiyse
  
  return (
    <>
      <SchemaMarkup type="blogPost" data={post} />
      <BlogViewTracker postId={post.id as string} />
      <Container>
        <article className="max-w-3xl mx-auto py-12">
          {/* Başlık ve meta bilgiler */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    {post.author.name[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium">{post.author.name}</div>
                  <div className="text-sm text-foreground/60">
                    <time dateTime={publishDate.toISOString()}>
                      {format(publishDate, 'PPP', { locale: tr })}
                    </time>
                    {isUpdated && (
                      <span> (Son güncelleme: {format(updateDate, 'PPP', { locale: tr })})</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Etkileşim çubuğu */}
              <InteractionBar 
                contentId={post.id as string}
                contentType="blog_post"
                contentTitle={post.title}
                contentUrl={`/blog/${post.slug}`}
                variant="horizontal"
                size="md"
              />
            </div>
          </header>
          
          {/* Kapak resmi */}
          {post.coverImage && (
            <figure className="mb-8 relative">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={630}
                className="rounded-lg"
                priority
              />
            </figure>
          )}
          
          {/* İçerik */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert mb-10"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Etkileşim çubuğu (alt) */}
          <div className="border-t border-b py-6 my-8">
            <div className="flex items-center justify-between">
              <div className="text-xl font-medium">Bu yazıyı beğendiniz mi?</div>
              <InteractionBar 
                contentId={post.id as string}
                contentType="blog_post"
                contentTitle={post.title}
                contentUrl={`/blog/${post.slug}`}
                variant="horizontal"
                size="lg"
              />
            </div>
          </div>
          
          {/* Yorumlar */}
          <CommentSection postId={post.id as string} />
        </article>
      </Container>
    </>
  );
}