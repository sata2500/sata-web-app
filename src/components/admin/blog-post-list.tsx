// src/components/admin/blog-post-list.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getBlogPosts, deleteBlogPost } from '@/lib/blog-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { BlogPost } from '@/types/blog';
import { formatRelativeTime } from '@/lib/utils';

export const BlogPostList: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await getBlogPosts({ 
        status: filter === 'all' ? 'all' : filter, 
        perPage: 50 
      });
      setPosts(result.posts);
    } catch (err) {
      console.error('Blog yazıları yüklenirken hata oluştu:', err);
      setError('Blog yazıları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await deleteBlogPost(id);
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      console.error('Blog yazısı silinirken hata oluştu:', err);
      alert('Blog yazısı silinirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <Button onClick={fetchPosts}>Yeniden Dene</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline'} 
          onClick={() => setFilter('all')}
        >
          Tümü
        </Button>
        <Button 
          variant={filter === 'published' ? 'primary' : 'outline'} 
          onClick={() => setFilter('published')}
        >
          Yayınlananlar
        </Button>
        <Button 
          variant={filter === 'draft' ? 'primary' : 'outline'} 
          onClick={() => setFilter('draft')}
        >
          Taslaklar
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-primary/5 rounded-lg">
          <p className="mb-4 text-foreground/70">Henüz blog yazısı yok.</p>
          <Button href="/admin/blog/yeni">Yeni Blog Yazısı Ekle</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Başlık</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Yazar</th>
                <th className="text-left py-3 px-4 hidden lg:table-cell">Tarih</th>
                <th className="text-left py-3 px-4 hidden sm:table-cell">Durum</th>
                <th className="text-right py-3 px-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border hover:bg-primary/5">
                  <td className="py-3 px-4">
                    <div className="font-medium">
                      <Link href={`/admin/blog/${post.id}/edit`} className="hover:text-primary">
                        {post.title}
                      </Link>
                    </div>
                    <div className="text-sm text-foreground/60 sm:hidden mt-1">
                      {post.author.name} • {formatRelativeTime(post.publishedAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {post.author.name}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    {format(new Date(post.publishedAt), 'PPP', { locale: tr })}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <Badge variant={post.status === 'published' ? 'primary' : 'secondary'}>
                      {post.status === 'published' ? 'Yayında' : 'Taslak'}
                    </Badge>
                    {post.featured && (
                      <Badge variant="secondary" className="ml-2">
                        Öne Çıkan
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-foreground/60 hover:text-primary p-2"
                        target="_blank"
                        title="Görüntüle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>
                      
                      <Link 
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-foreground/60 hover:text-primary p-2"
                        title="Düzenle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      
                      <button
                        onClick={() => post.id && handleDelete(post.id)}
                        className="text-foreground/60 hover:text-error p-2"
                        title="Sil"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};