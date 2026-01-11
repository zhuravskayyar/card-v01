// LocalStorage utility
export const storage = {
  // Get item from localStorage
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  // Set item in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },

  // Remove item from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  // Clear all localStorage
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if key exists
  has(key) {
    return localStorage.getItem(key) !== null;
  }
};

// Game-specific storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'elem_user_profile',
  COLLECTION: 'elem_collection',
  SETTINGS: 'elem_settings',
  DECK: 'elem_deck'
};

// User profile management
export const userStorage = {
  // Create new user profile with default values
  createProfile(name = 'Player') {
    const profile = {
      name: name,
      level: 1,
      xp: 0,
      gold: 10,
      gems: 1500,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      createdAt: Date.now()
    };
    this.saveProfile(profile);
    return profile;
  },

  // Check if user profile exists
  hasProfile() {
    return storage.has(STORAGE_KEYS.USER_PROFILE);
  },

  getProfile() {
    if (!this.hasProfile()) {
      return this.createProfile();
    }
    return storage.get(STORAGE_KEYS.USER_PROFILE);
  },

  saveProfile(profile) {
    return storage.set(STORAGE_KEYS.USER_PROFILE, profile);
  },

  // Add XP and handle level up
  addXP(amount) {
    const profile = this.getProfile();
    profile.xp += amount;
    
    // Level up every 100 XP
    while (profile.xp >= 100) {
      profile.xp -= 100;
      profile.level++;
    }
    
    this.saveProfile(profile);
    return profile;
  },

  // Add gold
  addGold(amount) {
    const profile = this.getProfile();
    profile.gold += amount;
    this.saveProfile(profile);
    return profile;
  },

  // Spend gold (returns true if successful)
  spendGold(amount) {
    const profile = this.getProfile();
    if (profile.gold >= amount) {
      profile.gold -= amount;
      this.saveProfile(profile);
      return true;
    }
    return false;
  },

  // Add gems
  addGems(amount) {
    const profile = this.getProfile();
    profile.gems += amount;
    this.saveProfile(profile);
    return profile;
  },

  // Spend gems (returns true if successful)
  spendGems(amount) {
    const profile = this.getProfile();
    if (profile.gems >= amount) {
      profile.gems -= amount;
      this.saveProfile(profile);
      return true;
    }
    return false;
  },

  updateStats(result) {
    const profile = this.getProfile();
    profile.gamesPlayed++;
    
    if (result === 'win') {
      profile.wins++;
    } else if (result === 'loss') {
      profile.losses++;
    }
    
    this.saveProfile(profile);
    return profile;
  }
};

// Collection management
export const collectionStorage = {
  getCollection() {
    return storage.get(STORAGE_KEYS.COLLECTION, []);
  },

  saveCollection(collection) {
    return storage.set(STORAGE_KEYS.COLLECTION, collection);
  },

  addCard(cardId) {
    const collection = this.getCollection();
    if (!collection.includes(cardId)) {
      collection.push(cardId);
      this.saveCollection(collection);
    }
    return collection;
  }
};

// Deck management
export const deckStorage = {
  getDeck() {
    return storage.get(STORAGE_KEYS.DECK, []);
  },

  saveDeck(deck) {
    return storage.set(STORAGE_KEYS.DECK, deck);
  }
};

// Settings management
export const settingsStorage = {
  getSettings() {
    return storage.get(STORAGE_KEYS.SETTINGS, {
      soundEnabled: true,
      musicEnabled: true,
      language: 'uk'
    });
  },

  saveSettings(settings) {
    return storage.set(STORAGE_KEYS.SETTINGS, settings);
  }
};

export default storage;
