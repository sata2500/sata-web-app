// src/components/auth/register-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export const RegisterForm = () => {
  const router = useRouter();
  const { signUpWithEmail, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // Burada displayName state'i ekledim
  const [formError, setFormError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
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
    
    try {
      // signUpWithEmail fonksiyonuna displayName parametresini ekledim
      await signUpWithEmail(email, password, displayName); 
      router.push('/');
    } catch (err: any) {
      setFormError(err.message || 'Kayıt işlemi başarısız oldu');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || formError) && (
        <Alert variant="error" className="mb-4">
          {error || formError}
        </Alert>
      )}
      
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium">
          Ad Soyad
        </label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ad Soyad"
          disabled={loading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          E-posta
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          disabled={loading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Şifre
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="******"
          disabled={loading}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" isLoading={loading}>
        Kaydol
      </Button>
    </form>
  );
};