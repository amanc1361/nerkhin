const CACHE_NAME = "nerkhin-cache-v1";
const PRECACHE_URLS = ["/", "/favicon.ico", "/manifest.webmanifest"];
// نصب: کش اولیه
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});
// فعال‌سازی: حذف کش‌های قدیمی
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});
// هندل درخواست‌ها
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // ❌ فقط GET را کش کن؛ POST/PUT/DELETE اصلاً هندل نشوند
  if (req.method !== "GET") {
    return; // اجازه بده مستقیم بره شبکه
  }
  // Network-first برای صفحات (document)
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
    return;
  }
  // Cache-first برای استاتیک (script, style, image, font,…)
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          // فقط فایل‌های استاتیک را کش کن
          if (
            ["style", "script", "image", "font"].includes(req.destination) ||
            req.url.endsWith(".webmanifest")
          ) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
      );
    })
  );
});
