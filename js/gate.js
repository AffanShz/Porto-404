/* ==========================================================================
   gate.js — Mobile Gate Resize Watcher.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('gate', function () {
  'use strict';

  const mql = window.matchMedia('(max-width: 720px)');
  const hasOverride = /[?&]mobile(&|=|$)/.test(location.search);

  function check() {
    if (hasOverride) {
      document.documentElement.classList.remove('is-gated');
      return;
    }
    const isMobile = mql.matches;
    document.documentElement.classList.toggle('is-gated', isMobile);
  }

  mql.addEventListener?.('change', check);
  window.addEventListener('resize', check, { passive: true });

  return function destroy() {
    mql.removeEventListener?.('change', check);
    window.removeEventListener('resize', check);
  };
});
