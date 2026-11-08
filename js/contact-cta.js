/* ==========================================================================
   contact-cta.js — Unicode glyph scramble decoder & tactical contact trigger.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('contact-cta', function (scope) {
  'use strict';

  const CONFIG = {
    glyphs: '▘▙▚▛▜▝▞▟▖▗▄▀█▌▐▓▒░',
    speed: 1.2,
    holdMs: 2400,
    lockWidth: true,
    ask: 'CONFIRM TRANSMISSION?',
    insist: 'ESTABLISHING UPLINK...',
    give: 'COMMS LOCKED // COPIED'
  };

  const els = Array.prototype.slice.call(scope.querySelectorAll('[data-copy-email]'));
  const echo = Array.prototype.slice.call(scope.querySelectorAll('[data-scramble]'));
  if (!els.length && !echo.length) return;

  const rnd = () => CONFIG.glyphs[(Math.random() * CONFIG.glyphs.length) | 0];

  function scrambler(el) {
    let raf = 0, frame = 0, q = [], busy = false, after = null;

    function step() {
      let out = '', done = 0;
      for (let i = 0; i < q.length; i++) {
        const c = q[i];
        if (c.to === ' ') {
          out += ' ';
          done++;
          continue;
        }
        if (frame >= c.end) {
          out += c.to;
          done++;
        } else if (frame >= c.start) {
          if (!c.ch || Math.random() < 0.3) c.ch = rnd();
          out += c.ch;
        } else {
          out += c.from;
        }
      }
      el.textContent = out;
      if (done === q.length) {
        busy = false;
        const fn = after;
        after = null;
        if (fn) fn();
        return;
      }
      frame++;
      raf = requestAnimationFrame(step);
    }

    return {
      get busy() { return busy; },
      to(next, done) {
        const prev = el.textContent;
        const len = Math.max(prev.length, next.length);
        const s = Math.max(0.2, CONFIG.speed);
        q = [];
        for (let i = 0; i < len; i++) {
          const start = Math.floor((Math.random() * 10) / s);
          q.push({
            from: prev[i] || ' ',
            to: next[i] || '',
            start,
            end: start + Math.floor((Math.random() * 12 + 6) / s),
            ch: ''
          });
        }
        cancelAnimationFrame(raf);
        frame = 0;
        busy = true;
        after = done || null;
        step();
      },
      stop() {
        cancelAnimationFrame(raf);
        busy = false;
        after = null;
      }
    };
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('no clipboard api');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  const on = window.PAGE.bindings();

  // Multi-phase Tactical Copy Button
  els.forEach(btn => {
    const email = btn.dataset.copyEmail;
    const label = btn.querySelector('[data-label]') || btn;
    const homeText = label.textContent.trim();
    const sc = scrambler(label);
    let stage = 0, resetTimer = 0;

    function lock() {
      if (!CONFIG.lockWidth) return;
      const probe = document.createElement('span');
      const cs = getComputedStyle(label);
      probe.style.cssText =
        `position:absolute;visibility:hidden;white-space:pre;left:-9999px;` +
        `font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform};`;
      document.body.appendChild(probe);
      let maxW = 0;
      [homeText, CONFIG.ask, CONFIG.insist, CONFIG.give].forEach(t => {
        probe.textContent = t;
        maxW = Math.max(maxW, probe.getBoundingClientRect().width);
      });
      probe.remove();
      label.style.display = 'inline-block';
      label.style.minWidth = Math.ceil(maxW + 4) + 'px';
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(lock).catch(lock);
    } else {
      lock();
    }

    function reset() {
      clearTimeout(resetTimer);
      stage = 0;
      btn.classList.remove('is-copied');
      sc.to(homeText);
    }

    on(btn, 'click', async e => {
      e.preventDefault();
      clearTimeout(resetTimer);

      if (stage === 0) {
        stage = 1;
        sc.to(CONFIG.ask);
        resetTimer = setTimeout(reset, 3000);
      } else if (stage === 1) {
        stage = 2;
        sc.to(CONFIG.insist, async () => {
          await copyText(email);
          btn.classList.add('is-copied');
          sc.to(CONFIG.give);
          resetTimer = setTimeout(reset, CONFIG.holdMs);
        });
      }
    });

    on(btn, 'mouseleave', () => {
      if (stage === 1) resetTimer = setTimeout(reset, 1500);
    });
  });

  // Standard hover descramble for navigation elements
  echo.forEach(el => {
    const label = el.querySelector('[data-label]') || el;
    const homeText = label.textContent.trim();
    const sc = scrambler(label);

    on(el, 'mouseenter', () => {
      if (sc.busy) return;
      sc.to(homeText);
    });
  });

  return function destroy() {
    on.release();
  };
});
