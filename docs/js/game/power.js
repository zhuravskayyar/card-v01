/**
 * СИСТЕМА РОЗРАХУНКУ СИЛИ КАРТ
 * 
 * Формула прокачки:
 * power(level) = basePower * (upgradeMult) ^ (level - 1)
 * 
 * Приклади:
 * - Level 1: 10 * 1.12^0 = 10
 * - Level 2: 10 * 1.12^1 = 11.2 ≈ 11
 * - Level 3: 10 * 1.12^2 = 12.54 ≈ 13
 * - Level 5: 10 * 1.12^4 = 15.73 ≈ 16
 */

/**
 * Отримати поточну силу карти при певному рівні
 * 
 * @param {Object} card - об'єкт карти з basePower та upgradeMult
 * @param {number} level - рівень прокачки (мін 1)
 * @returns {number} округлена сила карти
 */
function getPower(card, level = 1) {
  if (!card) {
    console.warn('Invalid card passed to getPower:', card);
    return 0;
  }

  // Support cards that use `power` or `basePower` fields
  const base = (typeof card.basePower === 'number') ? card.basePower : (typeof card.power === 'number' ? card.power : null);
  if (base === null) {
    console.warn('Invalid card or missing basePower/power:', card);
    return 0;
  }

  const lvl = Math.max(1, Math.floor(level));
  const multiplier = card.upgradeMult || 1.1;
  // Формула: base * (mult)^(level-1)
  const power = base * Math.pow(multiplier, lvl - 1);
  return Math.round(power);
}

/**
 * Отримати масив сил карти при різних рівнях
 * Отримати масив сил карти при різних рівнях
 * Корисно для відображення таблиці прокачки
 * 
 * @param {Object} card - об'єкт карти
 * @param {number} maxLevel - максимальний рівень для показу
 * @returns {Array} масив [level, power]
 */
function getPowerProgression(card, maxLevel = 20) {
  const progression = [];
  for (let level = 1; level <= maxLevel; level++) {
    progression.push({
      level,
      power: getPower(card, level)
    });
  }
  return progression;
}

/**
 * Отримати приріст сили при переході між рівнями
 * 
 * @param {Object} card - об'єкт карти
 * @param {number} fromLevel - від якого рівня
 * @param {number} toLevel - до якого рівня
 * @returns {number} приріст сили (числo)
 */
function getPowerGain(card, fromLevel, toLevel) {
  const from = getPower(card, fromLevel);
  const to = getPower(card, toLevel);
  return to - from;
}

/**
 * Отримати відсоток приросту сили
 * 
 * @param {Object} card - об'єкт карти
 * @param {number} fromLevel - від якого рівня
 * @param {number} toLevel - до якого рівня
 * @returns {number} відсоток приросту (0-100)
 */
function getPowerGainPercent(card, fromLevel, toLevel) {
  const from = getPower(card, fromLevel);
  const to = getPower(card, toLevel);
  if (from === 0) return 0;
  return Math.round(((to - from) / from) * 100);
}

/**
 * Отримати стандартну силу карти (level 1)
 * 
 * @param {Object} card - об'єкт карти
 * @returns {number} базова сила
 */
function getBasePower(card) {
  return (card && (typeof card.basePower === 'number' ? card.basePower : (typeof card.power === 'number' ? card.power : 0))) || 0;
}

/**
 * Порівняти дві карти по силі при певному рівні
 * 
 * @param {Object} card1 - перша карта
 * @param {Object} card2 - друга карта
 * @param {number} level - рівень для порівняння
 * @returns {number} різниця (card1 - card2)
 */
function comparePower(card1, card2, level = 1) {
  const power1 = getPower(card1, level);
  const power2 = getPower(card2, level);
  return power1 - power2;
}

/**
 * Розрахувати силу колоди (сума всіх карт)
 * 
 * @param {Array} cards - масив карт
 * @param {number} level - рівень кожної карти
 * @returns {number} загальна сила колоди
 */
function getDeckPower(cards, level = 1) {
  if (!Array.isArray(cards)) return 0;
  
  return cards.reduce((total, card) => {
    return total + getPower(card, level);
  }, 0);
}

/**
 * Отримати інформацію про прокачку карти в текстовому форматі
 * 
 * @param {Object} card - об'єкт карти
 * @param {number} level - рівень карти
 * @returns {string} рядок інформації
 */
function getCardInfoString(card, level = 1) {
  const power = getPower(card, level);
  const mult = (card.upgradeMult * 100 - 100).toFixed(0);
  return `${card.name}: ${power} (+${mult}% за рівень)`;
}

/**
 * СИСТЕМА ПРОКАЧКИ КАРТ (XP-система)
 * Чиста реалізація без залежностей, легко розширювана.
 */

/**
 * Гарантувати, що прогрес карти існує (хелпер)
 * @param {Object} state - об'єкт гравця
 * @param {string} cardId - ID карти
 * @returns {Object} {level, xp}
 */
function getProgress(state, cardId) {
  if (!state.progress) state.progress = {};
  if (!state.progress[cardId]) {
    state.progress[cardId] = { level: 1, xp: 0 };
  }
  return state.progress[cardId];
}

/**
 * Скільки XP потрібно для ап на наступний рівень
 * Плавне зростання: lvl1→2: 20, lvl2→3: 32, lvl3→4: 46, lvl4→5: 62 ...
 * @param {number} level - поточний рівень
 * @returns {number} XP для level → level+1
 */
function xpNeed(level) {
  return Math.round(20 + 12 * (level - 1) + 2 * (level - 1) ** 2);
}

/**
 * Скільки XP дає карта при спаленні
 * lvl1 = 5, lvl5 = 50
 * Формула: (5 * level * (level + 3)) / 4
 * @param {number} level - рівень карти, яку спалюємо
 * @returns {number} кількість XP
 */
function xpValue(level) {
  return Math.round((5 * level * (level + 3)) / 4);
}

/**
 * Додати XP до карти і автоматично ап рівні
 * @param {Object} state - об'єкт гравця
 * @param {string} cardId - ID карти
 * @param {number} amount - скільки XP додати
 */
function addXp(state, cardId, amount) {
  const p = getProgress(state, cardId);
  p.xp += amount;

  // Ап рівнів, поки вистачає XP
  while (p.xp >= xpNeed(p.level)) {
    p.xp -= xpNeed(p.level);
    p.level += 1;
  }
}

/**
 * Рендерити XP-бар (оновити DOM елементи cu-*)
 * @param {Object} state - об'єкт гравця
 * @param {string} cardId - ID карти
 */
function renderUpgradeBar(state, cardId) {
  const cuLevel = document.getElementById('cu-level');
  const cuXpText = document.getElementById('cu-xp-text');
  const cuXpFill = document.getElementById('cu-xp-fill');

  if (!cuLevel || !cuXpText || !cuXpFill) {
    console.warn('Upgrade bar elements not found');
    return;
  }

  const prog = getProgress(state, cardId);
  const need = xpNeed(prog.level);
  const pct = Math.min(100, Math.round((prog.xp / need) * 100));

  cuLevel.textContent = `LV ${prog.level}`;
  cuXpText.textContent = `${prog.xp} / ${need} XP`;
  cuXpFill.style.width = `${pct}%`;
}

/**
 * Оновити стан кнопки Прокачити (disabled якщо немає карт для спалення)
 * @param {Object} state - об'єкт гравця
 * @param {string} cardId - ID карти для прокачки
 */
function updateUpgradeButton(state, cardId) {
  const btn = document.getElementById('cu-upgrade-btn');
  if (!btn) return;

  // Знайти дані карти для отримання стихії
  const cardData = window.getCardById ? window.getCardById(cardId) : null;
  if (!cardData) {
    btn.disabled = true;
    return;
  }

  // Знайти всі карти, які можемо спалити (та ж стихія, але не сама карта)
  const allCards = window.ALL_CARDS || window.CARDS_COMMON || [];
  const canBurn = allCards.some(c => {
    // Та ж стихія, але не сама карта
    if (c.element !== cardData.element || c.id === cardId) return false;
    // Перевірити інвентар (є карти для спалення)
    const count = state.inventory && state.inventory[c.id] ? state.inventory[c.id] : 0;
    return count > 0;
  });

  btn.disabled = !canBurn;
}

// Експортуємо глобально для браузера
window.getPower = getPower;
window.getPowerProgression = getPowerProgression;
window.getPowerGain = getPowerGain;
window.getPowerGainPercent = getPowerGainPercent;
window.getBasePower = getBasePower;
window.comparePower = comparePower;
window.getDeckPower = getDeckPower;
window.getCardInfoString = getCardInfoString;
window.getProgress = getProgress;
window.xpValue = xpValue;
window.xpNeed = xpNeed;
window.addXp = addXp;
window.renderUpgradeBar = renderUpgradeBar;
window.updateUpgradeButton = updateUpgradeButton;
