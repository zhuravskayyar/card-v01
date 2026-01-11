// Random Number Generator
class RNG {
  constructor(seed = null) {
    this.seed = seed || Date.now();
    this.originalSeed = this.seed;
  }

  // Linear Congruential Generator
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Random integer between min and max (inclusive)
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Random float between min and max
  nextFloat(min = 0, max = 1) {
    return this.next() * (max - min) + min;
  }

  // Random boolean
  nextBool(probability = 0.5) {
    return this.next() < probability;
  }

  // Pick random element from array
  choice(array) {
    if (array.length === 0) return null;
    return array[this.nextInt(0, array.length - 1)];
  }

  // Shuffle array (Fisher-Yates)
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Pick N random elements from array
  sample(array, count) {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Reset seed
  reset(newSeed = null) {
    this.seed = newSeed || this.originalSeed;
  }
}

// Default RNG instance (non-seeded, truly random)
export const rng = new RNG();

// Create seeded RNG
export const createSeededRNG = (seed) => new RNG(seed);

// Utility functions using default RNG
export const random = {
  int: (min, max) => rng.nextInt(min, max),
  float: (min = 0, max = 1) => rng.nextFloat(min, max),
  bool: (probability = 0.5) => rng.nextBool(probability),
  choice: (array) => rng.choice(array),
  shuffle: (array) => rng.shuffle(array),
  sample: (array, count) => rng.sample(array, count)
};

export default rng;
