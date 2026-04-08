const CACHE_NAME = 'tatil-app-v3'; // Arşiv özelliği eklendiği için sürümü v3 yaptık

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Yeni sürümün bekletilmeden hemen kurulmasını sağlar
});

self.addEventListener('activate', (event) => {
  // Yeni sürüm devreye girdiğinde, eski sürümün kalıntılarını (v1, v2 vb.) temizler
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
  // Firebase veritabanı ve Auth isteklerini önbellekten hariç tutuyoruz.
  // (Çünkü Firebase'in kendi çevrimdışı senkronizasyon mekanizması var, çakışma olmamalı)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) {
      return; 
  }

  // Ağ Öncelikli (Network First) Stratejisi
  // Önce internetten en güncel dosyayı çekmeye çalışır, 
  // internet yoksa önbellekteki (cache) dosyayı getirir.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Yalnızca başarılı ve GET metodu ile yapılan istekleri önbelleğe al
        // (POST/PUT istekleri önbelleğe alınamaz, hata fırlatmasını engelleriz)
        if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
