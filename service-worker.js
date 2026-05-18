const CACHE_NAME = 'pyhub-v2.1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index_online.html',
  '/index_offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('Failed to cache app shell:', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache successful responses for future offline use
            if (networkResponse && networkResponse.status === 200) {
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, clonedResponse);
                })
                .catch(err => {
                  console.error('Failed to cache response:', err);
                });
            }
            return networkResponse;
          })
          .catch(err => {
            // If offline and not cached, return a fallback
            console.warn('Fetch failed for:', event.request.url, err);
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline - Please check your internet connection.', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});