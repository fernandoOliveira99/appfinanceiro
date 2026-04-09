const CACHE_NAME = 'app-financas-v3';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/styles/globals.css',
  '/favicon.ico',
  'https://ui-avatars.com/api/?name=F&background=7c3aed&color=fff&size=192&rounded=true'
];

// Instalação: Cacheia ativos estáticos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando ativos estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de Fetch:
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora chamadas de IA e autenticação
  if (url.pathname.includes('/api/ai-insights') || url.pathname.includes('/api/auth')) {
    return;
  }

  // Se for uma navegação (página HTML), tenta Rede e falha para o Cache da página principal
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/dashboard') || caches.match('/');
      })
    );
    return;
  }

  // Se for uma chamada de API (GET), tenta Rede depois Cache
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Para outros arquivos (JS, CSS, Imagens): Cache First
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((networkResponse) => {
        if (request.method === 'GET' && networkResponse.status === 200) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return networkResponse;
      });
    })
  );
});
