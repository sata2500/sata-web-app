// src/app/admin/blog/[id]/edit/page.tsx

import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BlogEditor } from '@/components/admin/blog-editor';
import { Container } from '@/components/ui/container';
import { getBlogPostById } from '@/lib/blog-service';
import { auth } from '@/lib/server-auth';

export default async function EditBlogPostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // params'ı await et - Next.js 15'te zorunlu
  const paramsData = await params;
  
  // Sunucu tarafında yetkilendirme kontrolü
  const session = await auth();
  
  if (!session?.user?.isAdmin && !session?.user?.isEditor) {
    redirect('/giris?redirect=/admin/blog/' + paramsData.id + '/edit');
  }

  const post = await getBlogPostById(paramsData.id);
  
  if (!post) {
    redirect('/admin/blog');
  }

  return (
    <AdminLayout>
      <Container>
        <h1 className="text-3xl font-bold mb-6">Blog Yazısı Düzenle</h1>
        <BlogEditor post={post} />
      </Container>
    </AdminLayout>
  );
}