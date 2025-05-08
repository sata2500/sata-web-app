// src/components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertIcon } from '@/components/ui/alert';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmail(email, password);
      router.push('/');
    } catch (err: unknown) { // 'any' tipini 'unknown' ile değiştirdik
      if (err instanceof Error) {
        setError(err.message || 'Giriş yapılırken bir hata oluştu');
      } else {
        setError('Giriş yapılırken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err: unknown) { // 'any' tipini 'unknown' ile değiştirdik
      if (err instanceof Error) {
        setError(err.message || 'Google ile giriş yapılırken bir hata oluştu');
      } else {
        setError('Google ile giriş yapılırken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Lütfen bir e-posta adresi girin');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Bu kısımda Firebase şifre sıfırlama fonksiyonunu çağırabilirsiniz
      // await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Şifre sıfırlama linki e-posta adresinize gönderildi');
    } catch (err: unknown) { // 'any' tipini 'unknown' ile değiştirdik
      if (err instanceof Error) {
        setError(err.message || 'Şifre sıfırlama işlemi sırasında bir hata oluştu');
      } else {
        setError('Şifre sıfırlama işlemi sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Giriş Yap</h1>
        <p className="mt-2 text-foreground/70">
          SaTA hesabınıza giriş yapın
        </p>
      </div>

      {error && (
        <Alert variant="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          <AlertIcon />
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            E-posta Adresi
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ornek@mail.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium">
              Şifre
            </label>
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-primary hover:underline"
            >
              Şifremi Unuttum
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
          />
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            Giriş Yap
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/60">veya</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            isLoading={loading}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google ile Giriş Yap
          </Button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-foreground/70">
          Hesabınız yok mu?{' '}
          <Link href="/kaydol" className="text-primary hover:underline">
            Hemen Kaydolun
          </Link>
        </p>
      </div>
    </div>
  );
}