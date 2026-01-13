// Card view component - STEAMPUNK STYLE

import dom from '../../core/dom.js';
import { ELEMENT_INFO } from '../../data/elements.js';

// PATCH: rarity normalization for all render paths
function normalizeRarity(raw) {
  if (raw == null) return { rClass: "R1", text: "common" };

  const s = String(raw).trim().toLowerCase();

  // If already R1..R6
  const m = s.match(/^r([1-6])$/);
  if (m) {
    const n = Number(m[1]);
    return {
      rClass: `R${n}`,
      text: ["common","uncommon","rare","epic","legendary","mythic"][n - 1]
    };
  }

  // If numeric 1..6
  const num = Number(s);
  if (Number.isFinite(num) && num >= 1 && num <= 6) {
    const n = Math.floor(num);
    return {
      rClass: `R${n}`,
      text: ["common","uncommon","rare","epic","legendary","mythic"][n - 1]
    };
  }

  // Text aliases
  const map = {
    common: { rClass: "R1", text: "common" },
    r1: { rClass: "R1", text: "common" },

    uncommon: { rClass: "R2", text: "uncommon" },
    r2: { rClass: "R2", text: "uncommon" },

    rare: { rClass: "R3", text: "rare" },
    r3: { rClass: "R3", text: "rare" },

    epic: { rClass: "R4", text: "epic" },
    purple: { rClass: "R4", text: "epic" },
    r4: { rClass: "R4", text: "epic" },

    legendary: { rClass: "R5", text: "legendary" },
    legend: { rClass: "R5", text: "legendary" },
    gold: { rClass: "R5", text: "legendary" },
    r5: { rClass: "R5", text: "legendary" },

    mythic: { rClass: "R6", text: "mythic" },
    red: { rClass: "R6", text: "mythic" },
    r6: { rClass: "R6", text: "mythic" },
  };

  return map[s] || { rClass: "R1", text: "common" };
}

function applyRarity(el, card) {
  const raw =
    card?.rarity ??
    card?.rarityId ??
    card?.rarity_id ??
    card?.tier ??
    card?.rank ??
    card?.rarityKey;

  const { rClass, text } = normalizeRarity(raw);

  // remove any previous rarity classes to avoid conflicts
  el.classList.remove(
    "R1","R2","R3","R4","R5","R6",
    "common","uncommon","rare","epic","legendary","mythic"
  );

  el.classList.add(rClass);
  el.classList.add(text);              // optional, but useful for readability/debug
  el.dataset.rarity = text;            // data-rarity="mythic" etc
}

// Маппінг стихій на SVG іконки (стимпанк-стиль)
const ELEMENT_ICONS = {
  fire: `<path d="M12 2C13 8 8 10 10 16 11 19 16 20 16 24 16 28 12 32 8 32S0 28 0 20c0-8 4-12 8-18 4-8 2-12 4-18Z" fill="currentColor"/>`,
  water: `<path d="M12 4C16 2 22 6 20 12 18 18 14 20 12 22 10 20 6 18 4 12 2 6 8 2 12 4Z" fill="currentColor"/>`,
  air: `<path d="M12 4C16 2 20 6 18 12 16 18 12 20 12 22 12 20 8 18 6 12 4 6 8 2 12 4Z" fill="currentColor"/><rect x="8" y="10" width="8" height="4" fill="currentColor" opacity="0.6"/>`,
  earth: `<path d="M6 16L12 6L18 16L15 20L9 20Z" fill="currentColor"/><rect x="10" y="14" width="4" height="2" fill="currentColor" opacity="0.7"/>`
};


export const createCardView = (card, options = {}) => {
  const { selected = false, disabled = false, onClick = () => {} } = options;

  if (!card) {
    return dom.create('div', { className: 'card-slot deck-slot' }, ['Порожній слот']);
  }

  const classes = ['sp-card', card.element];
  if (selected) classes.push('selected');
  if (disabled) classes.push('disabled');


  const cardEl = dom.create('div', {
    className: classes.join(' '),
    'data-uid': card.uid,
    'data-card-id': card.cardId || card.id,
    id: card.uid ? `card_${card.uid}` : undefined,
    style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    onClick: () => {
      if (!disabled) onClick(card);
    }
  });

  // PATCH: ensure rarity is always applied (even in fallback rendering)
  applyRarity(cardEl, card);

  // Only element icon (SVG) and power
  const elementIcon = ELEMENT_ICONS[card.element] || ELEMENT_ICONS.fire;
  const iconWrap = dom.create('div', { style: { position: 'absolute', top: '12px', left: '12px', width: '38px', height: '38px' } });
  iconWrap.innerHTML = `<svg viewBox="0 0 24 24" width="38" height="38" fill="none">${elementIcon}</svg>`;
  cardEl.appendChild(iconWrap);

  // Power (instance.power)
  const power = card.power ?? card.attack ?? card.basePower ?? 0;
  const powerDiv = dom.create('div', {
    style: {
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '2.2rem',
      color: '#f2d07a',
      fontWeight: 'bold',
      fontFamily: 'Georgia, serif',
      textShadow: '0 2px 8px #000, 0 0 1px #fff2',
      background: 'rgba(0,0,0,0.12)',
      borderRadius: '10px',
      padding: '2px 18px',
      minWidth: '60px',
      textAlign: 'center',
      boxShadow: '0 2px 8px #0002'
    }
  }, [String(power)]);
  cardEl.appendChild(powerDiv);

  return cardEl;
};

// Create card with tooltip
export const createCardWithTooltip = (card, options = {}) => {
  const cardEl = createCardView(card, options);
  
  if (!card) return cardEl;

  // Add hover tooltip
  let tooltip = null;
  
  cardEl.addEventListener('mouseenter', (e) => {
    tooltip = dom.create('div', {
      className: 'tooltip',
      style: {
        position: 'fixed',
        left: `${e.clientX + 10}px`,
        top: `${e.clientY + 10}px`,
        background: 'rgba(0,0,0,0.9)',
        color: '#f4e6c6',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #c59b3c',
        zIndex: '10000',
        pointerEvents: 'none',
        maxWidth: '250px'
      }
    }, [
      dom.create('div', { style: { fontWeight: 'bold', marginBottom: '4px' } }, [card.name]),
      dom.create('div', { style: { fontSize: '11px', opacity: '0.8', marginBottom: '4px' } }, [
        card.factionName || 'Фракція невідома'
      ]),
      dom.create('div', { style: { fontSize: '12px', marginTop: '6px' } }, [
        `${ELEMENT_INFO[card.element]?.name || card.element} • ${card.rarityDisplay || 'Рідкість невідома'}`
      ]),
      dom.create('div', { style: { fontSize: '12px', marginTop: '4px' } }, [
        `⚔️ Атака: ${card.attack} | 🛡️ Захист: ${card.defense}`
      ]),
      card.description ? dom.create('div', { 
        style: { fontSize: '11px', marginTop: '6px', opacity: '0.7', fontStyle: 'italic' }
      }, [card.description]) : null
    ].filter(Boolean));
    
    document.body.appendChild(tooltip);
  });

  cardEl.addEventListener('mouseleave', () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  });

  cardEl.addEventListener('mousemove', (e) => {
    if (tooltip) {
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
    }
  });

  return cardEl;
};

export default createCardView;
