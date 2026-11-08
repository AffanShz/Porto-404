/* ==========================================================================
   work-filter.js — Category Filter Rail for the WORK grid.
   DOM-only overlay: matches cards to window.PROJECTS by their .wcard__num
   and dims non-matching plates. Does NOT touch work-grid.js math.
   AffanShz Creative Portfolio.
   ========================================================================== */

// Fixed category tokens. A project matches token T if its category string
// contains T (case-insensitive substring match).
const FILTER_TOKENS = ['ALL', 'FLUTTER', 'AI', 'WEB', 'DESKTOP'];

window.PAGE.register('work-filter', function (scope) {
  'use strict';

  const root = scope.querySelector('.wgrid');
  if (!root) return;

  const PROJECTS = window.PROJECTS || [];
  if (!PROJECTS.length) return;

  const on = window.PAGE.bindings();

  /* ---------------- Card <-> Project mapping ------------------------------ */
  // Read the card's '// 001' number plate and look the project up by n.
  function cardNumber(cardEl) {
    const numEl = cardEl.querySelector('.wcard__num');
    if (!numEl) return null;
    const digits = (numEl.textContent || '').replace(/[^0-9]/g, '');
    return digits || null;
  }

  const cards = Array.prototype.map.call(
    root.querySelectorAll('.wcard'),
    el => ({ el, project: PROJECTS.find(p => p.n === cardNumber(el)) || null })
  );

  function matches(project, token) {
    if (!project) return false;
    const cat = String(project.category || '').toUpperCase();
    return cat.indexOf(token) !== -1;
  }

  /* ---------------- Apply filter ------------------------------------------- */
  let activeToken = 'ALL';

  function applyFilter(token) {
    activeToken = token;
    for (let i = 0; i < cards.length; i++) {
      const { el, project } = cards[i];
      const keep = token === 'ALL' || matches(project, token);
      el.classList.toggle('is-dimmed', !keep);
    }
    for (let i = 0; i < btns.length; i++) {
      const isOn = btns[i].dataset.token === token;
      btns[i].classList.toggle('is-active', isOn);
      btns[i].setAttribute('aria-pressed', isOn ? 'true' : 'false');
    }
  }

  /* ---------------- Build the rail ----------------------------------------- */
  const rail = document.createElement('div');
  rail.className = 'wfilter';
  rail.setAttribute('role', 'group');
  rail.setAttribute('aria-label', 'Project category filter');

  const label = document.createElement('span');
  label.className = 'wfilter__label';
  label.textContent = 'FILTER //';
  rail.appendChild(label);

  const btns = [];
  for (let i = 0; i < FILTER_TOKENS.length; i++) {
    const token = FILTER_TOKENS[i];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wfilter__btn';
    btn.dataset.token = token;
    btn.setAttribute('aria-pressed', 'false');

    const mark = document.createElement('span');
    mark.className = 'wfilter__mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '//';
    btn.appendChild(mark);
    btn.appendChild(document.createTextNode(token));

    rail.appendChild(btn);
    btns.push(btn);
  }

  // Rail sits above the drag field: swallow pointerdown so tapping a token
  // never starts a grid drag (work-grid.js listens on the section root).
  on(rail, 'pointerdown', e => e.stopPropagation());

  on(rail, 'click', e => {
    const btn = e.target.closest?.('.wfilter__btn');
    if (!btn) return;
    applyFilter(btn.dataset.token);
  });

  root.appendChild(rail);

  // Initial state: ALL pressed
  applyFilter('ALL');

  return function destroy() {
    on.release();
    if (rail.parentNode) rail.parentNode.removeChild(rail);
  };
});
