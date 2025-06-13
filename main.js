// 📁 自動釣魚遊戲主邏輯

// 🐟 儲存魚資料
let fishTypes = [];
const STORAGE_KEY = "fishing-backpack";
let backpack = loadBackpack();
let autoFishingInterval = null;
let isAutoMode = true;

// 🎣 讀取 fish.json 並開始自動釣魚
fetch("fish.json")
  .then((res) => res.json())
  .then((data) => {
    fishTypes = assignPriceByProbability(normalizeFishProbabilities(data));
    updateBackpackUI();
    startAutoFishing();
  })
  .catch((err) => console.error("❌ 載入魚資料失敗", err));

// 正規化魚的機率100%
function normalizeFishProbabilities(fishList) {
  const total = fishList.reduce((sum, f) => sum + f.probability, 0);
  return fishList.map((fish) => ({
    ...fish,
    probability: parseFloat(((fish.probability / total) * 100).toFixed(4)), // 先保留較高精度
  }));
}

// 計算魚的價值
function assignPriceByProbability(fishList, baseValue = 100) {
  return fishList.map((fish) => {
    const price = Math.floor(baseValue / (fish.probability / 5)); // 因為你正規化後是百分比
    return {
      ...fish,
      price,
    };
  });
}

// 👜 點擊背包按鈕打開 Modal
const openBackpackBtn = document.getElementById("openBackpack");
if (openBackpackBtn) {
  openBackpackBtn.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("backpackModal"));
    modal.show();
  });
}

// 🔁 模式切換邏輯
const toggleBtn = document.getElementById("toggleModeBtn");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    isAutoMode = !isAutoMode;
    toggleBtn.textContent = isAutoMode ? "自動模式" : "手動模式";
    isAutoMode ? startAutoFishing() : stopAutoFishing();
  });
}

// ✨ 點擊動畫效果
function addClickBounce(el) {
  el.classList.add("click-bounce");
  el.addEventListener(
    "animationend",
    () => {
      el.classList.remove("click-bounce");
    },
    { once: true }
  );
}

document.querySelectorAll(".fnc-anm").forEach((btn) => {
  btn.addEventListener("click", () => addClickBounce(btn));
});

// ⏳ 自動釣魚主迴圈
function startAutoFishing() {
  if (autoFishingInterval) return;

  const loop = () => {
    const delay = Math.random() * (3000 - 2000) + 5000;
    autoFishingInterval = setTimeout(() => {
      const success = Math.random() < 0.5;
      if (success) {
        const fish = getRandomFish();
        addFishToBackpack(fish.name);
        logCatch(`釣到了：${fish.name}!`);
      } else {
        logCatch("魚跑掉了...");
      }
      loop();
    }, delay);
  };

  loop();
}

function stopAutoFishing() {
  clearTimeout(autoFishingInterval);
  autoFishingInterval = null;
}

// 🎯 機率抽魚
function getRandomFish() {
  const total = fishTypes.reduce((sum, f) => sum + f.probability, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (let f of fishTypes) {
    sum += f.probability;
    if (rand < sum) return f;
  }
}

// 🧳 新增魚到背包並保存
function addFishToBackpack(fishName) {
  if (!backpack[fishName]) {
    backpack[fishName] = 1;
  } else {
    backpack[fishName]++;
  }
  saveBackpack();
  updateBackpackUI();
}

// 💾 LocalStorage 儲存 & 載入
function saveBackpack() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(backpack));
}

function loadBackpack() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// 📦 更新背包畫面
function updateBackpackUI() {
  const inventory = document.getElementById("inventory");
  if (!inventory) return;
  inventory.innerHTML = "";

  if (Object.keys(backpack).length === 0) {
    inventory.textContent = "(目前背包是空的)";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "fish-grid";

  for (const [fishName, count] of Object.entries(backpack)) {
    const fish = fishTypes.find((f) => f.name === fishName);
    if (!fish) continue;

    const card = document.createElement("div");
    card.className = "fish-card";
    card.innerHTML = `
      <img src="${fish.image}" class="fish-icon" alt="${fish.name}">
      <div class="fish-info">
        <div class="fish-name">${fish.name}</div>
        <div class="fish-count">數量：${count}</div>
        <div class="fish-probability">機率：${fish.probability.toFixed(
          2
        )}%</div>
        <div class="fish-value">💰：${fish.price} G</div>
      </div>
    `;
    grid.appendChild(card);
  }

  inventory.appendChild(grid);
}

// 釣魚資訊
function logCatch(message) {
  // 顯示在畫面底部浮出
  const bottomInfo = document.getElementById("bottomInfo");
  if (bottomInfo) {
    bottomInfo.textContent = message;
    bottomInfo.classList.add("show");

    // 過 5 秒淡出
    setTimeout(() => {
      bottomInfo.classList.remove("show");
    }, 5000);
  }
}

// 每次抓圖時，先看看快取有沒有，沒有就抓並加進快取
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const response = await cache.match(event.request);
      if (response) return response;

      const fetched = await fetch(event.request);
      if (
        event.request.url.startsWith(self.location.origin) &&
        event.request.destination === "image"
      ) {
        cache.put(event.request, fetched.clone());
      }
      return fetched;
    })
  );
});

// ✅ PWA 支援
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));
}
