/* ==========================================================================
   scroll-sync.js — Single-page scroll chrome synchronisation.
   Tracks which sector owns the viewport: drives the nav bar is-current
   state and fades the tactical HUD out as the page leaves the INDEX
   sector. AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('scroll-sync', function (scope) {
  'use strict';

  const sections = Array.prototype.slice.call(scope.querySelectorAll('[data-section]'));
  if (!sections.length) return;

  const on = window.PAGE.bindings();
  const links = Array.prototype.slice.call(document.querySelectorAll('.bar__btn[data-nav]'));
  const hud = scope.querySelector('.hud');

  // data-section → nav anchor id
  const NAV = { mask: 'sec-index', design: 'sec-work', err: 'sec-err' };

  function sync() {
    const vh = window.innerHeight;
    const y = window.scrollY || document.documentElement.scrollTop;

    // Active sector = last one whose top passed the viewport midline
    let active = sections[0].dataset.section;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= vh * 0.5) {
        active = sections[i].dataset.section;
      }
    }

    const target = NAV[active];
    for (let i = 0; i < links.length; i++) {
      links[i].classList.toggle('is-current', links[i].dataset.nav === target);
    }

    // HUD belongs to the INDEX sector — fade it out on the way down
    if (hud) {
      const fade = Math.max(0, Math.min(1, 1 - y / (vh * 0.7)));
      hud.style.opacity = fade.toFixed(3);
    }
  }

  on(window, 'scroll', sync, { passive: true });
  on(window, 'resize', sync, { passive: true });
  sync();

  return function destroy() {
    on.release();
  };
});
