function checkOrientation() {
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  document.body.classList.toggle('landscape', !isPortrait);
}

window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('resize', checkOrientation);
document.addEventListener('DOMContentLoaded', checkOrientation);
