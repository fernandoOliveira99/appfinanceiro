

import "../styles/globals.css";
import { theme } from "@config/design-system";
import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import MobileTopBar from "@components/MobileTopBar";
import AuthProvider from "@components/AuthProvider";

export const metadata = {
  title: "App Finanças",
  description: "Dashboard pessoal de finanças com visual fintech moderno.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "App Finanças",
  },
};

export const viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="https://ui-avatars.com/api/?name=F&background=7c3aed&color=fff&size=192&rounded=true" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function applyTheme(theme) {
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.colorScheme = 'dark';
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.style.colorScheme = 'light';
                    }
                  }

                  var savedTheme = localStorage.getItem('theme');
                  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                  
                  // Aplica tema inicial
                  var initialTheme = savedTheme || (mediaQuery.matches ? 'dark' : 'light');
                  applyTheme(initialTheme);

                  // Listener para mudanças no sistema em tempo real
                  mediaQuery.addEventListener('change', function(e) {
                    // Quando o sistema muda, seguimos o sistema e limpamos a escolha manual
                    // Isso garante que o site sempre se adapte ao celular do usuário
                    localStorage.removeItem('theme');
                    applyTheme(e.matches ? 'dark' : 'light');
                  });
                } catch (e) {}
              })();

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${theme.colors.background} min-h-screen text-slate-900 dark:text-slate-50 overflow-x-hidden w-full select-none touch-pan-y`}
      >
        <AuthProvider>
          <div className="w-full max-w-full overflow-x-hidden relative">
            {/* MOBILE LAYOUT: top bar controla navegação em telas pequenas */}
            <MobileTopBar />
            <div className={`relative min-h-screen ${theme.colors.background} pb-28 md:pb-0 overflow-x-hidden w-full`}>
            <div className="absolute inset-0 opacity-40 blur-3xl pointer-events-none bg-violet-500/10 dark:bg-violet-500/5" />
            <div className="relative flex min-h-screen w-full">
              {/* DESKTOP LAYOUT: sidebar fixa à esquerda */}
              <Sidebar />
              <main className="flex-1 flex flex-col w-full overflow-x-hidden">
                {/* DESKTOP HEADER: visível apenas em md+ */}
                <div className="hidden md:block w-full">
                  <Header />
                </div>
                {/* Conteúdo principal - flex-1 garante que ocupe o espaço restante */}
                <div
                  className={`${theme.spacing.layoutGutter} flex-1 flex flex-col gap-6 pb-8 md:pb-8 w-full`}
                >
                  {children}
                </div>
              </main>
            </div>
          </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

