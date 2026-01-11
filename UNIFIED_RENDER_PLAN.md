# ПЛАН УНІФІКАЦІЇ РЕНДЕРУ КАРТ

## Поточні проблеми

### 1. **CSS Конфлікт** (КРИТИЧНО)
- `steampunk-cards.css` визначає `.sp-card { width: 240px; height: 340px; }`
- `index.html` line 2323 **перевизначає**: `.deck-grid .sp-card { width: 200px; height: 280px; }` ← **ЛАМАЄ ДИЗАЙН**
- Також `.deck-grid .corner-gear { width: 42px; height: 42px; }` замість 70px

### 2. **Fallback рендеринг** (КРИТИЧНО)  
- `renderDeckCard()` має fallback (lines 4487-4527) зі старою структурою:
  - Не генерує 8 `<div class="rivet">` 
  - Не генерує `.decor-line`
  - Генерує `<div class="card-name-plate">` (якої немає в CSS нового дизайну)
  - Генерує старий SVG без `.element-icon`
- **Результат**: Якщо CardRenderer не завантажився, карта виглядає криво

### 3. **CardRenderer не везде используется**
- CardRenderer використовується тільки в `renderDeckCard()`
- Інші місця (дуель, колекція) можуть мати свої рендери

### 4. **Паралакс не делегований**
- `initCardParallax()` вешає listener на кожну карту окремо
- Коли карти додаються динамічно, паралакс не працює на них

## Рішення

### ✅ Крок 1: Видалити CSS конфлікт в `.deck-grid`

```diff
.deck-grid .sp-card {
-  width: 200px;
-  height: 280px;
+  /* Використовуємо розмери з steampunk-cards.css: 240x340 */
}

.deck-grid .corner-gear {
-  top: 10px;
-  left: 10px;
-  width: 42px;
-  height: 42px;
+  /* Використовуємо розмери з steampunk-cards.css: 70x70 */
}

.deck-grid .corner-gear::before {
-  inset: 7px;
+  /* Видалити, использует default з steampunk-cards.css */
}

.deck-grid .corner-gear svg {
-  width: 20px;
-  height: 20px;
+  /* Видалити, SVG вже має class="element-icon" з потрібним розміром */
}

.deck-grid .power-plate {
-  bottom: 16px;
-  height: 50px;
-  width: 70%;
+  /* Видалити, использует default */
}

.deck-grid .power-value {
-  font-size: 32px;
+  /* Видалити, використовує default 48px */
}
```

### ✅ Крок 2: Оновити fallback рендеринг

Замінити lines 4487-4527 на правильний шаблон:

```javascript
renderDeckCard(cardData, level = 1) {
  const profile = userProfile.getProfile();
  const inventory = this.getInventory(profile);
  const canUpgrade = this.canUpgradeCard({ id: cardData.id, level: level }, inventory);
  
  // Використовуємо CardRenderer якщо доступний
  if (window.cardRenderer) {
    let html = window.cardRenderer.render(cardData);
    // Додаємо upgrade-dot якщо можна поліпшити
    if (canUpgrade) {
      html = html.replace('class="sp-card', 'class="sp-card upgradable');
      html = html.replace('<div class="corner-gear">', '<div class="upgrade-dot">↑</div><div class="corner-gear">');
    }
    return html;
  }

  // Fallback - використовуємо ОДНАКОВИЙ шаблон, як CardRenderer
  const {
    id = 'unknown',
    name = 'Unknown',
    element = 'fire',
    basePower = 0,
    attack = 0,
    rarity = 'R1',
    rarityDisplay = ''
  } = cardData;

  const rarityBadge = rarityDisplay || this.getRarityName(rarity);
  const elementIcon = this.getElementIcon(element);
  const displayPower = attack || basePower;

  return `
    <div class="sp-card ${element} ${rarity} ${canUpgrade ? 'upgradable' : ''}" 
         data-id="${id}"
         data-element="${element}"
         data-rarity="${rarity}"
         data-power="${displayPower}"
         data-attack="${attack}"
         data-name="${name}">
      
      <!-- 8 ЗАКЛЕПОК -->
      <div class="rivet rivet-1"></div>
      <div class="rivet rivet-2"></div>
      <div class="rivet rivet-3"></div>
      <div class="rivet rivet-4"></div>
      <div class="rivet rivet-5"></div>
      <div class="rivet rivet-6"></div>
      <div class="rivet rivet-7"></div>
      <div class="rivet rivet-8"></div>
      
      <!-- ДЕКОРАТИВНІ ЛІНІЇ -->
      <div class="decor-line line-top"></div>
      <div class="decor-line line-bottom"></div>
      
      <!-- БЕЙДЖ РІДКОСТІ -->
      <div class="rarity-badge">${rarityBadge}</div>
      
      <!-- ВЕЛИКА ДЕТАЛЬНА ШЕСТЕРНЯ -->
      <div class="corner-gear">
        <div class="gear-inner">
          ${elementIcon}
        </div>
      </div>

      <!-- ПЛАШКА СИЛИ внизу -->
      <div class="power-plate">
        <div class="power-value">${displayPower}</div>
      </div>
      
      ${canUpgrade ? '<div class="upgrade-dot">↑</div>' : ''}
    </div>
  `;
}

getRarityName(rarity) {
  const names = {
    'R1': 'ЗВИЧАЙНА',
    'R2': 'НЕЗВИЧАЙНА',
    'R3': 'РІДКІСНА',
    'R4': 'ЕПІЧНА',
    'R5': 'ЛЕГЕНДАРНА',
    'R6': 'МІФІЧНА'
  };
  return names[rarity] || 'ЗВИЧАЙНА';
}

getElementIcon(element) {
  const icons = {
    fire: `<svg viewBox="0 0 64 64" fill="none" class="element-icon">
      <path d="M32 8C36 2 46 6 42 20C38 34 32 38 32 48C32 38 26 34 22 20C18 6 28 2 32 8Z" fill="currentColor" opacity="0.95"/>
      <path d="M32 16C34 12 40 14 38 22C36 30 32 32 32 38C32 32 28 30 26 22C24 14 30 12 32 16Z" fill="currentColor" opacity="0.8"/>
      <path d="M32 22C33 20 36 21 35 25C34 29 32 30 32 32C32 30 30 29 29 25C28 21 31 20 32 22Z" fill="currentColor" opacity="1"/>
      <circle cx="28" cy="12" r="2" fill="currentColor" opacity="0.7"/>
      <circle cx="36" cy="14" r="1.5" fill="currentColor" opacity="0.6"/>
      <circle cx="24" cy="16" r="1" fill="currentColor" opacity="0.5"/>
    </svg>`,
    water: `<svg viewBox="0 0 64 64" fill="none" class="element-icon">
      <path d="M32 8C26 14 22 24 22 32C22 44 26 52 32 52C38 52 42 44 42 32C42 24 38 14 32 8Z" fill="currentColor" opacity="0.9"/>
      <path d="M32 14C28 18 26 26 26 32C26 40 28 46 32 46C36 46 38 40 38 32C38 26 36 18 32 14Z" fill="currentColor" opacity="0.7"/>
      <ellipse cx="32" cy="28" rx="6" ry="8" fill="currentColor" opacity="0.5"/>
      <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.4"/>
      <circle cx="44" cy="24" r="1.5" fill="currentColor" opacity="0.3"/>
    </svg>`,
    air: `<svg viewBox="0 0 64 64" fill="none" class="element-icon">
      <path d="M16 32L32 12L48 32L40 40L32 36L24 40Z" fill="currentColor" opacity="0.9"/>
      <path d="M20 36L32 22L44 36" fill="none" stroke="currentColor" stroke-width="2" opacity="0.7"/>
      <circle cx="32" cy="24" r="3" fill="currentColor" opacity="0.6"/>
      <path d="M12 32Q20 28 32 32T52 32" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5" stroke-dasharray="3,2"/>
    </svg>`,
    earth: `<svg viewBox="0 0 64 64" fill="none" class="element-icon">
      <path d="M16 32C16 20 24 12 32 12C40 12 48 20 48 32L48 48C48 52 40 52 32 52C24 52 16 52 16 48Z" fill="currentColor" opacity="0.85"/>
      <path d="M20 36C20 28 26 24 32 24C38 24 44 28 44 36" fill="currentColor" opacity="0.6"/>
      <rect x="24" y="40" width="16" height="8" fill="currentColor" opacity="0.4" rx="2"/>
    </svg>`
  };
  return icons[element] || icons.fire;
}
```

### ✅ Крок 3: Замінити делегований паралакс

Замінити `initCardParallax()` на делегований обробник:

```javascript
function initCardParallax() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.sp-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / 50;
    const y = (e.clientY - centerY) / 50;

    card.style.transform = `translateY(-15px) scale(1.08) rotateX(${5 - y}deg) rotateY(${-2 + x}deg)`;
  });

  document.addEventListener('mouseleave', (e) => {
    const card = e.target.closest?.('.sp-card');
    if (card) {
      card.style.transform = '';
    }
  }, true);

  document.addEventListener('mouseout', (e) => {
    if (e.target.classList?.contains('sp-card')) {
      e.target.style.transform = '';
    }
  });
}
```

## Результат

✅ Карти везде мають **240x340px** з новим дизайном  
✅ CardRenderer і fallback повертають **однаковий HTML**  
✅ CSS від steampunk-cards.css не конфліктує  
✅ Паралакс працює на всіх картах, навіть динамічних  
✅ **Тип рендеру карт скрізь однаковий**
