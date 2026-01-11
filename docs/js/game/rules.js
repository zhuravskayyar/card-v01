// Game rules: damage calculation, combat resolution
import { getMultiplier } from '../data/elements.js';

// Calculate damage from attacker to defender
export const calculateDamage = (attackerCard, defenderCard) => {
  const baseAttack = attackerCard.attack;
  const defense = defenderCard.defense;
  const multiplier = getMultiplier(attackerCard.element, defenderCard.element);
  
  // Damage formula: (Attack - Defense/2) * Multiplier
  const rawDamage = Math.max(0, baseAttack - defense / 2);
  const finalDamage = Math.round(rawDamage * multiplier);
  
  return {
    damage: finalDamage,
    multiplier,
    isEffective: multiplier > 1.0,
    isWeak: multiplier < 1.0
  };
};

// Resolve a single round of combat between two cards
export const resolveRound = (playerCard, enemyCard) => {
  // Player attacks enemy
  const playerAttack = calculateDamage(playerCard, enemyCard);
  
  // Enemy attacks player
  const enemyAttack = calculateDamage(enemyCard, playerCard);
  
  // Determine winner (higher damage wins)
  let winner = null;
  let netDamage = 0;
  
  if (playerAttack.damage > enemyAttack.damage) {
    winner = 'player';
    netDamage = playerAttack.damage - enemyAttack.damage;
  } else if (enemyAttack.damage > playerAttack.damage) {
    winner = 'enemy';
    netDamage = enemyAttack.damage - playerAttack.damage;
  } else {
    winner = 'draw';
    netDamage = 0;
  }
  
  return {
    winner,
    netDamage,
    playerAttack,
    enemyAttack,
    playerCard,
    enemyCard
  };
};

// Check if duel is over
export const checkDuelEnd = (playerHP, enemyHP) => {
  if (playerHP <= 0 && enemyHP <= 0) {
    return { ended: true, result: 'draw' };
  }
  if (playerHP <= 0) {
    return { ended: true, result: 'defeat' };
  }
  if (enemyHP <= 0) {
    return { ended: true, result: 'victory' };
  }
  return { ended: false, result: null };
};

// Generate combat log message
export const generateLogMessage = (roundResult, round) => {
  const { winner, netDamage, playerCard, enemyCard, playerAttack, enemyAttack } = roundResult;
  
  let message = `Раунд ${round}: ${playerCard.name} VS ${enemyCard.name}. `;
  
  if (winner === 'player') {
    message += `Гравець наносить ${netDamage} урону`;
    if (playerAttack.isEffective) {
      message += ' (ефективно!)';
    }
  } else if (winner === 'enemy') {
    message += `Ворог наносить ${netDamage} урону`;
    if (enemyAttack.isEffective) {
      message += ' (ефективно!)';
    }
  } else {
    message += 'Нічия!';
  }
  
  return message;
};

// Validate deck (must have exactly 9 cards)
export const validateDeck = (deck) => {
  if (!Array.isArray(deck)) {
    return { valid: false, error: 'Колода повинна бути масивом' };
  }
  
  if (deck.length !== 9) {
    return { valid: false, error: 'Колода повинна містити рівно 9 карт' };
  }
  
  // Check all cards are valid objects
  for (const card of deck) {
    if (!card || !card.id || !card.element || typeof card.attack !== 'number' || typeof card.defense !== 'number') {
      return { valid: false, error: 'Недійсна карта в колоді' };
    }
  }
  
  return { valid: true, error: null };
};

// Calculate win probability (simple heuristic)
export const calculateWinProbability = (playerDeck, enemyDeck) => {
  const playerPower = playerDeck.reduce((sum, card) => sum + card.attack + card.defense, 0);
  const enemyPower = enemyDeck.reduce((sum, card) => sum + card.attack + card.defense, 0);
  
  const totalPower = playerPower + enemyPower;
  return Math.round((playerPower / totalPower) * 100);
};

export default {
  calculateDamage,
  resolveRound,
  checkDuelEnd,
  generateLogMessage,
  validateDeck,
  calculateWinProbability
};
