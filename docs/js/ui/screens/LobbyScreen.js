// Lobby Screen
import dom from '../../core/dom.js';
import { router } from '../../core/router.js';
import { store } from '../../core/store.js';
import { createButton } from '../components/Button.js';
import { userStorage } from '../../core/storage.js';

export const LobbyScreen = () => {
  const screen = dom.create('div', { className: 'screen lobby-screen' });

  // Load user profile
  const profile = userStorage.getProfile();
  store.setState({ user: profile });

  // Tiles section
  const tiles = dom.create('section', { className: 'tiles', 'aria-label': 'Режими' });

  const tileData = [
    { action: 'duels', icon: '⚔️', label: 'Дуелі', sub: `Спроби: ${profile.gamesPlayed || 0}`, route: '/duel' },
    { action: 'collection', icon: '🃏', label: 'Колекція карт', sub: 'Усі карти', route: '/deck' },
    { action: 'tournament', icon: '🏆', label: 'Турнір', sub: 'Сезон', route: '/duel' },
    { action: 'arena', icon: '🎯', label: 'Арена', sub: 'Бій', route: '/duel' },
    { action: 'deck', icon: '📋', label: 'Бойова колода', sub: `Перемог: ${profile.wins}`, route: '/deck' },
    { action: 'stats', icon: '📊', label: 'Статистика', sub: `Ігор: ${profile.gamesPlayed}`, route: '/result' }
  ];

  tileData.forEach(tile => {
    const tileEl = dom.create('div', { 
      className: 'tile', 
      'data-action': tile.action,
      onClick: () => {
        if (tile.route) {
          router.navigate(tile.route);
        }
      }
    });

    // Rivets
    const rivets = dom.create('div', { className: 'rivets' }, [
      dom.create('span', { className: 'rivet r1' }),
      dom.create('span', { className: 'rivet r2' }),
      dom.create('span', { className: 'rivet r3' }),
      dom.create('span', { className: 'rivet r4' })
    ]);
    tileEl.appendChild(rivets);

    // Icon
    const icon = dom.create('div', { className: 'icon', 'aria-hidden': 'true' }, [tile.icon]);
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.fontSize = '20px';
    tileEl.appendChild(icon);

    // Label
    tileEl.appendChild(dom.create('div', { className: 'label' }, [tile.label]));
    
    // Sub
    tileEl.appendChild(dom.create('div', { className: 'sub' }, [tile.sub]));

    tiles.appendChild(tileEl);
  });

  screen.appendChild(tiles);

  // Accordion list
  const list = dom.create('section', { className: 'list', 'aria-label': 'Меню' });

  const listData = [
    { text: 'Завдання', content: 'Щоденні та сезонні місії. Нагороди: досвід, золото, карти.' },
    { text: 'Нагороди', content: 'Бонуси за серії перемог, досягнення та події.' },
    { text: 'Колекції', content: 'Повні набори карт дають пасивні модифікатори та ресурси.' },
    { text: 'Магазин', content: 'Пакунки карт, кристали, золото та інші предмети.' },
    { text: 'Налаштування', content: 'Звук, музика, мова та інші параметри гри.' }
  ];

  listData.forEach((item, index) => {
    const itemEl = dom.create('div', { 
      className: 'item', 
      'aria-expanded': index === 0 ? 'true' : 'false' 
    });

    const button = dom.create('button', { type: 'button' }, [
      dom.create('span', { className: 'bullet', 'aria-hidden': 'true' }),
      dom.create('span', { className: 'text' }, [item.text]),
      dom.create('span', { className: 'chev', 'aria-hidden': 'true' })
    ]);

    button.addEventListener('click', () => {
      const expanded = itemEl.getAttribute('aria-expanded') === 'true';
      // Close all
      list.querySelectorAll('.item').forEach(i => i.setAttribute('aria-expanded', 'false'));
      // Toggle current
      itemEl.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });

    const panel = dom.create('div', { className: 'panel-inner' }, [item.content]);

    itemEl.appendChild(button);
    itemEl.appendChild(panel);
    list.appendChild(itemEl);
  });

  screen.appendChild(list);

  // Promo
  const promo = dom.create('section', { className: 'promo', 'aria-label': 'Акція' }, [
    dom.create('div', { className: 'badge' }, ['Акція']),
    dom.create('div', { className: 'line' }, ['Почніть свою пригоду зараз!']),
    dom.create('div', { className: 'sub' }, ['Зберіть колоду та почніть дуелі'])
  ]);

  screen.appendChild(promo);

  return screen;
};

export default LobbyScreen;
