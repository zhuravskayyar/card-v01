// Deck Screen
import dom from '../../core/dom.js';
import { router } from '../../core/router.js';
import { store } from '../../core/store.js';
import { createButton } from '../components/Button.js';
import { createDeckGrid, createSelectableDeckGrid } from '../components/DeckGrid.js';
import { showToast } from '../components/Toast.js';
import { CARDS, getAllCardIds } from '../../data/cards.js';
// Для патчу uid
import { genUID, createCardInstance } from '../../main.js';
import { balanceDeck } from '../../game/deck.js';
import { deckStorage } from '../../core/storage.js';

// Функція для адаптивної генерації колоди ворога на основі колоди гравця
function generateAdaptiveEnemyDeck(playerDeck) {
  const allCards = [...CARDS];
  const enemyCards = [];
  const used = new Set();

  // Counter mapping
  const elementCounter = {
    fire: 'water',
    water: 'earth', 
    earth: 'air',
    air: 'fire'
  };

  // Helper: get power of a card (use window.getPower if available)
  const cardPower = (card, lvl = 1) => {
    try { return (window.getPower ? window.getPower(card, lvl) : (card.attack || card.basePower || 0)) || 0; }
    catch (e) { return (card.attack || card.basePower || 0) || 0; }
  };

  // Find candidate by element and power within maxSpread (fallback to closest)
  const findCandidate = (targetPower, preferElement = null, maxSpread = 50) => {
    let pool = allCards.filter(c => !used.has(c.id));
    if (preferElement) {
      const byEl = pool.filter(c => c.element === preferElement);
      if (byEl.length) pool = byEl;
    }

    // Map with power
    const mapped = pool.map(c => ({ c, p: cardPower(c, 1) }));

    // Try to find within maxSpread
    let best = null; let bestDiff = Infinity;
    for (const item of mapped) {
      const diff = Math.abs(item.p - targetPower);
      if (diff <= maxSpread && diff < bestDiff) { best = item.c; bestDiff = diff; }
    }
    if (best) return best;

    // Fallback: closest even if > maxSpread
    best = null; bestDiff = Infinity;
    for (const item of mapped) {
      const diff = Math.abs(item.p - targetPower);
      if (diff < bestDiff) { best = item.c; bestDiff = diff; }
    }
    return best || null;
  };

  // Iterate player's deck and try to pick counter-cards with power close to player's card (±50)
  for (let i = 0; i < Math.min(playerDeck.length, 9); i++) {
    const pcard = playerDeck[i];
    if (!pcard) continue;
    const target = cardPower(pcard, pcard.level || 1);
    const counterEl = elementCounter[pcard.element] || null;

    // Prefer counter element, then same element, then any
    let pick = null;
    if (counterEl) pick = findCandidate(target, counterEl, 50);
    if (!pick) pick = findCandidate(target, pcard.element, 50);
    if (!pick) pick = findCandidate(target, null, 50);

    if (pick) {
      enemyCards.push(pick);
      used.add(pick.id);
    }
  }

  // Fill remaining slots randomly (avoid duplicates)
  if (enemyCards.length < 9) {
    const remaining = allCards.filter(c => !used.has(c.id)).sort(() => Math.random() - 0.5);
    for (const c of remaining) {
      if (enemyCards.length >= 9) break;
      enemyCards.push(c); used.add(c.id);
    }
  }

  return enemyCards.slice(0, 9);
}

export const DeckScreen = () => {
  const screen = dom.create('div', { className: 'deck-screen' });

  // Load saved deck or create new one
  let selectedCards = deckStorage.getDeck();
  // Якщо старий формат (масив id), мігруємо
  if (selectedCards.length && typeof selectedCards[0] === 'string') {
    selectedCards = selectedCards.map(id => createCardInstance(id));
    deckStorage.saveDeck(selectedCards);
  }
  // Ensure deck cards are shown in descending order by power (attack or basePower)
  const sortByPowerDesc = (arr) => arr.slice().sort((a, b) => {
    const va = (a && (a.attack || a.basePower)) || 0;
    const vb = (b && (b.attack || b.basePower)) || 0;
    if (va === vb) return (b.id || '').localeCompare(a.id || '');
    return vb - va;
  });
  selectedCards = sortByPowerDesc(selectedCards);
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
      // Remove card from deck по uid
      selectedCards = selectedCards.filter(c => c.uid !== card.uid);
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

    // Update preview (show cards sorted ascending by power)
    dom.clear(deckPreview);
    deckPreview.appendChild(dom.create('h3', {}, ['Поточна колода']));
    const newPreviewGrid = createDeckGrid(sortByPowerDesc(selectedCards), {
      onCardClick: (card) => {
        selectedCards = selectedCards.filter(c => c.uid !== card.uid);
        render();
        showToast.info(`${card.name} видалено з колоди`);
      },
      allPlayerCards: selectedCards // для canUpgrade тепер екземпляри
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
    // filteredCards — масив CardData, треба створювати інстанси
    const selection = createSelectableDeckGrid(
      filteredCards,
      selectedCards,
      (card) => {
        const isSelected = selectedCards.some(c => c.uid === card.uid);
        if (isSelected) {
          selectedCards = selectedCards.filter(c => c.uid !== card.uid);
          showToast.info(`${card.name} видалено`);
        } else {
          if (selectedCards.length < 9) {
            // Додаємо новий інстанс
            selectedCards.push(createCardInstance(card.id || card.cardId));
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
        // Save player deck (store full instances so uid is preserved)
        deckStorage.saveDeck(selectedCards);
        
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
