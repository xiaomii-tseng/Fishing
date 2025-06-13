// 📁 自動釣魚遊戲主邏輯

// 🐟 儲存魚資料
let fishTypes = [];
const STORAGE_KEY = "fishing-backpack";
let backpack = loadBackpack();
let autoFishingInterval = null;
let manualFishingTimeout = null;
let isAutoMode = true;

// 🎣 讀取 fish.json 並開始自動釣魚
fetch("fish.json")
  .then((res) => res.json())
  .then((data) => {
    fishTypes = assignPriceByProbability(normalizeFishProbabilities(data));
    updateBackpackUI();
    if (isAutoMode) startAutoFishing();
  })
  .catch((err) => console.error("❌ 載入魚資料失敗", err));

// 正規化魚的機率100%
function normalizeFishProbabilities(fishList) {
  const total = fishList.reduce((sum, f) => sum + f.probability, 0);
  return fishList.map((fish) => ({
    ...fish,
    probability: parseFloat(((fish.probability / total) * 100).toFixed(4)),
  }));
}

// 計算魚的價值
function assignPriceByProbability(fishList, baseValue = 100) {
  return fishList.map((fish) => {
    const price = Math.floor(baseValue / (fish.probability / 5));
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
const fishingStatus = document.getElementById("fishingStatus");
// 初始化狀態
if (fishingStatus) {
  fishingStatus.textContent = isAutoMode ? "自動釣魚中..." : "手動釣魚中...";
}
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    isAutoMode = !isAutoMode;
    toggleBtn.textContent = isAutoMode ? "自動模式" : "手動模式";
    // 🐟 更新狀態提示文字
    if (fishingStatus) {
      fishingStatus.textContent = isAutoMode
        ? "自動釣魚中..."
        : "手動釣魚中...";
    }
    stopAutoFishing();
    clearTimeout(manualFishingTimeout);
    if (isAutoMode) {
      startAutoFishing();
    } else {
      scheduleManualFishing();
    }
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
    const delay = Math.random() * (30000 - 15000) + 15000;
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

function scheduleManualFishing() {
  const delay = Math.random() * (12000 - 5000) + 5000;
  manualFishingTimeout = setTimeout(() => {
    startPrecisionBar();
  }, delay);
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
  const bottomInfo = document.getElementById("bottomInfo");
  if (bottomInfo) {
    bottomInfo.textContent = message;
    bottomInfo.classList.add("show");
    setTimeout(() => {
      bottomInfo.classList.remove("show");
    }, 5000);
  }
}

// 🎯 精度條控制
let precisionInterval = null;
let pos = 0;
let direction = 1;
const speed = 5;
const intervalTime = 16;

function startPrecisionBar() {
  if (precisionInterval) return;
  pos = 0;
  direction = 1;
  document.getElementById("precisionBarContainer").style.display = "flex";
  const track = document.getElementById("precisionTrack");
  const indicator = document.getElementById("precisionIndicator");
  const trackWidth = track.clientWidth;
  const indicatorWidth = indicator.clientWidth;
  precisionInterval = setInterval(() => {
    pos += speed * direction;
    if (pos >= trackWidth - indicatorWidth) {
      pos = trackWidth - indicatorWidth;
      direction = -1;
    } else if (pos <= 0) {
      pos = 0;
      direction = 1;
    }
    indicator.style.left = pos + "px";
  }, intervalTime);
}

function stopPrecisionBar() {
  if (!precisionInterval) return;
  clearInterval(precisionInterval);
  precisionInterval = null;
  const track = document.getElementById("precisionTrack");
  const indicator = document.getElementById("precisionIndicator");
  const trackWidth = track.clientWidth;
  const indicatorWidth = indicator.clientWidth;
  const precisionRatio = pos / (trackWidth - indicatorWidth);
  const successChance = 60 + precisionRatio * 38;
  const isSuccess = Math.random() * 100 < successChance;
  if (isSuccess) {
    const fish = getRandomFish();
    addFishToBackpack(fish.name);
    logCatch(`釣到了：${fish.name}!`);
  } else {
    logCatch("魚跑掉了...");
  }
  document.getElementById("precisionBarContainer").style.display = "none";
  if (!isAutoMode) scheduleManualFishing();
}

document
  .getElementById("precisionStopBtn")
  .addEventListener("click", stopPrecisionBar);

// ✅ PWA 支援
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));
}
