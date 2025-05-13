// src/components/admin/user-table.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { updateUserRole } from '@/lib/user-service';

// Rol değiştirme için Select bileşeni
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Onay dialogları için
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Filtre ve arama bileşenleri için
import { Input } from '@/components/ui/input';

interface UserTableProps {
  initialUsers: UserProfile[];
}

export function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'disable' | null>(null);

  // Kullanıcı rolünü değiştirme fonksiyonu
  const handleRoleChange = async (userId: string, newRole: 'user' | 'editor' | 'admin') => {
    try {
      setIsUpdating(true);
      await updateUserRole(userId, newRole);
      
      // Başarılı olursa yerel state'i güncelle
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Rol güncellenirken hata oluştu:', error);
      alert('Rol güncellenirken bir hata oluştu.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Kullanıcıları filtrele
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });

  // Bir kullanıcıyı silme veya devre dışı bırakma için onay dialog'unu açar
  const confirmAction = (userId: string, action: 'delete' | 'disable') => {
    setSelectedUserId(userId);
    setActionType(action);
    setIsConfirmOpen(true);
  };

  // Onay dialog'unu kapatır
  const closeConfirmDialog = () => {
    setIsConfirmOpen(false);
    setSelectedUserId(null);
    setActionType(null);
  };

  // Onaylanan işlemi gerçekleştirir
  const executeConfirmedAction = async () => {
    if (!selectedUserId || !actionType) return;
    
    setIsUpdating(true);
    
    try {
      // İlgili servisleri entegre ederek, kullanıcı silme veya devre dışı bırakma işlemlerini gerçekleştirebiliriz
      // Bu işlevsellikleri ilerleyen aşamalarda ekleyeceğiz
      
      if (actionType === 'delete') {
        // Kullanıcı silme işlemi (henüz uygulanmamış)
        alert('Kullanıcı silme özelliği henüz uygulanmamıştır.');
      } else if (actionType === 'disable') {
        // Kullanıcı devre dışı bırakma işlemi (henüz uygulanmamış)
        alert('Kullanıcı devre dışı bırakma özelliği henüz uygulanmamıştır.');
      }
      
      closeConfirmDialog();
    } catch (error) {
      console.error(`Kullanıcı ${actionType === 'delete' ? 'silme' : 'devre dışı bırakma'} hatası:`, error);
      alert(`Kullanıcı ${actionType === 'delete' ? 'silinirken' : 'devre dışı bırakılırken'} bir hata oluştu.`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Rol rengini belirle
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-error/10 text-error';
      case 'editor':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Arama ve Filtreleme */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:max-w-xs"
        />
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="md:max-w-xs">
            <SelectValue placeholder="Tüm roller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm roller</SelectItem>
            <SelectItem value="user">Kullanıcı</SelectItem>
            <SelectItem value="editor">Editör</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kullanıcı Tablosu */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Kullanıcı</th>
                <th className="text-left py-3 px-4 font-semibold">E-posta</th>
                <th className="text-left py-3 px-4 font-semibold">Rol</th>
                <th className="text-left py-3 px-4 font-semibold">Kayıt Tarihi</th>
                <th className="text-left py-3 px-4 font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {user.photoURL ? (
                          <div className="h-8 w-8 rounded-full overflow-hidden">
                            <Image 
                              src={user.photoURL} 
                              alt={user.displayName}
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {user.displayName[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span>{user.displayName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block py-1 px-2 rounded text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                        {user.role === 'admin' 
                          ? 'Admin' 
                          : user.role === 'editor' 
                            ? 'Editör' 
                            : 'Kullanıcı'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'editor' | 'admin')}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Kullanıcı</SelectItem>
                            <SelectItem value="editor">Editör</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => confirmAction(user.id, 'disable')}
                          disabled={isUpdating}
                        >
                          Engelle
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error"
                          onClick={() => confirmAction(user.id, 'delete')}
                          disabled={isUpdating}
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    {searchTerm || roleFilter ? 'Aramanızla eşleşen kullanıcı bulunamadı.' : 'Henüz hiç kullanıcı bulunmuyor.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Onay Dialog'u */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'delete' ? 'Kullanıcıyı Sil' : 'Kullanıcıyı Engelle'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'delete'
                ? 'Bu işlem kullanıcı hesabını ve ilişkili tüm verileri kalıcı olarak silecektir. Bu işlem geri alınamaz.'
                : 'Bu işlem kullanıcının platforma erişimini engelleyecektir. Daha sonra bu engeli kaldırabilirsiniz.'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeConfirmDialog}
              disabled={isUpdating}
            >
              İptal
            </Button>
            <Button
              variant="danger"
              onClick={executeConfirmedAction}
              disabled={isUpdating}
            >
              {isUpdating ? 'İşleniyor...' : actionType === 'delete' ? 'Sil' : 'Engelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}