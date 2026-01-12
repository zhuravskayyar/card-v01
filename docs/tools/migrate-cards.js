/**
 * Скрипт для міграції старих карт на нову систему
 */

(function(){
  function migrateLegacyCards() {
    const oldStyles = document.querySelectorAll('style, link[href*="steampunk"], link[href*="sp-card"]');
    oldStyles.forEach(style => {
      try {
        if (style.textContent?.includes('.sp-card') || style.textContent?.includes('.card')) style.remove();
      } catch (e) { /* silent */ }
    });

    const oldCards = document.querySelectorAll('.sp-card, .card, [class*="card-"]');
    oldCards.forEach(oldCard => {
      const element = oldCard.classList.contains('fire') ? 'FIRE' : oldCard.classList.contains('water') ? 'WATER' : oldCard.classList.contains('air') ? 'AIR' : oldCard.classList.contains('earth') ? 'EARTH' : (oldCard.dataset.element || 'FIRE');
      const rarity = oldCard.classList.contains('R1') ? 'common' : oldCard.classList.contains('R2') ? 'uncommon' : oldCard.classList.contains('R3') ? 'rare' : oldCard.classList.contains('R4') ? 'epic' : oldCard.classList.contains('R5') ? 'legendary' : oldCard.classList.contains('R6') ? 'mythic' : (oldCard.dataset.rarity || 'common');

      const newCardData = {
        id: oldCard.id || `card_${Date.now()}`,
        name: oldCard.querySelector('.card-name')?.textContent || oldCard.dataset.name || 'Карта',
        element,
        rarity,
        level: parseInt(oldCard.dataset.level) || 1,
        xp: parseInt(oldCard.dataset.xp) || 0,
        xpMax: parseInt(oldCard.dataset.xpMax) || 100,
        power: parseInt(oldCard.querySelector('.power-value')?.textContent) || parseInt(oldCard.dataset.power) || 0
      };

      const newCard = window.CardRenderer ? window.CardRenderer.renderCard(newCardData, { size: 'md', interactive: !!oldCard.onclick }) : document.createElement('div');
      oldCard.parentNode.replaceChild(newCard, oldCard);
    });

    const oldGrids = document.querySelectorAll('.deck-grid, .collection-grid, .duel-deck');
    oldGrids.forEach(grid => {
      grid.className = 'grid-3x3';
      grid.style.padding = '0 4px';
    });

    console.log('Міграція завершена. Оновлено карт:', oldCards.length);
  }

  if (typeof window !== 'undefined') window.addEventListener('load', migrateLegacyCards);
})();
