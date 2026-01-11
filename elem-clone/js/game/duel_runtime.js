// Runtime duel engine for index.html usage (global functions)
(function(){
  function shuffle(arr){
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }
  
  // Get IDs already on field (excluding specific slot)
  function getFieldIds(hand, excludeIdx){
    const ids = [];
    for (let i=0; i<hand.length; i++){
      if (i !== excludeIdx && hand[i]) ids.push(hand[i].id);
    }
    return ids;
  }
  
  // Draw next unique card (circular deck)
  function drawNextUnique(side, slotIdx){
    const fieldIds = getFieldIds(side.hand, slotIdx);
    const maxAttempts = side.deck.length;
    
    for (let attempt=0; attempt<maxAttempts; attempt++){
      const candidate = side.deck[side.cursor];
      side.cursor = (side.cursor + 1) % side.deck.length;
      
      if (!fieldIds.includes(candidate.id)){
        return candidate;
      }
    }
    // If no unique found (наприклад, багато дублікатів) — все одно беремо наступну карту за курсором
    const fallback = side.deck[side.cursor];
    side.cursor = (side.cursor + 1) % side.deck.length;
    return fallback;
  }
  
  // Fill initial hand with unique cards
  function fillInitialHand(side, handSize){
    side.hand = [];
    for (let i=0; i<handSize; i++){
      side.hand[i] = drawNextUnique(side, i);
    }
  }
  
  window.createDuel = function(playerDeck9, enemyDeck9){
    const pHP = playerDeck9.reduce((s,c)=>s+(c.power||0),0);
    const eHP = enemyDeck9.reduce((s,c)=>s+(c.power||0),0);
    
    const player = {
      hp: pHP,
      maxHp: pHP,
      deck: shuffle(playerDeck9),
      cursor: 0,
      hand: []
    };
    
    const enemy = {
      hp: eHP,
      maxHp: eHP,
      deck: shuffle(enemyDeck9),
      cursor: 0,
      hand: []
    };
    
    fillInitialHand(player, 3);
    fillInitialHand(enemy, 3);
    
    return {
      turn: 1,
      player,
      enemy,
      log: [],
      lastTurn: null,
      finished: false,
      result: null
    };
  };
  window.playTurn = function(duel, playerIdx){
    if (!duel || duel.finished) return duel;
    
    // Mirror model: player card at slot i fights enemy card at slot i
    const pCard = duel.player.hand[playerIdx];
    const eCard = duel.enemy.hand[playerIdx];
    if (!pCard || !eCard) return duel;
    
    // Calculate damage both ways
    const pHit = window.damage(pCard, eCard);
    const eHit = window.damage(eCard, pCard);
    
    duel.enemy.hp = Math.max(0, duel.enemy.hp - pHit.dmg);
    duel.player.hp = Math.max(0, duel.player.hp - eHit.dmg);
    
    // Log this turn
    duel.lastTurn = {
      slotIdx: playerIdx,
      player: { cardId: pCard.id, element: pCard.element, power: pCard.power, dmg: pHit.dmg, mult: pHit.mult },
      enemy: { cardId: eCard.id, element: eCard.element, power: eCard.power, dmg: eHit.dmg, mult: eHit.mult }
    };
    duel.log.push({ turn: duel.turn, ...duel.lastTurn });
    duel.turn += 1;
    
    // Refill ONLY the played slot with unique cards
    duel.player.hand[playerIdx] = drawNextUnique(duel.player, playerIdx);
    duel.enemy.hand[playerIdx] = drawNextUnique(duel.enemy, playerIdx);
    
    // Check end condition
    if (duel.player.hp <= 0 || duel.enemy.hp <= 0){
      duel.finished = true;
      if (duel.player.hp > duel.enemy.hp) duel.result = 'win';
      else if (duel.player.hp < duel.enemy.hp) duel.result = 'lose';
      else duel.result = 'draw';
    }
    
    // Keep last 10 log entries
    if (duel.log.length > 10) duel.log.splice(0, duel.log.length - 10);
    
    return duel;
  };
})();
