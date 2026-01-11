// App shell - top-level UI structure
import dom from '../../core/dom.js';
import { router } from '../../core/router.js';
import { store } from '../../core/store.js';

export const initAppShell = () => {
  const header = document.getElementById('app-header');
  if (!header) return;

  // Update navigation
  updateNavigation();

  // Subscribe to route changes
  router.afterEach(() => {
    updateNavigation();
  });

  // Subscribe to store changes
  store.subscribe(() => {
    updateUserInfo();
  });

  updateUserInfo();
};

// Update navigation based on current route
const updateNavigation = () => {
  // Navigation moved to screens, skip if no main-nav element
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const currentRoute = router.getCurrentPath();
  
  const navItems = [
    { path: '/lobby', label: 'Головна', icon: '🏠' },
    { path: '/deck', label: 'Колода', icon: '🃏' },
    { path: '/duel', label: 'Дуель', icon: '⚔️' }
  ];

  dom.clear(nav);

  navItems.forEach(item => {
    const isActive = currentRoute === item.path || currentRoute === item.path.slice(1);
    
    const link = dom.create('a', {
      className: `nav-item ${isActive ? 'active' : ''}`,
      href: `#${item.path}`,
      style: {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        background: isActive ? 'var(--color-primary)' : 'transparent',
        color: isActive ? 'white' : 'var(--color-text-secondary)',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
      },
      onClick: (e) => {
        e.preventDefault();
        router.navigate(item.path);
      }
    }, [
      item.icon + ' ' + item.label
    ]);
    
    nav.appendChild(link);
  });
};

// Update user info in header
const updateUserInfo = () => {
  // Get user from store
  const user = store.get('user');
  if (!user) return;

  // Update level
  const levelEl = document.getElementById('user-level');
  if (levelEl) {
    levelEl.textContent = user.level || 1;
  }

  // Update gems (wins for now)
  const gemsEl = document.getElementById('user-gems');
  if (gemsEl) {
    gemsEl.textContent = user.wins * 100 || 0;
  }

  // Update coins (based on games played)
  const coinsEl = document.getElementById('user-coins');
  if (coinsEl) {
    coinsEl.textContent = user.gamesPlayed * 10 || 0;
  }

  // Update XP bar
  const xpBar = document.getElementById('xp-bar');
  if (xpBar) {
    const xpPercent = user.xp ? (user.xp % 100) : 0;
    xpBar.style.width = `${xpPercent}%`;
  }
};

// Show loading overlay
export const showLoading = () => {
  const overlay = dom.create('div', {
    id: 'loading-overlay',
    style: {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      color: 'white',
      fontSize: '1.5rem'
    }
  }, ['⏳ Завантаження...']);

  document.body.appendChild(overlay);
};

// Hide loading overlay
export const hideLoading = () => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.remove();
};

export default {
  initAppShell,
  updateNavigation,
  updateUserInfo,
  showLoading,
  hideLoading
};
