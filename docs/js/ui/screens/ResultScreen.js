// Result Screen
import dom from '../../core/dom.js';
import { router } from '../../core/router.js';
import { store } from '../../core/store.js';
import { createButton } from '../components/Button.js';
import { userStorage } from '../../core/storage.js';

export const ResultScreen = () => {
  const screen = dom.create('div', { className: 'screen result-screen' });

  // Get duel result from store
  const duel = store.get('duel');
  const result = duel?.result || 'draw';

  // Update user profile
  if (result === 'victory' || result === 'defeat') {
    userStorage.updateStats(result === 'victory' ? 'win' : 'loss');
    const profile = userStorage.getProfile();
    store.setState({ user: profile });
  }

  // Result icon
  const icons = {
    victory: '🏆',
    defeat: '💔',
    draw: '🤝'
  };

  const icon = dom.create('div', { className: 'result-icon' }, [
    icons[result] || '❓'
  ]);
  screen.appendChild(icon);

  // Result title
  const titles = {
    victory: 'Перемога!',
    defeat: 'Поразка',
    draw: 'Нічия'
  };

  const title = dom.create('h1', {
    className: `result-title ${result}`
  }, [titles[result] || 'Результат']);
  screen.appendChild(title);

  // Result stats
  const stats = dom.create('div', { className: 'result-stats' });

  const statCards = [
    { label: 'Раундів зіграно', value: duel?.round || 0, icon: '🔄' },
    { label: 'Ваше ХП', value: duel?.playerHP || 0, icon: '❤️' },
    { label: 'ХП противника', value: duel?.enemyHP || 0, icon: '💔' },
    { label: 'Карт використано', value: (9 - (duel?.playerDeckSize || 0)), icon: '🃏' }
  ];

  statCards.forEach(({ label, value, icon }) => {
    const card = dom.create('div', { className: 'stat-card' }, [
      dom.create('div', { className: 'stat-value' }, [`${icon} ${value}`]),
      dom.create('div', { className: 'stat-label' }, [label])
    ]);
    stats.appendChild(card);
  });

  screen.appendChild(stats);

  // Actions
  const actions = dom.create('div', { className: 'result-actions' });

  const playAgainBtn = createButton({
    text: '🔄 Грати знову',
    variant: 'primary',
    size: 'lg',
    onClick: () => {
      router.navigate('/duel');
    }
  });
  actions.appendChild(playAgainBtn);

  const lobbyBtn = createButton({
    text: '🏠 До головної',
    variant: 'secondary',
    size: 'lg',
    onClick: () => {
      router.navigate('/lobby');
    }
  });
  actions.appendChild(lobbyBtn);

  screen.appendChild(actions);

  // Show result message
  const messages = {
    victory: 'Чудова робота! Ви перемогли у дуелі! 🎉',
    defeat: 'Не засмучуйтесь! Спробуйте ще раз! 💪',
    draw: 'Рівні сили! Це була хороша битва! 🤝'
  };

  const message = dom.create('p', {
    style: {
      marginTop: '2rem',
      fontSize: '1.1rem',
      color: 'var(--color-text-secondary)',
      textAlign: 'center'
    }
  }, [messages[result] || 'Гра завершена']);
  screen.appendChild(message);

  return screen;
};

export default ResultScreen;
