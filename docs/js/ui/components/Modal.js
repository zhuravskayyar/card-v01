// Modal component
import dom from '../../core/dom.js';

export const createModal = (options = {}) => {
  const {
    title = 'Modal',
    content = '',
    onClose = () => {},
    showCloseButton = true,
    footer = null
  } = options;

  // Create backdrop
  const backdrop = dom.create('div', {
    className: 'modal-backdrop',
    onClick: (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    }
  });

  // Create modal
  const modal = dom.create('div', { className: 'modal' });

  // Modal header
  const header = dom.create('div', { className: 'modal-header' }, [
    dom.create('h2', { className: 'modal-title' }, [title])
  ]);

  if (showCloseButton) {
    const closeBtn = dom.create('button', {
      className: 'modal-close',
      onClick: closeModal
    }, ['×']);
    header.appendChild(closeBtn);
  }

  // Modal body
  const body = dom.create('div', { className: 'modal-body' });
  
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof Node) {
    body.appendChild(content);
  }

  // Modal footer
  let footerElement = null;
  if (footer) {
    footerElement = dom.create('div', { className: 'modal-footer' });
    if (footer instanceof Node) {
      footerElement.appendChild(footer);
    } else if (Array.isArray(footer)) {
      footer.forEach(item => footerElement.appendChild(item));
    }
  }

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(body);
  if (footerElement) {
    modal.appendChild(footerElement);
  }

  backdrop.appendChild(modal);

  // Close function
  function closeModal() {
    backdrop.remove();
    onClose();
  }

  // Public API
  return {
    element: backdrop,
    close: closeModal,
    show: () => {
      const modalsContainer = document.getElementById('modals');
      if (modalsContainer) {
        modalsContainer.appendChild(backdrop);
      }
    }
  };
};

export default createModal;
