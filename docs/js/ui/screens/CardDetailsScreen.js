// CardDetailsScreen.js
import dom from '../../core/dom.js';
import { CARDS } from '../../data/cards.js';

import createCardView from '../components/CardView.js';
import createCompactCardView from '../components/CompactCardView.js';

/**
 * Card Details Screen with weaker cards rendering
 * @param {string} cardId - ID of the card to show details for
 * @param {object} [options] - Optional params
 */
export const CardDetailsScreen = (cardId, options = {}) => {
  const card = CARDS.find(c => c.id === cardId);
  if (!card) {
    return dom.create('div', {}, ['Карта не знайдена']);
  }

  // Main container
  const screen = dom.create('div', { className: 'card-details-screen' });

  // Main card display
  const mainInfo = dom.create('div', { className: 'card-main-info panel' });
  mainInfo.appendChild(createCardView(card, { showStats: true }));
  screen.appendChild(mainInfo);


  // Weaker cards section (compact style)
  const weakerSection = dom.create('div', { className: 'card-comparison' });
  weakerSection.appendChild(dom.create('h3', { className: 'comparison-title' }, ['📊 Слабші карти тієї ж стихії']));

  // Find weaker cards of the same element
  const weakerCards = CARDS.filter(c => c.element === card.element && c.id !== card.id && (c.basePower || c.attack) < (card.basePower || card.attack));

  const weakerList = dom.create('div', { className: 'weaker-cards-compact' });
  if (weakerCards.length === 0) {
    weakerList.appendChild(dom.create('div', { className: 'no-weaker-cards' }, ['Немає слабших карт цієї стихії']));
  } else {
    weakerCards.forEach(wc => {
      // Розрахунок бонусу (наприклад, XP за поглинання)
      const bonusXP = window.xpValue ? window.xpValue(1) : 5; // TODO: взяти реальний рівень карти
      const bonusText = `+${bonusXP} XP`;
      weakerList.appendChild(createCompactCardView(wc, {
        bonusText,
        onAbsorb: () => alert(`Поглинуто ${wc.name}!`)
      }));
    });
  }
  weakerSection.appendChild(weakerList);
  screen.appendChild(weakerSection);

  // Action buttons (stub)
  const actions = dom.create('div', { className: 'card-actions' }, [
    dom.create('button', { className: 'action-btn add-btn' }, ['Додати в колоду']),
    dom.create('button', { className: 'action-btn remove-btn' }, ['Видалити'])
  ]);
  screen.appendChild(actions);

  return screen;
};

export default CardDetailsScreen;
