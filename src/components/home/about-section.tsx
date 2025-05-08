export function AboutSection() {
    return (
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">SaTA Hakkında</h2>
          <p className="text-lg mb-4">
            SaTA, başlangıçta blog platformu olarak tasarlanan, ilerleyen süreçlerde Öğrenme Yönetim Sistemi (SaTA-ÖYS), Müzik Platformu (SaTA-Müzik) ve Yapay Zeka destekli içerik bölümlerini (Seher AI) içerecek modüler bir web platformudur.
          </p>
          <p className="text-lg mb-4">
            Açık kaynak kodlu olarak geliştirilen platformumuz, modern web teknolojileri kullanılarak oluşturulmuştur ve sürekli gelişmeye devam etmektedir.
          </p>
          <p className="text-lg">
            SaTA, teknoloji meraklıları, eğitimciler ve içerik üreticileri için tasarlanmış, kullanıcı dostu bir platform sunmayı hedeflemektedir.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-72 h-72 bg-primary/20 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary">SaTA</span>
            </div>
          </div>
        </div>
      </div>
    );
  }