const CACHE_NAME = 'pyhub-v2.2';
const URLS_TO_CACHE = [
  '/Pyhub/',
  '/Pyhub/index.html',
  '/Pyhub/index_online.html',
  '/Pyhub/index_offline.html',
  '/Pyhub/manifest.json',
  '/Pyhub/icon-192.png',
  '/Pyhub/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
