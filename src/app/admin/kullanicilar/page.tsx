// src/app/admin/kullanicilar/page.tsx

import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Container } from '@/components/ui/container';
import { auth } from '@/lib/server-auth';
import { getUsers } from '@/lib/user-service';
import { UserTable } from '@/components/admin/user-table';

export const metadata = {
  title: 'Kullanıcı Yönetimi - SaTA Admin',
  description: 'SaTA platformundaki kullanıcıları yönetin',
};

export default async function UsersAdminPage() {
  // Sunucu tarafında yetkilendirme kontrolü
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    redirect('/giris?redirect=/admin/kullanicilar');
  }

  // Kullanıcıları getir
  const users = await getUsers();

  return (
    <AdminLayout>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
            <p className="text-muted-foreground mt-1">
              Toplam {users.length} kullanıcı bulundu.
            </p>
          </div>
        </div>

        {/* Client component: Kullanıcı tablosu */}
        <UserTable initialUsers={users} />
      </Container>
    </AdminLayout>
  );
}