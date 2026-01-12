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
  // Variant B: pick target total within playerTotal ± MAX_DIFF and build deck to match
  const MAX_DIFF = 20;
  const calcPower = (card, level = 1) => {
    if (typeof window !== 'undefined' && window.getPower) return window.getPower(card, level);
    return card.attack || card.basePower || 0;
  };

  // Compute player's total power
  const playerTotal = playerDeck.reduce((s, c) => s + (calcPower(c, c.level || 1) || 0), 0);

  const minTarget = Math.max(20, playerTotal - MAX_DIFF);
  const maxTarget = Math.max(minTarget, playerTotal + MAX_DIFF);
  const targetTotal = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;

  // Pool of candidate cards
  let pool = CARDS.filter(c => !(String(c.id).startsWith('S'))).slice();
  if (pool.length < 9) pool = CARDS.slice();

  const cardPower = c => calcPower(c, 1) || 0;

  // Greedy selection to approach targetTotal
  const selected = [];
  let currentSum = 0;
  for (let slot = 0; slot < 9; slot++) {
    let bestIdx = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const p = cardPower(pool[i]);
      const newSum = currentSum + p;
      const delta = Math.abs(newSum - targetTotal);
      if (delta < bestDelta) { bestDelta = delta; bestIdx = i; }
    }
    if (bestIdx === -1) break;
    const pick = pool.splice(bestIdx, 1)[0];
    selected.push(pick);
    currentSum += cardPower(pick);
  }

  // Fill if not enough
  if (selected.length < 9) {
    const extras = (CARDS.concat(selected)).slice(0, 9 - selected.length);
    selected.push(...extras);
  }

  // Level-up selected cards to approach targetTotal
  const enriched = selected.map(c => ({ src: c, level: 1, power: cardPower(c) }));
  let selectedSum = enriched.reduce((s, e) => s + e.power, 0);
  let attempts = 0;
  const maxAttempts = 500;
  while (selectedSum < targetTotal && attempts < maxAttempts) {
    let bestIdx = -1;
    let bestGain = 0;
    for (let i = 0; i < enriched.length; i++) {
      const e = enriched[i];
      const nextLevel = Math.min((e.level || 1) + 1, 20);
      const nextPower = calcPower(e.src, nextLevel) || e.power;
      const gain = nextPower - e.power;
      if (gain > bestGain) { bestGain = gain; bestIdx = i; }
    }
    if (bestIdx === -1 || bestGain <= 0) break;
    enriched[bestIdx].level = Math.min((enriched[bestIdx].level || 1) + 1, 20);
    enriched[bestIdx].power = calcPower(enriched[bestIdx].src, enriched[bestIdx].level) || enriched[bestIdx].power;
    selectedSum = enriched.reduce((s, e) => s + e.power, 0);
    attempts++;
  }

  // Map to enemy card objects with level and power fields
  const enemyDeck9 = enriched.map(e => {
    const copy = Object.assign({}, e.src);
    copy.level = e.level || 1;
    const p = calcPower(e.src, copy.level) || (e.src.attack || e.src.basePower || 0);
    copy.attack = p; copy.power = p; copy.stats = { ...(copy.stats || {}), power: p };
    return copy;
  });

  return enemyDeck9.slice(0, 9);
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
