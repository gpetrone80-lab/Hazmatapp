const CACHE_NAME = 'hazmat-ops-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './Foamcalculator.html',
  './Hazmatboard.html',
  './styles.css',
  './Hazmat_logo.png',
  './manifest.json'
];

// Install Event: Cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// FETCH EVENT: Network First for HTML, Cache First for everything else
self.addEventListener('fetch', (event) => {
  
  // 1. Check if the request is for an HTML page (like index.html)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // ONLINE: If we got a connection, show the new page AND save it to cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // OFFLINE: If internet fails, grab the version from the cache
          return caches.match(event.request);
        })
    );
  } else {
    // 2. For everything else (Images, CSS, Scripts), keep using Cache First for speed
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  } // 
}); // 