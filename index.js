const STORAGE_KEY = "fishing-backpack";
const rawFishTypes = [
  { name: "小鯉魚", probability: 15.82249 },
  { name: "吳郭魚", probability: 10.79904 },
  { name: "青魚", probability: 8.71297 },
  { name: "金魚", probability: 6.14107 },
  { name: "河豚", probability: 6.12258 },
  { name: "鯽魚", probability: 5.74625 },
  { name: "鰱魚", probability: 4.20518 },
  { name: "草魚", probability: 3.90272 },
  { name: "沙丁魚", probability: 2.71779 },
  { name: "烏龜魚", probability: 1.76901 },
  { name: "海洋魚", probability: 2.13233 },
  { name: "湖泊魚", probability: 1.24181 },
  { name: "冰河魚", probability: 1.74768 },
  { name: "火山魚", probability: 1.5327 },
  { name: "沙漠魚", probability: 1.55953 },
  { name: "森林魚", probability: 0.98863 },
  { name: "峽谷魚", probability: 0.83787 },
  { name: "深淵魚", probability: 0.97456 },
  { name: "北極魚", probability: 0.63431 },
  { name: "熔岩魚", probability: 1.19725 },
  { name: "火焰魚", probability: 1.13901 },
  { name: "水流魚", probability: 0.61905 },
  { name: "雷電魚", probability: 1.02179 },
  { name: "風暴魚", probability: 0.99154 },
  { name: "大地魚", probability: 0.62663 },
  { name: "極光魚", probability: 0.66003 },
  { name: "黑霧魚", probability: 0.68657 },
  { name: "冰封魚", probability: 0.55289 },
  { name: "熱浪魚", probability: 0.78676 },
  { name: "閃電魚", probability: 0.42172 },
  { name: "寶藏魚", probability: 0.44468 },
  { name: "水晶魚", probability: 0.51272 },
  { name: "珍珠魚", probability: 0.66983 },
  { name: "龍鱗魚", probability: 0.63979 },
  { name: "鳳凰魚", probability: 0.03955 },
  { name: "魔法魚", probability: 0.54557 },
  { name: "神秘魚", probability: 0.6463 },
  { name: "天神魚", probability: 0.45163 },
  { name: "魔王魚", probability: 0.30987 },
  { name: "英雄魚", probability: 0.42233 },
  { name: "時間魚", probability: 0.03423 },
  { name: "空間魚", probability: 0.56153 },
  { name: "虛無魚", probability: 0.29301 },
  { name: "幻影魚", probability: 0.04591 },
  { name: "夢境魚", probability: 0.04587 },
  { name: "平行魚", probability: 0.32111 },
  { name: "次元魚", probability: 0.3215 },
  { name: "星辰魚", probability: 0.4476 },
  { name: "宇宙魚", probability: 0.48247 },
  { name: "黑洞魚", probability: 0.36202 },
  { name: "仙女魚", probability: 0.37602 },
  { name: "靈魂魚", probability: 0.32301 },
  { name: "古代魚", probability: 0.24447 },
  { name: "龍神魚", probability: 0.31295 },
  { name: "幻獸魚", probability: 0.39673 },
  { name: "地獄魚", probability: 0.3861 },
  { name: "天空魚", probability: 0.27725 },
  { name: "混沌魚", probability: 0.39883 },
  { name: "暗影魚", probability: 0.32845 },
  { name: "雷神魚", probability: 0.02902 },
  { name: "機械魚", probability: 0.28417 },
  { name: "核能魚", probability: 0.22778 },
  { name: "資料魚", probability: 0.23799 },
  { name: "雷射魚", probability: 0.20804 },
  { name: "賽博魚", probability: 0.30967 },
  { name: "鋼鐵魚", probability: 0.32752 },
  { name: "AI魚", probability: 0.35628 },
  { name: "螢光魚", probability: 0.19238 },
  { name: "未來魚", probability: 0.24336 },
  { name: "複製魚", probability: 0.2236 },
  { name: "長尾魚", probability: 0.30869 },
  { name: "大眼魚", probability: 0.04948 },
  { name: "花紋魚", probability: 0.21941 },
  { name: "獠牙魚", probability: 0.26351 },
  { name: "翅膀魚", probability: 0.24942 },
  { name: "雙頭魚", probability: 0.2751 },
  { name: "金背魚", probability: 0.24036 },
  { name: "幽藍魚", probability: 0.19171 },
  { name: "銀鱗魚", probability: 0.29629 },
  { name: "紅角魚", probability: 0.17904 },
  { name: "英靈魚", probability: 0.03769 },
  { name: "月影魚", probability: 0.23249 },
  { name: "黎明魚", probability: 0.03367 },
  { name: "重生魚", probability: 0.26928 },
  { name: "最終魚", probability: 0.22036 },
  { name: "毀滅魚", probability: 0.24854 },
  { name: "永恆魚", probability: 0.15918 },
  { name: "破碎魚", probability: 0.16218 },
  { name: "無盡魚", probability: 0.04004 },
  { name: "命運魚", probability: 0.23138 },
  { name: "哈哈魚", probability: 0.43795 },
  { name: "零卡魚", probability: 0.16898 },
  { name: "便當魚", probability: 0.22612 },
  { name: "抱枕魚", probability: 0.19077 },
  { name: "星爆魚", probability: 0.25101 },
  { name: "哭哭魚", probability: 0.20772 },
  { name: "蛋殼魚", probability: 0.13887 },
  { name: "雞腿魚", probability: 0.14021 },
  { name: "彩虹魚", probability: 0.04816 },
  { name: "終焉魚", probability: 0.005 },
];

const total = rawFishTypes.reduce(
  (sum, f) => sum + (typeof f.probability === "number" ? f.probability : 0),
  0
);

const fishTypes = rawFishTypes.map((f) => {
  const prob =
    typeof f.probability === "number" && total > 0
      ? parseFloat(((f.probability / total) * 100).toFixed(4))
      : 0;
  return {
    name: f.name,
    probability: prob,
  };
});

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
    if (probability < 0.1) rarityClass = "rarity-mythic"; // 紅
    else if (probability < 0.5) rarityClass = "rarity-legend"; // 紫
    else if (probability < 1) rarityClass = "rarity-epic"; // 黃
    else if (probability < 5) rarityClass = "rarity-rare"; // 藍

    html += `
        <div class="inventory-item ${rarityClass}">
            <div class="fish-probability">機率：${Number(probability).toFixed(
              3
            )}%</div>
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
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));
}

// 啟動
renderInventory();
scheduleNextFish();
startIdleFishingAnimation();
