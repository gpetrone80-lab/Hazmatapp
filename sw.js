// Hazmat PWA - cache version v16
const CACHE_NAME = 'hazmat-pwa-v16';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './Hazmat_logo.png',
  './192x192.png',
  './512x512.png',
  './Foamcalculator.html',
  './Hazmatboard.html',
  './manifest.json',
  './Accountability.html',
  './Erglookup.html',
  './erg-data.js',
  './UnitConverter.html',
  './MeterLog.html',
  './TeamInstall.html',
  './qr-install.png'
];

// Install: pre-cache the app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : undefined)))
    )
  );
  self.clients.claim();
});

// Fetch:
// - cross-origin requests (Google Drive, Skydio, ERG pdf, etc.) go straight to network
// - navigations: network-first, fall back to cache, then offline to index.html
// - same-origin assets: cache-first, then network (and refresh the cache)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((r) => r || caches.match('./index.html'))
        )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(
      (res) =>
        res ||
        fetch(e.request).then((netRes) => {
          if (e.request.method === 'GET' && netRes && netRes.ok) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
          }
          return netRes;
        })
    )
  );
});
