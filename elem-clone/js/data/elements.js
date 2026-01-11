// Elements and their properties
export const ELEMENTS = {
  FIRE: 'fire',
  WATER: 'water',
  EARTH: 'earth',
  AIR: 'air',
  LIGHTNING: 'lightning',
  ICE: 'ice'
};

// Element display info
export const ELEMENT_INFO = {
  [ELEMENTS.FIRE]: {
    name: 'Вогонь',
    color: '#FF4500',
    icon: '🔥',
    description: 'Сильний проти Льоду, слабкий проти Води'
  },
  [ELEMENTS.WATER]: {
    name: 'Вода',
    color: '#1E90FF',
    icon: '💧',
    description: 'Сильний проти Вогню, слабкий проти Землі'
  },
  [ELEMENTS.EARTH]: {
    name: 'Земля',
    color: '#8B4513',
    icon: '🌍',
    description: 'Сильний проти Води, слабкий проти Повітря'
  },
  [ELEMENTS.AIR]: {
    name: 'Повітря',
    color: '#87CEEB',
    icon: '💨',
    description: 'Сильний проти Землі, слабкий проти Блискавки'
  },
  [ELEMENTS.LIGHTNING]: {
    name: 'Блискавка',
    color: '#FFD700',
    icon: '⚡',
    description: 'Сильний проти Повітря, слабкий проти Льоду'
  },
  [ELEMENTS.ICE]: {
    name: 'Лід',
    color: '#00CED1',
    icon: '❄️',
    description: 'Сильний проти Блискавки, слабкий проти Вогню'
  }
};

// Element effectiveness multipliers
// [attacker][defender] = multiplier
export const ELEMENT_MULTIPLIERS = {
  [ELEMENTS.FIRE]: {
    [ELEMENTS.FIRE]: 1.0,
    [ELEMENTS.WATER]: 0.5,
    [ELEMENTS.EARTH]: 1.0,
    [ELEMENTS.AIR]: 1.0,
    [ELEMENTS.LIGHTNING]: 1.0,
    [ELEMENTS.ICE]: 1.5
  },
  [ELEMENTS.WATER]: {
    [ELEMENTS.FIRE]: 1.5,
    [ELEMENTS.WATER]: 1.0,
    [ELEMENTS.EARTH]: 0.5,
    [ELEMENTS.AIR]: 1.0,
    [ELEMENTS.LIGHTNING]: 1.0,
    [ELEMENTS.ICE]: 1.0
  },
  [ELEMENTS.EARTH]: {
    [ELEMENTS.FIRE]: 1.0,
    [ELEMENTS.WATER]: 1.5,
    [ELEMENTS.EARTH]: 1.0,
    [ELEMENTS.AIR]: 0.5,
    [ELEMENTS.LIGHTNING]: 1.0,
    [ELEMENTS.ICE]: 1.0
  },
  [ELEMENTS.AIR]: {
    [ELEMENTS.FIRE]: 1.0,
    [ELEMENTS.WATER]: 1.0,
    [ELEMENTS.EARTH]: 1.5,
    [ELEMENTS.AIR]: 1.0,
    [ELEMENTS.LIGHTNING]: 0.5,
    [ELEMENTS.ICE]: 1.0
  },
  [ELEMENTS.LIGHTNING]: {
    [ELEMENTS.FIRE]: 1.0,
    [ELEMENTS.WATER]: 1.0,
    [ELEMENTS.EARTH]: 1.0,
    [ELEMENTS.AIR]: 1.5,
    [ELEMENTS.LIGHTNING]: 1.0,
    [ELEMENTS.ICE]: 0.5
  },
  [ELEMENTS.ICE]: {
    [ELEMENTS.FIRE]: 0.5,
    [ELEMENTS.WATER]: 1.0,
    [ELEMENTS.EARTH]: 1.0,
    [ELEMENTS.AIR]: 1.0,
    [ELEMENTS.LIGHTNING]: 1.5,
    [ELEMENTS.ICE]: 1.0
  }
};

// Get multiplier for attack
export const getMultiplier = (attackerElement, defenderElement) => {
  return ELEMENT_MULTIPLIERS[attackerElement]?.[defenderElement] || 1.0;
};

// Get effectiveness description
export const getEffectiveness = (attackerElement, defenderElement) => {
  const multiplier = getMultiplier(attackerElement, defenderElement);
  
  if (multiplier > 1.0) return 'Ефективно';
  if (multiplier < 1.0) return 'Неефективно';
  return 'Нормально';
};

// Get all elements
export const getAllElements = () => Object.values(ELEMENTS);

export default {
  ELEMENTS,
  ELEMENT_INFO,
  ELEMENT_MULTIPLIERS,
  getMultiplier,
  getEffectiveness,
  getAllElements
};
