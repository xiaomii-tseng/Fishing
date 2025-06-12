// 打開背包
document.getElementById("openBackpack").addEventListener("click", function () {
  const modal = new bootstrap.Modal(document.getElementById("backpackModal"));
  modal.show();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));
}
