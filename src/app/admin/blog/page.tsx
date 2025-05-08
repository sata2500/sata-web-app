// src/app/admin/blog/page.tsx

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BlogPostList } from '@/components/admin/blog-post-list';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { auth } from '@/lib/server-auth';

export default async function AdminBlogPage() {
  // Sunucu tarafında yetkilendirme kontrolü
  const session = await auth();
  
  if (!session?.user?.isAdmin && !session?.user?.isEditor) {
    redirect('/giris?redirect=/admin/blog');
  }

  return (
    <AdminLayout>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Blog Yazıları</h1>
          <Button href="/admin/blog/yeni">
            Yeni Blog Yazısı
          </Button>
        </div>
        
        <BlogPostList />
      </Container>
    </AdminLayout>
  );
}