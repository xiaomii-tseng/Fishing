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
    updateMoneyUI();
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

// 魚的卡片邊框
function getRarityClass(probability) {
  if (probability > 5) return "rarity-common"; // 普通：白色
  if (probability > 0.5) return "rarity-uncommon"; // 高級：藍色
  if (probability > 0.2) return "rarity-rare"; // 稀有：黃色
  if (probability > 0.1) return "rarity-epic"; // 史詩：紫色
  if (probability > 0.05) return "rarity-mythic"; // 神話：紅色
  return "rarity-legend"; // 傳奇：彩色邊框
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

// 手動釣魚增加稀有度
function getWeightedFishByPrecision(precisionRatio) {
  // 建立一個新的魚池，加權機率會隨 precisionRatio 提升而往稀有魚偏移
  const weightedFish = fishTypes.map((fish) => {
    const rarityWeight = 1 / fish.probability; // 機率越低，值越高
    const bias = 1 + rarityWeight * precisionRatio * 0.1; // 可調係數 0.1
    return {
      ...fish,
      weight: fish.probability * bias,
    };
  });

  const total = weightedFish.reduce((sum, f) => sum + f.weight, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (const f of weightedFish) {
    sum += f.weight;
    if (rand < sum) return f;
  }
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

  // ✨ 排序處理
  let entries = Object.entries(backpack);
  if (currentSort) {
    entries.sort((a, b) => {
      const fishA = fishTypes.find((f) => f.name === a[0]);
      const fishB = fishTypes.find((f) => f.name === b[0]);
      const probA = fishA?.probability || 0;
      const probB = fishB?.probability || 0;
      return currentSort === "asc" ? probA - probB : probB - probA;
    });
  }

  // 🔁 建立卡片
  for (const [fishName, count] of entries) {
    const fish = fishTypes.find((f) => f.name === fishName);
    if (!fish) continue;

    const card = document.createElement("div");
    card.className = "fish-card";
    const rarityClass = getRarityClass(fish.probability); // ✅ 等有 fish 之後再呼叫
    card.classList.add(rarityClass);

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
    card.addEventListener("click", () => openSellModal(fish, count));
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
    const fish = getWeightedFishByPrecision(precisionRatio); // ✅ 改這行
    addFishToBackpack(fish.name);
    logCatch(`成功釣到：${fish.name}`);
  } else {
    logCatch("魚跑掉了...");
  }

  document.getElementById("precisionBarContainer").style.display = "none";
  if (!isAutoMode) scheduleManualFishing();
}

document
  .getElementById("precisionStopBtn")
  .addEventListener("click", stopPrecisionBar);

// 🛒 賣魚對話框
let money = loadMoney();
function openSellModal(fish, count) {
  const input = document.getElementById("sellQuantity");
  const label = document.getElementById("sellFishName");
  const total = document.getElementById("sellTotal");
  const confirmBtn = document.getElementById("confirmSell");

  // 初始化對話框內容
  input.max = count;
  input.value = 1;
  label.textContent = `販售：${fish.name}`;
  total.textContent = `${fish.price} G`;

  // 當使用者改變數量時重新計算總價
  input.oninput = () => {
    const qty = Math.min(input.valueAsNumber || 1, count);
    total.textContent = `${qty * fish.price} G`;
  };

  // 點擊「確定販售」按鈕時執行販售邏輯
  confirmBtn.onclick = () => {
    const qty = Math.min(input.valueAsNumber || 1, count);
    if (qty <= 0) return;

    // 扣除背包中的數量
    backpack[fish.name] -= qty;
    if (backpack[fish.name] <= 0) delete backpack[fish.name];

    // 增加金幣
    money += qty * fish.price;

    // 儲存並更新畫面
    saveBackpack();
    saveMoney();
    updateBackpackUI();
    updateMoneyUI();

    // 關閉對話框
    bootstrap.Modal.getInstance(document.getElementById("sellModal")).hide();
  };

  // 開啟對話框
  const modal = new bootstrap.Modal(document.getElementById("sellModal"));
  modal.show();
}
function saveMoney() {
  localStorage.setItem("fishing-money", money);
}
function loadMoney() {
  return parseInt(localStorage.getItem("fishing-money") || "0", 10);
}
function updateMoneyUI() {
  const el = document.getElementById("coinCount");
  if (el) el.textContent = money.toLocaleString();
}

// 排序
let currentSort = "desc";
document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  updateBackpackUI(); // 更新背包畫面
});

// ✅ PWA 支援
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));
}
