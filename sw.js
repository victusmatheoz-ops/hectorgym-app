const CACHE_NAME = 'hectorgym-v3';

// Solo se cachean imágenes e iconos (raramente cambian)
const IMMUTABLE_ASSETS = [
  '/images/gym_bg.jpg',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Instalar: cachear solo imágenes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(IMMUTABLE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar: eliminar TODOS los caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first para HTML/CSS/JS; cache-only para imágenes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API: siempre red
  if (url.pathname.startsWith('/api')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Imágenes: cache-first (no cambian)
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // HTML, CSS, JS: network-first — siempre sirve la versión más reciente
  event.respondWith(
    fetch(event.request).then((response) => response).catch(() => caches.match(event.request))
  );
});
