// src/components/auth/register-form.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';

export const RegisterForm = () => {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, loading: authLoading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setFormError('');
    
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message || 'Google ile kayıt işlemi başarısız oldu');
      } else {
        setFormError('Google ile kayıt işlemi başarısız oldu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { displayName, email, password, passwordConfirm } = formData;

    // Validation
    if (!displayName.trim()) {
      setFormError('Lütfen ad ve soyadınızı girin');
      return;
    }

    if (!email.trim()) {
      setFormError('Lütfen e-posta adresinizi girin');
      return;
    }

    if (password.length < 6) {
      setFormError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== passwordConfirm) {
      setFormError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    
    try {
      // signUpWithEmail fonksiyonuna displayName parametresini ekledim
      await signUpWithEmail(email, password, displayName);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message || 'Kayıt işlemi başarısız oldu');
      } else {
        setFormError('Kayıt işlemi başarısız oldu');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Form içindeki tüm alanların dolu olup olmadığını kontrol et
  const isFormComplete = Object.values(formData).every(value => value !== '');

  return (
    <FadeIn direction="up" className="w-full max-w-md">
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Hesap Oluştur
          </CardTitle>
          <CardDescription>
            SaTA platformuna kayıt olarak tüm içeriklere erişim sağlayın
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {(authError || formError) && (
            <Alert 
              variant="error" 
              className="mb-4"
              onClose={() => setFormError('')}
              dismissible
            >
              {authError || formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                label="Ad Soyad"
                placeholder="Ad Soyad"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                }
                disabled={loading || authLoading}
                required
              />

              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                label="E-posta Adresi"
                placeholder="ornek@mail.com"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                }
                disabled={loading || authLoading}
                required
              />

              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                label="Şifre"
                placeholder="••••••••"
                hint="En az 6 karakter olmalıdır"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                }
                disabled={loading || authLoading}
                required
              />

              <Input
                name="passwordConfirm"
                type={showPassword ? "text" : "password"}
                value={formData.passwordConfirm}
                onChange={handleChange}
                label="Şifre Tekrar"
                placeholder="••••••••"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
                error={
                  formData.password && 
                  formData.passwordConfirm && 
                  formData.password !== formData.passwordConfirm
                    ? 'Şifreler eşleşmiyor'
                    : undefined
                }
                disabled={loading || authLoading}
                required
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={loading || authLoading}
                disabled={!isFormComplete}
              >
                Kaydol
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-foreground/60">veya</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
                isLoading={loading || authLoading}
                leftIcon={
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
                }
              >
                Google ile Kaydol
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <div className="text-center text-sm text-foreground/70">
            Zaten hesabınız var mı?{' '}
            <Link 
              href="/giris" 
              className="text-primary font-medium hover:underline transition-colors"
            >
              Giriş Yapın
            </Link>
          </div>
        </CardFooter>
      </Card>
    </FadeIn>
  );
};