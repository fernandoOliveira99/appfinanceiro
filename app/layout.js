

import "../styles/globals.css";
import { theme } from "@config/design-system";
import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import MobileTopBar from "@components/MobileTopBar";
import MobileBottomNav from "@components/MobileBottomNav";
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
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="https://ui-avatars.com/api/?name=F&background=7c3aed&color=fff&size=192&rounded=true" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (!theme) theme = 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
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
        className={`${theme.colors.background} min-h-screen text-slate-900 dark:text-slate-50 overflow-x-hidden max-w-full w-full select-none touch-pan-y`}
      >
        <AuthProvider>
          {/* MOBILE LAYOUT: top bar e bottom nav controlam navegação em telas pequenas */}
          <MobileTopBar />
          <div className={`relative min-h-screen ${theme.colors.background} pb-24 md:pb-0 overflow-x-hidden w-full`}>
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
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

