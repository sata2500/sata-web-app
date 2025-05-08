'use client';

import { useState, useEffect } from 'react';
//import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { getBlogPosts } from '@/lib/blog-service';
import { BlogPost } from '@/types/blog';

export function HeroSlider() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const result = await getBlogPosts({ 
          status: 'published',
          featured: true,
          perPage: 5
        });
        setPosts(result.posts);
      } catch (error) {
        console.error('Featured posts loading error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedPosts();
  }, []);
  
  useEffect(() => {
    if (posts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [posts.length]);
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  
  if (loading) {
    return (
      <div className="bg-primary/5 py-24">
        <Container>
          <div className="animate-pulse h-64 rounded-lg bg-card/50"></div>
        </Container>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="bg-primary/5 py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">SaTA Blog</h1>
            <p className="text-xl text-foreground/70 mb-8">Modern Blog ve Öğrenme Platformu</p>
            <Button href="/blog">Blog Yazılarını Keşfet</Button>
          </div>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="bg-primary/5 relative">
      <div className="overflow-hidden">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          >
            <div 
              className="h-96 bg-cover bg-center relative"
              style={{ backgroundImage: post.coverImage ? `url(${post.coverImage})` : 'none' }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <Container className="h-full">
                <div className="flex items-center h-full relative z-10">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h2>
                    <p className="mb-6 text-white/80 line-clamp-2">{post.excerpt}</p>
                    <Button href={`/blog/${post.slug}`} variant="primary">
                      Devamını Oku
                    </Button>
                  </div>
                </div>
              </Container>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots navigation */}
      {posts.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {posts.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-primary' : 'bg-white/50'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}