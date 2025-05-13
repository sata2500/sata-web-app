// src/components/profile/account-settings.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteUserAccount } from '@/lib/user-service';
import { useAuth } from '@/context/auth-context';

interface AccountSettingsProps {
  userId: string;
}

export function AccountSettings({ userId }: AccountSettingsProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  // Hesaptan çıkış yap
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Çıkış yapılırken bir hata oluştu:', err);
      setError('Çıkış yapılırken bir hata oluştu.');
    }
  };

  // Hesabı sil
  const handleDeleteAccount = async () => {
    if (confirmText !== 'hesabımı sil') {
      setError('Lütfen onay metinini doğru şekilde yazın.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteUserAccount(userId);
      await signOut();
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Hesap silinirken bir hata oluştu.');
      } else {
        setError('Hesap silinirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        {/* Hesaptan Çıkış */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium">Hesaptan Çıkış Yap</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Tüm cihazlardan oturumunuzu kapatmak için aşağıdaki butonu kullanın.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
          >
            Hesaptan Çıkış Yap
          </Button>
        </div>

        {/* Tehlikeli Bölge */}
        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-medium text-red-600 dark:text-red-400">Tehlikeli Bölge</h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1 mb-3">
            Hesabınızı silmek geri alınamaz bir işlemdir. Tüm verileriniz kalıcı olarak silinecektir.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Hesabı Sil
          </Button>
        </div>
      </div>

      {/* Hesap Silme Onay Dialog'u */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Hesabınızı Silmek İstediğinizden Emin Misiniz?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
              Devam etmek için aşağıya <strong>&quot;hesabımı sil&quot;</strong> yazın.
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="hesabımı sil"
            />
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={loading}
              disabled={confirmText !== 'hesabımı sil'}
            >
              Hesabı Kalıcı Olarak Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}