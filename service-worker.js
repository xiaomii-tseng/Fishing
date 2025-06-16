const CACHE_NAME = "fishing-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/js/main.js",
  "/css/main.css",
  "/manifest.json",
  "/images/icons/icon-192.png",
  "/images/icons/icon-512.png",
  "/images/index/index3.jpg",
  "/images/shop/chest1.png",
  "/images/shop/chest2.png",
  "/images/index/chest2.gif"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
