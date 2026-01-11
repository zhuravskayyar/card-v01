// CompactCardView.js
import dom from '../../core/dom.js';

/**
 * Компактна картка для списку слабших карт (без повної інфо)
 */
export const createCompactCardView = (card, { bonusText, onAbsorb } = {}) => {
  const cardEl = dom.create('div', { className: 'compact-card' });

  // Іконка стихії
  const icon = dom.create('div', { className: 'compact-card-icon' }, [card.element?.[0]?.toUpperCase() || '?']);
  cardEl.appendChild(icon);

  // Назва
  cardEl.appendChild(dom.create('div', { className: 'compact-card-name' }, [card.name]));

  // Сила
  cardEl.appendChild(dom.create('div', { className: 'compact-card-power' }, [`${card.attack || card.basePower}`]));

  // Кнопка "Поглинути"
  const btn = dom.create('button', { className: 'absorb-btn', onClick: () => onAbsorb?.(card) }, ['Поглинути']);
  cardEl.appendChild(btn);

  // Бонус
  if (bonusText) {
    cardEl.appendChild(dom.create('div', { className: 'absorb-bonus' }, [bonusText]));
  }

  return cardEl;
};

export default createCompactCardView;
