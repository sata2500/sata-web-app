import { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SchemaMarkup } from '@/components/seo/schema-markup';
import { createMetadata } from '@/app/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Hakkımızda',
  description: 'SaTA web platformu ve ekibimiz hakkında bilgi edinin.',
  path: '/hakkimizda'
});

export default function AboutPage() {
  return (
    <>
      <SchemaMarkup type="organization" />
      
      <Container>
        <div className="py-12 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Hakkımızda</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2>Vizyonumuz</h2>
            <p>
              SaTA, teknoloji ve eğitim alanında yenilikçi çözümler sunmayı hedefleyen bir web platformudur. 
              Amacımız, kullanıcı dostu araçlar geliştirerek bilgiye erişimi kolaylaştırmak ve içerik 
              üreticilerine modern bir platform sağlamaktır.
            </p>
            
            <h2>Başlangıç Hikayemiz</h2>
            <p>
              SaTA projesi, başlangıçta bir blog platformu olarak tasarlandı. Ancak zamanla, 
              daha fazla özellik ve işlevsellik ekleyerek kapsamlı bir web platformuna 
              dönüştürme vizyonuyla gelişmeye devam etmiştir.
            </p>
            
            <h2>Teknoloji Yaklaşımımız</h2>
            <p>
              SaTA, modern web teknolojileri kullanılarak geliştirilmiştir. Next.js, React, 
              TypeScript ve Firebase gibi teknolojileri kullanarak, performanslı, güvenli ve 
              ölçeklenebilir bir platform oluşturmayı amaçlıyoruz.
            </p>
            
            <h2>Açık Kaynak Felsefemiz</h2>
            <p>
              SaTA, açık kaynak bir proje olarak geliştirilmektedir. Kodumuz GitHub üzerinden 
              paylaşılmakta ve topluluk katkılarına açıktır. Bilginin paylaşıldıkça çoğalacağına 
              inanıyoruz ve bu felsefeyle hareket ediyoruz.
            </p>
            
            <h2>Gelecek Planlarımız</h2>
            <p>
              SaTA, gelecekte çeşitli modülleri bünyesinde barındıracak şekilde genişlemeyi hedefliyor:
            </p>
            <ul>
              <li><strong>SaTA-ÖYS:</strong> Öğrenme yönetim sistemi</li>
              <li><strong>SaTA-Müzik:</strong> Müzik platformu</li>
              <li><strong>Seher AI:</strong> Yapay zeka destekli içerik oluşturma ve analiz araçları</li>
            </ul>
            
            <h2>İletişim</h2>
            <p>
              Sorularınız, önerileriniz veya katkıda bulunmak için bizimle 
              <a href="/iletisim"> iletişim sayfamız</a> üzerinden iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}