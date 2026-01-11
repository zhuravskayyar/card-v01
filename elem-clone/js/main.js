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
  const profile = userStorage.getProfile();
  const collection = collectionStorage.getCollection();
  const deckIds = deckStorage.getDeck();
  const deck = deckIds.map(id => getCardById(id)).filter(Boolean);

  store.setState({
    user: profile,
    collection,
    deck
  });
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
