# SaTA Web Platformu

SaTA, blog ve çeşitli uygulamalar sunan modern bir web platformudur. Bu proje, Next.js 15, React 19, TypeScript ve Tailwind CSS 4 kullanılarak geliştirilmiştir. Firebase ile kimlik doğrulama ve veri depolama işlemleri yapılmaktadır.

## Özellikler

- Blog yazıları okuma ve yayınlama
- Kullanıcı hesabı oluşturma ve yönetme
- Firebase kimlik doğrulama (Google ve E-posta/Şifre)
- Karanlık/Aydınlık tema desteği
- Responsive tasarım
- SEO optimizasyonu

## Başlangıç

### Gereksinimler

- Node.js 20.0.0 veya daha yüksek
- npm veya yarn

### Kurulum

1. Projeyi klonlayın:

```bash
git clone https://github.com/kullaniciadi/sata-web.git
cd sata-web
```

2. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn
```

3. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Firebase yapılandırma bilgilerinizi ekleyin:

```bash
cp .env.example .env.local
```

4. Geliştirme sunucusunu başlatın:

```bash
npm run dev
# veya
yarn dev
```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Proje Yapısı

```
sata-web/
├── src/
│   ├── app/                      # Next.js App Router yapısı
│   ├── components/               # React bileşenleri
│   ├── config/                   # Yapılandırma dosyaları
│   ├── context/                  # React context'leri
│   ├── hooks/                    # Özel React hook'ları
│   ├── services/                 # Servis fonksiyonları
│   └── types/                    # TypeScript tipleri
├── public/                       # Statik dosyalar
├── .env.example                  # Örnek çevre değişkenleri
├── .gitignore                    # Git yok sayma listesi
├── next.config.js                # Next.js yapılandırması
├── package.json                  # Paket yapılandırması
├── postcss.config.js             # PostCSS yapılandırması
├── README.md                     # Proje dokümanı
├── tailwind.config.js            # Tailwind CSS yapılandırması
└── tsconfig.json                 # TypeScript yapılandırması
```

## Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) üzerinden yeni bir proje oluşturun.
2. Web uygulaması ekleyin.
3. Authentication kısmından E-posta/Şifre ve Google giriş yöntemlerini etkinleştirin.
4. Firestore Database oluşturun ve kuralları ayarlayın.
5. Firebase yapılandırma bilgilerinizi `.env.local` dosyasına ekleyin.

## Geliştirici Bilgileri

Projeyi geliştirirken aşağıdaki teknolojileri kullanıyoruz:

- **Next.js 15**: Server-side rendering, file-based routing ve API router özellikleri
- **React 19**: Kullanıcı arayüzleri oluşturmak için JavaScript kütüphanesi
- **TypeScript**: JavaScript için tip güvenliği
- **Tailwind CSS 4**: Utility-first CSS framework
- **Firebase**: Backend as a Service (BaaS) çözümü

## Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## İletişim

Sorularınız için [info@sata.com.tr](mailto:info@sata.com.tr) adresine e-posta gönderebilirsiniz.