// 📁 自動釣魚遊戲主邏輯

// 🐟 儲存魚資料
let fishTypes = [];
const STORAGE_KEY = "fishing-v3-backpack";
let backpack = loadBackpack();
let autoFishingInterval = null;
let manualFishingTimeout = null;
let isAutoMode = true;
let money = loadMoney();
let currentSort = "asc";
let longPressTimer = null;
let isMultiSelectMode = false;
const selectedFishIds = new Set();

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
// UUID
function generateUUID() {
  return "xxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
// 🎯 精度條控制
let precisionInterval = null;
let pos = 0;
let direction = 1;
const speed = 6;
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
// 釣魚資訊
function logCatchCard(fishObj, fishType) {
  const bottomInfo = document.getElementById("bottomInfo");
  if (!bottomInfo) return;

  bottomInfo.innerHTML = ""; // 清空
  bottomInfo.className = "bottom-info show"; // 重設 class

  if (fishType && fishObj) {
    const card = document.createElement("div");
    card.className = "fish-card";

    // 🪄 加上稀有度 class
    const rarityClass = getRarityClass(fishType.probability);
    card.classList.add(rarityClass);

    card.innerHTML = `
      <img src="${fishType.image}" class="fish-icon" alt="${fishType.name}">
      <div class="fish-info">
        <div class="fish-name">${fishType.name}</div>
        <div class="fish-size">體型：${fishObj.size.toFixed(1)} %</div>
        <div class="fish-value">💰：${fishObj.finalPrice} G</div>
      </div>
    `;
    bottomInfo.appendChild(card);
  } else {
    bottomInfo.textContent = "魚跑掉了...";
  }

  clearTimeout(bottomInfo._hideTimer);
  bottomInfo._hideTimer = setTimeout(() => {
    bottomInfo.classList.remove("show");
  }, 5000);
}
// 多選與單選的function
function enterMultiSelectMode() {
  isMultiSelectMode = true;
  selectedFishIds.clear();
  document.getElementById("multiSelectActions").style.display = "flex";
  updateBackpackUI();
}
function toggleFishSelection(id) {
  if (selectedFishIds.has(id)) {
    selectedFishIds.delete(id);
  } else {
    selectedFishIds.add(id);
  }
  updateCardSelectionUI();
}
function updateCardSelectionUI() {
  document.querySelectorAll(".fish-card").forEach((card) => {
    const id = card.dataset.id;
    card.classList.toggle("selected", selectedFishIds.has(id));
  });
}
function enterSelectStyleMode() {
  const body = document.querySelector(".modal-body");
  if (body) {
    body.classList.remove("select-body");
    body.classList.add("select-body2");
  }
}
function exitSelectStyleMode() {
  const body = document.querySelector(".modal-body");
  if (body) {
    body.classList.remove("select-body2");
    body.classList.add("select-body");
  }
}
// 多選與單選
function handleFishCardEvents(cardEl, fishObj) {
  cardEl.addEventListener("click", () => {
    if (isMultiSelectMode) {
      toggleFishSelection(fishObj.id);
      updateCardSelectionUI();
    }
  });
}
function exitMultiSelectMode() {
  isMultiSelectMode = false;
  selectedFishIds.clear();
  document.getElementById("multiSelectActions").style.display = "none";
  updateBackpackUI();
}
function batchSellSelected() {
  let total = 0;
  backpack = backpack.filter((f) => {
    if (selectedFishIds.has(f.id)) {
      total += f.finalPrice || 0;
      return false;
    }
    return true;
  });

  money += total;
  saveBackpack();
  saveMoney();
  updateMoneyUI();
  updateBackpackUI();
  exitMultiSelectMode();
}
function logCatch(message) {
  const bottomInfo = document.getElementById("bottomInfo");
  if (bottomInfo) {
    bottomInfo.textContent = message;
    bottomInfo.classList.add("show");

    // 清除先前計時器（避免多次觸發）
    clearTimeout(bottomInfo._hideTimer);
    bottomInfo._hideTimer = setTimeout(() => {
      bottomInfo.classList.remove("show");
    }, 5000);
  }
}
document
  .getElementById("precisionStopBtn")
  .addEventListener("click", stopPrecisionBar);

// 關閉指示器
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
    const fishType = getWeightedFishByPrecision(precisionRatio);
    addFishToBackpack(fishType);
  } else {
    logCatch("魚跑掉了...");
  }

  document.getElementById("precisionBarContainer").style.display = "none";
  if (!isAutoMode) {
    manualFishingTimeout = setTimeout(() => {
      startPrecisionBar();
    }, 5500);
  }
}

// 計算魚的價值
function assignPriceByProbability(fishList, baseValue = 70) {
  return fishList.map((fish) => {
    const price = Math.floor(baseValue / (fish.probability / 7));
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
  fishingStatus.textContent = isAutoMode ? "自動釣魚中..." : "機率加成中...";
}
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    isAutoMode = !isAutoMode;
    toggleBtn.textContent = isAutoMode ? "自動模式" : "手動模式";
    // 🐟 更新狀態提示文字
    if (fishingStatus) {
      fishingStatus.textContent = isAutoMode
        ? "自動釣魚中..."
        : "機率加成中...";
    }
    stopAutoFishing();
    clearTimeout(manualFishingTimeout);
    if (isAutoMode) {
      hidePrecisionBar();
      startAutoFishing();
    } else {
      startPrecisionBar();
    }
  });
}
// 關閉精度條
function hidePrecisionBar() {
  clearInterval(precisionInterval);
  precisionInterval = null;
  const container = document.getElementById("precisionBarContainer");
  if (container) container.style.display = "none";
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

// ⏳ 自動釣魚主迴圈
function startAutoFishing() {
  if (autoFishingInterval) return;

  const loop = () => {
    const delay = Math.random() * (30000 - 15000) + 15000;
    autoFishingInterval = setTimeout(() => {
      const success = Math.random() < 0.5;
      if (success) {
        const fishType = getRandomFish();
        addFishToBackpack(fishType);
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

// 打包卡片資訊
function createFishInstance(fishType) {
  // 隨機產生體型並四捨五入至小數點一位
  const size = parseFloat((Math.random() * 100).toFixed(1));
  // 根據體型計算最終價格（最高增加35%）
  const finalPrice = Math.floor(fishType.price * (1 + (size / 100) * 0.35));
  return {
    id: crypto.randomUUID(),
    name: fishType.name,
    size: size,
    finalPrice: finalPrice,
    caughtAt: new Date().toISOString(),
  };
}

// 🧳 新增魚到背包並保存
function addFishToBackpack(fishType) {
  const fishObj = createFishInstance(fishType);
  backpack.push(fishObj);
  saveBackpack();
  updateBackpackUI();
  logCatchCard(fishObj, fishType); // 改這裡：顯示卡片
}

// 💾 LocalStorage 儲存 & 載入
function saveBackpack() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(backpack));
}
function loadBackpack() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
function updateMoneyUI() {
  const el = document.getElementById("coinCount");
  if (el)
    el.textContent = parseInt(
      localStorage.getItem("fishing-money") || "0",
      10
    ).toLocaleString();
}
function saveMoney() {
  localStorage.setItem("fishing-money", money);
}
function loadMoney() {
  return parseInt(localStorage.getItem("fishing-money") || "0", 10);
}

// 📦 更新背包畫面
function updateBackpackUI() {
  const inventory = document.getElementById("inventory");
  if (!inventory) return;
  inventory.innerHTML = "";

  if (backpack.length === 0) {
    inventory.textContent = "(目前背包是空的)";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "fish-grid";

  // ✨ 排序處理
  let entries = [...backpack];
  if (currentSort) {
    entries.sort((a, b) => {
      const priceA = a.finalPrice || 0;
      const priceB = b.finalPrice || 0;
      return currentSort === "asc" ? priceA - priceB : priceB - priceA;
    });
  }

  // 🔁 建立卡片（用排序後的 entries）
  for (const fish of entries) {
    const fishType = fishTypes.find((f) => f.name === fish.name);
    if (!fishType) continue;

    const rarityClass = getRarityClass(fishType.probability);
    const card = document.createElement("div");
    card.className = `fish-card ${rarityClass}`;
    card.dataset.id = fish.id;
    card.innerHTML = `
      <img src="${fishType.image}" class="fish-icon" alt="${fish.name}">
      <div class="fish-info">
        <div class="fish-name">${fish.name}</div>
        <div class="fish-size">體型：${fish.size.toFixed(1)} %</div>
        <div class="fish-value">💰：${fish.finalPrice} G</div>
      </div>
    `;
    handleFishCardEvents(card, fish);
    grid.appendChild(card);
  }

  inventory.appendChild(grid);
}

// 抽寶箱
const BUFF_TYPES = [
  { type: "increaseCatchRate", label: "增加上鉤率" },
  { type: "increaseRareRate", label: "增加稀有率" },
  { type: "increaseBigFishChance", label: "大體型魚機率" },
  { type: "increaseSellValue", label: "增加販售金額" },
];

const RARITY_TABLE = [
  { key: "common", label: "普通", buffCount: 1 },
  { key: "uncommon", label: "高級", buffCount: 2 },
  { key: "rare", label: "稀有", buffCount: 3 },
];

const RARITY_PROBABILITIES = [
  { rarity: "普通", chance: 94 },
  { rarity: "高級", chance: 5.5 },
  { rarity: "稀有", chance: 0.5 },
];
const CHEST_COST = 50;

document.querySelector(".shop-chest").addEventListener("click", () => {
  const currentMoney = parseInt(
    localStorage.getItem("fishing-money") || "0",
    10
  );

  if (currentMoney < CHEST_COST) {
    alert("金幣不足，無法抽寶箱！");
    return;
  }

  // 扣錢
  const updatedMoney = currentMoney - CHEST_COST;
  localStorage.setItem("fishing-money", updatedMoney.toString());
  updateMoneyUI(); // 若有即時更新顯示金額的 function

  // 正常抽裝備
  fetch("item.json")
    .then((res) => res.json())
    .then((items) => {
      const item = getRandomItem(items);
      const rarity = getRandomRarity();
      const buffs = generateBuffs(rarity.buffCount);

      const newEquip = {
        id: crypto.randomUUID(),
        name: item.name,
        image: item.image,
        type: item.type,
        rarity: rarity.key,
        buffs: buffs,
      };

      saveToOwnedEquipment(newEquip);
      showEquipmentGetModal(newEquip);
    });
});

// 從 item.json 抽一個
function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// 隨機稀有度（可機率控制）
function getRandomRarity() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const entry of RARITY_PROBABILITIES) {
    sum += entry.chance;
    if (rand < sum) {
      return RARITY_TABLE.find((r) => r.label === entry.rarity);
    }
  }
  return RARITY_TABLE.find(
    (r) =>
      r.label === RARITY_PROBABILITIES[RARITY_PROBABILITIES.length - 1].rarity
  );
}

// 給對應數量 buff
function generateBuffs(count) {
  const shuffled = [...BUFF_TYPES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((buff) => ({
    type: buff.type,
    label: buff.label,
    value: getBuffValue(buff.type),
  }));
}

// 可根據 buff 類型定義不同範圍
function getBuffValue(type) {
  switch (type) {
    case "increaseCatchRate":
      return randomInt(1, 30);
    case "increaseRareRate":
      return randomInt(1, 30);
    case "increaseBigFishChance":
      return randomInt(1, 30);
    case "increaseSellValue":
      return randomInt(1, 30);
    default:
      return 1;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 跳出卡片
function showEquipmentGetModal(equip) {
  const card = document.getElementById("equipmentGetCard");
  card.innerHTML = `
    <div class="equipment-top">
      <img src="${equip.image}" alt="裝備圖示" class="equipment-icon" />
      <div class="equipment-name">${equip.name}</div>
    </div>
    <ul class="equipment-buffs">
      ${equip.buffs
        .map((buff) => `<li>${buff.label} +${buff.value}%</li>`)
        .join("")}
    </ul>
  `;

  const modal = new bootstrap.Modal(
    document.getElementById("equipmentGetModal")
  );
  modal.show();
}

// 儲存到 localStorage
function saveToOwnedEquipment(item) {
  const list = JSON.parse(localStorage.getItem("owned-equipment") || "[]");
  list.push(item);
  localStorage.setItem("owned-equipment", JSON.stringify(list));
  updateOwnedEquipListUI();
}
function updateOwnedEquipListUI() {
  const container = document.getElementById("ownedEquipList");
  if (!container) return;

  const owned = JSON.parse(localStorage.getItem("owned-equipment") || "[]");

  container.innerHTML = ""; // 清空現有內容

  for (const equip of owned) {
    const card = document.createElement("div");
    card.className = "equipment-card";

    // 裝備卡片結構
    card.innerHTML = `
      <div class="equipment-top">
        <img src="${equip.image}" alt="裝備圖示" class="equipment-icon" />
        <div class="equipment-name">${equip.name}</div>
      </div>
      <ul class="equipment-buffs">
        ${equip.buffs
          .map((buff) => `<li>${buff.label} +${buff.value}%</li>`)
          .join("")}
      </ul>
    `;

    container.appendChild(card);
    card.addEventListener("click", () => {
      openEquipActionModal(equip);
    });
  }
}

// 選取的裝備
function openEquipActionModal(equip) {
  const modal = new bootstrap.Modal(document.getElementById("equipActionModal"));
  const content = document.getElementById("equipActionContent");

  content.innerHTML = `
    <div class="equipment-card">
      <div class="equipment-top">
        <img src="${equip.image}" class="equipment-icon" />
        <div class="equipment-name">${equip.name}</div>
      </div>
      <ul class="equipment-buffs">
        ${equip.buffs.map(b => `<li>${b.label} +${b.value}%</li>`).join("")}
      </ul>
    </div>
  `;

  // 你可以在這裡綁定每個按鈕功能
  document.getElementById("equipBtn").onclick = () => {
    console.log("裝備功能（之後實作）");
    modal.hide();
  };
  document.getElementById("dismantleBtn").onclick = () => {
    console.log("拆解功能（之後實作）");
    modal.hide();
  };
  modal.show();
}
// 下面是 document
document.getElementById("openShop").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("shopModal"));
  modal.show();
});

document.getElementById("startMultiSelect").addEventListener("click", () => {
  enterMultiSelectMode();
  enterSelectStyleMode();
});
document.getElementById("multiSellBtn").addEventListener("click", () => {
  batchSellSelected();
  exitMultiSelectMode();
  exitSelectStyleMode();
});
document
  .getElementById("cancelMultiSelectBtn")
  .addEventListener("click", () => {
    exitMultiSelectMode();
    exitSelectStyleMode();
  });
document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  updateBackpackUI();
});
document.querySelectorAll(".fnc-anm").forEach((btn) => {
  btn.addEventListener("click", () => addClickBounce(btn));
});
document.getElementById("openEquip").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("equipModal"));
  modal.show();
  updateOwnedEquipListUI();
});
// ✅ PWA 支援
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));
}
