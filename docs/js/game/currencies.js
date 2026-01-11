/**
 * Currency System
 * Валютна система гри
 * 
 * Валюти:
 * 🔩 Болти (bolts) - базова валюта
 * ⚙️ Шестерні (gears) - середня валюта
 * ✴︎ Парові ядра (cores) - преміум валюта
 */

window.CurrencySystem = {
  // Типи валют
  TYPES: {
    BOLTS: 'bolts',    // 🔩
    GEARS: 'gears',    // ⚙️
    CORES: 'cores'     // ✴︎
  },

  // Емодзі валют
  EMOJIS: {
    bolts: '🔩',
    gears: '⚙️',
    cores: '✴︎'
  },

  // Назви валют
  NAMES: {
    bolts: 'Болти',
    gears: 'Шестерні',
    cores: 'Парові ядра'
  },

  // Стартові значення
  STARTING_AMOUNTS: {
    bolts: 500,   // 🔩
    gears: 0,   // ⚙️
    cores: 0    // ✴︎
  },

  /**
   * Отримати інформацію про валюту
   */
  getCurrency(type) {
    return {
      type: type,
      emoji: this.EMOJIS[type],
      name: this.NAMES[type],
      starting: this.STARTING_AMOUNTS[type]
    };
  },

  /**
   * Отримати всі валюти
   */
  getAllCurrencies() {
    return Object.values(this.TYPES).map(type => this.getCurrency(type));
  },

  /**
   * Отримати дані для топбара
   */
  getTopbarData(profile) {
    const data = {};
    this.getAllCurrencies().forEach(currency => {
      data[currency.type] = {
        emoji: currency.emoji,
        value: profile[currency.type] || 0
      };
    });
    return data;
  },

  /**
   * Перевірити, чи вистачає валюти
   */
  canAfford(profile, currency, amount) {
    if (!profile[currency]) return false;
    return profile[currency] >= amount;
  },

  /**
   * Списати валюту
   */
  deduct(profile, currency, amount) {
    if (!this.canAfford(profile, currency, amount)) {
      return false;
    }
    profile[currency] -= amount;
    return true;
  },

  /**
   * Додати валюту
   */
  add(profile, currency, amount) {
    profile[currency] = (profile[currency] || 0) + amount;
    return true;
  },

  /**
   * Отримати ціну товару як текст
   */
  getPriceText(product) {
    const currency = window.CurrencySystem.getCurrency(product.price.currency);
    return `${currency.emoji} ${product.price.amount}`;
  },

  /**
   * Отримати назву валюти в родовому відмінку
   */
  getCurrencyNameGenitive(type) {
    const genetiveNames = {
      bolts: 'болтів',
      gears: 'шестерень',
      cores: 'парових ядер'
    };
    return genetiveNames[type] || type;
  }
};

// Експорт для глобального використання
window.Currencies = window.CurrencySystem;
