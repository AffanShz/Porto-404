/* ==========================================================================
   about-text.js — Virtual Scroll Accumulator & Narrative Column Mover.
   Single-page build: the column consumes wheel input while the INDEX sector
   owns the viewport; at either travel boundary the wheel is released to
   native page scroll, so scrolling flows seamlessly into the next sector.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('about-text', function (scope) {
  'use strict';

  const stage  = scope.querySelector('#aboutStage');
  const column = scope.querySelector('#aboutColumn');
  if (!stage || !column) return;

  const section = stage.closest('section') || stage.parentElement;
  const on = window.PAGE.bindings();

  let targetY = 0;
  let currentY = 0;
  let maxTravel = 1600;
  let raf = 0;

  function measure() {
    const colHeight = column.scrollHeight || 1800;
    maxTravel = Math.max(200, colHeight - window.innerHeight * 0.4);
  }
  measure();
  on(window, 'resize', measure);

  function loop() {
    // Smooth dampening towards target
    const dy = (targetY - currentY) * 0.08;
    currentY += dy;

    column.style.transform = `translateY(-${currentY.toFixed(2)}px)`;

    // Dispatch scroll progress to HUD
    const progress = Math.max(0, Math.min(1, currentY / maxTravel));
    scope.dispatchEvent(new CustomEvent('about:scroll', {
      detail: { progress, travel: currentY, max: maxTravel }
    }));

    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  // Sector owns the viewport while its top has not scrolled half-out
  function inZone() {
    const r = section.getBoundingClientRect();
    return r.top > -window.innerHeight * 0.5;
  }

  function nudge(delta) {
    const next = targetY + delta;
    if ((next <= 0 && targetY <= 0) || (next >= maxTravel && targetY >= maxTravel)) {
      return false; // boundary reached — hand the gesture to native page scroll
    }
    targetY = Math.max(0, Math.min(maxTravel, next));
    return true;
  }

  // Wheel: consumed only inside the sector and between column boundaries
  on(window, 'wheel', e => {
    if (!inZone()) return;
    if (nudge(e.deltaY * 0.85)) e.preventDefault();
  }, { passive: false });

  // Keyboard mirrors wheel behaviour
  on(window, 'keydown', e => {
    if (!inZone()) return;
    let step = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') step = 120;
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') step = -120;
    else if (e.key === 'Home') { e.preventDefault(); targetY = 0; return; }
    else if (e.key === 'End')  { e.preventDefault(); targetY = maxTravel; return; }
    if (!step) return;
    if (nudge(step)) e.preventDefault();
  });

  return function destroy() {
    on.release();
    cancelAnimationFrame(raf);
  };
});
