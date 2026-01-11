// Time and Animation utilities
class TimeManager {
  constructor() {
    this.running = false;
    this.callbacks = new Map();
    this.callbackId = 0;
    this.lastTime = 0;
    this.deltaTime = 0;
  }

  // Start the animation loop
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  // Stop the animation loop
  stop() {
    this.running = false;
  }

  // Main tick function
  tick(currentTime = performance.now()) {
    if (!this.running) return;

    this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Call all registered callbacks
    this.callbacks.forEach(callback => {
      callback(this.deltaTime, currentTime);
    });

    requestAnimationFrame((time) => this.tick(time));
  }

  // Subscribe to animation loop
  subscribe(callback) {
    const id = this.callbackId++;
    this.callbacks.set(id, callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(id);
    };
  }

  // Get current delta time
  getDeltaTime() {
    return this.deltaTime;
  }
}

// Create global time manager
export const timeManager = new TimeManager();

// Utility: Delay/sleep function
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Debounce function
export const debounce = (fn, wait) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  };
};

// Utility: Throttle function
export const throttle = (fn, wait) => {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

// Utility: Animate value from start to end
export const animate = (from, to, duration, onUpdate, onComplete) => {
  const startTime = performance.now();
  
  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = from + (to - from) * eased;
    
    onUpdate(value, progress);
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  requestAnimationFrame(step);
};

// Utility: Format time (ms to mm:ss)
export const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Utility: Simple timer
export class Timer {
  constructor(duration, onTick, onComplete) {
    this.duration = duration;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.remaining = duration;
    this.running = false;
    this.intervalId = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    
    this.intervalId = setInterval(() => {
      this.remaining -= 100;
      
      if (this.onTick) {
        this.onTick(this.remaining);
      }
      
      if (this.remaining <= 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 100);
  }

  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(newDuration = null) {
    this.stop();
    this.remaining = newDuration || this.duration;
  }
}

export default timeManager;
