// Button component
import dom from '../../core/dom.js';

export const createButton = (options = {}) => {
  const {
    text = 'Button',
    onClick = () => {},
    variant = 'primary', // primary, secondary, success, danger, outline
    size = 'md', // sm, md, lg
    disabled = false,
    className = ''
  } = options;

  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  const button = dom.create('button', {
    className: classes,
    disabled,
    onClick: (e) => {
      if (!disabled) {
        onClick(e);
      }
    }
  }, [text]);

  return button;
};

export default createButton;
