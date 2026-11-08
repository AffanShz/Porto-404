/* ==========================================================================
   a11y.js — Accessibility module: skip link + landmark labelling.
   AffanShz Creative Portfolio.
   ========================================================================== */

window.PAGE.register('a11y', function (scope) {
  'use strict';
  const on = window.PAGE.bindings();
  const doc = document;

  /* ---------------- Skip Link — first child of <body> --------------------- */
  let skip = null;

  if (!doc.querySelector('.skip-link')) {
    skip = doc.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#sec-index';
    skip.textContent = 'SKIP // TO CONTENT';

    const body = doc.body;
    if (body.firstChild) {
      body.insertBefore(skip, body.firstChild);
    } else {
      body.appendChild(skip);
    }

    // Move real focus to the target sector, not just the scroll position.
    on(skip, 'click', () => {
      const target = doc.getElementById('sec-index');
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ---------------- Landmark Labelling (only if missing) ------------------ */
  const main = doc.querySelector('main');
  let addedMain = false;
  if (main && !main.hasAttribute('aria-label')) {
    main.setAttribute('aria-label', 'Portfolio sectors');
    addedMain = true;
  }

  const footerNav = doc.querySelector('footer.bar .bar__left');
  let addedNav = false;
  if (footerNav && !footerNav.hasAttribute('aria-label')) {
    // The footer links live in a plain <div> — promote it to a named
    // navigation landmark without restructuring the DOM.
    footerNav.setAttribute('role', 'navigation');
    footerNav.setAttribute('aria-label', 'Footer sector navigation');
    addedNav = true;
  }

  /* ---------------- Teardown ---------------------------------------------- */
  return function destroy() {
    on.release();
    if (skip && skip.parentNode) skip.parentNode.removeChild(skip);
    skip = null;
    if (addedMain && main) main.removeAttribute('aria-label');
    if (addedNav && footerNav) {
      footerNav.removeAttribute('aria-label');
      footerNav.removeAttribute('role');
    }
  };
});
