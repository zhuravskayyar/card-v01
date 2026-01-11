// Duel state machine and logic
import { resolveRound, checkDuelEnd, generateLogMessage } from './rules.js';
import { shuffleDeck } from './deck.js';

// Duel states
export const DUEL_STATES = {
  INIT: 'init',
  PLAYER_TURN: 'player_turn',
  ENEMY_TURN: 'enemy_turn',
  RESOLVING: 'resolving',
  ROUND_END: 'round_end',
  DUEL_END: 'duel_end'
};

// Create new duel instance
export class Duel {
  constructor(playerDeck, enemyDeck, startingHP = 100, startingEnemyHP = null) {
    this.playerDeck = shuffleDeck([...playerDeck]);
    this.enemyDeck = shuffleDeck([...enemyDeck]);
    this.playerHP = startingHP;
    this.enemyHP = (startingEnemyHP !== null) ? startingEnemyHP : startingHP;
    this.playerMaxHP = this.playerHP;
    this.enemyMaxHP = this.enemyHP;
    this.round = 0;
    this.state = DUEL_STATES.INIT;
    this.log = [];
    this.currentPlayerCard = null;
    this.currentEnemyCard = null;
    this.result = null;
  }

  // Start the duel
  start() {
    this.state = DUEL_STATES.PLAYER_TURN;
    this.round = 1;
    this.addLog('Дуель розпочалася!');
  }

  // Player selects a card
  selectPlayerCard(cardIndex) {
    if (this.state !== DUEL_STATES.PLAYER_TURN) {
      return { success: false, error: 'Не ваш хід' };
    }

    if (cardIndex < 0 || cardIndex >= this.playerDeck.length) {
      return { success: false, error: 'Недійсний індекс карти' };
    }

    this.currentPlayerCard = this.playerDeck[cardIndex];
    this.state = DUEL_STATES.ENEMY_TURN;
    
    return { success: true };
  }

  // Enemy AI selects a card (random for now)
  selectEnemyCard() {
    if (this.state !== DUEL_STATES.ENEMY_TURN) {
      return { success: false, error: 'Не хід противника' };
    }

    const randomIndex = Math.floor(Math.random() * this.enemyDeck.length);
    this.currentEnemyCard = this.enemyDeck[randomIndex];
    this.state = DUEL_STATES.RESOLVING;
    
    return { success: true };
  }

  // Resolve current round
  resolveCurrentRound() {
    if (this.state !== DUEL_STATES.RESOLVING) {
      return { success: false, error: 'Неможливо розв\'язати раунд' };
    }

    if (!this.currentPlayerCard || !this.currentEnemyCard) {
      return { success: false, error: 'Карти не вибрані' };
    }

    // Resolve combat
    const roundResult = resolveRound(this.currentPlayerCard, this.currentEnemyCard);
    
    // Apply damage
    if (roundResult.winner === 'player') {
      this.enemyHP -= roundResult.netDamage;
    } else if (roundResult.winner === 'enemy') {
      this.playerHP -= roundResult.netDamage;
    }

    // Ensure HP doesn't go below 0
    this.playerHP = Math.max(0, this.playerHP);
    this.enemyHP = Math.max(0, this.enemyHP);

    // Add to log
    const logMessage = generateLogMessage(roundResult, this.round);
    this.addLog(logMessage);

    // Remove used cards
    this.playerDeck = this.playerDeck.filter(card => card.id !== this.currentPlayerCard.id);
    this.enemyDeck = this.enemyDeck.filter(card => card.id !== this.currentEnemyCard.id);

    this.currentPlayerCard = null;
    this.currentEnemyCard = null;

    // Check if duel ended
    const endCheck = checkDuelEnd(this.playerHP, this.enemyHP);
    
    if (endCheck.ended) {
      this.state = DUEL_STATES.DUEL_END;
      this.result = endCheck.result;
      this.addLog(`Дуель завершена! Результат: ${this.getResultText()}`);
    } else if (this.playerDeck.length === 0 || this.enemyDeck.length === 0) {
      // No more cards - determine winner by HP
      this.state = DUEL_STATES.DUEL_END;
      if (this.playerHP > this.enemyHP) {
        this.result = 'victory';
      } else if (this.enemyHP > this.playerHP) {
        this.result = 'defeat';
      } else {
        this.result = 'draw';
      }
      this.addLog(`Дуель завершена! Результат: ${this.getResultText()}`);
    } else {
      this.state = DUEL_STATES.ROUND_END;
    }

    return { 
      success: true, 
      roundResult,
      duelEnded: this.state === DUEL_STATES.DUEL_END
    };
  }

  // Start next round
  nextRound() {
    if (this.state !== DUEL_STATES.ROUND_END) {
      return { success: false, error: 'Раунд ще не завершено' };
    }

    this.round++;
    this.state = DUEL_STATES.PLAYER_TURN;
    
    return { success: true };
  }

  // Add message to log
  addLog(message) {
    this.log.push({
      round: this.round,
      message,
      timestamp: Date.now()
    });
  }

  // Get result text
  getResultText() {
    switch (this.result) {
      case 'victory': return 'Перемога';
      case 'defeat': return 'Поразка';
      case 'draw': return 'Нічия';
      default: return 'Невідомо';
    }
  }

  // Get current state snapshot
  getState() {
    return {
      state: this.state,
      round: this.round,
      playerHP: this.playerHP,
      playerMaxHP: this.playerMaxHP,
      enemyHP: this.enemyHP,
      enemyMaxHP: this.enemyMaxHP,
      playerDeckSize: this.playerDeck.length,
      enemyDeckSize: this.enemyDeck.length,
      currentPlayerCard: this.currentPlayerCard,
      currentEnemyCard: this.currentEnemyCard,
      result: this.result,
      log: [...this.log]
    };
  }

  // Auto-play one turn (for AI or quick play)
  autoPlay() {
    if (this.state === DUEL_STATES.PLAYER_TURN) {
      const randomIndex = Math.floor(Math.random() * this.playerDeck.length);
      this.selectPlayerCard(randomIndex);
    }
    
    if (this.state === DUEL_STATES.ENEMY_TURN) {
      this.selectEnemyCard();
    }
    
    if (this.state === DUEL_STATES.RESOLVING) {
      return this.resolveCurrentRound();
    }
    
    return { success: false };
  }
}

export default Duel;
