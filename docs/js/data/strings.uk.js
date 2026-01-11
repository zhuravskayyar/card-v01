// Ukrainian localization strings
export const strings = {
  // General
  app: {
    title: 'Elem Clone',
    loading: 'Завантаження...',
    error: 'Помилка'
  },

  // Navigation
  nav: {
    lobby: 'Головна',
    deck: 'Колода',
    duel: 'Дуель',
    collection: 'Колекція',
    settings: 'Налаштування'
  },

  // Lobby Screen
  lobby: {
    title: 'Вітаємо у грі!',
    subtitle: 'Зберіть свою колоду та вирушайте у бій',
    startDuel: 'Почати дуель',
    manageDeck: 'Керувати колодою',
    viewCollection: 'Переглянути колекцію',
    stats: {
      wins: 'Перемог',
      losses: 'Поразок',
      winRate: 'Відсоток перемог'
    }
  },

  // Deck Screen
  deck: {
    title: 'Колода',
    selectCards: 'Виберіть 9 карт для бою',
    cardsSelected: 'Вибрано карт',
    autoFill: 'Автозаповнення',
    clear: 'Очистити',
    startBattle: 'Почати бій',
    emptySlot: 'Порожній слот',
    needMoreCards: 'Потрібно вибрати 9 карт'
  },

  // Duel Screen
  duel: {
    title: 'Дуель',
    round: 'Раунд',
    player: 'Гравець',
    enemy: 'Противник',
    selectCard: 'Виберіть карту для атаки',
    autoPlay: 'Авто-гра',
    surrender: 'Здатися',
    hp: 'ХП',
    attack: 'Атака',
    defense: 'Захист'
  },

  // Result Screen
  result: {
    victory: 'Перемога!',
    defeat: 'Поразка',
    draw: 'Нічия',
    stats: {
      rounds: 'Раундів',
      damage: 'Нанесено урону',
      cardsUsed: 'Використано карт'
    },
    playAgain: 'Грати знову',
    returnToLobby: 'До головної'
  },

  // Elements
  elements: {
    fire: 'Вогонь',
    water: 'Вода',
    earth: 'Земля',
    air: 'Повітря',
    lightning: 'Блискавка',
    ice: 'Лід'
  },

  // Messages
  messages: {
    cardSelected: 'Карта вибрана',
    deckFull: 'Колода заповнена',
    deckSaved: 'Колоду збережено',
    duelStarted: 'Дуель розпочалася',
    duelEnded: 'Дуель завершена',
    error: 'Сталася помилка',
    effectiveAttack: 'Ефективна атака!',
    weakAttack: 'Слабка атака',
    normalAttack: 'Звичайна атака'
  },

  // Buttons
  buttons: {
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
    close: 'Закрити',
    save: 'Зберегти',
    back: 'Назад',
    next: 'Далі',
    play: 'Грати',
    pause: 'Пауза'
  }
};

// Get string by path (e.g., 'lobby.title')
export const getString = (path, defaultValue = '') => {
  const keys = path.split('.');
  let value = strings;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return defaultValue;
  }
  
  return value;
};

export default strings;
