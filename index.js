const STORAGE_KEY = "fishing-backpack";
const rawFishTypes = [
  { name: "小鯉魚", probability: 15 },
  { name: "吳郭魚", probability: 10 },
  { name: "青魚", probability: 9 },
  { name: "金魚", probability: 8 },
  { name: "河豚", probability: 6 },
  { name: "章魚", probability: 5 },
  { name: "烏龜", probability: 4 },
  { name: "電鰻", probability: 3.5 },
  { name: "鯊魚", probability: 3 },
  { name: "珍珠魚", probability: 2.5 },
  { name: "寶藏魚", probability: 2 },
  { name: "魔法魚", probability: 1.8 },
  { name: "仙女魚", probability: 1.6 },
  { name: "夢幻魚", probability: 1.4 },
  { name: "靈魂魚", probability: 1.2 },
  { name: "熔岩魚", probability: 1 },
  { name: "極光魚", probability: 0.95 },
  { name: "水晶魚", probability: 0.9 },
  { name: "機械魚", probability: 0.85 },
  { name: "深海魚", probability: 0.8 },
  { name: "幻影魚", probability: 0.75 },
  { name: "雷電魚", probability: 0.7 },
  { name: "冰封魚", probability: 0.65 },
  { name: "地獄魚", probability: 0.6 },
  { name: "古代魚", probability: 0.55 },
  { name: "龍鱗魚", probability: 0.5 },
  { name: "天空魚", probability: 0.45 },
  { name: "烈焰魚", probability: 0.4 },
  { name: "時間魚", probability: 0.35 },
  { name: "寶石魚", probability: 0.3 },
  { name: "黑洞魚", probability: 0.25 },
  { name: "虛無魚", probability: 0.2 },
  { name: "時空魚", probability: 0.15 },
  { name: "次元魚", probability: 0.1 },
  { name: "雷神魚", probability: 0.08 },
  { name: "暗影魚", probability: 0.07 },
  { name: "風暴魚", probability: 0.06 },
  { name: "幻獸魚", probability: 0.05 },
  { name: "終焉魚", probability: 0.05 },
  { name: "星辰魚", probability: 0.05 },
  { name: "宇宙魚", probability: 0.05 },
  { name: "神秘魚", probability: 0.05 },
  { name: "混沌魚", probability: 0.05 },
  { name: "黎明魚", probability: 0.05 },
  { name: "重生魚", probability: 0.05 },
  { name: "光明魚", probability: 0.05 },
  { name: "無盡魚", probability: 0.05 },
  { name: "破碎魚", probability: 0.05 },
  { name: "最終魚", probability: 0.05 },
];

// Normalize to 100%
const total = rawFishTypes.reduce((sum, f) => sum + f.probability, 0);
const fishTypes = rawFishTypes.map((f) => ({
  name: f.name,
  probability: parseFloat(((f.probability / total) * 100).toFixed(4)),
}));

const logDiv = document.getElementById("log");
const inventoryDiv = document.getElementById("inventory");
const animationDiv = document.getElementById("fishing-animation");
let backpack = loadBackpack();
let idleIntervalId = null;

function getRandomFish() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const fish of fishTypes) {
    sum += fish.probability;
    if (rand <= sum) return fish.name;
  }
  return "？？？";
}
function logCatch(fish) {
  const timestamp = new Date().toLocaleTimeString();
  logDiv.innerHTML = `[${timestamp}] 你釣到了：${fish}<br>` + logDiv.innerHTML;

  if (!(fish in backpack)) {
    backpack[fish] = 0;
  }
  backpack[fish]++;
  saveBackpack();
  renderInventory();
}
function renderInventory() {
  const keys = Object.keys(backpack);
  if (keys.length === 0) {
    inventoryDiv.innerHTML = "(目前背包是空的)";
    return;
  }

  let html = '<div class="inventory-grid">';
  for (const fishName in backpack) {
    const fish = fishTypes.find((f) => f.name === fishName);
    const probability = fish ? fish.probability : "?";

    let rarityClass = "rarity-common"; // 預設灰
    if (probability < 0.1) rarityClass = "rarity-mythic"; // 紫
    else if (probability < 0.5) rarityClass = "rarity-legend"; // 紅
    else if (probability < 1) rarityClass = "rarity-epic"; // 黃
    else if (probability < 5) rarityClass = "rarity-rare"; // 藍

    html += `
        <div class="inventory-item ${rarityClass}">
            <div class="fish-probability">機率：${Number(probability).toFixed(3)}%</div>
            <div class="fish-name">${fishName}</div>
            <div>🐟 × ${backpack[fishName]}</div>
        </div>`;
  }
  html += "</div>";
  inventoryDiv.innerHTML = html;
}
function scheduleNextFish() {
  const delay = Math.random() * (30000 - 15000) + 5000;
  setTimeout(() => {
    const fish = getRandomFish();
    playFishingAnimation(fish);
    logCatch(fish);
    scheduleNextFish();
  }, delay);
}
function clearBackpack() {
  if (confirm("你確定要清空背包嗎？這個動作無法復原。")) {
    backpack = {};
    localStorage.removeItem(STORAGE_KEY);
    renderInventory();

    logDiv.innerHTML =
      `[${new Date().toLocaleTimeString()}] 背包已清空！<br>` +
      logDiv.innerHTML;

    const existingResult = animationDiv.querySelector(".fish-result");
    if (existingResult) existingResult.remove();

    const img = document.getElementById("fishing-img");
    if (img) img.src = "images/user/fishing1.png";
  }
}

function loadBackpack() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}
function saveBackpack() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(backpack));
}
function startIdleFishingAnimation() {
  const img = document.getElementById("fishing-img");
  let frame = 1;
  const maxFrame = 3;

  // 避免重複啟動
  if (idleIntervalId) clearInterval(idleIntervalId);

  idleIntervalId = setInterval(() => {
    frame = (frame % maxFrame) + 1;
    img.src = `images/user/fishing${frame}.png`;
  }, 500);
}

function stopIdleFishingAnimation() {
  if (idleIntervalId) {
    clearInterval(idleIntervalId);
    idleIntervalId = null;
  }
}
function playFishingAnimation(fishName, onFinished) {
  const animDiv = document.getElementById("fishing-animation");
  const img = document.getElementById("fishing-img");

  stopIdleFishingAnimation(); // ⛔ 停止 idle 動畫

  img.src = "images/user/fishing4.png";

  setTimeout(() => {
    const result = document.createElement("div");
    result.className = "fish-result";
    result.textContent = `釣到了：${fishName}！`;
    animDiv.appendChild(result);

    setTimeout(() => {
      result.remove();
      img.src = "images/user/fishing1.png";
      startIdleFishingAnimation(); // ✅ 播完之後恢復 idle 動畫
    }, 2000);
  }, 1500);

  setTimeout(() => {
    if (typeof onFinished === "function") {
      onFinished();
    }
  }, 3500);
}

// 啟動
renderInventory();
scheduleNextFish();
startIdleFishingAnimation();
