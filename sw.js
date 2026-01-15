// BUMPED VERSION TO v7 TO ENSURE FIXES LOAD
const CACHE_NAME = 'superfund-v7';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './Hazmat_logo.png',
  './192x192.png',
  './512x512.png',
  './Foamcalculator.html',
  './Hazmatboard.html',
  './manifest.json'
];

// Install Event: Cache files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Force new service worker to activate immediately
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim(); // Take control of open pages immediately
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  // Do not cache Google Script/Drive calls aggressively or they might break
  if (e.request.url.includes('google.com') || e.request.url.includes('googleapis')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});