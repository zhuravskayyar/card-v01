// Duel Screen
import dom from '../../core/dom.js';
import { router } from '../../core/router.js';
import { store } from '../../core/store.js';
import { createButton } from '../components/Button.js';
import { createCardView } from '../components/CardView.js';
import { showToast } from '../components/Toast.js';
import { Duel, DUEL_STATES } from '../../game/duel.js';
import { balanceDeck, getDeckStats } from '../../game/deck.js';
import { CARDS } from '../../data/cards.js';
import { animate } from '../../core/time.js';

let currentDuel = null;
let autoPlayInterval = null;

export const DuelScreen = () => {
  const screen = dom.create('div', { className: 'screen duel-screen' });

  // Get player deck from store
  let playerDeck = store.get('deck');
  if (!playerDeck || playerDeck.length !== 9) {
    playerDeck = balanceDeck(CARDS, 9);
  }

  // Generate enemy deck adapted to player total power: target = playerTotal +/-100
  let enemyDeck = balanceDeck(CARDS, 9);
  try {
    // compute player's total power (use getProgress + getPower if available)
    const calcPower = (card, level = 1) => {
      if (typeof window !== 'undefined' && window.getPower) return window.getPower(card, level);
      return card.attack || card.basePower || 0;
    };

    let playerTotal = 0;
    try {
      const profile = (typeof window !== 'undefined' && window.userProfile) ? window.userProfile.getProfile() : null;
      if (profile && profile.deckCards && profile.deckCards.length) {
        profile.deckCards.forEach(dc => {
          const src = CARDS.find(x => x.id === (dc.cardId || dc.id)) || null;
          const prog = (typeof window !== 'undefined' && window.getProgress) ? window.getProgress(profile, dc.uid || dc.id) : { level: dc.level || 1 };
          const lvl = (prog && prog.level) ? prog.level : (dc.level || 1);
          if (src) playerTotal += calcPower(src, lvl) || 0;
        });
      } else {
        playerTotal = playerDeck.reduce((sum, c) => sum + (calcPower(c, 1) || 0), 0);
      }
    } catch (err) {
      playerTotal = playerDeck.reduce((sum, c) => sum + (calcPower(c, 1) || 0), 0);
    }
    // target enemy total within +/-20 of playerTotal
    const offset = Math.floor(Math.random() * 41) - 20; // -20..+20
    const targetTotal = Math.max(0, playerTotal + offset);

    // candidate pool: prefer non-starter cards
    let pool = CARDS.filter(c => !(String(c.id).startsWith('S'))).slice();
    if (pool.length < 9) pool = CARDS.slice();

    const cardPower = c => calcPower(c, 1) || 0;

    // Greedy selection with optimistic future estimate: pick cards that move sum
    // closest to target when assuming we can fill remaining slots with the
    // strongest available cards (helps reach target within tighter bounds).
    const selected = [];
    let currentSum = 0;

    function sumTopPowers(arrPowers, count, excludeIdx) {
      if (count <= 0) return 0;
      // take top `count` powers from arrPowers excluding index excludeIdx
      const copy = arrPowers.slice();
      if (excludeIdx >= 0) copy.splice(excludeIdx, 1);
      copy.sort((a, b) => b - a);
      return copy.slice(0, count).reduce((s, v) => s + v, 0);
    }

    for (let slot = 0; slot < 9; slot++) {
      let bestIdx = -1;
      let bestDelta = Infinity;

      // Precompute powers array for pool
      const poolPowers = pool.map(c => cardPower(c));
      const remainingSlots = 9 - slot - 1;

      for (let i = 0; i < pool.length; i++) {
        const p = poolPowers[i];
        // optimistic future: sum of top `remainingSlots` powers from pool excluding candidate
        const futureMax = sumTopPowers(poolPowers, remainingSlots, i);
        const newSum = currentSum + p + futureMax;
        const delta = Math.abs(newSum - targetTotal);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) break;
      const pick = pool.splice(bestIdx, 1)[0];
      selected.push(pick);
      currentSum += cardPower(pick);
    }

    // If not enough selected (rare), fill with random balanced ones
    if (selected.length < 9) {
      const fill = balanceDeck(pool.concat(CARDS), 9 - selected.length);
      selected.push(...fill);
    }

    // Now adjust levels of selected cards so enemy total approximates targetTotal
    const enriched = selected.map(c => ({ src: c, level: 1, power: cardPower(c) }));
    let selectedSum = enriched.reduce((s, e) => s + e.power, 0);
    let attempts = 0;
    const maxAttempts = 500;
    while (selectedSum < targetTotal && attempts < maxAttempts) {
      // pick card which gives largest incremental gain when level++
      let bestIdx = -1;
      let bestGain = 0;
      for (let i = 0; i < enriched.length; i++) {
        const e = enriched[i];
        const nextLevel = Math.min((e.level || 1) + 1, 20);
        const nextPower = calcPower(e.src, nextLevel) || e.power;
        const gain = nextPower - e.power;
        if (gain > bestGain) {
          bestGain = gain;
          bestIdx = i;
        }
      }
      if (bestIdx === -1 || bestGain <= 0) break;
      enriched[bestIdx].level = Math.min((enriched[bestIdx].level || 1) + 1, 20);
      enriched[bestIdx].power = calcPower(enriched[bestIdx].src, enriched[bestIdx].level) || enriched[bestIdx].power;
      selectedSum = enriched.reduce((s, e) => s + e.power, 0);
      attempts++;
    }

    // Build final enemy deck objects with updated attack/level
    const finalSelected = enriched.map(e => {
      const copy = Object.assign({}, e.src);
      copy.level = e.level || 1;
      // set attack to computed power; keep defense as base or scaled if getPower returns object
      const p = calcPower(e.src, copy.level) || (e.src.attack || e.src.basePower || 0);
      copy.attack = p;
      // Duplicate power for UI compatibility
      copy.power = p;
      copy.stats = { ...(copy.stats || {}), power: p };
      return copy;
    });

    enemyDeck = balanceDeck(finalSelected, 9);
    console.log('[DUEL] playerTotal', playerTotal, 'offset', offset, 'target', targetTotal, 'enemyTotalApprox', finalSelected.reduce((s,c)=>s+(c.attack||0),0));
  } catch (err) {
    console.warn('Enemy adaptation failed, using default pool', err);
    enemyDeck = balanceDeck(CARDS, 9);
  }

  // Create duel instance — HP equals deck total power
  const computeCardPower = (c) => {
    try {
      return calcPower(c, c.level || 1) || c.attack || c.basePower || 0;
    } catch (e) {
      return c.attack || c.basePower || 0;
    }
  };
  const playerHP = playerDeck.reduce((s, c) => s + computeCardPower(c), 0);
  const enemyHP = enemyDeck.reduce((s, c) => s + (c.power || computeCardPower(c)), 0);

  currentDuel = new Duel(playerDeck, enemyDeck, playerHP, enemyHP);
  currentDuel.start();

  // Duel header
  const header = createDuelHeader();
  screen.appendChild(header);

  // Arena
  const arena = dom.create('div', { className: 'duel-arena' });
  screen.appendChild(arena);


  // --- MOBILE GRID STYLE ---
  // Використовуємо сітку як у DeckScreen, але без другого ряду, зменшена відстань, з множником
  const playerDeckEl = dom.create('div', { className: 'duel-deck mobile-grid' });
  arena.appendChild(playerDeckEl);
  const vs = dom.create('div', { className: 'duel-vs' }, ['⚔️']);
  arena.appendChild(vs);
  const enemyDeckEl = dom.create('div', { className: 'duel-deck mobile-grid' });
  arena.appendChild(enemyDeckEl);

  // Log
  const log = dom.create('div', { className: 'duel-log' });
  screen.appendChild(log);

  // Actions
  const actions = dom.create('div', { className: 'duel-actions' });
  screen.appendChild(actions);

  // Render function
  function render() {
    const state = currentDuel.getState();

    // Update header
    updateDuelHeader(header, state);


    // --- MOBILE GRID STYLE ---
    // Вирізаємо другий ряд (позиції 3,4,5), залишаємо 6 карт (0,1,2,6,7,8)
    const playerGridCards = [0,1,2,6,7,8].map(i => currentDuel.playerDeck[i]).filter(Boolean);
    const enemyGridCards = [0,1,2,6,7,8].map(i => currentDuel.enemyDeck[i]).filter(Boolean);
    dom.clear(playerDeckEl);
    dom.clear(enemyDeckEl);
    playerGridCards.forEach((card, idx) => {
      // Множник: рахуємо скільки карт з таким id у колоді (на випадок дублікатів)
      const count = currentDuel.playerDeck.filter(c => c.id === card.id).length;
      const cardEl = createCardView(card, {
        selected: state.currentPlayerCard?.id === card.id,
        disabled: state.state !== DUEL_STATES.PLAYER_TURN,
        onClick: () => {
          if (state.state === DUEL_STATES.PLAYER_TURN) {
            currentDuel.selectPlayerCard(idx);
            showToast.info(`Вибрано ${card.name}`);
            setTimeout(() => {
              currentDuel.selectEnemyCard();
              render();
              setTimeout(() => {
                const result = currentDuel.resolveCurrentRound();
                render();
                if (result.duelEnded) {
                  setTimeout(() => { endDuel(); }, 1500);
                } else {
                  currentDuel.nextRound();
                  render();
                }
              }, 1000);
            }, 500);
          }
        }
      });
      // Додаємо множник, якщо карт більше однієї
      if (count > 1) {
        const mult = dom.create('div', {
          className: 'card-multiplier',
          style: {
            position: 'absolute',
            top: '6px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 10px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            zIndex: 2
          }
        }, [`×${count}`]);
        cardEl.appendChild(mult);
      }
      playerDeckEl.appendChild(cardEl);
    });
    enemyGridCards.forEach((card, idx) => {
      const count = currentDuel.enemyDeck.filter(c => c.id === card.id).length;
      const cardEl = createCardView(card, {
        selected: state.currentEnemyCard?.id === card.id
      });
      if (count > 1) {
        const mult = dom.create('div', {
          className: 'card-multiplier',
          style: {
            position: 'absolute',
            top: '6px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 10px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            zIndex: 2
          }
        }, [`×${count}`]);
        cardEl.appendChild(mult);
      }
      enemyDeckEl.appendChild(cardEl);
    });

    // Update log
    dom.clear(log);
    state.log.slice(-5).reverse().forEach(entry => {
      const logEntry = dom.create('div', { className: 'duel-log-entry' }, [
        entry.message
      ]);
      log.appendChild(logEntry);
    });

    // Update actions
    dom.clear(actions);

    if (state.state === DUEL_STATES.PLAYER_TURN) {
      const info = dom.create('p', { 
        style: { 
          textAlign: 'center',
          color: 'var(--color-primary)',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }
      }, ['👆 Виберіть карту для атаки']);
      actions.appendChild(info);
    }

    const autoBtn = createButton({
      text: autoPlayInterval ? '⏸️ Зупинити авто-гру' : '▶️ Авто-гра',
      variant: autoPlayInterval ? 'warning' : 'secondary',
      onClick: toggleAutoPlay
    });
    actions.appendChild(autoBtn);

    const surrenderBtn = createButton({
      text: '🏳️ Здатися',
      variant: 'danger',
      onClick: () => {
        showToast.warning('Ви здалися');
        currentDuel.result = 'defeat';
        endDuel();
      }
    });
    actions.appendChild(surrenderBtn);
  }

  // Auto-play toggle
  function toggleAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    } else {
      autoPlayInterval = setInterval(() => {
        const state = currentDuel.getState();
        
        if (state.state === DUEL_STATES.DUEL_END) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
          endDuel();
          return;
        }

        const result = currentDuel.autoPlay();
        render();
        
        if (result.duelEnded) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
          setTimeout(() => {
            endDuel();
          }, 1000);
        } else if (state.state === DUEL_STATES.ROUND_END) {
          currentDuel.nextRound();
          render();
        }
      }, 1500);
    }
    render();
  }

  // End duel
  function endDuel() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }

    // Save result
    store.setState({
      duel: {
        ...currentDuel.getState(),
        active: false
      }
    });

    router.navigate('/result');
  }

  // Initial render
  render();

  return screen;
};

// Create duel header
function createDuelHeader() {
  const header = dom.create('div', { className: 'duel-header' });

  // Player info
  const playerInfo = dom.create('div', { className: 'player-info' }, [
    dom.create('div', { className: 'player-name' }, ['👤 Гравець']),
    dom.create('div', { className: 'player-hp' })
  ]);

  // Round info
  const roundInfo = dom.create('div', { className: 'duel-round' });

  // Enemy info
  const enemyInfo = dom.create('div', { className: 'player-info' }, [
    dom.create('div', { className: 'player-name' }, ['🤖 Противник']),
    dom.create('div', { className: 'player-hp' })
  ]);

  header.appendChild(playerInfo);
  header.appendChild(roundInfo);
  header.appendChild(enemyInfo);

  return header;
}

// Update duel header
function updateDuelHeader(header, state) {
  const playerInfo = header.children[0];
  const roundInfo = header.children[1];
  const enemyInfo = header.children[2];

  // Update player HP
  const playerHPEl = playerInfo.querySelector('.player-hp');
  dom.clear(playerHPEl);
  playerHPEl.appendChild(createHealthBar(state.playerHP, state.playerMaxHP || state.playerHP));

  // Update round
  roundInfo.textContent = `Раунд ${state.round}`;

  // Update enemy HP
  const enemyHPEl = enemyInfo.querySelector('.player-hp');
  dom.clear(enemyHPEl);
  enemyHPEl.appendChild(createHealthBar(state.enemyHP, state.enemyMaxHP || state.enemyHP));
}

// Create health bar
function createHealthBar(current, max) {
  const percentage = Math.max(0, (current / max) * 100);
  
  const bar = dom.create('div', { className: 'health-bar' }, [
    dom.create('div', {
      className: 'health-bar-fill',
      style: {
        width: `${percentage}%`
      }
    }),
    dom.create('div', { className: 'health-bar-text' }, [
      `${current}/${max}`
    ])
  ]);

  return bar;
}

export default DuelScreen;
