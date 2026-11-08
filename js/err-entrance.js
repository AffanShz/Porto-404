/* ==========================================================================
   err-entrance.js — Periodic glitch bursts for the 404 sector.
   Every 10s the "404" headline bursts (glyph-scramble decode + RGB jitter
   via is-glitching). Every 15s the white strip line scrambles the same
   way the nav / back-to-index scramble does, with a slice jitter class.
   Decode is driven by rAF with a MessageChannel pump fallback so bursts
   complete even when frame production is suspended.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('err-entrance', function (scope) {
  'use strict';

  const room = scope.querySelector('.err-room');
  const head = room && room.querySelector('.err__glitch');
  const strip = room && room.querySelector('.err__strip');
  if (!room || !head) return;

  const GLYPHS = '▘▙▚▛▜▝▞▟▖▗▄▀█▌▐▓▒░';
  const HEAD_TEXT = head.textContent.trim();
  const HEAD_PERIOD_MS = 10000;   // headline glitch once every 10 seconds
  const HEAD_BURST_MS = 420;
  const STRIP_PERIOD_MS = 15000;  // strip scramble once every 15 seconds
  const STRIP_BURST_MS = 420;
  const STRIP_SPANS = strip
    ? Array.from(strip.querySelectorAll('.err__stripIn span'))
    : [];

  const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  let headTimer = 0;
  let stripTimer = 0;
  let headBursting = false;
  let stripBursting = false;

  // Glyph decoder: each character settles at a random moment inside durMs
  function decode(el, finalText, durMs, done) {
    const chars = Array.from(finalText).map(ch => ({
      ch,
      settle: durMs * (0.15 + Math.random() * 0.75),
      cur: ch === ' ' ? ' ' : rnd()
    }));
    const t0 = performance.now();
    let stopped = false;
    let lastPump = 0;

    function step(now) {
      if (stopped) return;
      const t = now - t0;
      let out = '';
      let remaining = 0;
      for (const c of chars) {
        if (t >= c.settle) {
          out += c.ch;
        } else {
          remaining++;
          if (Math.random() < 0.35) c.cur = rnd();
          out += c.cur;
        }
      }
      el.textContent = out;
      if (remaining === 0) {
        stopped = true;
        if (done) done();
      }
    }

    function rafLoop(now) {
      if (stopped) return;
      step(now);
      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);

    // MessageChannel pump: keeps stepping when rAF is frozen (idle webview)
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      if (stopped) return;
      const now = performance.now();
      if (now - lastPump >= 16) {
        lastPump = now;
        step(now);
      }
      if (!stopped) ch.port2.postMessage(0);
    };
    ch.port2.postMessage(0);

    el._pump = ch;
  }

  function headBurst() {
    if (headBursting) return;
    headBursting = true;
    room.classList.add('is-glitching');
    decode(head, HEAD_TEXT, HEAD_BURST_MS, () => {
      head.textContent = HEAD_TEXT;
      room.classList.remove('is-glitching');
      headBursting = false;
    });
  }

  function stripBurst() {
    if (stripBursting || !STRIP_SPANS.length) return;
    stripBursting = true;
    strip.classList.add('is-glitching');
    let pending = STRIP_SPANS.length;
    STRIP_SPANS.forEach(el => {
      if (!el.dataset.final) el.dataset.final = el.textContent;
      decode(el, el.dataset.final, STRIP_BURST_MS, () => {
        el.textContent = el.dataset.final;
        if (--pending === 0) {
          strip.classList.remove('is-glitching');
          stripBursting = false;
        }
      });
    });
  }

  function headLoop() {
    headTimer = setTimeout(() => {
      headBurst();
      headLoop();
    }, HEAD_PERIOD_MS);
  }

  function stripLoop() {
    stripTimer = setTimeout(() => {
      stripBurst();
      stripLoop();
    }, STRIP_PERIOD_MS);
  }

  headLoop();
  stripLoop();

  return function destroy() {
    clearTimeout(headTimer);
    clearTimeout(stripTimer);
    if (head._pump) head._pump.port1.close();
    STRIP_SPANS.forEach(el => { if (el._pump) el._pump.port1.close(); });
  };
});
