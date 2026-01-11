/**
 * СИСТЕМА РЕНДЕРУ КАРТ - Стимпанк ДЕТАЛЬНИЙ ДИЗАЙН
 * Велика шестерня, заклепки, анімовані значки, детальні ефекти
 */

class CardRenderer {
  constructor() {
    // Емодзі значки для кожної стихії з класами анімацій
    this.elementIcons = {
      fire: `<div class="element-emoji fire-emoji">🔥</div>`,
      water: `<div class="element-emoji water-emoji">💧</div>`,
      air: `<div class="element-emoji air-emoji">💨</div>`,
      earth: `<div class="element-emoji earth-emoji">🍃</div>`
    };

    this.rarityNames = {
      R1: 'ЗВИЧАЙНА',
      R2: 'НЕЗВИЧАЙНА',
      R3: 'РІДКІСНА',
      R4: 'ЕПІЧНА',
      R5: 'ЛЕГЕНДАРНА',
      R6: 'МІФІЧНА'
    };

    this.elementNames = {
      fire: 'Вогонь',
      water: 'Вода',
      air: 'Повітря',
      earth: 'Земля'
    };
  }

  /**
   * ОСНОВНИЙ МЕТОД РЕНДЕРУ - ДЕТАЛЬНИЙ ДИЗАЙН
   * @param {Object} cardData - дані карти з бази
   * @returns {String} HTML розмітка карти з детальним дизайном
   */
  render(cardData, opts = {}) {
    const {
      id = 'unknown',
      name = 'Unknown Card',
      element = 'fire',
      rarity = 'R1',
      basePower = 0,
      attack = 0,
      factionName = '',
      rarityDisplay = '',
      faction = ''
    } = cardData;

    const rarityBadge = rarityDisplay || this.rarityNames[rarity] || 'ЗВИЧАЙНА';
    const elementIcon = this.elementIcons[element] || this.elementIcons.fire;
    const displayPower = (opts.power !== undefined) ? opts.power : (attack || basePower);
    const level = opts.level || (cardData.level || 1);
    const showUpgrade = !!opts.showUpgrade;

    return `
      <div class="sp-card ${element} ${rarity} ${showUpgrade ? 'upgradable' : ''}" 
           data-id="${id}"
           data-card-id="${id}"
           data-element="${element}"
           data-rarity="${rarity}"
           data-power="${displayPower}"
           data-attack="${attack}"
           data-level="${level}"
           data-faction="${faction}"
           data-name="${name}">
        
        <!-- ДЕКОРАТИВНІ ЛІНІЇ -->
        <div class="decor-line line-top"></div>
        <div class="decor-line line-bottom"></div>
        
        <!-- БЕЙДЖ РІДКОСТІ -->
        <div class="rarity-badge">${rarityBadge}</div>
        
        <!-- ВЕЛИКА ДЕТАЛЬНА ШЕСТЕРНЯ -->
        <div class="corner-gear">
          <div class="gear-inner">
            ${elementIcon}
          </div>
        </div>

        <!-- ПЛАШКА СИЛИ внизу -->
        <div class="power-plate">
          <div class="power-value">${displayPower}</div>
        </div>
        ${showUpgrade ? '<div class="upgrade-arrow" title="Можна прокачати">▲</div>' : ''}
      </div>
    `;
  }

  /**
   * ПАКЕТНИЙ РЕНДЕРИНГ
   * @param {Array} cardsArray - масив карт
   * @returns {String} HTML всіх карт
   */
  renderMultiple(cardsArray) {
    return cardsArray
      .map(card => this.render(card))
      .join('');
  }

  /**
   * РЕНДЕРИНГ З ІНФОРМАЦІЙНОЮ ПАНЕЛЛЮ
   * @param {Object} cardData - дані карти
   * @returns {String} HTML карти + інформація
   */
  renderWithInfo(cardData) {
    const cardHTML = this.render(cardData);
    const infoHTML = this.renderInfo(cardData);
    
    return `
      <div class="card-with-info">
        ${cardHTML}
        ${infoHTML}
      </div>
    `;
  }

  /**
   * ІНФОРМАЦІЙНА ПАНЕЛЬ
   * @param {Object} cardData - дані карти (нова структура)
   * @returns {String} HTML інформації
   */
  renderInfo(cardData) {
    const {
      name = 'Unknown',
      element = 'fire',
      rarity = 'R1',
      basePower = 0,
      attack = 0,
      defense = 0,
      multiplier = 1.0,
      upgradeMult = 1.05,
      factionName = '',
      rarityDisplay = '',
      faction = ''
    } = cardData;

    const elementName = this.elementNames[element] || element;
    const rarityName = rarityDisplay || this.rarityNames[rarity] || rarity;

    return `
      <div class="card-info">
        <h3 class="card-name">${name}</h3>
        
        <div class="card-stats">
          <div class="stat">
            <span class="stat-label">Стихія:</span>
            <span class="stat-value element-${element}">${elementName}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Рідкість:</span>
            <span class="stat-value rarity-${rarity}">${rarityName}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Фракція:</span>
            <span class="stat-value faction">${factionName || faction}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Атака:</span>
            <span class="stat-value attack">⚔️ ${attack}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Захист:</span>
            <span class="stat-value defense">🛡️ ${defense}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Множник покращення:</span>
            <span class="stat-value upgrade">×${upgradeMult}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * ГЕНЕРАТОР CSS ДЛЯ ДИНАМІЧНИХ КОЛЬОРІВ
   * @returns {String} CSS змінні для 4 стихій і 6 рідкостей
   */
  generateColorCSS() {
    return `
      :root {
        /* 4 основні стихії */
        --fire:   #c45a2a;
        --water:  #3b6c8e;
        --air:    #9fb6c1;
        --earth:  #7a6a3a;
        
        /* 6 рівнів рідкості */
        --R1: #b8a27b;    /* Звичайна */
        --R2: #7aaa6f;    /* Незвичайна */
        --R3: #6fb2ff;    /* Рідкісна */
        --R4: #b07cff;    /* Епічна */
        --R5: #ffcc66;    /* Легендарна */
        --R6: #ff6b9d;    /* Міфічна */
      }
    `;
  }

  /**
   * ПІДГОТОВКА КАРТИ ДО ВІДОБРАЖЕННЯ
   * Додає обробники подій та інші функції
   */
  attachEventHandlers(cardElement, onSelect = null, onHover = null) {
    // При кліку на карту
    cardElement.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Видаляємо клас з інших карт
      document.querySelectorAll('.sp-card').forEach(c => {
        c.classList.remove('selected');
      });
      
      // Додаємо клас поточній карті
      cardElement.classList.add('selected');
      
      // Callback
      if (onSelect) {
        const cardData = {
          id: cardElement.dataset.id,
          name: cardElement.dataset.name,
          element: cardElement.dataset.element,
          rarity: cardElement.dataset.rarity,
          power: cardElement.dataset.power
        };
        onSelect(cardData);
      }
    });

    // При ховері
    if (onHover) {
      cardElement.addEventListener('mouseenter', () => {
        onHover(cardElement.dataset.id, true);
      });
      cardElement.addEventListener('mouseleave', () => {
        onHover(cardElement.dataset.id, false);
      });
    }
  }

  /**
   * ФІЛЬТРАЦІЯ КАРТ
   * @param {Array} cardsArray - всі карти
   * @param {String} filter - фільтр (element або 'legend')
   * @returns {Array} відфільтровані карти
   */
  filterCards(cardsArray, filter) {
    if (filter === 'all') return cardsArray;
    
    if (filter === 'legend') {
      return cardsArray.filter(card => card.rarity === 'legend');
    }
    
    // Фільтр по стихії
    return cardsArray.filter(card => card.element === filter);
  }

  /**
   * СОРТУВАННЯ КАРТ
   * @param {Array} cardsArray - карти
   * @param {String} sortBy - поле для сортування
   * @param {String} order - 'asc' або 'desc'
   * @returns {Array} відсортовані карти
   */
  sortCards(cardsArray, sortBy = 'power', order = 'desc') {
    const sorted = [...cardsArray].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (order === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
    
    return sorted;
  }

  /**
   * ПОШУК КАРТ
   * @param {Array} cardsArray - карти
   * @param {String} query - пошуковий запит
   * @returns {Array} результати пошуку
   */
  searchCards(cardsArray, query) {
    const lowerQuery = query.toLowerCase();
    
    return cardsArray.filter(card => {
      return card.name.toLowerCase().includes(lowerQuery) ||
             card.description.toLowerCase().includes(lowerQuery) ||
             card.element.toLowerCase().includes(lowerQuery);
    });
  }

  /**
   * ГРУПУВАННЯ КАРТ ПО СТИХІЯМ
   * @param {Array} cardsArray - карти
   * @returns {Object} карти згруповані по стихіям
   */
  groupByElement(cardsArray) {
    return cardsArray.reduce((groups, card) => {
      const element = card.element;
      if (!groups[element]) {
        groups[element] = [];
      }
      groups[element].push(card);
      return groups;
    }, {});
  }

  /**
   * ГРУПУВАННЯ КАРТ ПО РІДКОСТІ
   * @param {Array} cardsArray - карти
   * @returns {Object} карти згруповані по рідкості
   */
  groupByRarity(cardsArray) {
    return cardsArray.reduce((groups, card) => {
      const rarity = card.rarity;
      if (!groups[rarity]) {
        groups[rarity] = [];
      }
      groups[rarity].push(card);
      return groups;
    }, {});
  }
}

// ЕКСПОРТ ДЛЯ ВИКОРИСТАННЯ
// якщо це модуль
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardRenderer;
}

// ПРИКЛАД ВИКОРИСТАННЯ:
/*
// 1. Ініціалізація
const cardRenderer = new CardRenderer();

// 2. Завантажити базу карт
fetch('cards-database.json')
  .then(response => response.json())
  .then(data => {
    const cards = data.cards;
    
    // 3. Отримати контейнер
    const container = document.getElementById('cardsContainer');
    
    // 4. Рендеринг всіх карт
    container.innerHTML = cardRenderer.renderMultiple(cards);
    
    // 5. Прикріпити обробники подій
    document.querySelectorAll('.sp-card').forEach(cardEl => {
      cardRenderer.attachEventHandlers(
        cardEl,
        (cardData) => {
          console.log('Вибрана карта:', cardData);
        },
        (cardId, isHovering) => {
          if (isHovering) {
            console.log('Ховер на карту:', cardId);
          }
        }
      );
    });
    
    // 6. Фільтрація
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        const filtered = cardRenderer.filterCards(cards, filter);
        container.innerHTML = cardRenderer.renderMultiple(filtered);
      });
    });
  });

// ДОДАТКОВО - Пошук карт
const searchInput = document.querySelector('.search-input');
searchInput?.addEventListener('input', (e) => {
  const query = e.target.value;
  const filtered = cardRenderer.searchCards(cards, query);
  container.innerHTML = cardRenderer.renderMultiple(filtered);
});

// ДОДАТКОВО - Сортування
const sortSelect = document.querySelector('.sort-select');
sortSelect?.addEventListener('change', (e) => {
  const sortBy = e.target.value;
  const sorted = cardRenderer.sortCards(cards, sortBy, 'desc');
  container.innerHTML = cardRenderer.renderMultiple(sorted);
});
*/
