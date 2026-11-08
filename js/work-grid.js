/* ==========================================================================
   work-grid.js — Infinite Draggable 2D Project Matrix.
   Single-page build: the matrix only moves via pointer drag; page scroll
   passes through the sector without affecting the field.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('work-grid', function (scope) {
  'use strict';

  const root  = scope.querySelector('.wgrid');
  const world = scope.querySelector('.wgrid__world');
  if (!root || !world) return;

  const PROJECTS = window.PROJECTS || [];
  if (!PROJECTS.length) return;

  const on = window.PAGE.bindings();

  // Grid Pitch Dimensions
  const PITCH_X = 470;
  const PITCH_Y = 320;
  const COLS = 4;
  const ROWS = 4;
  const TOTAL_W = COLS * PITCH_X;
  const TOTAL_H = ROWS * PITCH_Y;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let dragDist = 0;
  let raf = 0;

  // Build grid card DOM elements
  const cards = [];
  world.innerHTML = '';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = (r * COLS + c) % PROJECTS.length;
      const prj = PROJECTS[idx];

      const card = document.createElement('div');
      card.className = 'wcard';
      if (prj.url) {
        card.classList.add('is-linked');
        card.dataset.url = prj.url;
      }

      // Keyboard a11y: every plate is a focusable button
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Open case file: ${prj.title} — ${prj.category}`);

      const visual = prj.img
        ? `<img class="wcard__img" src="${prj.img}" alt="${prj.title} preview" loading="lazy" decoding="async" />`
        : `<div class="wcard__glyph">▚▟</div>
           <span class="wcard__spec">// TACTICAL SPECIFICATION //</span>`;

      card.innerHTML = `
        <span class="wcard__corner wcard__corner--tl"></span>
        <span class="wcard__corner wcard__corner--tr"></span>
        <span class="wcard__corner wcard__corner--bl"></span>
        <span class="wcard__corner wcard__corner--br"></span>

        <div class="wcard__top">
          <span class="wcard__num">// ${prj.n}</span>
          <span class="wcard__status">[${prj.status}]</span>
          <span>${prj.year}</span>
        </div>

        <div class="wcard__visual">
          ${visual}
          <span class="wcard__cat">${prj.category}</span>
        </div>

        <div class="wcard__foot">
          <h3 class="wcard__title">${prj.title}</h3>
          <p class="wcard__desc">${prj.desc}</p>
        </div>
      `;

      world.appendChild(card);
      cards.push({ el: card, baseCol: c, baseRow: r });
    }
  }

  function loop() {
    // Smoothed drag movement
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    // Modulo wrapping for infinite field
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (let i = 0; i < cards.length; i++) {
      const { el, baseCol, baseRow } = cards[i];

      let x = (baseCol * PITCH_X + currentX) % TOTAL_W;
      let y = (baseRow * PITCH_Y + currentY) % TOTAL_H;

      if (x < -PITCH_X) x += TOTAL_W;
      if (y < -PITCH_Y) y += TOTAL_H;
      if (x > vw + PITCH_X) x -= TOTAL_W;
      if (y > vh + PITCH_Y) y -= TOTAL_H;

      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }

    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  // Pointer drag input
  on(root, 'pointerdown', e => {
    isDragging = true;
    dragDist = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    root.classList.add('is-dragging');
    root.setPointerCapture?.(e.pointerId);
  });

  on(window, 'pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    dragDist += Math.abs(dx) + Math.abs(dy);

    targetX += dx * 1.35;
    targetY += (dy + dx * 0.1) * 1.35;
  });

  const stopDrag = e => {
    if (!isDragging) return;
    isDragging = false;
    root.classList.remove('is-dragging');
    if (e && root.hasPointerCapture?.(e.pointerId)) {
      root.releasePointerCapture(e.pointerId);
    }
  };

  on(window, 'pointerup', stopDrag);
  on(window, 'pointercancel', stopDrag);

  // Open repository on click (ignore clicks that end a drag)
  on(root, 'click', e => {
    if (dragDist > 8) return;
    const card = e.target.closest?.('.wcard');
    if (!card || !card.dataset.url) return;
    window.open(card.dataset.url, '_blank', 'noopener');
  });

  // Keyboard input: arrows pan the field, Enter/Space activate the focused card
  const CARD_W = 440; // matches .wcard width
  const CARD_H = 290; // matches .wcard height

  // Pan the field so the focused card sits comfortably inside the viewport.
  // Reuses the same wrapped-position math as loop(); the minimal delta is
  // taken around the infinite wrap so the field never teleports a full turn.
  function panToCard(baseCol, baseRow) {
    const margin = 60;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = (baseCol * PITCH_X + currentX) % TOTAL_W;
    let y = (baseRow * PITCH_Y + currentY) % TOTAL_H;
    if (x < -PITCH_X) x += TOTAL_W;
    if (y < -PITCH_Y) y += TOTAL_H;
    if (x > vw + PITCH_X) x -= TOTAL_W;
    if (y > vh + PITCH_Y) y -= TOTAL_H;

    let dx = 0;
    if (x < margin) dx = margin - x;
    else if (x + CARD_W > vw - margin) dx = (vw - margin - CARD_W) - x;

    let dy = 0;
    if (y < margin) dy = margin - y;
    else if (y + CARD_H > vh - margin) dy = (vh - margin - CARD_H) - y;

    if (dx > TOTAL_W / 2) dx -= TOTAL_W;
    if (dx < -TOTAL_W / 2) dx += TOTAL_W;
    if (dy > TOTAL_H / 2) dy -= TOTAL_H;
    if (dy < -TOTAL_H / 2) dy += TOTAL_H;

    targetX += dx;
    targetY += dy;
  }

  for (let i = 0; i < cards.length; i++) {
    const { el, baseCol, baseRow } = cards[i];
    on(el, 'focus', () => panToCard(baseCol, baseRow));
  }

  on(window, 'keydown', e => {
    if (!root.contains(e.target)) return;

    switch (e.key) {
      case 'ArrowRight': targetX -= PITCH_X; break;
      case 'ArrowLeft':  targetX += PITCH_X; break;
      case 'ArrowDown':  targetY -= PITCH_Y; break;
      case 'ArrowUp':    targetY += PITCH_Y; break;
      default:
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest?.('.wcard');
          if (card) {
            dragDist = 0;
            card.click();
            if (e.key === ' ') e.preventDefault();
          }
        }
        return;
    }

    e.preventDefault();
  });

  return function destroy() {
    on.release();
    cancelAnimationFrame(raf);
  };
});
