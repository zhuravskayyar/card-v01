// Simple State Management Store
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Map();
    this.listenerId = 0;
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Get specific state value
  get(key) {
    return this.state[key];
  }

  // Set state
  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.notify(prevState, this.state);
  }

  // Update nested state
  updateState(key, value) {
    this.setState({ [key]: value });
  }

  // Subscribe to state changes
  subscribe(callback) {
    const id = this.listenerId++;
    this.listeners.set(id, callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(id);
    };
  }

  // Subscribe to specific key changes
  subscribeToKey(key, callback) {
    return this.subscribe((prevState, newState) => {
      if (prevState[key] !== newState[key]) {
        callback(newState[key], prevState[key]);
      }
    });
  }

  // Notify all listeners
  notify(prevState, newState) {
    this.listeners.forEach(callback => {
      callback(prevState, newState);
    });
  }

  // Reset state
  reset(newState = {}) {
    const prevState = { ...this.state };
    this.state = newState;
    this.notify(prevState, this.state);
  }
}

// Create global store instance
export const store = new Store({
  // Navigation
  currentRoute: 'lobby',
  
  // User
  user: {
    name: 'Player',
    wins: 0,
    losses: 0,
    collection: []
  },
  
  // Deck
  deck: [],
  
  // Duel
  duel: {
    active: false,
    round: 0,
    playerHP: 100,
    enemyHP: 100,
    playerDeck: [],
    enemyDeck: [],
    log: []
  }
});

export default store;
