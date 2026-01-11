/**
 * КАРТОВА БАЗА ГРИ - 40 ФРАКЦІЙ, 240 КАРТ
 * 
 * Структура карти:
 * - id: унікальний ідентифікатор (формат: "F##-R#" де ## - номер фракції, # - рідкість)
 * - element: "fire" | "water" | "air" | "earth"
 * - faction: ID фракції
 * - factionName: Назва фракції
 * - rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic"
 * - basePower: фінальна сила карти (base * multiplier)
 * - multiplier: множник рідкості (для розрахунків)
 * - upgradeMult: множник прокачки (для системи рівнів)
 * - attack: атака (дорівнює basePower)
 * - defense: захист (80% від basePower)
 * - name: ім'я карти
 */

// Маппінг елементів для фракцій
const FACTION_ELEMENTS = {
  "F01": "fire", "F02": "fire", "F03": "fire", "F04": "fire", "F05": "fire",
  "F06": "fire", "F07": "fire", "F08": "fire", "F09": "fire", "F10": "fire",
  "F11": "water", "F12": "water", "F13": "water", "F14": "water", "F15": "water",
  "F16": "water", "F17": "water", "F18": "water", "F19": "water", "F20": "water",
  "F21": "air", "F22": "air", "F23": "air", "F24": "air", "F25": "air",
  "F26": "air", "F27": "air", "F28": "air", "F29": "air", "F30": "air",
  "F31": "earth", "F32": "earth", "F33": "earth", "F34": "earth", "F35": "earth",
  "F36": "earth", "F37": "earth", "F38": "earth", "F39": "earth", "F40": "earth"
};

// Назви фракцій
const FACTION_NAMES = {
  "F01": "Орден Попелястого Сонця",
  "F02": "Легіон Палаючих Клинків",
  "F03": "Культ Вічного Полум'я",
  "F04": "Імперія Червоного Дракона",
  "F05": "Ковалі Магми",
  "F06": "Сини Вулкану",
  "F07": "Піратські Клани Жару",
  "F08": "Братство Обвуглених",
  "F09": "Вартові Кальдери",
  "F10": "Пророки Вогняної Крони",
  "F11": "Королівство Глибин",
  "F12": "Орден Припливу",
  "F13": "Морські Відьми Синіх Рифів",
  "F14": "Флот Бездонної Тиші",
  "F15": "Хранителі Крижаних Озер",
  "F16": "Народ Туманних Дельт",
  "F17": "Левіафанові Жерці",
  "F18": "Перлинний Конклав",
  "F19": "Клан Штормових Хвиль",
  "F20": "Архіви Забутих Морів",
  "F21": "Небесні Кочівники",
  "F22": "Орден Чистого Вітру",
  "F23": "Штормові Яструби",
  "F24": "Ліга Левітації",
  "F25": "Хмарні Магістри",
  "F26": "Сини Урагану",
  "F27": "Дзвонарі Атмосфери",
  "F28": "Вартові Високих Піків",
  "F29": "Астральні Мандрівці",
  "F30": "Конклав Повітряних Сфер",
  "F31": "Кам'яні Домініони",
  "F32": "Орден Коріння",
  "F33": "Залізні Друїди",
  "F34": "Клани Гірських Щитів",
  "F35": "Хранителі Монолітів",
  "F36": "Народ Печер",
  "F37": "Обсидіановий Синдикат",
  "F38": "Сторожі Давніх Лісів",
  "F39": "Архонти Тектоніки",
  "F40": "Племена Першої Скелі"
};

// Назви карт для кожної фракції
const CARD_NAMES = {
  "F01": ["Послушник Попелястого Сонця", "Світоч Попелястих Молитв", "Інквізитор Сажі", "Паладин Сонячного Попелу", "Архонт Попелястого Світанку", "Емісар Чорного Полудня"],
  "F02": ["Легіонер Палаючого Клинка", "Капрал Розжареної Сталі", "Дуелянист Вогняного Ребра", "Центуріон Полум'яних Шеренг", "Маршал Клинків-Комет", "Володар Першого Розжарення"],
  "F03": ["Фанатик Вічного Полум'я", "Жрець Жаркого Кадила", "Провидець Безкінечної Іскри", "Обрядник Непогасного Вогню", "Верховний Паламар Культу", "Серце Вічного Полум'я"],
  "F04": ["Солдат Драконової Варти", "Драконів Вершник Пороху", "Гвардієць Червоного Трону", "Прапороносець Драконового Вогню", "Регент Луски й Полум'я", "Червоний Дракон-Імператор"],
  "F05": ["Коваль Магмового Горна", "Ливарник Рідкого Каменю", "Майстер Рун Розплаву", "Коваль-Алхімік Вулканічних Сплавів", "Великий Горняк Магми", "Горнило Першої Кузні"],
  "F06": ["Рейдер Вулканічних Схилів", "Мисливець на Лавових Псів", "Шаман Гримучого Кратера", "Ватажок Синів Вулкану", "Першородний Вулканіт", "Спадкоємець Серця Кратера"],
  "F07": ["Пірат Жаркого Вітрила", "Боцман Кіптявих Канатів", "Гарпунник Вогняної Хвилі", "Капітан Палаючих Рифів", "Корсар Червоного Шторму", "Флагман «Розжарений Привид»"],
  "F08": ["Обвуглений Сторож", "Збирач Вуглин", "Тінь Сажистого Леза", "Палкий Месник Братства", "Старійшина Обвуглених Клятв", "Прах, Що Пам'ятає Імена"],
  "F09": ["Вартовий Кальдери", "Розвідник Киплячих Порожнин", "Хранитель Лавових Брам", "Командир Кальдерних Щитів", "Страж Краю Вулкану", "Кальдера, Що Дихає"],
  "F10": ["Аколіт Вогняної Крони", "Тлумач Іскорного Знаку", "Провісник Полум'яного Пророцтва", "Оракул Коронованого Жару", "Верховний Пророк Палаючої Крони", "Крона, Що Говорить Вогнем"],
  "F11": ["Дозорець Глибин", "Водолаз Королівської Варти", "Маг Тиску Безодні", "Рицар Перлинної Броні", "Регент Трону Глибин", "Король Безодні, Володар Припливів"],
  "F12": ["Послушник Ордену Припливу", "Монах Солоних Хвиль", "Настоятель Водяних Кругів", "Майстер Дев'яти Припливів", "Архімонах Великої Поверті", "Приплив, Що Не Має Берега"],
  "F13": ["Відьомська Учениця Рифів", "Травниця Солоних Чар", "Чарівниця Синього Рифу", "Матрона Рифових Заклять", "Володарка Рифової Ночі", "Сирена «Синя Безвихідь»"],
  "F14": ["Матрос Бездонної Тиші", "Штурман Мовчазних Вод", "Капітан Беззвучного Корабля", "Адмірал Тихих Морів", "Флагман «Глибока Пауза»", "Тиша, Що Тягне На Дно"],
  "F15": ["Сторож Крижаного Озера", "Лижник Північних Заток", "Заклинач Льодяних Дзеркал", "Крижаний Чемпіон Озер", "Старший Хранитель Північної Кромки", "Озеро, Що Пам'ятає Зиму"],
  "F16": ["Провідник Туманної Дельти", "Мисливець Мокрих Стежок", "Ткач Туману й Лози", "Вартовий Дельтових Болот", "Старійшина Семи Рук Дельти", "Туман, Що Ходить Людьми"],
  "F17": ["Служка Левіафана", "Жрець Соляних Псалмів", "Наглядач Китового Храму", "Проповідник Підводної Величі", "Верховний Жрець Левіафана", "Левіафан «Солона Воля»"],
  "F18": ["Збирач Перлин Конклаву", "Дипломат Перлинних Знакiв", "Арбітр Коралових Угод", "Маг Перлинної Логіки", "Голова Перлинного Конклаву", "Перлина, Що Судить Шторми"],
  "F19": ["Воїн Штормової Хвилі", "Бігун Прибою", "Списоносець Грому над Водою", "Провідник Штормового Нальоту", "Ватажок Клану Глибокого Грому", "Хвиля «Грім-Розлом»"],
  "F20": ["Писар Забутих Морів", "Картограф Солоних Таємниць", "Хранитель Ракушкових Хронік", "Архіваріус Підводних Літописів", "Куратор Бездонної Бібліотеки", "Книга, Що Пише Приплив"],
  "F21": ["Скаут Небесних Кочівників", "Погонич Вітряних Звірів", "Лучник Хмарних Степів", "Вождь Повітряного Каравану", "Старший Шаман Небесних Доріг", "Караван, Що Йде По Небу"],
  "F22": ["Послушник Чистого Вітру", "Монах Легкого Подиху", "Стихійник Прозорих Поривів", "Настоятель Вітряного Кола", "Архімаг Чистого Вітру", "Подих, Що Очищує Світ"],
  "F23": ["Яструбиний Розвідник", "Пікінер Грозових Крил", "Снайпер Штормового Неба", "Командир Яструбиних Ланок", "Володар Грозових Течій", "Яструб «Грімоклюв»"],
  "F24": ["Технік Левітаційних Рун", "Інженер Підйомних Сфер", "Арканіст Гравітаційних Зсувів", "Майстер Левітаційних Портів", "Голова Ліги Левітації", "Нульова Вага, Печатка Ліги"],
  "F25": ["Учень Хмарних Магістрів", "Скульптор Туману", "Магістр Хмарних Форм", "Архітектор Небесних Веж", "Великий Магістр Висоти", "Палац Із Хмар, Що Не Тануть"],
  "F26": ["Рейдер Ураганного Клану", "Борець Вихорів", "Шаман Спіральних Бур", "Ватажок Синів Урагану", "Першородний Вихорник", "Ураган, Що Має Ім'я"],
  "F27": ["Дзвонар Небесної Вежі", "Ритміст Повітряних Хорів", "Тональник Барометрів", "Майстер Дзвонів Грозової Межі", "Верховний Дзвонар Атмосфери", "Дзвін, Що Керує Небом"],
  "F28": ["Сторож Високого Піку", "Провідник Круч", "Стрілець Пікових Вітрів", "Командир Пікових Застав", "Голова Варти Небесного Хребта", "Пік, Що Дивиться На Час"],
  "F29": ["Мандрівець Астральних Стежок", "Навігатор Сузір'їв", "Пілігрим Нульового Неба", "Капітан Астрального Вітрила", "Архімандрівець Порожньої Орбіти", "Сузір'я, Що Веде Домів"],
  "F30": ["Учень Сфер Конклаву", "Оператор Аеросфери", "Маг Сферичних Течій", "Архонт Повітряних Сфер", "Голова Конклаву Високого Тиску", "Сфера, Що Тримає Бурю"],
  "F31": ["Дружинник Кам'яних Домініонів", "Тесля Монолітних Брам", "Геомант Домініонів", "Командир Базальтових Легій", "Князь Кам'яного Закону", "Домініон, Що Не Падає"],
  "F32": ["Послушник Ордену Коріння", "Садівник Священних Ліан", "Друїд Глибоких Коренів", "Настоятель Живого Гаю", "Архідруїд Коріння", "Корінь, Що П'є Світло"],
  "F33": ["Залізний Послушник", "Ковалодруїд Рун Металу", "Хранитель Сталевих Гаїв", "Архітектор Залізної Флори", "Верховний Друїд Феруму", "Дерево зі Сталі, Живий Колос"],
  "F34": ["Щитоносець Гірського Клану", "Сокирник Кам'яної Брови", "Клятвеник Гірських Брам", "Тан Чорного Граніту", "Верховний Вождь Щитів", "Щит «Гора-Серце»"],
  "F35": ["Вартовий Моноліту", "Рунник Кам'яних Плит", "Оракул Монолітних Знаків", "Командир Монолітної Варти", "Старший Хранитель Семи Монолітів", "Моноліт, Що Відчиняє Ніч"],
  "F36": ["Слідопит Печерного Ходу", "Шахтар Світляних Жил", "Печерний Мисливець Тіней", "Вождь Підземних Залів", "Король Кам'яної Нори", "Печера, Що Ковтає Ліхтарі"],
  "F37": ["Агент Обсидіанового Синдикату", "Контрактор Чорного Склу", "Нотаріус Гострих Угод", "Куратор Обсидіанових Каналів", "Директор Синдикату Тінь-Руд", "Обсидіанова Печатка Боргу"],
  "F38": ["Сторож Давнього Лісу", "Стрілець Зелених Тіней", "Шептун Старих Дерев", "Вартовий Священного Гаю", "Архісторож Давніх Лісів", "Дерево-Предок «Першолист»"],
  "F39": ["Служитель Тектоніки", "Інженер Розломів", "Геостратег Плит", "Архонт Підземних Зсувів", "Верховний Архонт Тектоніки", "Плита, Що Рухається Сама"],
  "F40": ["Мисливець Першої Скелі", "Каменеход Племен", "Шаман Пилових Пісень", "Вождь Першої Скелі", "Праматір Кам'яних Племен", "Перша Скеля, Живий Обіт"]
};

// Множники рідкості
const RARITY_MULTIPLIERS = {
  "R1": { value: 1.00, name: "common", displayName: "Звичайна" },
  "R2": { value: 1.10, name: "uncommon", displayName: "Незвичайна" },
  "R3": { value: 1.25, name: "rare", displayName: "Рідкісна" },
  "R4": { value: 1.45, name: "epic", displayName: "Епічна" },
  "R5": { value: 1.70, name: "legendary", displayName: "Легендарна" },
  "R6": { value: 2.00, name: "mythic", displayName: "Міфічна" }
};

/**
 * Баланс сил (лінійна прокачка):
 *  - R1 / стартові: +10 за рівень
 *  - R2: +20
 *  - R3: +50
 *  - R4: +100
 *  - R5: +500
 *  - R6: +500
 *
 * База (діапазони по рідкості):
 *  - R1: 12..100
 *  - R2: 30..140
 *  - R3: 60..220
 *  - R4: 100..320
 *  - R5: 160..450
 *  - R6: 250..650
 */

const RARITY_BASE_RANGES = {
  R1: [12, 100],
  R2: [30, 140],
  R3: [60, 220],
  R4: [100, 320],
  R5: [160, 450],
  R6: [250, 650]
};

function lerp(min, max, t) {
  return Math.round(min + (max - min) * t);
}

// Єдине джерело істини для сили карти з урахуванням рівня
if (typeof window !== 'undefined' && typeof window.getPower === 'undefined') {
  window.getPower = function getPower(card, level = 1) {
    const lvl = Math.max(1, Number(level) || 1);
    const rarityId = (card.rarityId || card.rarity || 'R1').toString().toUpperCase();
    const incByRarity = { R1: 10, R2: 20, R3: 50, R4: 100, R5: 500, R6: 500 };
    const inc = incByRarity[rarityId] ?? 10;
    const base = Number(card.basePower) || 0;
    return Math.round(base + inc * (lvl - 1));
  };
}

// Генерація всіх 240 карт
const ALL_CARDS = [];

for (let factionNum = 1; factionNum <= 40; factionNum++) {
  const factionId = `F${String(factionNum).padStart(2, '0')}`;
  const element = FACTION_ELEMENTS[factionId];
  const factionName = FACTION_NAMES[factionId];
  const cardNames = CARD_NAMES[factionId];

  // детермінована позиція в діапазоні 0..1 (щоб бази були стабільні)
  const t = (factionNum - 1) / 39;

  for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
    const rarityId = `R${rarityNum}`;
    const cardId = `${factionId}-${rarityId}`;
    const rarityData = RARITY_MULTIPLIERS[rarityId];

    // Нова база по діапазонах (замість множення rarity multiplier)
    const [minP, maxP] = RARITY_BASE_RANGES[rarityId] || RARITY_BASE_RANGES.R1;
    const finalPower = lerp(minP, maxP, t);
    
    // upgradeMult для системи прокачки (залежить від рідкості)
    // Чим рідкісніша карта, тим менший приріст при прокачці (баланс)
    const upgradeMult = {
      1: 1.15, // common - швидке зростання
      2: 1.13, // uncommon
      3: 1.11, // rare
      4: 1.09, // epic
      5: 1.07, // legendary
      6: 1.05  // mythic - повільне зростання, але висока база
    }[rarityNum];
    
    ALL_CARDS.push({
      id: cardId,
      element: element,
      faction: factionId,
      factionName: factionName,
      // Сохраняем совместимость: `rarity` — строковое имя (common/uncommon/...)
      rarity: rarityData.name,
      rarityId: rarityId,
      rarityName: rarityData.name,
      rarityDisplay: rarityData.displayName,
      basePower: finalPower,
      multiplier: 1.0,
      upgradeMult: upgradeMult,
      attack: finalPower,
      defense: Math.round(finalPower * 0.8),
      name: cardNames[rarityNum - 1]
    });
  }
}

// Стартовий набір карт (16 шт), усі мають силу 12
const STARTER_CARDS = [
  { id: 'S01', name: 'Іскровий Новобранець', element: 'fire',  faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S02', name: 'Підпалювач Шестерень', element: 'fire',  faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S03', name: 'Сторож Жаркого Котла', element: 'fire',  faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S04', name: 'Кочегар Мідного Серця', element: 'fire',  faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S05', name: 'Матрос Туманної Варти', element: 'water', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S06', name: 'Регулятор Парових Клапанів', element: 'water', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S07', name: 'Навігатор Глибокого Каналу', element: 'water', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S08', name: 'Охоронець Холодних Резервуарів', element: 'water', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S09', name: 'Кур’єр Вітряних Трас', element: 'air',   faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S10', name: 'Механік Аерокрил', element: 'air',  faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S11', name: 'Сигнальник Високих Щогл', element: 'air',  faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S12', name: 'Спостерігач Небесних Турбін', element: 'air',  faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S13', name: 'Робітник Кам’яних Доків', element: 'earth', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S14', name: 'Оператор Гірських Ліфтів', element: 'earth', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S15', name: 'Вартовий Шахтного Периметру', element: 'earth', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 },
  { id: 'S16', name: 'Технік Осадових Машин', element: 'earth', faction: 'S', factionName: 'Стартовий набір', rarity: 'common', rarityDisplay: 'Звичайна', basePower: 12, multiplier: 1.0, upgradeMult: 1.0, attack: 12, defense: 0 }
];

ALL_CARDS.push(...STARTER_CARDS);

/**
 * Швидкий індекс карт за ID
 */
const CARDS_BY_ID = Object.fromEntries(
  ALL_CARDS.map(card => [card.id, card])
);

/**
 * Групування карт по стихіях
 */
const CARDS_BY_ELEMENT = ALL_CARDS.reduce((acc, card) => {
  if (!acc[card.element]) {
    acc[card.element] = [];
  }
  acc[card.element].push(card);
  return acc;
}, {});

/**
 * Групування карт по фракціях
 */
const CARDS_BY_FACTION = ALL_CARDS.reduce((acc, card) => {
  if (!acc[card.faction]) {
    acc[card.faction] = [];
  }
  acc[card.faction].push(card);
  return acc;
}, {});

// Хелпери для доступу до стартових та усіх карт
const getAllCardIds = () => ALL_CARDS.map(card => card.id);
const getStarterCardIds = () => STARTER_CARDS.map(card => card.id);
const getRandomStarterCardIds = (count = 9) => {
  const ids = [...getStarterCardIds()];

  // Fisher-Yates shuffle для чесного випадкового порядку
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  return ids.slice(0, Math.min(count, ids.length));
};

// Локальний пошук без конфлікту з глобальними оголошеннями
function lookupCardById(id) {
  return CARDS_BY_ID[id] || null;
}

/**
 * Групування карт по рідкості
 */
const CARDS_BY_RARITY = ALL_CARDS.reduce((acc, card) => {
  if (!acc[card.rarity]) {
    acc[card.rarity] = [];
  }
  acc[card.rarity].push(card);
  return acc;
}, {});

// Експортуємо глобально для браузера
window.ALL_CARDS = ALL_CARDS;
window.CARDS_BY_ID = CARDS_BY_ID;
window.CARDS_BY_ELEMENT = CARDS_BY_ELEMENT;
window.CARDS_BY_FACTION = CARDS_BY_FACTION;
window.CARDS_BY_RARITY = CARDS_BY_RARITY;
window.FACTION_NAMES = FACTION_NAMES;
window.RARITY_MULTIPLIERS = RARITY_MULTIPLIERS;
window.STARTER_CARDS = STARTER_CARDS;

// Глобальні функції для доступу до карт
window.CARDS = ALL_CARDS;

if (!window.getCardById) {
  window.getCardById = function(id) {
    return lookupCardById(id);
  };
}

window.getAllCardIds = function() {
  return getAllCardIds();
};

window.getStarterCardIds = function() {
  return getStarterCardIds();
};

window.getRandomStarterCardIds = function(count = 9) {
  return getRandomStarterCardIds(count);
};

window.getCardsByElement = function(element) {
  return CARDS_BY_ELEMENT[element] || [];
};

window.getCardsByFaction = function(factionId) {
  return CARDS_BY_FACTION[factionId] || [];
};

window.getCardsByRarity = function(rarity) {
  return CARDS_BY_RARITY[rarity] || [];
};

// Node/CommonJS fallback
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CARDS: ALL_CARDS,
    STARTER_CARDS,
    getAllCardIds,
    getStarterCardIds,
    getRandomStarterCardIds,
    getCardById: lookupCardById,
    CARDS_BY_ID,
    CARDS_BY_ELEMENT,
    CARDS_BY_FACTION,
    CARDS_BY_RARITY
  };
}
