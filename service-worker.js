const CACHE_NAME = "fishing-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/main.js", // 你的 JS 檔名
  "/main.css", // 你的 CSS 檔名
  "/images/index/index1.jpg",
  "/images/index/backpackbg.jpg",
  "/images/icons/coin.png",
  "/images/icons/equip.png",
  "/images/icons/backpack.png",
  "/images/icons/shop.png",
  // 魚
  "/images/fishes/fish1.png",
  "/images/fishes/fish2.png",
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
