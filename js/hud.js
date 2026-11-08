/* ==========================================================================
   hud.js — Tactical Instrument HUD Pointer Tracking & Telemetry.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('hud', function (scope) {
  'use strict';

  const root = scope.querySelector('.hud');
  if (!root) return;

  const dot   = root.querySelector('.hud__dot');
  const box   = root.querySelector('.hud__mapbox');
  const readX = root.querySelector('.hud__xy--x span');
  const readY = root.querySelector('.hud__xy--y span');
  const fill  = root.querySelector('.hud__fill');

  const on = window.PAGE.bindings();

  let boxW = 283, boxH = 142;
  const dotSize = 4;

  function measure() {
    if (!box) return;
    const r = box.getBoundingClientRect();
    boxW = r.width;
    boxH = r.height;
  }
  measure();
  on(window, 'resize', measure);

  // Remap clientX / clientY onto the 283x142 radar box
  on(window, 'pointermove', e => {
    const rx = e.clientX / window.innerWidth;
    const ry = e.clientY / window.innerHeight;

    const px = Math.max(0, Math.min(boxW - dotSize, rx * boxW));
    const py = Math.max(0, Math.min(boxH - dotSize, ry * boxH));

    if (dot) {
      dot.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
    }

    if (readX) readX.textContent = Math.round(rx * 999).toString().padStart(3, '0');
    if (readY) readY.textContent = Math.round(ry * 999).toString().padStart(3, '0');
  });

  // Listen for scroll progress dispatches from about-text
  on(scope, 'about:scroll', e => {
    if (!fill) return;
    const progress = Math.max(0, Math.min(1, e.detail?.progress || 0));
    fill.style.width = (progress * 100).toFixed(1) + '%';
  });

  return function destroy() {
    on.release();
  };
});
