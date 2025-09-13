// public/sw.js
const CACHE_NAME = "nerkhin-cache-v1";
const PRECACHE_URLS = ["/", "/favicon.ico", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Network-first برای صفحات؛ Cache-first برای استاتیک
  if (req.method === "GET") {
    if (req.destination === "document") {
      event.respondWith(
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            return res;
          })
          .catch(() => caches.match(req))
      );
    } else {
      event.respondWith(
        caches.match(req).then((cached) => {
          return (
            cached ||
            fetch(req).then((res) => {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
              return res;
            })
          );
        })
      );
    }
  }
});
