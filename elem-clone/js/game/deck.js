// Deck management
import { getCardById } from '../data/cards.js';
import { random } from '../core/rng.js';

// Create battle deck from card IDs
export const createDeck = (cardIds) => {
  return cardIds.map(id => getCardById(id)).filter(card => card !== undefined);
};

// Sort deck by element, then by attack
export const sortDeck = (deck) => {
  return [...deck].sort((a, b) => {
    if (a.element !== b.element) {
      return a.element.localeCompare(b.element);
    }
    return b.attack - a.attack;
  });
};

// Shuffle deck randomly
export const shuffleDeck = (deck) => {
  return random.shuffle(deck);
};

// Get top N cards from deck
export const getTopCards = (deck, count) => {
  return deck.slice(0, Math.min(count, deck.length));
};

// Validate deck composition (exactly 9 cards)
export const isDeckValid = (deck) => {
  return Array.isArray(deck) && deck.length === 9;
};

// Auto-fill deck with random cards
export const autoFillDeck = (availableCards, count = 9) => {
  const shuffled = random.shuffle(availableCards);
  return shuffled.slice(0, Math.min(count, availableCards.length));
};

// Balance deck by elements (try to get diverse elements)
export const balanceDeck = (availableCards, count = 9) => {
  if (availableCards.length <= count) {
    return [...availableCards];
  }
  
  const elements = [...new Set(availableCards.map(card => card.element))];
  const cardsPerElement = Math.floor(count / elements.length);
  const remainder = count % elements.length;
  
  const balanced = [];
  
  // Pick cards from each element
  for (let i = 0; i < elements.length; i++) {
    const elementCards = availableCards.filter(card => card.element === elements[i]);
    const takeCount = cardsPerElement + (i < remainder ? 1 : 0);
    const selected = random.sample(elementCards, takeCount);
    balanced.push(...selected);
  }
  
  // If not enough, fill with random
  if (balanced.length < count) {
    const remaining = availableCards.filter(card => !balanced.includes(card));
    const additional = random.sample(remaining, count - balanced.length);
    balanced.push(...additional);
  }
  
  return balanced.slice(0, count);
};

// Calculate deck statistics
export const getDeckStats = (deck) => {
  if (!deck || deck.length === 0) {
    return {
      totalAttack: 0,
      totalDefense: 0,
      avgAttack: 0,
      avgDefense: 0,
      elements: {}
    };
  }
  
  const totalAttack = deck.reduce((sum, card) => sum + card.attack, 0);
  const totalDefense = deck.reduce((sum, card) => sum + card.defense, 0);
  
  const elements = {};
  deck.forEach(card => {
    elements[card.element] = (elements[card.element] || 0) + 1;
  });
  
  return {
    totalAttack,
    totalDefense,
    avgAttack: Math.round(totalAttack / deck.length),
    avgDefense: Math.round(totalDefense / deck.length),
    elements
  };
};

// Find best card to play against opponent card
export const findBestCard = (deck, opponentCard) => {
  if (!deck || deck.length === 0) return null;
  
  // Import here to avoid circular dependency
  import('../data/elements.js').then(({ getMultiplier }) => {
    let bestCard = deck[0];
    let bestScore = -Infinity;
    
    for (const card of deck) {
      const multiplier = getMultiplier(card.element, opponentCard.element);
      const score = (card.attack * multiplier) - (opponentCard.attack / 2);
      
      if (score > bestScore) {
        bestScore = score;
        bestCard = card;
      }
    }
    
    return bestCard;
  });
  
  // Simple fallback: return first card
  return deck[0];
};

export default {
  createDeck,
  sortDeck,
  shuffleDeck,
  getTopCards,
  isDeckValid,
  autoFillDeck,
  balanceDeck,
  getDeckStats,
  findBestCard
};
