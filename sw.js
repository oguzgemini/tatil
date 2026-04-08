const CACHE_NAME = 'tatil-app-v1'; // Kodu her güncellediğinizde burayı v2, v3 yapın

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Önce ağdan en güncel halini çekmeye çalışır, yoksa önbelleği kullanır.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});