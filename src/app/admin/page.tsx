// src/app/admin/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { auth } from '@/lib/server-auth';
import { getUsers } from '@/lib/user-service';
import { getBlogStats } from '@/lib/blog-service'; // Bu servisi oluşturacağız

// İcon bileşenleri
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftIcon,
  EyeIcon,
  PencilSquareIcon,
  RssIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default async function AdminDashboardPage() {
  // Sunucu tarafında yetkilendirme kontrolü
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    redirect('/giris?redirect=/admin');
  }

  // Kullanıcı sayısını getir
  const users = await getUsers();
  
  // Blog istatistiklerini getir
  const blogStats = await getBlogStats();

  // Son etkinlikler (örnek veriler)
  const recentActivities = [
    { 
      id: '1', 
      type: 'post', 
      title: 'Next.js 14 ile Modern Web Uygulamaları', 
      user: 'Ahmet Yılmaz', 
      date: new Date(2024, 4, 10), 
      action: 'published' 
    },
    { 
      id: '2', 
      type: 'comment', 
      content: 'Harika bir makale olmuş, teşekkürler!', 
      user: 'Zeynep Öztürk', 
      date: new Date(2024, 4, 9), 
      action: 'added' 
    },
    { 
      id: '3', 
      type: 'user', 
      name: 'Mehmet Kaya', 
      date: new Date(2024, 4, 8), 
      action: 'registered' 
    },
    { 
      id: '4', 
      type: 'post', 
      title: 'TypeScript İpuçları ve Püf Noktaları', 
      user: 'Can Demirci', 
      date: new Date(2024, 4, 7), 
      action: 'updated' 
    },
    { 
      id: '5', 
      type: 'comment', 
      content: 'Bu konuda daha fazla bilgi paylaşabilir misiniz?', 
      user: 'Ayşe Yıldız', 
      date: new Date(2024, 4, 6), 
      action: 'pending' 
    }
  ];

  return (
    <AdminLayout>
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Paneli</h1>
          <p className="text-foreground/60 mt-1">SaTA web platformu yönetim arayüzü</p>
        </div>
        
        {/* İstatistik Kartları */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/60">Toplam Kullanıcı</p>
                  <h2 className="text-3xl font-bold">{users.length}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-secondary/10 rounded-full">
                  <DocumentTextIcon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/60">Blog Yazıları</p>
                  <h2 className="text-3xl font-bold">{blogStats.totalPosts}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-accent/10 rounded-full">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/60">Yorumlar</p>
                  <h2 className="text-3xl font-bold">{blogStats.totalComments}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-info/10 rounded-full">
                  <EyeIcon className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/60">Toplam Görüntülenme</p>
                  <h2 className="text-3xl font-bold">{blogStats.totalViews.toLocaleString('tr-TR')}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Ana içerik ve etkinlikler */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Hızlı Erişim Menüsü - 8 sütun */}
          <div className="md:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hızlı Erişim</CardTitle>
                <CardDescription>Sık kullanılan işlemler ve modüller</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                  <Link href="/admin/blog/yeni" className="group">
                    <div className="border rounded-lg p-4 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <PencilSquareIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Yeni Blog Yazısı</h3>
                        <p className="text-xs text-foreground/60">Yeni bir blog yazısı oluşturun</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/blog" className="group">
                    <div className="border rounded-lg p-4 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <DocumentTextIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Blog Yazıları</h3>
                        <p className="text-xs text-foreground/60">Tüm yazıları yönetin</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/yorumlar" className="group">
                    <div className="border rounded-lg p-4 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <ChatBubbleLeftIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Yorumlar</h3>
                        <p className="text-xs text-foreground/60">Yorumları yönetin</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/kullanicilar" className="group">
                    <div className="border rounded-lg p-4 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <UserGroupIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Kullanıcılar</h3>
                        <p className="text-xs text-foreground/60">Kullanıcıları yönetin</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/kategoriler" className="group">
                    <div className="border rounded-lg p-4 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <RssIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Kategoriler</h3>
                        <p className="text-xs text-foreground/60">Kategorileri yönetin</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/etiketler" className="group">
                    <div className="border rounded-lg p-4 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <TagIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Etiketler</h3>
                        <p className="text-xs text-foreground/60">Etiketleri yönetin</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
                <CardDescription>Platform kullanım istatistikleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-foreground/60">Yayınlanan Yazılar</p>
                    <h4 className="text-2xl font-bold">{blogStats.publishedPosts}</h4>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-foreground/60">Taslak Yazılar</p>
                    <h4 className="text-2xl font-bold">{blogStats.draftPosts}</h4>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-foreground/60">Onay Bekleyen Yorumlar</p>
                    <h4 className="text-2xl font-bold">{blogStats.pendingComments}</h4>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-foreground/60">Toplam Etiketler</p>
                    <h4 className="text-2xl font-bold">{blogStats.totalTags}</h4>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/admin/istatistikler" className="text-primary text-sm hover:underline">
                  Tüm istatistikleri görüntüle &rarr;
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Son Etkinlikler - 4 sütun */}
          <div className="md:col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Son Etkinlikler</CardTitle>
                <CardDescription>Platform üzerindeki son hareketler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`mt-0.5 p-1.5 rounded-full 
                        ${activity.type === 'post' 
                          ? 'bg-primary/10 text-primary' 
                          : activity.type === 'comment' 
                            ? 'bg-secondary/10 text-secondary' 
                            : 'bg-info/10 text-info'}`}
                      >
                        {activity.type === 'post' && <DocumentTextIcon className="h-4 w-4" />}
                        {activity.type === 'comment' && <ChatBubbleLeftIcon className="h-4 w-4" />}
                        {activity.type === 'user' && <UserGroupIcon className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {activity.type === 'post' && `${activity.user} ${activity.action === 'published' ? 'yayınladı' : 'güncelledi'}: ${activity.title}`}
                          {activity.type === 'comment' && `${activity.user} yorum ${activity.action === 'added' ? 'yaptı' : 'bekliyor'}: "${activity.content}"`}
                          {activity.type === 'user' && `${activity.name} kayıt oldu`}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {activity.date.toLocaleDateString('tr-TR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/admin/etkinlikler" className="text-primary text-sm hover:underline">
                  Tüm etkinlikleri görüntüle &rarr;
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}