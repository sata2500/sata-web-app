export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                SaTA Web Platformu
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Blog ve çeşitli uygulamalar sunan modern bir web platformu
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <a className="btn btn-primary" href="/blog">
                Blog'a Göz At
              </a>
              <a className="btn btn-outline" href="/hakkimizda">
                Hakkımızda
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Özellikler
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                SaTA platformu neler sunuyor?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg border">
                <div className="p-2 rounded-full bg-primary-400/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M18 7V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"></path>
                    <path d="M5 14h14"></path>
                    <path d="M7 7v12"></path>
                    <path d="M17 7v12"></path>
                    <path d="M8 7h8"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">SaTA Blog</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Modern ve kullanıcı dostu blog platformu
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg border">
                <div className="p-2 rounded-full bg-secondary-400/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-secondary"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" x2="4" y1="22" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">SaTA ÖYS</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Öğrenme yönetim sistemi (Yakında)
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg border">
                <div className="p-2 rounded-full bg-primary-400/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5z"></path>
                    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">SaTA Müzik</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Müzik servisi (Yakında)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Bir Parçası Olun
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                SaTA platformuna katılmak için hemen kayıt olun.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <a className="btn btn-primary" href="/kaydol">
                Hemen Kaydol
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}