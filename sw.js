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

// Fetch Event: Network first, then Cache (Safe strategy)
// Or Cache first, then Network (Better for offline tools)
// Below is a "Cache First, falling back to Network" strategy suitable for static tools.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cache if found, otherwise go to network
        return response || fetch(event.request);
      })
  );
});