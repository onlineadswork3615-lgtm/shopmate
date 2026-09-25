// ShopMate AI — Service Worker v2 (Fast Cache)
const CACHE_NAME = "shopmate-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
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
  // Google Apps Script API — always network
  if (event.request.url.includes("script.google.com")) return;

  // HTML, CSS, JS — Cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Background-এ update
        fetch(event.request).then(fresh => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, fresh));
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
