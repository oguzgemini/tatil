const CACHE_NAME = 'tatil-app-v2'; // Sürümü v2 yaptık, bu sayede tarayıcı güncellemeyi algılayacak

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Yeni sürümün bekletilmeden hemen kurulmasını sağlar
});

self.addEventListener('activate', (event) => {
  // Yeni sürüm devreye girdiğinde, eski sürümün kalıntılarını (v1 vb.) temizler
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski önbellek temizleniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Önce internetten en güncel dosyayı çekmeye çalışır, 
  // internet yoksa önbellekteki (cache) dosyayı getirir.
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
