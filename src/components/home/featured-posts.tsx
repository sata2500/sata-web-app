'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { getBlogPosts } from '@/lib/blog-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

export function FeaturedPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await getBlogPosts({ 
          status: 'published', 
          perPage: 6 
        });
        setPosts(result.posts);
      } catch (error) {
        console.error('Posts loading error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-card border border-border rounded-lg">
              <div className="h-40 bg-primary/5 rounded-t-lg"></div>
              <div className="p-5">
                <div className="h-6 bg-primary/5 rounded mb-3"></div>
                <div className="h-4 bg-primary/5 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-primary/5 rounded mb-4"></div>
                <div className="h-4 bg-primary/5 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center p-8 bg-primary/5 rounded-lg">
        <p className="text-lg">Henüz blog yazısı bulunmuyor.</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="transition-transform hover:-translate-y-1">
          <Card className="h-full flex flex-col">
            {post.coverImage && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <Image 
                    src={post.coverImage} 
                    alt={post.title} 
                    width={500}   // Uygun bir genişlik değeri
                    height={300}  // Uygun bir yükseklik değeri - aspect-video oranına uygun
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover' }} // object-fit'i doğrudan style olarak eklemek daha güvenli
                />
              </div>
            )}
            <CardHeader className={post.coverImage ? "pb-3" : "pb-3 pt-6"}>
              <div className="flex gap-2 mb-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="outline">+{post.tags.length - 2}</Badge>
                )}
              </div>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="text-sm text-foreground/60 flex items-center gap-2">
                <span>{formatRelativeTime(post.publishedAt)}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-foreground/30"></span>
                <span>{post.author.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="py-0 flex-grow">
              <p className="text-foreground/80 line-clamp-3">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="pt-4">
              <span className="text-primary font-medium text-sm">Devamını Oku &rarr;</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}