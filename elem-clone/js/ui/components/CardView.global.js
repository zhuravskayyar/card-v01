// CardView.global — гарантирует наличие глобального `cardRenderer`
try {
  if (typeof CardRenderer !== 'undefined') {
    window.cardRenderer = window.cardRenderer || new CardRenderer();
  }
} catch (err) {
  console.warn('CardView.global init failed', err);
}
