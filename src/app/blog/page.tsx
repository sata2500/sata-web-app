import Link from 'next/link';

// Örnek blog yazıları için veri
const blogPosts = [
  {
    id: 1,
    title: 'SaTA Web Uygulaması Yayında!',
    excerpt: 'SaTA web uygulaması yayın hayatına başladı. Detaylı bilgi için tıklayın.',
    date: '15 Mayıs 2025',
    author: 'SaTA Ekibi',
    slug: 'sata-web-uygulamasi-yayinda',
    category: 'Duyuru'
  },
  {
    id: 2,
    title: 'Modern Web Uygulamalarında SEO Optimizasyonu',
    excerpt: 'Modern web uygulamalarında SEO optimizasyonu nasıl yapılır? İşte detaylar.',
    date: '10 Mayıs 2025',
    author: 'Web Geliştirme Ekibi',
    slug: 'modern-web-uygulamalarinda-seo-optimizasyonu',
    category: 'Web Geliştirme'
  },
  {
    id: 3,
    title: 'Tailwind CSS ile Hızlı UI Geliştirme',
    excerpt: 'Tailwind CSS kullanarak nasıl hızlı ve etkili kullanıcı arayüzleri geliştirebilirsiniz?',
    date: '5 Mayıs 2025',
    author: 'Tasarım Ekibi',
    slug: 'tailwind-css-ile-hizli-ui-gelistirme',
    category: 'Tasarım'
  },
  {
    id: 4,
    title: 'React 19 ile Gelen Yenilikler',
    excerpt: 'React 19 ile birlikte gelen yeni özellikler ve değişiklikler neler?',
    date: '1 Mayıs 2025',
    author: 'Frontend Ekibi',
    slug: 'react-19-ile-gelen-yenilikler',
    category: 'React'
  },
  {
    id: 5,
    title: 'Next.js 15 Yenilikleri ve Performans İyileştirmeleri',
    excerpt: 'Next.js 15 ile gelen yenilikler ve performans iyileştirmeleri hakkında detaylı bilgi.',
    date: '25 Nisan 2025',
    author: 'SaTA Geliştirme Ekibi',
    slug: 'nextjs-15-yenilikleri-performans-iyilestirmeleri',
    category: 'Next.js'
  },
  {
    id: 6,
    title: 'Firebase Authentication Kullanımı',
    excerpt: 'Firebase Authentication ile kullanıcı kimlik doğrulama sistemi nasıl kurulur?',
    date: '20 Nisan 2025',
    author: 'Backend Ekibi',
    slug: 'firebase-authentication-kullanimi',
    category: 'Firebase'
  }
];

export default function BlogPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-gray-500 dark:text-gray-400">
          SaTA ekibi tarafından yazılan en son blog yazıları
        </p>
      </div>
      
      {/* Blog kategorileri */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="inline-flex items-center rounded-md bg-primary-400/10 px-2 py-1 text-xs font-medium text-primary">
          Tümü
        </span>
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Web Geliştirme
        </span>
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Tasarım
        </span>
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          React
        </span>
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Next.js
        </span>
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Firebase
        </span>
      </div>
      
      {/* Blog yazıları grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="card">
            <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
              {/* Placeholder image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Blog görseli
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="inline-flex items-center rounded-md bg-primary-400/10 px-2 py-1 text-xs font-medium text-primary">
                  {post.category}
                </span>
                <time className="text-gray-500 dark:text-gray-400">{post.date}</time>
              </div>
              <div className="space-y-2">
                <h2 className="font-bold text-xl">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary hover:no-underline transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{post.excerpt}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.author}</span>
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Devamını Oku
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}