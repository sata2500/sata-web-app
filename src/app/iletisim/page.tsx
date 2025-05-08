import { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { ContactForm } from '@/components/contact/contact-form';
import { SchemaMarkup } from '@/components/seo/schema-markup';
import { createMetadata } from '@/app/metadata';

export const metadata: Metadata = createMetadata({
  title: 'İletişim',
  description: 'SaTA ekibi ile iletişime geçin, sorularınızı sorun veya önerilerinizi paylaşın.',
  path: '/iletisim'
});

export default function ContactPage() {
  return (
    <>
      <SchemaMarkup type="website" />
      
      <Container>
        <div className="py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">İletişim</h1>
          
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold mb-4">Bizimle İletişime Geçin</h2>
              <p className="text-lg mb-6">
                Sorularınız, önerileriniz veya işbirliği teklifleriniz için aşağıdaki iletişim formunu 
                kullanabilir veya doğrudan e-posta adresimizden bize ulaşabilirsiniz.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">E-posta</h3>
                    <a href="mailto:info@sata.com.tr" className="text-primary hover:underline">
                      info@sata.com.tr
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Web</h3>
                    <a href="https://sata.com.tr" className="text-primary hover:underline">
                      https://sata.com.tr
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">GitHub</h3>
                    <a href="https://github.com/sata-project" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      github.com/sata-project
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">İletişim Formu</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}