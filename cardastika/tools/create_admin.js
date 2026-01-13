// Usage:
// 1) Open browser console on your local site (or GitHub Pages site).
// 2) Paste the contents of this file and press Enter.
// Alternatively run with `node create_admin.js` (will modify a JSON file if you adapt it).

(function createAdmin() {
  try {
    const username = 'delt5977';
    const USERS_KEY = 'elem_users';
    const STORAGE_KEY = 'elem_user_profile';

    const now = Date.now();

    const adminProfile = {
      name: username,
      level: 1,
      xp: 0,
      bolts: 9999,
      gears: 9999,
      cores: 9999,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      createdAt: now,
      deckCards: [],
      collectionCards: [],
      progress: {},
      inventory: {}
    };

    // Read existing users map
    let users = {};
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    } catch (e) {
      console.warn('Failed to parse existing users, overwriting.');
      users = {};
    }

    users[username] = adminProfile;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    // Set as current logged-in profile as well
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProfile));

    console.log('Admin profile created/updated:', adminProfile);
    alert('Admin created: ' + username + ' (bolts/gears/cores = 9999)');
  } catch (err) {
    console.error('createAdmin failed', err);
    alert('createAdmin failed: ' + err.message);
  }
})();
