'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPostBySlug, getRelatedPosts, BlogPost } from '@/services/blog-service';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function loadPost() {
      try {
        if (typeof slug !== 'string') {
          throw new Error('Geçersiz slug parametresi');
        }
        
        const postData = await getPostBySlug(slug);
        
        if (!postData) {
          setError('Blog yazısı bulunamadı');
          setLoading(false);
          return;
        }
        
        setPost(postData);
        
        // İlgili yazıları getir
        const related = await getRelatedPosts(postData, 3);
        setRelatedPosts(related);
      } catch (err) {
        console.error('Blog yazısı yüklenirken hata oluştu:', err);
        setError('Blog yazısı yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }
    
    loadPost();
  }, [slug]);
  
  // Örnek veri (Firebase kurulumu olmadığı için)
  const examplePost = {
    title: 'SaTA Web Uygulaması Yayında!',
    excerpt: 'SaTA web uygulaması yayın hayatına başladı. Detaylı bilgi için tıklayın.',
    content: `
      <p>SaTA web uygulaması artık yayında! Bu uzun zamandır üzerinde çalıştığımız bir proje ve sonunda sizlerle buluşturmanın heyecanını yaşıyoruz.</p>
      
      <h2>SaTA Nedir?</h2>
      <p>SaTA, blog ve çeşitli uygulamalar sunan modern bir web platformudur. Amacımız kullanıcılara kaliteli içerik ve kullanışlı araçlar sunmaktır.</p>
      
      <h2>Neler Sunuyoruz?</h2>
      <p>SaTA platformunda şu an için blog içerikleri sunuyoruz. Yakın zamanda SaTA Öğrenme Yönetim Sistemi (SaTA-ÖYS), SaTA Müzik gibi farklı uygulamaları da platformumuza ekleyeceğiz.</p>
      
      <h2>Teknolojilerimiz</h2>
      <p>SaTA web uygulaması, modern web teknolojileri kullanılarak geliştirilmiştir:</p>
      <ul>
        <li>Next.js</li>
        <li>React</li>
        <li>TypeScript</li>
        <li>Tailwind CSS</li>
        <li>Firebase</li>
      </ul>
      
      <h2>Bizimle İletişime Geçin</h2>
      <p>SaTA hakkında sorularınız veya önerileriniz varsa, lütfen bizimle iletişime geçmekten çekinmeyin. İletişim sayfamızdan veya info@sata.com.tr adresinden bize ulaşabilirsiniz.</p>
    `,
    author: {
      id: '1',
      name: 'SaTA Ekibi',
      image: '/images/authors/team.jpg'
    },
    category: 'Duyuru',
    tags: ['duyuru', 'SaTA', 'web'],
    createdAt: new Date('2025-05-15'),
    updatedAt: new Date('2025-05-15'),
    published: true,
    featured: true
  };
  
  // Örnek ilgili yazılar (Firebase kurulumu olmadığı için)
  const exampleRelatedPosts = [
    {
      id: '2',
      title: 'Modern Web Uygulamalarında SEO Optimizasyonu',
      excerpt: 'Modern web uygulamalarında SEO optimizasyonu nasıl yapılır? İşte detaylar.',
      slug: 'modern-web-uygulamalarinda-seo-optimizasyonu',
      author: {
        id: '2',
        name: 'Web Geliştirme Ekibi'
      },
      category: 'Web Geliştirme',
      tags: ['SEO', 'web geliştirme'],
      createdAt: new Date('2025-05-10'),
      updatedAt: new Date('2025-05-10'),
      published: true
    },
    {
      id: '3',
      title: 'Tailwind CSS ile Hızlı UI Geliştirme',
      excerpt: 'Tailwind CSS kullanarak nasıl hızlı ve etkili kullanıcı arayüzleri geliştirebilirsiniz?',
      slug: 'tailwind-css-ile-hizli-ui-gelistirme',
      author: {
        id: '3',
        name: 'Tasarım Ekibi'
      },
      category: 'Tasarım',
      tags: ['CSS', 'Tailwind', 'UI'],
      createdAt: new Date('2025-05-05'),
      updatedAt: new Date('2025-05-05'),
      published: true
    }
  ];
  
  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Hata: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-6">
          <Link href="/blog" className="btn btn-primary">
            Blog Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }
  
  // Firebase bağlantısı olmadığı için örnek veriyi kullan
  const currentPost = post || examplePost;
  const currentRelatedPosts = relatedPosts.length > 0 ? relatedPosts : exampleRelatedPosts;
  
  // Tarih formatı
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="container py-8 md:py-12">
      <article className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-sm text-primary flex items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Blog sayfasına dön
        </Link>
        
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-sm mb-3">
            <span className="inline-flex items-center rounded-md bg-primary-400/10 px-2 py-1 text-xs font-medium text-primary">
              {currentPost.category}
            </span>
            <time className="text-gray-500 dark:text-gray-400">
              {formatDate(currentPost.createdAt instanceof Date ? currentPost.createdAt : new Date(currentPost.createdAt.seconds * 1000))}
            </time>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentPost.title}</h1>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Yazar: {currentPost.author.name}
            </span>
          </div>
        </header>
        
        <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-gray-800 mb-8 rounded-lg overflow-hidden">
          {/* Placeholder image */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Blog görseli
          </div>
        </div>
        
        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: currentPost.content }}
        />
        
        <footer className="mt-12 pt-6 border-t">
          <div className="flex flex-wrap gap-2">
            {currentPost.tags.map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>
      </article>
      
      {/* İlgili yazılar */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6">İlgili Yazılar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentRelatedPosts.map((relatedPost) => (
            <div key={relatedPost.id} className="card h-full">
              <div className="relative h-40 bg-gray-200 dark:bg-gray-800">
                {/* Placeholder image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Blog görseli
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2">
                  <Link 
                    href={`/blog/${relatedPost.slug}`}
                    className="hover:text-primary hover:no-underline transition-colors"
                  >
                    {relatedPost.title}
                  </Link>
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {formatDate(relatedPost.createdAt instanceof Date ? relatedPost.createdAt : new Date(relatedPost.createdAt.seconds * 1000))}
                </div>
                <Link 
                  href={`/blog/${relatedPost.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Devamını Oku
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}