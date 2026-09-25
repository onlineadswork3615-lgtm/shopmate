// ShopMate AI — Service Worker
const CACHE_NAME = "shopmate-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(n => { if (n !== CACHE_NAME) return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.url.includes("script.google.com")) return;
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});