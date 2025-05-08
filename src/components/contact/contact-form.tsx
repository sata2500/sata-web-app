'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basit doğrulama
    if (!name || !email || !message) {
      setError('Lütfen tüm gerekli alanları doldurun.');
      setLoading(false);
      return;
    }
    
    // E-posta doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      setLoading(false);
      return;
    }
    
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik bir simülasyon yapıyoruz
    try {
      // Firebase veya başka bir servis kullanarak mesajı kaydedebilirsiniz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
        console.error('Form submission error:', err);
        setError(`Mesajınız gönderilirken bir hata oluştu: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="bg-success/10 text-success p-4 rounded-md text-center">
        <h3 className="text-lg font-bold mb-2">Mesajınız Gönderildi!</h3>
        <p className="mb-4">En kısa sürede size geri dönüş yapacağız.</p>
        <Button 
          onClick={() => setSuccess(false)} 
          variant="outline"
        >
          Yeni Mesaj Gönder
        </Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 text-error p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Adınız <span className="text-error">*</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            E-posta <span className="text-error">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          Konu
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Mesajınız <span className="text-error">*</span>
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          disabled={loading}
        />
      </div>
      
      <Button type="submit" isLoading={loading}>
        Mesajı Gönder
      </Button>
    </form>
  );
}