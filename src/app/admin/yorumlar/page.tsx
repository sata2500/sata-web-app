// src/app/admin/yorumlar/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/admin-layout';
import { getComments, updateComment, deleteComment, getBlogPostById } from '@/lib/blog-service';
import { BlogComment, BlogPost } from '@/types/blog';
import { formatRelativeTime } from '@/lib/utils';

export default function YorumlarPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [blogPosts, setBlogPosts] = useState<Record<string, BlogPost | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Yorumları yükleme fonksiyonu - useCallback ile sarıldı
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const allComments = await getComments(filter);
      setComments(allComments);
      
      // Blog yazılarını getir
      const postIds = Array.from(new Set(allComments.map(comment => comment.postId)));
      const postData: Record<string, BlogPost | null> = {};
      
      // Her bir blog yazısını getir
      for (const postId of postIds) {
        const post = await getBlogPostById(postId);
        postData[postId] = post;
      }
      
      setBlogPosts(postData);
    } catch (err) {
      console.error('Yorumlar yüklenirken hata oluştu:', err);
      setError('Yorumlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [filter]);
  
  // Sayfa yüklendiğinde yorumları getir - dependency olarak fetchComments eklendi
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  // Yetkisiz kullanıcıları yönlendir
  useEffect(() => {
    if (user && !user.isAdmin && !user.isEditor) {
      window.location.href = '/';
    }
  }, [user]);
  
  // Yorum onaylama işlevi
  const handleApprove = async (commentId: string) => {
    try {
      await updateComment(commentId, { status: 'approved' });
      
      // Yerel durumu güncelle
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: 'approved' } 
            : comment
        )
      );
      
      // Başarı mesajı göster
      setSuccessMessage('Yorum başarıyla onaylandı.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Yorum onaylanırken hata oluştu:', err);
      setError('Yorum onaylanırken bir hata oluştu.');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Yorum reddetme işlevi
  const handleReject = async (commentId: string) => {
    try {
      await updateComment(commentId, { status: 'rejected' });
      
      // Yerel durumu güncelle
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: 'rejected' } 
            : comment
        )
      );
      
      // Başarı mesajı göster
      setSuccessMessage('Yorum başarıyla reddedildi.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Yorum reddedilirken hata oluştu:', err);
      setError('Yorum reddedilirken bir hata oluştu.');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Yorum silme işlevi
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await deleteComment(commentId);
      
      // Yerel durumdan yorumu kaldır
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
      
      // Başarı mesajı göster
      setSuccessMessage('Yorum başarıyla silindi.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Yorum silinirken hata oluştu:', err);
      setError('Yorum silinirken bir hata oluştu.');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Kullanıcı yüklenmedi veya yetkileri yetersiz
  if (loading && !user) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  // Yetkisiz erişim
  if (!user?.isAdmin && !user?.isEditor) {
    return (
      <AdminLayout>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h1>
          <p className="mb-6">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
          <Link href="/" className="text-primary underline">
            Ana Sayfaya Dön
          </Link>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Yorum Yönetimi</h1>
        
        {successMessage && (
          <Alert title="Başarılı" variant="success" className="mb-6">
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert title="Hata" variant="error" className="mb-6">
            {error}
          </Alert>
        )}
        
        {/* Filtreler - variant değerleri primary olarak değiştirildi */}
        <div className="flex mb-6 gap-2 overflow-x-auto pb-2">
          <Button 
            variant={filter === 'pending' ? 'primary' : 'outline'} 
            onClick={() => setFilter('pending')}
          >
            Bekleyen Yorumlar
          </Button>
          <Button 
            variant={filter === 'approved' ? 'primary' : 'outline'} 
            onClick={() => setFilter('approved')}
          >
            Onaylanan Yorumlar
          </Button>
          <Button 
            variant={filter === 'rejected' ? 'primary' : 'outline'} 
            onClick={() => setFilter('rejected')}
          >
            Reddedilen Yorumlar
          </Button>
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'} 
            onClick={() => setFilter('all')}
          >
            Tüm Yorumlar
          </Button>
        </div>
        
        {/* Yükleniyor durumu */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-foreground/60">
              {filter === 'pending' 
                ? 'Bekleyen yorum bulunmamaktadır.' 
                : filter === 'approved' 
                ? 'Onaylanan yorum bulunmamaktadır.'
                : filter === 'rejected'
                ? 'Reddedilen yorum bulunmamaktadır.'
                : 'Hiç yorum bulunmamaktadır.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => {
              const blogPost = blogPosts[comment.postId];
              
              return (
                <div key={comment.id} className="border rounded-lg p-6 bg-card">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="font-medium text-lg">{comment.author.name}</div>
                      <div className="text-sm text-foreground/60">{formatRelativeTime(comment.createdAt)}</div>
                      
                      {blogPost && (
                        <div className="mt-1">
                          <Link 
                            href={`/blog/${blogPost.slug}`} 
                            className="text-sm text-primary hover:underline"
                            target="_blank"
                          >
                            Blog: {blogPost.title}
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {comment.status === 'pending' && (
                        <>
                          <Button 
                            size="sm"
                            variant="outline" 
                            className="border-green-500 hover:bg-green-50 hover:text-green-600 text-green-600" 
                            onClick={() => handleApprove(comment.id!)}
                          >
                            Onayla
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline" 
                            className="border-red-500 hover:bg-red-50 hover:text-red-600 text-red-600"
                            onClick={() => handleReject(comment.id!)}
                          >
                            Reddet
                          </Button>
                        </>
                      )}
                      
                      {comment.status === 'approved' && (
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-amber-500 hover:bg-amber-50 hover:text-amber-600 text-amber-600"
                          onClick={() => updateComment(comment.id!, { status: 'pending' }).then(fetchComments)}
                        >
                          Bekleyene Al
                        </Button>
                      )}
                      
                      {comment.status === 'rejected' && (
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-amber-500 hover:bg-amber-50 hover:text-amber-600 text-amber-600"
                          onClick={() => updateComment(comment.id!, { status: 'pending' }).then(fetchComments)}
                        >
                          Bekleyene Al
                        </Button>
                      )}
                      
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="border-red-500 hover:bg-red-50 hover:text-red-600 text-red-600"
                        onClick={() => handleDelete(comment.id!)}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none dark:prose-invert bg-background/50 p-4 rounded-md border border-border">
                    {comment.content.split('\n').map((line, i) => (
                      line ? <p key={i}>{line}</p> : <br key={i} />
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comment.status === 'approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : comment.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {comment.status === 'approved' 
                        ? 'Onaylandı' 
                        : comment.status === 'rejected'
                        ? 'Reddedildi'
                        : 'Beklemede'}
                    </span>
                    
                    {comment.parentId && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Yanıt
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}