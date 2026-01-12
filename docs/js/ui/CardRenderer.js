/**
 * Єдиний рендерер карт для всіх екранів гри
 */

// Константи
const ELEMENT_EMOJIS = {
  'FIRE': '🔥',
  'WATER': '💧',
  'AIR': '💨',
  'EARTH': '🌍'
};

const RARITY_LABELS = {
  'common': 'Common',
  'uncommon': 'Uncommon',
  'rare': 'Rare',
  'epic': 'Epic',
  'legendary': 'Legendary',
  'mythic': 'Mythic'
};

class CardRenderer {
  static renderCard(card, options = {}) {
    const defaultOptions = {
      size: 'md',
      variant: 'default',
      interactive: true,
      selected: false,
      disabled: false,
      showPower: true,
      showElement: true,
      showLevel: true,
      showXp: true,
      highlight: 'none'
    };

    const opts = { ...defaultOptions, ...options };
    const cardEl = document.createElement('article');
    cardEl.className = this._buildCardClass(opts);
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.element = card.element;
    cardEl.dataset.rarity = card.rarity;

    if (opts.selected) cardEl.classList.add('c-card--selected');
    if (opts.disabled) cardEl.classList.add('c-card--disabled');
    if (card.isLocked) cardEl.classList.add('c-card--locked');

    cardEl.innerHTML = this._buildCardHTML(card, opts);

    if (opts.interactive) {
      cardEl.style.cursor = 'pointer';
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('tabindex', '0');
    }

    return cardEl;
  }

  static updateCard(cardEl, card, options = {}) {
    if (!cardEl.classList.contains('c-card')) return;
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.element = card.element;
    cardEl.dataset.rarity = card.rarity;
    cardEl.classList.toggle('c-card--selected', options.selected || false);
    cardEl.classList.toggle('c-card--disabled', options.disabled || false);
    cardEl.classList.toggle('c-card--locked', card.isLocked || false);

    const contentEl = cardEl.querySelector('.c-card__content');
    if (contentEl) {
      const titleEl = contentEl.querySelector('.c-card__title');
      if (titleEl && options.showName !== false) titleEl.textContent = card.name;
      const levelEl = contentEl.querySelector('.c-card__level');
      if (levelEl && options.showLevel) levelEl.textContent = `LV ${card.level}`;
      const rarityEl = contentEl.querySelector('.c-card__rarity');
      if (rarityEl) rarityEl.textContent = RARITY_LABELS[card.rarity] || card.rarity;
    }

    const xpFillEl = cardEl.querySelector('.c-card__xpFill');
    if (xpFillEl && options.showXp) {
      const xpPercent = card.xpMax > 0 ? (card.xp / card.xpMax) * 100 : 0;
      xpFillEl.style.width = `${xpPercent}%`;
      xpFillEl.setAttribute('aria-valuenow', card.xp);
      xpFillEl.parentElement.setAttribute('aria-valuemax', card.xpMax);
    }

    const powerEl = cardEl.querySelector('.c-card__power');
    if (powerEl && options.showPower) powerEl.textContent = card.power;

    const badgeEl = cardEl.querySelector('.c-card__badge');
    if (badgeEl && options.showElement) badgeEl.textContent = ELEMENT_EMOJIS[card.element] || '❓';

    const artEl = cardEl.querySelector('.c-card__art');
    if (artEl && card.artUrl) artEl.style.backgroundImage = `url('${card.artUrl}')`;

    this._updateHighlight(cardEl, options.highlight);
  }

  static renderEmptySlot(options = {}) {
    const slotEl = document.createElement('div');
    slotEl.className = 'c-card c-card--empty';
    const sizeClass = options.size ? `c-card--${options.size}` : 'c-card--md';
    slotEl.classList.add(sizeClass);
    if (options.variant) slotEl.classList.add(`c-card--variant-${options.variant}`);
    slotEl.setAttribute('data-empty-slot', 'true');
    return slotEl;
  }

  static renderCardList(container, cards, options = {}) {
    const fragment = document.createDocumentFragment();
    cards.forEach(card => fragment.appendChild(this.renderCard(card, options)));
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(fragment);
  }

  static renderMobileGrid(cards, options = {}) {
    const gridEl = document.createElement('div');
    gridEl.className = 'grid-3x3';
    const gridOptions = { ...options, size: 'sm' };
    cards.forEach(card => gridEl.appendChild(this.renderCard(card, gridOptions)));
    const emptySlotsCount = 9 - cards.length;
    for (let i = 0; i < emptySlotsCount; i++) gridEl.appendChild(this.renderEmptySlot({ size: 'sm', variant: 'slot' }));
    return gridEl;
  }

  static _buildCardClass(options) {
    const classes = ['c-card'];
    if (options.size) classes.push(`c-card--${options.size}`);
    if (options.variant && options.variant !== 'default') classes.push(`c-card--variant-${options.variant}`);
    if (options.highlight && options.highlight !== 'none') classes.push(`c-card--highlight-${options.highlight}`);
    return classes.join(' ');
  }

  static _buildCardHTML(card, options) {
    const xpPercent = card.xpMax > 0 ? (card.xp / card.xpMax) * 100 : 0;
    return `
      <div class="c-card__frame">
        ${card.artUrl ? `<div class="c-card__art"></div>` : ''}
        <div class="c-card__content">
          ${options.showName !== false ? `<div class="c-card__title">${card.name}</div>` : ''}
          <div class="c-card__meta">
            ${options.showLevel ? `<span class="c-card__level">LV ${card.level}</span>` : ''}
            <span class="c-card__rarity">${RARITY_LABELS[card.rarity] || card.rarity}</span>
          </div>
          ${options.showXp ? `
            <div class="c-card__xp" role="progressbar" aria-valuemin="0" aria-valuemax="${card.xpMax}" aria-valuenow="${card.xp}">
              <span class="c-card__xpFill" style="width: ${xpPercent}%"></span>
            </div>
          ` : ''}
        </div>
        ${options.showElement ? `
          <div class="c-card__badge c-card__badge--element" aria-hidden="true">${ELEMENT_EMOJIS[card.element] || '❓'}</div>
        ` : ''}
        ${options.showPower ? `<div class="c-card__power">${card.power}</div>` : ''}
        <div class="c-card__overlay c-card__overlay--selected"></div>
        <div class="c-card__overlay c-card__overlay--disabled"></div>
        ${card.isLocked ? `<div class="c-card__overlay c-card__overlay--locked"></div>` : ''}
      </div>
      ${this._buildHighlightHTML(options.highlight)}
    `;
  }

  static _buildHighlightHTML(highlight) {
    if (highlight === 'upgrade') return '<div class="c-card__upgrade-indicator">↑</div>';
    if (highlight === 'warning') return '<div class="c-card__upgrade-indicator" style="background: var(--color-warning)">!</div>';
    return '';
  }

  static _updateHighlight(cardEl, highlight) {
    const oldIndicators = cardEl.querySelectorAll('.c-card__upgrade-indicator');
    oldIndicators.forEach(el => el.remove());
    if (highlight && highlight !== 'none') {
      const indicatorHTML = this._buildHighlightHTML(highlight);
      if (indicatorHTML) cardEl.insertAdjacentHTML('beforeend', indicatorHTML);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = CardRenderer;
else if (typeof window !== 'undefined') window.CardRenderer = CardRenderer;
