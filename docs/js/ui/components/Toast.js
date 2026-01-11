// Toast notification component
import dom from '../../core/dom.js';

export const createToast = (options = {}) => {
  const {
    message = '',
    type = 'info', // success, error, warning, info
    duration = 3000,
    onClose = () => {}
  } = options;

  const toast = dom.create('div', {
    className: `toast ${type}`
  }, [message]);

  // Auto-remove after duration
  const timeoutId = setTimeout(() => {
    removeToast();
  }, duration);

  function removeToast() {
    clearTimeout(timeoutId);
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      toast.remove();
      onClose();
    }, 300);
  }

  // Click to dismiss
  toast.addEventListener('click', removeToast);

  return {
    element: toast,
    show: () => {
      const toastsContainer = document.getElementById('toasts');
      if (toastsContainer) {
        toastsContainer.appendChild(toast);
      }
    },
    remove: removeToast
  };
};

// Utility functions for common toast types
export const showToast = {
  success: (message, duration) => {
    const toast = createToast({ message, type: 'success', duration });
    toast.show();
    return toast;
  },
  
  error: (message, duration) => {
    const toast = createToast({ message, type: 'error', duration });
    toast.show();
    return toast;
  },
  
  warning: (message, duration) => {
    const toast = createToast({ message, type: 'warning', duration });
    toast.show();
    return toast;
  },
  
  info: (message, duration) => {
    const toast = createToast({ message, type: 'info', duration });
    toast.show();
    return toast;
  }
};

// Add slideOutRight animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

export default createToast;
