// DOM Utilities
export const dom = {
  // Query selector shorthand
  qs: (selector, parent = document) => parent.querySelector(selector),
  qsa: (selector, parent = document) => Array.from(parent.querySelectorAll(selector)),
  
  // Element creation
  create: (tag, attributes = {}, children = []) => {
    const el = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          el.dataset[dataKey] = dataValue;
        });
      } else {
        el.setAttribute(key, value);
      }
    });
    
    // Append children
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
    
    return el;
  },
  
  // Event handling
  on: (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },
  
  // Clear element content
  clear: (element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },
  
  // Toggle class
  toggleClass: (element, className, force) => {
    return element.classList.toggle(className, force);
  },
  
  // Set attributes
  setAttrs: (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  },
  
  // Get element by ID
  byId: (id) => document.getElementById(id),
  
  // Create element from HTML string
  fromHTML: (html) => {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  },
  
  // Mount component to target
  mount: (target, component) => {
    if (typeof target === 'string') {
      target = dom.qs(target);
    }
    dom.clear(target);
    target.appendChild(component);
  }
};

export default dom;
