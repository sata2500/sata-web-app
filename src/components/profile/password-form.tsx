// src/components/profile/password-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertIcon } from '@/components/ui/alert';
import { updatePassword } from '@/lib/user-service';
import { useAuth } from '@/context/auth-context';

export function PasswordForm() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form gönderildiğinde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Şifre uzunluğu kontrolü
    if (newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    // Şifre eşleşme kontrolü
    if (newPassword !== confirmPassword) {
      setError('Yeni şifre ve onay şifresi eşleşmiyor.');
      setLoading(false);
      return;
    }

    try {
      // Google ile giriş yapılmışsa şifre güncelleme mümkün değil
      if (!user?.email?.endsWith('@gmail.com')) {
        await updatePassword(currentPassword, newPassword);
        setSuccess(true);
        
        // Formları temizle
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Google hesabı ile giriş yaptınız. Şifrenizi Google üzerinden değiştirmeniz gerekiyor.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
      } else {
        setError('Şifre güncellenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertIcon />
          Şifreniz başarıyla güncellendi.
        </Alert>
      )}

      <div className="space-y-4">
        {/* Mevcut Şifre */}
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="block text-sm font-medium">
            Mevcut Şifre
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        {/* Yeni Şifre */}
        <div className="space-y-2">
          <label htmlFor="newPassword" className="block text-sm font-medium">
            Yeni Şifre
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Şifreniz en az 6 karakter uzunluğunda olmalıdır.
          </p>
        </div>

        {/* Şifre Onay */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            Şifreyi Onayla
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" isLoading={loading}>
        Şifreyi Güncelle
      </Button>
    </form>
  );
}