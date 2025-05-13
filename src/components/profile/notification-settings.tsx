// src/components/profile/notification-settings.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { getUserNotificationSettings, updateUserNotificationSettings } from '@/lib/user-service';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    blogUpdates: true,
    newComments: true,
    commentReplies: true,
    newFeatures: true,
    marketing: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bildirim ayarlarını yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getUserNotificationSettings(userId);
        if (userSettings) {
          setSettings(userSettings);
        }
      } catch (err) {
        console.error('Bildirim ayarları yüklenirken bir hata oluştu:', err);
        setError('Bildirim ayarları yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  // Form gönderildiğinde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserNotificationSettings(userId, settings);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Ayarlar kaydedilirken bir hata oluştu.');
      } else {
        setError('Ayarlar kaydedilirken bir hata oluştu.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Switch değişimini işle
  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Ayarlar yükleniyor...</p>
      </div>
    );
  }

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
          Bildirim ayarlarınız başarıyla kaydedildi.
        </Alert>
      )}

      <div className="space-y-4">
        {/* Ana bildirim ayarı */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h3 className="font-medium">E-posta Bildirimleri</h3>
            <p className="text-sm text-muted-foreground">
              Tüm e-posta bildirimlerini etkinleştir veya devre dışı bırak
            </p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={() => handleToggle('emailNotifications')}
            aria-label="E-posta bildirimleri"
          />
        </div>

        {/* Blog güncellemeleri */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h3 className="font-medium">Blog Güncellemeleri</h3>
            <p className="text-sm text-muted-foreground">
              Takip ettiğiniz blog kategorilerindeki yeni yazılar
            </p>
          </div>
          <Switch
            checked={settings.blogUpdates}
            onCheckedChange={() => handleToggle('blogUpdates')}
            disabled={!settings.emailNotifications}
            aria-label="Blog güncellemeleri"
          />
        </div>

        {/* Yeni yorumlar */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h3 className="font-medium">Yeni Yorumlar</h3>
            <p className="text-sm text-muted-foreground">
              Yazılarınıza yapılan yeni yorumlar hakkında bildirimler
            </p>
          </div>
          <Switch
            checked={settings.newComments}
            onCheckedChange={() => handleToggle('newComments')}
            disabled={!settings.emailNotifications}
            aria-label="Yeni yorum bildirimleri"
          />
        </div>

        {/* Yorum yanıtları */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h3 className="font-medium">Yorum Yanıtları</h3>
            <p className="text-sm text-muted-foreground">
              Yorumlarınıza gelen yanıtlar hakkında bildirimler
            </p>
          </div>
          <Switch
            checked={settings.commentReplies}
            onCheckedChange={() => handleToggle('commentReplies')}
            disabled={!settings.emailNotifications}
            aria-label="Yorum yanıtı bildirimleri"
          />
        </div>

        {/* Yeni özellikler */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h3 className="font-medium">Yeni Özellikler</h3>
            <p className="text-sm text-muted-foreground">
              Platforma eklenen yeni özellikler hakkında bildirimler
            </p>
          </div>
          <Switch
            checked={settings.newFeatures}
            onCheckedChange={() => handleToggle('newFeatures')}
            disabled={!settings.emailNotifications}
            aria-label="Yeni özellik bildirimleri"
          />
        </div>

        {/* Pazarlama bildirimleri */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <h3 className="font-medium">Pazarlama Bildirimleri</h3>
            <p className="text-sm text-muted-foreground">
              Özel teklifler, duyurular ve kampanyalar
            </p>
          </div>
          <Switch
            checked={settings.marketing}
            onCheckedChange={() => handleToggle('marketing')}
            disabled={!settings.emailNotifications}
            aria-label="Pazarlama bildirimleri"
          />
        </div>
      </div>

      <Button type="submit" isLoading={saving}>
        Ayarları Kaydet
      </Button>
    </form>
  );
}