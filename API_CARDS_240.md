# 📚 API Довідник - Система 240 карт

## Швидкий старт

```javascript
import { CARDS, getCardById } from './js/data/cards.js';

// Отримати карту за ID
const card = getCardById('F01-R1');
console.log(card.name); // "Послушник Попелястого Сонця"
console.log(card.basePower); // 51
console.log(card.multiplier); // 1.00
```

## Імпорти

### ES6 модулі

```javascript
import { 
  CARDS,                // Масив всіх 240 карт
  getCardById,          // Функція пошуку карти за ID
  getAllCardIds,        // Масив всіх ID карт
  getCardsByElement,    // Карти за стихією
  getCardsByFaction,    // Карти за фракцією
  getCardsByRarity      // Карти за рідкістю
} from './js/data/cards.js';
```

### Глобальні змінні (window)

```javascript
// Масиви та індекси
window.ALL_CARDS          // Масив всіх карт
window.CARDS_BY_ID        // Індекс { "F01-R1": {...}, ... }
window.CARDS_BY_ELEMENT   // Групування { "fire": [...], ... }
window.CARDS_BY_FACTION   // Групування { "F01": [...], ... }
window.CARDS_BY_RARITY    // Групування { "common": [...], ... }

// Довідники
window.FACTION_NAMES      // { "F01": "Орден Попелястого Сонця", ... }
window.RARITY_MULTIPLIERS // { "R1": { value: 1.00, ... }, ... }

// Функції (deprecated, використовуйте ES6 імпорти)
window.getCardById(id)
window.getCardsByElement(element)
```

## Основні функції

### getCardById(id)

Отримати карту за унікальним ідентифікатором.

```javascript
const card = getCardById('F01-R6');

console.log(card);
// {
//   id: "F01-R6",
//   element: "fire",
//   faction: "F01",
//   factionName: "Орден Попелястого Сонця",
//   rarity: "mythic",
//   rarityDisplay: "Міфічна",
//   basePower: 51,
//   multiplier: 2.00,
//   name: "Емісар Чорного Полудня"
// }
```

**Параметри:**
- `id` (string) - ID карти у форматі "F##-R#"

**Повертає:**
- `object` - Об'єкт карти або `null`, якщо карту не знайдено

---

### getAllCardIds()

Отримати масив всіх ID карт.

```javascript
const ids = getAllCardIds();
console.log(ids.length); // 240
console.log(ids[0]); // "F01-R1"
console.log(ids[239]); // "F40-R6"
```

**Повертає:**
- `string[]` - Масив ID всіх 240 карт

---

### getCardsByElement(element)

Отримати всі карти певної стихії.

```javascript
const fireCards = getCardsByElement('fire');
console.log(fireCards.length); // 60 (фракції F01-F10)

const waterCards = getCardsByElement('water');
console.log(waterCards.length); // 60 (фракції F11-F20)
```

**Параметри:**
- `element` (string) - Стихія: `"fire"`, `"water"`, `"air"`, `"earth"`

**Повертає:**
- `object[]` - Масив карт відповідної стихії (60 карт)

---

### getCardsByFaction(factionId)

Отримати всі карти певної фракції.

```javascript
const ashSunCards = getCardsByFaction('F01');
console.log(ashSunCards.length); // 6 карт

ashSunCards.forEach(card => {
  console.log(`${card.name} (${card.rarityDisplay})`);
});
// Послушник Попелястого Сонця (Звичайна)
// Світоч Попелястих Молитв (Незвичайна)
// Інквізитор Сажі (Рідкісна)
// Паладин Сонячного Попелу (Епічна)
// Архонт Попелястого Світанку (Легендарна)
// Емісар Чорного Полудня (Міфічна)
```

**Параметри:**
- `factionId` (string) - ID фракції у форматі "F##" (F01-F40)

**Повертає:**
- `object[]` - Масив 6 карт фракції (R1-R6)

---

### getCardsByRarity(rarity)

Отримати всі карти певної рідкості.

```javascript
const mythicCards = getCardsByRarity('mythic');
console.log(mythicCards.length); // 40 (по 1 міфічній карті з кожної фракції)

const commonCards = getCardsByRarity('common');
console.log(commonCards.length); // 40
```

**Параметри:**
- `rarity` (string) - Рідкість: `"common"`, `"uncommon"`, `"rare"`, `"epic"`, `"legendary"`, `"mythic"`

**Повертає:**
- `object[]` - Масив карт відповідної рідкості (40 карт)

---

## Структура даних

### Об'єкт карти

```typescript
interface Card {
  id: string;              // "F##-R#" (F01-R1 ... F40-R6)
  element: string;         // "fire" | "water" | "air" | "earth"
  faction: string;         // "F##" (F01-F40)
  factionName: string;     // Назва фракції українською
  rarity: string;          // "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic"
  rarityDisplay: string;   // Назва рідкості українською
  basePower: number;       // 51-90 (50 + номер фракції)
  multiplier: number;      // 1.00, 1.10, 1.25, 1.45, 1.70, 2.00
  name: string;            // Назва карти українською
}
```

### Розрахунок фінальної сили

```javascript
function calculatePower(card) {
  return Math.round(card.basePower * card.multiplier);
}

const card = getCardById('F01-R6');
console.log(calculatePower(card)); // 102
```

---

## Приклади використання

### Пошук найсильнішої карти

```javascript
const strongestCard = CARDS.reduce((max, card) => {
  const maxPower = max.basePower * max.multiplier;
  const cardPower = card.basePower * card.multiplier;
  return cardPower > maxPower ? card : max;
});

console.log(strongestCard.name); // "Перша Скеля, Живий Обіт"
console.log(strongestCard.id); // "F40-R6"
console.log(strongestCard.basePower * strongestCard.multiplier); // 180
```

### Фільтрація карт за критеріями

```javascript
// Всі легендарні карти вогню
const fireLegendary = CARDS.filter(card => 
  card.element === 'fire' && card.rarity === 'legendary'
);
console.log(fireLegendary.length); // 10

// Всі карти з силою більше 100
const powerfulCards = CARDS.filter(card => 
  card.basePower * card.multiplier > 100
);
console.log(powerfulCards.length);
```

### Групування карт

```javascript
// Групування за стихіями та рідкістю
const grouped = {};

CARDS.forEach(card => {
  const key = `${card.element}-${card.rarity}`;
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(card);
});

console.log(grouped['fire-mythic'].length); // 10
console.log(grouped['water-common'].length); // 10
```

### Генерація випадкової колоди

```javascript
function getRandomDeck(element = null, deckSize = 9) {
  let pool = element ? getCardsByElement(element) : CARDS;
  
  // Перемішуємо
  pool = pool.sort(() => Math.random() - 0.5);
  
  // Беремо перші N карт
  return pool.slice(0, deckSize);
}

const fireДeck = getRandomDeck('fire', 9);
console.log('Колода вогню:', fireDeck.map(c => c.name));
```

### Аналіз балансу фракції

```javascript
function analyzeFaction(factionId) {
  const cards = getCardsByFaction(factionId);
  const factionName = cards[0]?.factionName;
  
  const powers = cards.map(c => c.basePower * c.multiplier);
  const total = powers.reduce((sum, p) => sum + p, 0);
  const avg = total / powers.length;
  
  console.log(`Фракція: ${factionName} (${factionId})`);
  console.log(`Середня сила: ${avg.toFixed(2)}`);
  console.log(`Діапазон: ${Math.min(...powers)} - ${Math.max(...powers)}`);
  
  return { factionName, avg, powers };
}

analyzeFaction('F01');
// Фракція: Орден Попелястого Сонця (F01)
// Середня сила: 68.17
// Діапазон: 51 - 102
```

### Пошук за назвою

```javascript
function findCardByName(searchTerm) {
  const term = searchTerm.toLowerCase();
  return CARDS.find(card => 
    card.name.toLowerCase().includes(term)
  );
}

const dragon = findCardByName('дракон');
console.log(dragon?.name); // "Червоний Дракон-Імператор"
console.log(dragon?.id); // "F04-R6"
```

---

## Константи та довідники

### Стихії

```javascript
const ELEMENTS = {
  FIRE: 'fire',
  WATER: 'water',
  AIR: 'air',
  EARTH: 'earth'
};

const ELEMENT_NAMES = {
  fire: '🔥 Вогонь',
  water: '💧 Вода',
  air: '💨 Повітря',
  earth: '🌍 Земля'
};
```

### Рідкості

```javascript
const RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic'
};

const RARITY_NAMES = {
  common: 'Звичайна',
  uncommon: 'Незвичайна',
  rare: 'Рідкісна',
  epic: 'Епічна',
  legendary: 'Легендарна',
  mythic: 'Міфічна'
};
```

### Множники рідкості

```javascript
// Доступно глобально
window.RARITY_MULTIPLIERS = {
  "R1": { value: 1.00, name: "common", displayName: "Звичайна" },
  "R2": { value: 1.10, name: "uncommon", displayName: "Незвичайна" },
  "R3": { value: 1.25, name: "rare", displayName: "Рідкісна" },
  "R4": { value: 1.45, name: "epic", displayName: "Епічна" },
  "R5": { value: 1.70, name: "legendary", displayName: "Легендарна" },
  "R6": { value: 2.00, name: "mythic", displayName: "Міфічна" }
};
```

### Назви фракцій

```javascript
// Доступно глобально
window.FACTION_NAMES['F01']; // "Орден Попелястого Сонця"
window.FACTION_NAMES['F20']; // "Архіви Забутих Морів"
window.FACTION_NAMES['F40']; // "Племена Першої Скелі"
```

---

## Перевірка та валідація

### Перевірка валідності ID

```javascript
function isValidCardId(id) {
  const pattern = /^F(0[1-9]|[1-3][0-9]|40)-R[1-6]$/;
  return pattern.test(id);
}

console.log(isValidCardId('F01-R1')); // true
console.log(isValidCardId('F40-R6')); // true
console.log(isValidCardId('F41-R1')); // false
console.log(isValidCardId('F01-R7')); // false
```

### Перевірка існування карти

```javascript
function cardExists(id) {
  return getCardById(id) !== null;
}

console.log(cardExists('F01-R1')); // true
console.log(cardExists('F99-R9')); // false
```

---

## Оптимізація та продуктивність

### Використання індексів

Для швидкого пошуку завжди використовуйте індекси:

```javascript
// ✅ ДОБРЕ - O(1)
const card = window.CARDS_BY_ID['F01-R1'];

// ❌ ПОГАНО - O(n)
const card = CARDS.find(c => c.id === 'F01-R1');
```

### Кешування результатів

```javascript
// Кешування фільтрів
const cache = new Map();

function getCardsByElementCached(element) {
  if (!cache.has(element)) {
    cache.set(element, getCardsByElement(element));
  }
  return cache.get(element);
}
```

---

## Troubleshooting

### Карта повертає null

```javascript
const card = getCardById('F01-R1');
if (!card) {
  console.error('Карту не знайдено. Перевірте:');
  console.error('1. Чи правильний формат ID (F##-R#)');
  console.error('2. Чи завантажився модуль cards.js');
  console.error('3. Чи є карта в діапазоні F01-F40, R1-R6');
}
```

### Масив карт порожній

```javascript
if (!CARDS || CARDS.length === 0) {
  console.error('Карти не завантажились!');
  console.error('Перевірте імпорт: import { CARDS } from "./js/data/cards.js"');
}
```

---

**Версія API:** 1.0  
**Сумісність:** ES6+  
**Останнє оновлення:** 10 січня 2026
