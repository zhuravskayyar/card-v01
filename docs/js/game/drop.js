// Card drop system with rarity and element chances
// Based on balanced TCG drop rates

// Drop rate configuration
const DROP_CONFIG = {
  rarity_drop_rates: {
    R1: 60,
    R2: 15,
    R3: 15,
    R4: 10,
    // Keep R5/R6 at zero by default to make very rare; use pity for guarantees only
    R5: 0,
    R6: 0
  },
  // Configurable post-duel drop chances (can be tuned without code changes)
  drop_chances: {
    // default reduced values (win / lose / draw)
    win: 0.12,
    lose: 0.03,
    draw: 0.07
  },
  element_drop_rates: {
    fire: 25,
    water: 25,
    air: 25,
    earth: 25
  },
  starter_pool: {
    enabled_until_complete: true
  },
  pity_system: {
    // Increase pity thresholds to make guaranteed R5/R6 extremely unlikely
    legendary_guarantee_after: 99999,
    mythic_guarantee_after: 999999
  }
};

const RARITY_ORDER = ['R1','R2','R3','R4','R5','R6'];
const rarityRank = r => Math.max(1, RARITY_ORDER.indexOf(r) + 1);

const sumRates = (rates) => Object.values(rates || {}).reduce((s,v)=>s+(v||0),0);

const normalizeRates = (rates) => {
  const total = sumRates(rates) || 1;
  const out = {};
  for (const r of RARITY_ORDER) out[r] = ((rates[r] || 0) / total) * 100;
  return out;
};

const clampRatesToMax = (rates, maxRarity) => {
  if (!maxRarity) return {...rates};
  const maxRank = rarityRank(maxRarity);
  const out = {};
  for (const r of RARITY_ORDER) out[r] = (rarityRank(r) > maxRank) ? 0 : (rates[r] || 0);
  return out;
};

const rollFromNormalized = (normalized) => {
  const roll = Math.random() * 100;
  let cum = 0;
  for (const r of RARITY_ORDER) {
    cum += (normalized[r] || 0);
    if (roll <= cum) return r;
  }
  return 'R1';
};

const rollElement = (elementRates) => {
  const rates = elementRates || DROP_CONFIG.element_drop_rates;
  const roll = Math.random() * 100;
  let cum = 0;
  for (const el of Object.keys(rates)) {
    cum += rates[el] || 0;
    if (roll <= cum) return el;
  }
  return Object.keys(rates)[0] || 'fire';
};

const getRandomFromPool = (pool) => {
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

const hasCompletedStarterCollection = (profile, starterCards) => {
  if (!profile || !profile.inventory) return false;
  const starterIds = (starterCards || []).map(c => c.id);
  return starterIds.every(id => profile.inventory && profile.inventory[id] > 0);
};

// Core option-aware single drop implementation
const dropCardCore = (profile, allCards, starterCards, pityCounters = {noLegendary:0,noMythic:0}, opts = {}) => {
  const counters = { noLegendary: (pityCounters.noLegendary||0), noMythic: (pityCounters.noMythic||0) };

  // Starter pool
  const starterActive = DROP_CONFIG.starter_pool.enabled_until_complete && !hasCompletedStarterCollection(profile, starterCards);
  if (starterActive && starterCards && starterCards.length) {
    return { card: getRandomFromPool(starterCards), rarity: null, fromStarterPool: true, pityCounters: counters };
  }

  // Assemble rates
  const baseRates = opts.rarityRates || DROP_CONFIG.rarity_drop_rates;
  // First clamp to maxRarity if provided
  const capped = clampRatesToMax(baseRates, opts.maxRarity);
  // Normalize
  const normalized = normalizeRates(capped);

  // Pity checks (won't exceed maxRarity because capped above)
  let forcedRarity = null;
  if ((counters.noMythic || 0) >= (DROP_CONFIG.pity_system.mythic_guarantee_after || 999999)) {
    forcedRarity = 'R6';
  } else if ((counters.noLegendary || 0) >= (DROP_CONFIG.pity_system.legendary_guarantee_after || 999999)) {
    forcedRarity = 'R5';
  }

  if (forcedRarity) {
    // If forced rarity is above maxRarity, clamp it down
    if (opts.maxRarity && rarityRank(forcedRarity) > rarityRank(opts.maxRarity)) {
      forcedRarity = opts.maxRarity;
    }
    // If the forced rarity has zero chance in the capped rates, pick the highest allowed rarity with non-zero chance
    const cappedRates = clampRatesToMax(baseRates, opts.maxRarity);
    const hasChance = (r) => (cappedRates[r] || 0) > 0;
    if (!hasChance(forcedRarity)) {
      // find highest allowed rarity with positive weight
      let found = null;
      for (let i = RARITY_ORDER.length - 1; i >= 0; i--) {
        const r = RARITY_ORDER[i];
        if (hasChance(r)) { found = r; break; }
      }
      forcedRarity = found; // may be null
    }
  }

  // Roll rarity (or apply forced)
  let rarity = forcedRarity || rollFromNormalized(normalized);

  // Guaranteed at least
  if (opts.guaranteedAtLeast) {
    const need = rarityRank(opts.guaranteedAtLeast);
    if (rarityRank(rarity) < need) rarity = opts.guaranteedAtLeast;
  }

  // Final clamp to maxRarity again to be safe
  if (opts.maxRarity && rarityRank(rarity) > rarityRank(opts.maxRarity)) {
    rarity = opts.maxRarity;
  }

  const element = rollElement(opts.elementRates);

  let pool = (allCards || []).filter(c => c.rarity === rarity && c.element === element);
  if (!pool.length) pool = (allCards || []).filter(c => c.rarity === rarity);
  if (!pool.length) pool = (allCards || []).filter(c => c.element === element);
  if (!pool.length) pool = allCards || [];

  const card = getRandomFromPool(pool);

  // Update pity counters
  if (rarity === 'R6') {
    counters.noMythic = 0; counters.noLegendary = 0;
  } else if (rarity === 'R5') {
    counters.noLegendary = 0; counters.noMythic = (counters.noMythic||0) + 1;
  } else {
    counters.noLegendary = (counters.noLegendary||0) + 1; counters.noMythic = (counters.noMythic||0) + 1;
  }

  return { card, rarity, fromStarterPool: false, pityCounters: counters };
};

// Public API
if (typeof window !== 'undefined') {
  window.dropCardWithOptions = window.dropCardWithOptions || function(profile, allCards, starterCards, pityCounters, opts) {
    return dropCardCore(profile, allCards, starterCards, pityCounters, opts);
  };

  window.dropCardsWithOptions = window.dropCardsWithOptions || function(profile, allCards, starterCards, count = 1, pityCounters, opts) {
    const res = { cards: [], pityCounters: { noLegendary: (pityCounters && pityCounters.noLegendary)||0, noMythic: (pityCounters && pityCounters.noMythic)||0 } };
    for (let i=0;i<count;i++){
      const t = dropCardCore(profile, allCards, starterCards, res.pityCounters, opts);
      if (t.card) res.cards.push(t.card);
      res.pityCounters = t.pityCounters;
    }
    return res;
  };

  // Backwards-compatible wrappers
  window.dropCard = window.dropCard || function(profile, allCards, starterCards, pityCounters) {
    const opts = {}; return dropCardCore(profile, allCards, starterCards, pityCounters, opts);
  };

  window.dropCards = window.dropCards || function(profile, allCards, starterCards, count, pityCounters) {
    return window.dropCardsWithOptions(profile, allCards, starterCards, count, pityCounters, {});
  };

  // Read drop chance from config (allows runtime tuning)
  const getDropChance = (result, opts = {}) => {
    // Priority: opts.dropChances -> DROP_CONFIG.drop_chances -> hard defaults
    const defaults = { win: 0.12, lose: 0.03, draw: 0.07 };
    const cfg = (opts && opts.dropChances) || DROP_CONFIG.drop_chances || defaults;
    return (cfg && (cfg[result] || 0)) || 0;
  };

  const shouldDrop = (result) => Math.random() < getDropChance(result);

  window.dropSystem = window.dropSystem || {};
  window.dropSystem.DROP_CONFIG = DROP_CONFIG;
  window.dropSystem.dropCard = window.dropCard;
  window.dropSystem.dropCards = window.dropCards;
  window.dropSystem.dropCardWithOptions = window.dropCardWithOptions;
  window.dropSystem.dropCardsWithOptions = window.dropCardsWithOptions;
  window.dropSystem.getDropChance = getDropChance;
  window.dropSystem.shouldDrop = shouldDrop;
  window.dropSystem.simulateDrops = function(allCards, starterCards, profile = {}, trials = 10000, opts = {}){
    let counters = { noLegendary: 0, noMythic: 0 };
    const counts = { R1:0,R2:0,R3:0,R4:0,R5:0,R6:0 };
    for (let i=0;i<trials;i++){
      const r = dropCardCore(profile, allCards, starterCards, counters, opts);
      counters = r.pityCounters;
      const rr = r.rarity || (r.card && r.card.rarity) || null;
      if (rr) counts[rr] = (counts[rr]||0) + 1;
    }
    return { counts, counters };
  };
}
