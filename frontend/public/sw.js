// sw.js — No-Cache / No-Offline

// هیچ فایل پیش‌بارگذاری/کش نداریم
// فقط مطمئن می‌شیم SW سریع فعال بشه و کش‌های قدیمی پاک شن.

self.addEventListener("install", (event) => {
  // سریع فعال شو
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // تمام کش‌های قبلی رو پاک کن
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      // کنترل همه‌ی کلاینت‌ها رو بگیر
      await self.clients.claim();
    })()
  );
});

// هیچ درخواستی را کش نکن و هیچ fallback آفلاینی نده.
// برای GETها هم صرفاً همون شبکه رو پاس می‌دیم (بدون کش SW).
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // فقط برای GET به‌صورت Network Only پاسخ می‌دیم تا مطمئن باشیم
  // هیچ چیزی از کش SW برنگرده.
  if (req.method === "GET") {
    event.respondWith(
      fetch(req, { cache: "no-store" }) // تلاش برای دورزدن HTTP cache مرورگر
    );
    return;
  }

  // برای سایر متدها (POST/PUT/DELETE...) اصلاً دخالت نمی‌کنیم
  // تا مستقیم بره شبکه.
});
