const CACHE_NAME = "fishing-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/main.js", // 你的 JS 檔名
  "/style.css", // 你的 CSS 檔名
  "/images/user/fishing1.png",
  "/images/user/fishing2.png",
  "/images/user/fishing3.png",
  "/images/user/fishing4.png",
  // ...還有所有圖片、icon
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
