// Deck Screen
import dom from '../../core/dom.js';
import { router } from '../../core/router.js';
import { store } from '../../core/store.js';
import { createButton } from '../components/Button.js';
import { createDeckGrid, createSelectableDeckGrid } from '../components/DeckGrid.js';
import { showToast } from '../components/Toast.js';
import { CARDS, getAllCardIds } from '../../data/cards.js';
import { balanceDeck } from '../../game/deck.js';
import { deckStorage } from '../../core/storage.js';

// Функція для адаптивної генерації колоди ворога на основі колоди гравця
function generateAdaptiveEnemyDeck(playerDeck) {
  const allCards = [...CARDS];
  let enemyCards = [];
  
  // Аналіз колоди гравця
  const elementCount = { fire: 0, water: 0, air: 0, earth: 0 };
  const rarityCount = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 };
  const cardTypes = { attack: 0, defense: 0, special: 0 };
  
  playerDeck.forEach(card => {
    if (elementCount.hasOwnProperty(card.element)) {
      elementCount[card.element]++;
    }
    if (rarityCount.hasOwnProperty(card.rarity)) {
      rarityCount[card.rarity]++;
    }
    if (cardTypes.hasOwnProperty(card.type)) {
      cardTypes[card.type]++;
    }
  });
  
  // Визначаємо переважаючий елемент гравця
  let dominantElement = Object.keys(elementCount).reduce((a, b) => 
    elementCount[a] > elementCount[b] ? a : b
  );
  
  // Визначаємо переважаючу рідкість
  let dominantRarity = Object.keys(rarityCount).reduce((a, b) => 
    rarityCount[a] > rarityCount[b] ? a : b
  );
  
  // Визначаємо переважаючий тип
  let dominantType = Object.keys(cardTypes).reduce((a, b) => 
    cardTypes[a] > cardTypes[b] ? a : b
  );
  
  // Система контр-елементів
  const elementCounter = {
    fire: 'water',
    water: 'earth', 
    earth: 'air',
    air: 'fire'
  };
  
  // Система контр-типів
  const typeCounter = {
    attack: 'defense',
    defense: 'special',
    special: 'attack'
  };
  
  // Крок 1: Додаємо контр-елементи (3 карти)
  const counterElement = elementCounter[dominantElement] || 'fire';
  const counterElementCards = allCards.filter(card => 
    card.element === counterElement
  ).sort(() => Math.random() - 0.5).slice(0, 3);
  
  enemyCards.push(...counterElementCards);
  
  // Крок 2: Додаємо контр-типи (2 карти)
  const counterType = typeCounter[dominantType] || 'attack';
  const counterTypeCards = allCards.filter(card => 
    card.type === counterType && 
    !enemyCards.some(c => c.id === card.id)
  ).sort(() => Math.random() - 0.5).slice(0, 2);
  
  enemyCards.push(...counterTypeCards);
  
  // Крок 3: Додаємо карти з трохи вищою рідкістю (2 карти)
  const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const currentRarityIndex = rarityOrder.indexOf(dominantRarity);
  const targetRarityIndex = Math.min(currentRarityIndex + 1, rarityOrder.length - 1);
  const targetRarity = rarityOrder[targetRarityIndex];
  
  const higherRarityCards = allCards.filter(card => 
    card.rarity === targetRarity &&
    !enemyCards.some(c => c.id === card.id)
  ).sort(() => Math.random() - 0.5).slice(0, 2);
  
  enemyCards.push(...higherRarityCards);
  
  // Крок 4: Заповнюємо решту випадковими картами (до 9)
  const remainingSlots = 9 - enemyCards.length;
  if (remainingSlots > 0) {
    const remainingCards = allCards.filter(card => 
      !enemyCards.some(c => c.id === card.id)
    ).sort(() => Math.random() - 0.5).slice(0, remainingSlots);
    
    enemyCards.push(...remainingCards);
  }
  
  // Забезпечуємо баланс, якщо не вистачило карт
  if (enemyCards.length < 9) {
    const extraCards = allCards.filter(card => 
      !enemyCards.some(c => c.id === card.id)
    ).sort(() => Math.random() - 0.5).slice(0, 9 - enemyCards.length);
    
    enemyCards.push(...extraCards);
  }
  
  return enemyCards.slice(0, 9);
}

export const DeckScreen = () => {
  const screen = dom.create('div', { className: 'deck-screen' });

  // Load saved deck or create new one
  let selectedCards = deckStorage.getDeck().map(id => CARDS.find(c => c.id === id)).filter(Boolean);
  if (selectedCards.length === 0) {
    // Auto-fill with balanced deck
    selectedCards = balanceDeck(CARDS, 9);
  }

  // Filters state
  let currentFilters = {
    element: 'all',
    rarity: 'all'
  };

  // Header
  const header = dom.create('div', { className: 'deck-header' }, [
    dom.create('h2', { className: 'deck-title' }, ['Збери свою колоду']),
    dom.create('div', { className: 'deck-info' }, [
      `Вибрано: ${selectedCards.length}/9`
    ])
  ]);
  screen.appendChild(header);

  // Current deck preview
  const deckPreview = dom.create('div', { style: { marginBottom: '2rem' } }, [
    dom.create('h3', {}, ['Поточна колода']),
  ]);

  const previewGrid = createDeckGrid(selectedCards, {
    onCardClick: (card) => {
      // Remove card from deck
      selectedCards = selectedCards.filter(c => c.id !== card.id);
      render();
      showToast.info(`${card.name} видалено з колоди`);
    }
  });
  deckPreview.appendChild(previewGrid);
  screen.appendChild(deckPreview);

  // Filters section
  const filtersSection = dom.create('div', { 
    className: 'filters-section',
    style: { marginBottom: '1rem', padding: '1rem', background: '#120d0a', borderRadius: '8px' }
  }, [
    dom.create('h3', { style: { marginBottom: '0.5rem' } }, ['Фільтри'])
  ]);
  screen.appendChild(filtersSection);

  // Available cards selection
  const selectionContainer = dom.create('div');
  screen.appendChild(selectionContainer);

  // Actions
  const actions = dom.create('div', { className: 'deck-actions' });
  screen.appendChild(actions);

  // Render function
  function render() {
    // Update header info
    const info = header.querySelector('.deck-info');
    if (info) {
      info.textContent = `Вибрано: ${selectedCards.length}/9`;
    }

    // Update preview
    dom.clear(deckPreview);
    deckPreview.appendChild(dom.create('h3', {}, ['Поточна колода']));
    const newPreviewGrid = createDeckGrid(selectedCards, {
      onCardClick: (card) => {
        selectedCards = selectedCards.filter(c => c.id !== card.id);
        render();
        showToast.info(`${card.name} видалено з колоди`);
      },
      allPlayerCards: CARDS // передаємо всі карти гравця для визначення canUpgrade
    });
    deckPreview.appendChild(newPreviewGrid);

    // Update filters
    dom.clear(filtersSection);
    filtersSection.appendChild(dom.create('h3', { style: { marginBottom: '0.5rem' } }, ['Фільтри']));
    
    const filtersRow = dom.create('div', { 
      style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' }
    });
    
    // Element filter
    const elementFilter = dom.create('div', {});
    elementFilter.appendChild(dom.create('label', { style: { marginRight: '0.5rem' } }, ['Стихія:']));
    const elementSelect = dom.create('select', {
      style: { padding: '0.5rem', borderRadius: '4px', background: '#1a120c', color: '#f4e6c6', border: '1px solid #c59b3c' },
      onChange: (e) => {
        currentFilters.element = e.target.value;
        render();
      }
    });
    ['all', 'fire', 'water', 'air', 'earth'].forEach(el => {
      const option = dom.create('option', { value: el }, [
        el === 'all' ? 'Всі' : 
        el === 'fire' ? '🔥 Вогонь' :
        el === 'water' ? '💧 Вода' :
        el === 'air' ? '💨 Повітря' : '🌍 Земля'
      ]);
      if (el === currentFilters.element) option.selected = true;
      elementSelect.appendChild(option);
    });
    elementFilter.appendChild(elementSelect);
    filtersRow.appendChild(elementFilter);

    // Rarity filter
    const rarityFilter = dom.create('div', {});
    rarityFilter.appendChild(dom.create('label', { style: { marginRight: '0.5rem' } }, ['Рідкість:']));
    const raritySelect = dom.create('select', {
      style: { padding: '0.5rem', borderRadius: '4px', background: '#1a120c', color: '#f4e6c6', border: '1px solid #c59b3c' },
      onChange: (e) => {
        currentFilters.rarity = e.target.value;
        render();
      }
    });
    ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].forEach(r => {
      const option = dom.create('option', { value: r }, [
        r === 'all' ? 'Всі' :
        r === 'common' ? 'Звичайна' :
        r === 'uncommon' ? 'Незвичайна' :
        r === 'rare' ? 'Рідкісна' :
        r === 'epic' ? 'Епічна' :
        r === 'legendary' ? 'Легендарна' : 'Міфічна'
      ]);
      if (r === currentFilters.rarity) option.selected = true;
      raritySelect.appendChild(option);
    });
    rarityFilter.appendChild(raritySelect);
    filtersRow.appendChild(rarityFilter);

    filtersSection.appendChild(filtersRow);

    // Apply filters
    let filteredCards = CARDS;
    if (currentFilters.element !== 'all') {
      filteredCards = filteredCards.filter(c => c.element === currentFilters.element);
    }
    if (currentFilters.rarity !== 'all') {
      filteredCards = filteredCards.filter(c => c.rarity === currentFilters.rarity);
    }

    // Show count
    filtersSection.appendChild(dom.create('div', { 
      style: { marginTop: '0.5rem', fontSize: '12px', opacity: '0.7' }
    }, [`Знайдено карт: ${filteredCards.length}`]));

    // Update selection
    dom.clear(selectionContainer);
    const selection = createSelectableDeckGrid(
      filteredCards,
      selectedCards,
      (card) => {
        const isSelected = selectedCards.some(c => c.id === card.id);
        
        if (isSelected) {
          // Remove from deck
          selectedCards = selectedCards.filter(c => c.id !== card.id);
          showToast.info(`${card.name} видалено`);
        } else {
          // Add to deck
          if (selectedCards.length < 9) {
            selectedCards.push(card);
            showToast.success(`${card.name} додано`);
          } else {
            showToast.warning('Колода заповнена (9/9)');
          }
        }
        
        render();
      }
    );
    selectionContainer.appendChild(selection);

    // Update actions
    dom.clear(actions);

    const autoBtn = createButton({
      text: '🎲 Автозаповнення',
      variant: 'secondary',
      onClick: () => {
        selectedCards = balanceDeck(CARDS, 9);
        render();
        showToast.success('Колоду автоматично заповнено!');
      }
    });
    actions.appendChild(autoBtn);

    const clearBtn = createButton({
      text: '🗑️ Очистити',
      variant: 'outline',
      onClick: () => {
        selectedCards = [];
        render();
        showToast.info('Колоду очищено');
      }
    });
    actions.appendChild(clearBtn);

    const startBtn = createButton({
      text: '⚔️ Почати бій',
      variant: 'success',
      size: 'lg',
      disabled: selectedCards.length !== 9,
      onClick: () => {
        // Save player deck
        deckStorage.saveDeck(selectedCards.map(c => c.id));
        
        // Generate adaptive enemy deck
        const enemyDeck = generateAdaptiveEnemyDeck(selectedCards);
        
        // Save both decks to store
        store.setState({ 
          playerDeck: selectedCards,
          enemyDeck: enemyDeck
        });
        
        // Save enemy deck to storage for persistence
        if (typeof Storage !== 'undefined') {
          localStorage.setItem('lastEnemyDeck', JSON.stringify(enemyDeck.map(c => c.id)));
        }
        
        showToast.success('Колоду збережено! Створюємо адаптивного супротивника...');
        
        setTimeout(() => {
          router.navigate('/duel');
        }, 1000);
      }
    });
    actions.appendChild(startBtn);

    const backBtn = createButton({
      text: '← Назад',
      variant: 'outline',
      onClick: () => {
        router.navigate('/lobby');
      }
    });
    actions.appendChild(backBtn);
  }

  // Initial render
  render();

  return screen;
};

export default DeckScreen;
