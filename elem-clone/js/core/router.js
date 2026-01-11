// Simple Hash Router
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];
    
    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  // Register a route
  register(path, handler) {
    this.routes.set(path, handler);
  }

  // Navigate to a route
  navigate(path) {
    window.location.hash = `#${path}`;
  }

  // Get current path from hash
  getCurrentPath() {
    const hash = window.location.hash;
    return hash.slice(1) || '/';
  }

  // Handle route change
  async handleRoute() {
    const path = this.getCurrentPath();
    const handler = this.routes.get(path) || this.routes.get('*');
    
    if (!handler) {
      console.warn(`No handler found for route: ${path}`);
      return;
    }

    // Run before hooks
    for (const hook of this.beforeHooks) {
      const result = await hook(path, this.currentRoute);
      if (result === false) return; // Cancel navigation
    }

    const prevRoute = this.currentRoute;
    this.currentRoute = path;

    // Execute route handler
    try {
      await handler(path, prevRoute);
    } catch (error) {
      console.error(`Error handling route ${path}:`, error);
    }

    // Run after hooks
    for (const hook of this.afterHooks) {
      await hook(path, prevRoute);
    }
  }

  // Add before navigation hook
  beforeEach(hook) {
    this.beforeHooks.push(hook);
  }

  // Add after navigation hook
  afterEach(hook) {
    this.afterHooks.push(hook);
  }

  // Get query parameters
  getParams() {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    
    if (queryIndex === -1) return {};
    
    const query = hash.slice(queryIndex + 1);
    const params = new URLSearchParams(query);
    
    return Object.fromEntries(params.entries());
  }
}

// Create global router instance
export const router = new Router();

export default router;
