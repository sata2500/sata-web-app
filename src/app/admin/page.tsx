// src/app/admin/page.tsx

import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { auth } from '@/lib/server-auth';

export default async function AdminDashboardPage() {
  // Sunucu tarafında yetkilendirme kontrolü
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    redirect('/giris?redirect=/admin');
  }

  return (
    <AdminLayout>
      <Container>
        <h1 className="text-3xl font-bold mb-6">Admin Paneli</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Blog Yazıları</CardTitle>
              <CardDescription>Blog içeriklerini yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Yeni yazı ekleyin, mevcut içerikleri düzenleyin ve yayınlayın.</p>
              <a href="/admin/blog" className="text-primary font-medium mt-4 block">
                Blog Yazılarını Yönet &rarr;
              </a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Yorumlar</CardTitle>
              <CardDescription>Kullanıcı yorumlarını yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Bekleyen yorumları onaylayın, uygunsuz içerikleri kaldırın.</p>
              <a href="/admin/yorumlar" className="text-primary font-medium mt-4 block">
                Yorumları Yönet &rarr;
              </a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcılar</CardTitle>
              <CardDescription>Kullanıcı hesaplarını yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Kullanıcı rollerini değiştirin, hesapları yönetin.</p>
              <a href="/admin/kullanicilar" className="text-primary font-medium mt-4 block">
                Kullanıcıları Yönet &rarr;
              </a>
            </CardContent>
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}