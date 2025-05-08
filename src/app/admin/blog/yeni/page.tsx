// src/app/admin/blog/yeni/page.tsx

import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BlogEditor } from '@/components/admin/blog-editor';
import { Container } from '@/components/ui/container';
import { auth } from '@/lib/server-auth';

export default async function NewBlogPostPage() {
  // Sunucu tarafında yetkilendirme kontrolü
  const session = await auth();
  
  if (!session?.user?.isAdmin && !session?.user?.isEditor) {
    redirect('/giris?redirect=/admin/blog/yeni');
  }

  return (
    <AdminLayout>
      <Container>
        <h1 className="text-3xl font-bold mb-6">Yeni Blog Yazısı</h1>
        <BlogEditor />
      </Container>
    </AdminLayout>
  );
}