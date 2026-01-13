// === PATCH: діагностика унікальності uid ===
function assertUniqueUIDs(arr, label="list") {
  const seen = new Set();
  const dup = [];
  for (const c of arr || []) {
    if (!c?.uid) continue;
    if (seen.has(c.uid)) dup.push(c.uid);
    seen.add(c.uid);
  }
  if (dup.length) {
    console.error(`❌ Duplicate uids in ${label}:`, dup);
  } else {
    console.log(`✅ All uids unique in ${label}`);
  }
}
// === PATCH: міграція старих колод до uid-моделі ===
function migrateDeckToInstances(profile) {
  if (!profile) return profile;
  // 1) deckCards
  if (Array.isArray(profile.deckCards)) {
    profile.deckCards = profile.deckCards.map((c) => {
      if (c && c.uid && c.cardId) return c;
      const cardId = c.cardId || c.id;
      const inst = createCardInstance(cardId, {
        level: c.level ?? 1,
        xp: c.xp ?? 0,
        power: c.power ?? (window.getCardById ? (window.getCardById(cardId)?.basePower ?? 0) : 0)
      });
      return inst;
    });
  }
  // 2) collectionCards
  if (Array.isArray(profile.collectionCards)) {
    profile.collectionCards = profile.collectionCards.map((c) => {
      if (c && c.uid && c.cardId) return c;
      const cardId = c.cardId || c.id;
      return createCardInstance(cardId, {
        level: c.level ?? 1,
        xp: c.xp ?? 0,
        power: c.power ?? (window.getCardById ? (window.getCardById(cardId)?.basePower ?? 0) : 0)
      });
    });
  }
  // 3) унікальність uid
  const seen = new Set();
  const fixUIDs = (arr) => arr.map((c) => {
    if (!c.uid || seen.has(c.uid)) c.uid = genUID("card");
    seen.add(c.uid);
    return c;
  });
  if (Array.isArray(profile.deckCards)) profile.deckCards = fixUIDs(profile.deckCards);
  if (Array.isArray(profile.collectionCards)) profile.collectionCards = fixUIDs(profile.collectionCards);
  return profile;
}
// === PATCH: генератор uid та createCardInstance ===
function genUID(prefix = "c") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function createCardInstance(cardId, overrides = {}) {
  const cardData = window.getCardById ? window.getCardById(cardId) : null;
  const basePower = cardData?.basePower ?? 0;
  return {
    uid: genUID("card"),
    cardId,
    level: 1,
    xp: 0,
    power: basePower,
    ...overrides
  };
}
// Main entry point - Bootstrap application
import { router } from './core/router.js';
import { store } from './core/store.js';
import dom from './core/dom.js';
import { initAppShell } from './ui/appShell.js';
import { userStorage, collectionStorage, deckStorage } from './core/storage.js';
import { getCardById, getRandomStarterCardIds } from './data/cards.js';

// Import screens
import LobbyScreen from './ui/screens/LobbyScreen.js';
import DeckScreen from './ui/screens/DeckScreen.js';
import DuelScreen from './ui/screens/DuelScreen.js';

import ResultScreen from './ui/screens/ResultScreen.js';
import CardDetailsScreen from './ui/screens/CardDetailsScreen.js';

// Initialize application
const init = async () => {
  console.log('🎮 Initializing Elem Clone...');

  // Initialize first-time data
  initializeFirstTime();

  // Load user data
  loadUserData();

  // Initialize app shell
  initAppShell();

  // Register routes
  registerRoutes();

  // Start router
  router.handleRoute();

  console.log('✅ Elem Clone initialized successfully!');
};

// Initialize first-time user data
const initializeFirstTime = () => {
  // Check if user profile exists
  if (!userStorage.getProfile().createdAt) {
    console.log('🆕 First time user - initializing data...');
    
    // Create default profile
    userStorage.saveProfile({
      name: 'Player',
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      level: 1,
      xp: 0,
      coins: 0,
      createdAt: Date.now()
    });

    // Дати стартовий рандомний набір (9 карт) новому акаунту
    const starterCardIds = getRandomStarterCardIds(9);
    collectionStorage.saveCollection(starterCardIds);
    deckStorage.saveDeck(starterCardIds);

    console.log('✅ User data initialized');
  }
};

// Load user data into store
const loadUserData = () => {
  let profile = userStorage.getProfile();
  profile = migrateDeckToInstances(profile);
  userStorage.saveProfile(profile);
  // Для backward compatibility: колекція та колода як масив id (старий формат)
  let collection = collectionStorage.getCollection();
  if (collection.length && typeof collection[0] === 'string') {
    collection = collection.map(id => createCardInstance(id));
    collectionStorage.saveCollection(collection);
  }
  let deck = deckStorage.getDeck();
  if (deck.length && typeof deck[0] === 'string') {
    deck = deck.map(id => createCardInstance(id));
    deckStorage.saveDeck(deck);
  }
  store.setState({
    user: profile,
    collection,
    deck
  });
  // Діагностика унікальності uid
  assertUniqueUIDs(deck, "store.deck");
  assertUniqueUIDs(collection, "store.collection");
};

// Register all routes
const registerRoutes = () => {
  const root = document.getElementById('root');

  // Lobby route
  router.register('/lobby', () => {
    const screen = LobbyScreen();
    dom.mount(root, screen);
  });

  // Deck route
  router.register('/deck', () => {
    const screen = DeckScreen();
    dom.mount(root, screen);
  });

  // Duel route
  router.register('/duel', () => {
    const screen = DuelScreen();
    dom.mount(root, screen);
  });

  // Result route
  router.register('/result', () => {
    const screen = ResultScreen();
    dom.mount(root, screen);
  });

  // Card details route
  router.register('/card/:id', (params) => {
    const screen = CardDetailsScreen(params.id);
    dom.mount(root, screen);
  });

  // Default route (/) redirects to lobby
  router.register('/', () => {
    router.navigate('/lobby');
  });

  // Catch-all route (404)
  router.register('*', () => {
    const notFound = dom.create('div', {
      className: 'screen screen-centered',
      style: { textAlign: 'center' }
    }, [
      dom.create('h1', {}, ['404 - Сторінку не знайдено']),
      dom.create('p', { style: { marginTop: '1rem' } }, [
        'Схоже, ця сторінка не існує.'
      ]),
      dom.create('button', {
        className: 'btn btn-primary',
        style: { marginTop: '2rem' },
        onClick: () => router.navigate('/lobby')
      }, ['← Повернутися на головну'])
    ]);
    dom.mount(root, notFound);
  });
};

// Error handler
window.addEventListener('error', (event) => {
  console.error('❌ Application error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
if (typeof window !== 'undefined') {
  window.__ELEM_CLONE__ = {
    store,
    router,
    version: '1.0.0'
  };
}
