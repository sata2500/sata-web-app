export default function AboutPage() {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Hakkımızda</h1>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>
              SaTA, 2025 yılında kurulmuş, blog ve çeşitli uygulamalar sunan modern bir web platformudur.
              Amacımız kullanıcılara kaliteli içerik ve kullanışlı araçlar sunmaktır.
            </p>
            
            <h2>Misyonumuz</h2>
            <p>
              Herkes için erişilebilir ve kullanıcı dostu dijital çözümler üretmek,
              bilgi paylaşımını kolaylaştırmak ve teknoloji dünyasındaki gelişmeleri
              kullanıcılarımıza en güncel ve anlaşılır şekilde sunmaktır.
            </p>
            
            <h2>Vizyonumuz</h2>
            <p>
              Dijital dünyanın sürekli değişen doğasında öncü olmak ve kullanıcılarımıza
              en kaliteli içerik ve hizmetleri sunarak, teknoloji alanında güvenilir
              bir bilgi kaynağı olmaktır.
            </p>
            
            <h2>Değerlerimiz</h2>
            <ul>
              <li>
                <strong>Şeffaflık:</strong> Her adımımızda açık ve dürüst olmaya özen gösteriyoruz.
              </li>
              <li>
                <strong>Kalite:</strong> Sunduğumuz her içerikte ve hizmette en yüksek kaliteyi hedefliyoruz.
              </li>
              <li>
                <strong>Kullanıcı Odaklılık:</strong> Kullanıcılarımızın ihtiyaçları ve geri bildirimleri bizim için en öncelikli konudur.
              </li>
              <li>
                <strong>Yenilikçilik:</strong> Teknolojideki gelişmeleri takip ederek hizmetlerimizi sürekli güncelliyoruz.
              </li>
              <li>
                <strong>Erişilebilirlik:</strong> Platformumuzu tüm kullanıcılar için erişilebilir kılmak adına çalışıyoruz.
              </li>
            </ul>
            
            <h2>Platformlarımız</h2>
            <p>
              SaTA olarak şu anda blog platformumuz aktif durumdadır. Yakın zamanda
              aşağıdaki platformları da kullanıcılarımızla buluşturmayı hedefliyoruz:
            </p>
            
            <ul>
              <li>
                <strong>SaTA ÖYS:</strong> Öğrenme yönetim sistemi, farklı alanlarda kurslar ve eğitim materyalleri sunacak.
              </li>
              <li>
                <strong>SaTA Müzik:</strong> Müzik keşfetme ve dinleme platformu.
              </li>
              <li>
                <strong>SaTA Haberler:</strong> Güncel teknoloji ve yazılım haberleri.
              </li>
              <li>
                <strong>Seher AI:</strong> Yapay zeka destekli asistan.
              </li>
            </ul>
            
            <h2>Ekibimiz</h2>
            <p>
              SaTA, teknoloji ve içerik konusunda uzman bir ekip tarafından yönetilmektedir.
              Yazılım geliştiriciler, içerik üreticileri, tasarımcılar ve proje yöneticilerinden
              oluşan ekibimiz, kullanıcılarımıza en iyi deneyimi sunmak için çalışmaktadır.
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mt-6">
              <h2 className="mt-0">Bize Katılın</h2>
              <p>
                SaTA topluluğunun bir parçası olmak ve güncellemelerden haberdar olmak için
                hesap oluşturabilir veya bültenimize abone olabilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <a href="/kaydol" className="btn btn-primary">
                  Şimdi Kaydolun
                </a>
                <a href="/iletisim" className="btn btn-outline">
                  Bizimle İletişime Geçin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }