// ========================================
// СИСТЕМА ПРОКАЧКИ КАРТ - ПРИКЛАДИ ВИКОРИСТАННЯ
// ========================================

/**
 * ПРИКЛАД 1: Отримання інвентарю користувача
 * 
 * Інвентар = всі копії карт (з деки + колекції)
 */
function example1_getInventory() {
  const profile = userProfile.getProfile();
  
  // Отримати інвентар з рахунком всіх копій
  const inventory = navigation.getInventory(profile);
  
  console.log('Інвентар:', inventory);
  // Результат:
  // {
  //   "C-F-001": 3,   // 1 в деці + 2 в колекції
  //   "C-W-002": 1,   // 1 в деці + 0 в колекції
  //   "C-A-001": 2,   // 1 в деці + 1 в колекції
  // }
}

/**
 * ПРИКЛАД 2: Підрахунок лишніх копій для конкретної карти
 */
function example2_getExtraCopies() {
  const profile = userProfile.getProfile();
  const inventory = navigation.getInventory(profile);
  
  const cardId = "C-F-001";
  const extra = navigation.getExtraCopies(inventory, cardId);
  
  console.log(`Карта ${cardId}: ${extra} лишніх копій`);
  // Якщо всього 3, то 2 лишні (1 в деці)
  
  // Це число показує, скільки копій можна використати для апгрейду
}

/**
 * ПРИКЛАД 3: Отримання вартості апгрейду
 */
function example3_getUpgradeCost() {
  // Вартість зростає лінійно з рівнем
  
  for (let level = 1; level <= 5; level++) {
    const cost = navigation.getUpgradeCost(level);
    console.log(`lvl ${level} → ${level + 1}: потребує ${cost} дублікатів`);
  }
  
  // Результат:
  // lvl 1 → 2: потребує 1 дублікатів
  // lvl 2 → 3: потребує 2 дублікатів
  // lvl 3 → 4: потребує 3 дублікатів
  // lvl 4 → 5: потребує 4 дублікатів
  // lvl 5 → 6: потребує 5 дублікатів
}

/**
 * ПРИКЛАД 4: Перевірка чи можна апгрейдити конкретну карту
 */
function example4_canUpgradeCard() {
  const profile = userProfile.getProfile();
  const inventory = navigation.getInventory(profile);
  
  // Взяти першу карту з деки
  const deckItem = profile.deckCards[0];
  
  const canUpgrade = navigation.canUpgradeCard(deckItem, inventory);
  
  console.log(`Карта ${deckItem.id} (lvl ${deckItem.level}):`, 
              canUpgrade ? 'Можна апгрейдити ✅' : 'Не можна ❌');
  
  // Результат залежить від кількості лишніх копій і вартості
}

/**
 * ПРИКЛАД 5: Перевірка чи є хоча б одна апгрейджвальна карта
 */
function example5_hasAnyUpgradable() {
  const profile = userProfile.getProfile();
  const inventory = navigation.getInventory(profile);
  
  const hasAny = navigation.hasAnyUpgradable(profile.deckCards, inventory);
  
  if (hasAny) {
    console.log('В деці є карти для апгрейду 🔥');
  } else {
    console.log('Немає карт для апгрейду 😴');
  }
}

/**
 * ПРИКЛАД 6: Виконання апгрейду карти
 */
function example6_performUpgrade() {
  const profile = userProfile.getProfile();
  const inventory = navigation.getInventory(profile);
  
  // Знайти першу апгрейджвальну карту
  const deckItem = profile.deckCards.find(item => 
    navigation.canUpgradeCard(item, inventory)
  );
  
  if (deckItem) {
    const oldLevel = deckItem.level;
    const success = navigation.performUpgrade(deckItem, inventory, profile);
    
    if (success) {
      console.log(`Карта апгрейджена: lvl ${oldLevel} → ${deckItem.level}`);
      // Дублікати автоматично списані з колекції
      // Профіль автоматично збережений
    }
  }
}

/**
 * ПРИКЛАД 7: Обновлення UI при завантаженні деки
 */
function example7_updateUI() {
  const profile = userProfile.getProfile();
  const inventory = navigation.getInventory(profile);
  
  // Обновити стан підказки
  const hintEl = document.getElementById('deck-hint');
  if (hintEl) {
    if (navigation.hasAnyUpgradable(profile.deckCards, inventory)) {
      hintEl.classList.add('hot');  // Зелена свічення
    } else {
      hintEl.classList.remove('hot');  // Звичайний вигляд
    }
  }
  
  // Обновити классы на картах
  document.querySelectorAll('#deckGrid .sp-card').forEach((cardEl, index) => {
    const deckItem = profile.deckCards[index];
    const canUpgrade = navigation.canUpgradeCard(deckItem, inventory);
    
    if (canUpgrade) {
      cardEl.classList.add('upgradable');  // Додати стрілку
    } else {
      cardEl.classList.remove('upgradable');  // Видалити стрілку
    }
  });
}

/**
 * ПРИКЛАД 8: Перевірка статистики апгрейдів
 */
function example8_statsUpgrades() {
  const profile = userProfile.getProfile();
  const inventory = navigation.getInventory(profile);
  
  let stats = {
    totalCards: profile.deckCards.length,
    upgradableCards: 0,
    totalDuplicates: 0,
    totalPotentialLevels: 0,
  };
  
  profile.deckCards.forEach(deckItem => {
    const extra = navigation.getExtraCopies(inventory, deckItem.id);
    stats.totalDuplicates += extra;
    
    if (navigation.canUpgradeCard(deckItem, inventory)) {
      stats.upgradableCards++;
    }
    
    // Скільки рівнів можна піднятися максимально?
    let maxLevelsUp = 0;
    let remaining = extra;
    for (let i = 1; remaining > 0; i++) {
      if (remaining >= i) {
        remaining -= i;
        maxLevelsUp++;
      } else {
        break;
      }
    }
    stats.totalPotentialLevels += maxLevelsUp;
  });
  
  console.log('Статистика:', stats);
  // {
  //   totalCards: 9,
  //   upgradableCards: 5,
  //   totalDuplicates: 7,
  //   totalPotentialLevels: 2,
  // }
}

/**
 * ПРИКЛАД 9: Обробник кліку на карту (як в грі)
 */
function example9_cardClickHandler() {
  document.addEventListener('click', (e) => {
    const cardEl = e.target.closest('.sp-card');
    if (!cardEl) return;
    
    const profile = userProfile.getProfile();
    const inventory = navigation.getInventory(profile);
    
    // Знайти відповідну карту в деці
    const cardIndex = [...document.querySelectorAll('.sp-card')].indexOf(cardEl);
    const deckItem = profile.deckCards[cardIndex];
    
    // Спробувати апгрейдити
    if (navigation.performUpgrade(deckItem, inventory, profile)) {
      console.log(`✅ Карта апгрейджена до рівня ${deckItem.level}`);
      // Перерендерити грід (вже робиться в loadDeckCards)
      navigation.loadDeckCards();
    } else {
      console.log(`❌ Не вдалося апгрейдити карту`);
    }
  });
}

/**
 * ПРИКЛАД 10: Симульований апгрейд кількох карт
 */
function example10_multipleUpgrades() {
  const profile = userProfile.getProfile();
  
  // Апгрейдити всі можливі карти по очереді
  let upgradeCount = 0;
  
  for (const deckItem of profile.deckCards) {
    const inventory = navigation.getInventory(profile);
    
    while (navigation.canUpgradeCard(deckItem, inventory)) {
      if (navigation.performUpgrade(deckItem, inventory, profile)) {
        upgradeCount++;
        console.log(`✅ Апгрейд #${upgradeCount}: ${deckItem.id} lvl ${deckItem.level}`);
      } else {
        break;
      }
    }
  }
  
  console.log(`Всього апгрейдів: ${upgradeCount}`);
}

// ========================================
// ВИКОРИСТАННЯ У ГРІ
// ========================================

/**
 * У функції navigation.loadDeckCards() вже реалізовано:
 * 
 * 1. Отримання інвентарю
 * 2. Перевірка які карти апгрейджвальні
 * 3. Додавання класу 'upgradable' до карт
 * 4. Обновлення стану підказки 'deck-hint'
 * 5. Обробник кліку на карту для апгрейду
 * 
 * При кліку на карту:
 * - Якщо можна апгрейдити → виконується апгрейд
 * - Грід перерендерюється
 * - Дані зберігаються у localStorage
 */

/**
 * КЛАВІАТУРНІ СКОРОЧЕННЯ (для вам розвитку)
 * 
 * У консолі браузера можна запустити:
 * 
 * navigation.getInventory(userProfile.getProfile())
 * // Див інвентар
 * 
 * userProfile.getProfile().deckCards[0].level
 * // Див рівень першої карти в деці
 * 
 * userProfile.getProfile().collectionCards.length
 * // Див кількість карт в колекції
 */
