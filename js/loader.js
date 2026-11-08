/* ==========================================================================
   loader.js — Progressive Asset-Decode Mathematical Preloader.
   AffanShz Creative Portfolio.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const el = document.querySelector('[data-loader]');

  if (!root.classList.contains('is-loading')) {
    el?.remove();
    return;
  }
  if (!el) {
    root.classList.remove('is-loading');
    return;
  }

  const MIN_MS = 1800;
  const MAX_MS = 2400;
  const EXIT_AT = 1100;

  const pctEl  = el.querySelector('[data-loader-pct]');
  const lineEl = el.querySelector('[data-loader-line]');

  let total = 1, done = 0;

  // Track fonts and any preloaded images
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => done++).catch(() => done++);
  } else {
    done++;
  }

  const start = performance.now();
  let raf = 0, exiting = false, flooding = false;

  function step(now) {
    const elapsed = now - start;
    const pTime   = elapsed / MIN_MS;
    const pReal   = done / Math.max(total, 1);
    const pFloor  = elapsed / MAX_MS;
    const p       = Math.min(pTime, Math.max(pReal, pFloor));
    const pct     = Math.min(100, Math.floor(p * 100));

    if (pctEl) pctEl.textContent = pct;
    if (lineEl) lineEl.style.width = pct + '%';

    if (elapsed >= EXIT_AT && !exiting) {
      exiting = true;
      el.classList.add('is-exiting');
    }

    if (p >= 1.0 && !flooding) {
      flooding = true;
      cancelAnimationFrame(raf);
      if (pctEl) pctEl.textContent = '100';
      if (lineEl) lineEl.style.width = '100%';

      el.classList.add('is-flooding');

      setTimeout(() => {
        root.classList.remove('is-loading');
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.4s ease';
        setTimeout(() => el.remove(), 400);
      }, 650);
      return;
    }

    raf = requestAnimationFrame(step);
  }

  raf = requestAnimationFrame(step);
})();
