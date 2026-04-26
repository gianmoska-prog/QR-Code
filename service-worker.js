const CACHE_NAME = 'moscatelli-qr-pwa-ambience-v2.1.0';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css?v=ambience-2.1.0',
  './assets/js/app.js?v=ambience-2.1.0',
  './assets/qr-code.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png'
];

const FALLBACK_MAP = new Map([
  ['/assets/css/styles.css', './assets/css/styles.css?v=ambience-2.1.0'],
  ['/assets/js/app.js', './assets/js/app.js?v=ambience-2.1.0']
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => {
          if (cached) return cached;
          const url = new URL(request.url);
          const fallback = FALLBACK_MAP.get(url.pathname);
          return fallback ? caches.match(fallback) : undefined;
        }))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});
