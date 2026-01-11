# 🎴 СИСТЕМА КАРТ ТА ПРОКАЧКИ

## 📋 Структура даних карти

```javascript
{
  id: "C-F-001",           // Унікальний ID
  element: "fire",         // Стихія: fire | water | air | earth
  basePower: 10,          // Базова сила (рівень 1)
  upgradeMult: 1.12,      // Множник прокачки (9%-14% за рівень)
  name: "Котельний Іфрит" // Назва карти
}
```

## 🔧 Файли системи

### 1. `js/data/cards.js`
База всіх карт у грі

**Експорти:**
- `CARDS_COMMON` - 16 карт common рівня
- `ALL_CARDS` - всі карти (об'єднання всіх рівнів)
- `CARDS_BY_ID` - індекс за ID (для швидкого пошуку)
- `CARDS_BY_ELEMENT` - групування по стихіях

**Формат ID:**
- `C-F-001` → Common, Fire, №1
- `R-W-002` → Rare, Water, №2
- `E-A-001` → Epic, Air, №1
- `L-E-001` → Legend, Earth, №1

### 2. `js/game/power.js`
Розрахунки сили карт та прокачки

**Основні функції:**

#### `getPower(card, level)`
Отримати силу карти при певному рівні
```javascript
import { getPower } from './js/game/power.js';

const card = { basePower: 10, upgradeMult: 1.12 };
getPower(card, 1);   // 10
getPower(card, 2);   // 11
getPower(card, 5);   // 16
```

**Формула:** `power = basePower * (upgradeMult) ^ (level - 1)`

#### Інші функції:
- `getPowerProgression(card, maxLevel)` - таблиця всіх рівнів
- `getPowerGain(card, from, to)` - приріст сили
- `getPowerGainPercent(card, from, to)` - % приросту
- `getBasePower(card)` - базова сила
- `comparePower(card1, card2, level)` - порівняння карт
- `getDeckPower(cards, level)` - сила цілої колоди
- `getCardInfoString(card, level)` - текст інформації

### 3. `js/data/cards_index.js`
Індекси та пошукові функції

**Основні функції:**

#### `getCardById(id)`
```javascript
import { getCardById } from './js/data/cards_index.js';

const card = getCardById('C-F-001');
// { id: "C-F-001", name: "Котельний Іфрит", ... }
```

#### `getCardsByElement(element)`
```javascript
const fireCards = getCardsByElement('fire');
// Масив з 4 вогняних карт (common)
```

#### `getCardsByRarity(rarity)`
```javascript
const rareCards = getCardsByRarity('rare');
// Масив всіх рідкісних карт
```

#### Інші функції:
- `searchCards(query)` - пошук по назві
- `getRandomCards(count, element)` - випадкові карти
- `findCard(predicate)` - пошук по умові
- `filterCards(predicate)` - фільтрація
- `getCardsStats()` - статистика

## 📊 Поточна база карт (Common)

### Вогонь (4 карти)
| ID | Назва | BasePower | Mult |
|----|-------|-----------|------|
| C-F-001 | Котельний Іфрит | 10 | 1.12 |
| C-F-002 | Паровий Саламандр | 11 | 1.10 |
| C-F-003 | Вугільний Гоблін | 9 | 1.14 |
| C-F-004 | Мідний Піромех | 12 | 1.09 |

### Вода (4 карти)
| ID | Назва | BasePower | Mult |
|----|-------|-----------|------|
| C-W-001 | Гідропомпний Дух | 10 | 1.11 |
| C-W-002 | Краплинний Автомат | 9 | 1.13 |
| C-W-003 | Портовий Левіафан | 11 | 1.10 |
| C-W-004 | Сифонний Кракен | 12 | 1.09 |

### Повітря (4 карти)
| ID | Назва | BasePower | Mult |
|----|-------|-----------|------|
| C-A-001 | Вітровий Дирижабльник | 10 | 1.11 |
| C-A-002 | Турбінний Сфинкс | 9 | 1.13 |
| C-A-003 | Пружинний Альбатрос | 11 | 1.10 |
| C-A-004 | Аерошестер | 12 | 1.09 |

### Земля (4 карти)
| ID | Назва | BasePower | Mult |
|----|-------|-----------|------|
| C-E-001 | Шахтний Голем | 10 | 1.12 |
| C-E-002 | Гвинтовий Кріт | 9 | 1.14 |
| C-E-003 | Бронзовий Бик | 11 | 1.10 |
| C-E-004 | Камінний Мех | 12 | 1.09 |

**Разом: 16 карт common рівня**

## 📈 Приклад прокачки карти

```javascript
import { getPower, getPowerProgression } from './js/game/power.js';

const card = { 
  id: 'C-F-001',
  basePower: 10, 
  upgradeMult: 1.12,
  name: 'Котельний Іфрит'
};

// Одна карта на різних рівнях
for (let lvl = 1; lvl <= 10; lvl++) {
  console.log(`Рівень ${lvl}: ${getPower(card, lvl)}`);
}
// Рівень 1: 10
// Рівень 2: 11
// Рівень 3: 12
// Рівень 4: 14
// Рівень 5: 16
// Рівень 6: 18
// Рівень 7: 20
// Рівень 8: 22
// Рівень 9: 25
// Рівень 10: 28
```

## 🎮 Інтеграція в гру

### У компоненті відображення карти:
```javascript
import { getCardById } from './js/data/cards_index.js';
import { getPower } from './js/game/power.js';

const cardElement = document.querySelector('[data-card-id="C-F-001"]');
const card = getCardById('C-F-001');
const power = getPower(card, userLevel);

cardElement.querySelector('.power-value').textContent = power;
```

### У системі колоди:
```javascript
import { getDeckPower } from './js/game/power.js';

const deckCards = [cardA, cardB, cardC, ...];
const deckPower = getDeckPower(deckCards, 5); // На рівні 5
console.log(`Сила колоди: ${deckPower}`);
```

### У системі пошуку:
```javascript
import { searchCards, getCardsByElement } from './js/data/cards_index.js';

// Пошук по назві
const results = searchCards('гоблін');

// Отримати всі вогняні карти
const fireCards = getCardsByElement('fire');
```

## 🔄 Майбутні доповнення

- [ ] CARDS_RARE (рідкісні карти)
- [ ] CARDS_EPIC (епічні карти)
- [ ] CARDS_LEGEND (легендарні карти)
- [ ] Система здібностей карт
- [ ] Синерія елементів
- [ ] Комбо-системи
- [ ] Баланс множників по рівню рідкості

## 💾 Збереження у localStorage

```javascript
// Рівні карт користувача
const userCardLevels = {
  'C-F-001': 5,
  'C-W-002': 3,
  'C-A-001': 7,
  // ...
};

localStorage.setItem('userCardLevels', JSON.stringify(userCardLevels));
```

## 🐛 Дебаг і тестування

В консолі браузера:
```javascript
// Інформація про систему карт
console.log(window.ALL_CARDS);
console.log(window.CARDS_COMMON);

// Тест функцій
import { getPower, getCardById } from './js/game/power.js';
const card = getCardById('C-F-001');
getPower(card, 10);
```
