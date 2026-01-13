// Deck grid component (3x3 grid)
import dom from '../../core/dom.js';
import { createCardView } from './CardView.js';

export const createDeckGrid = (cards = [], options = {}) => {
  const {
    onCardClick = () => {},
    selectedCards = [],
    maxCards = 9,
    allPlayerCards = null // новий параметр: всі карти гравця
  } = options;

  const grid = dom.create('div', { className: 'deck-grid grid-3x3' });

  // Для визначення canUpgrade використовуємо всі карти гравця, якщо передано
  const cardsForCheck = Array.isArray(allPlayerCards) && allPlayerCards.length > 0 ? allPlayerCards : cards;
  // Групуємо всі карти гравця за стихією
  const byElement = {};
  for (const card of cardsForCheck) {
    if (!card) continue;
    if (!byElement[card.element]) byElement[card.element] = [];
    byElement[card.element].push(card);
  }
  // Для кожної стихії знаходимо найсильнішу карту серед карт у колоді
  const upgradeableIds = new Set();
  for (const element in byElement) {
    const group = byElement[element];
    if (group.length < 2) continue;
    // Знаходимо найсильнішу карту серед карт у колоді цієї стихії
    let maxPower = Math.max(...group.map(c => c.attack || c.basePower || 0));
    // Всі карти у колоді цієї стихії
    let deckCards = cards.filter(c => c && c.element === element);
    let deckStrongest = deckCards.find(c => (c.attack || c.basePower || 0) === maxPower);
    // Чи є хоча б одна слабша карта у колекції
    let hasWeaker = group.some(c => (c.attack || c.basePower || 0) < maxPower);
    if (deckStrongest && hasWeaker) upgradeableIds.add(deckStrongest.id);
  }

  for (let i = 0; i < maxCards; i++) {
    const card = cards[i];
    const isSelected = card && selectedCards.some(c => c?.uid === card?.uid);
    let canUpgrade = false;
    if (card && upgradeableIds.has(card.cardId || card.id)) canUpgrade = true;
    const cardView = createCardView(card, {
      selected: isSelected,
      canUpgrade,
      onClick: (clickedCard) => {
        onCardClick(clickedCard, i);
      }
    });
    grid.appendChild(cardView);
  }

  return grid;
};

// Create deck grid with selection
export const createSelectableDeckGrid = (availableCards, selectedCards, onSelect) => {
  const container = dom.create('div', { className: 'deck-selection' });

  // Header with info
  const header = dom.create('div', { className: 'deck-header' }, [
    dom.create('h3', {}, ['Доступні карти']),
    dom.create('div', { className: 'deck-info' }, [
      `Вибрано: ${selectedCards.length}/9`
    ])
  ]);
  container.appendChild(header);

  // Grid of available cards - оновлено для стимпанк-карт
  const grid = dom.create('div', { className: 'cards-grid' });

  availableCards.forEach(card => {
    const isSelected = selectedCards.some(c => c?.id === card.id);
    const isDisabled = !isSelected && selectedCards.length >= 9;
    
    const cardView = createCardView(card, {
      selected: isSelected,
      disabled: isDisabled,
      onClick: (clickedCard) => {
        onSelect(clickedCard);
      }
    });
    
    grid.appendChild(cardView);
  });

  container.appendChild(grid);

  return container;
};

export default createDeckGrid;
