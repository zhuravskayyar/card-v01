/**
 * ІНДЕКСИ КАРТ - для швидкого пошуку
 * 
 * Використання:
 * - getCardById('C-F-001')
 * - getCardsByElement('fire')
 * - getRandomCards(16)
 */

// Функції доступу до карт (безпечні присвоєння в глобальній області)
if (typeof window.getCardById === 'undefined') {
  window.getCardById = function(id) {
    return (window.CARDS_BY_ID && window.CARDS_BY_ID[id]) || null;
  };
}

if (typeof window.getCardsByElement === 'undefined') {
  window.getCardsByElement = function(element) {
    return (window.CARDS_BY_ELEMENT && window.CARDS_BY_ELEMENT[element]) || [];
  };
}

if (typeof window.getRandomCards === 'undefined') {
  window.getRandomCards = function(count) {
    const allCards = window.ALL_CARDS || [];
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, allCards.length));
  };
}
