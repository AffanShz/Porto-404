/* ==========================================================================
   clock.js — Live Tactical Jakarta Timezone Clock (WIB GMT+7).
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('clock', function (scope) {
  'use strict';

  const host = scope.querySelector('[data-clock]');
  if (!host) return;

  const CONFIG = {
    zone: 'Asia/Jakarta',
    label: 'GMT+7',
    seconds: true,
    dayFrom: 6,
    dayTo: 18
  };

  const timeEl = host.querySelector('[data-clock-time]');
  const zoneEl = host.querySelector('[data-clock-zone]');
  let timer = 0, alive = true;

  let fmt = null;
  try {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: CONFIG.zone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    console.warn('[CLOCK] Zone fallback:', e);
  }

  function tick() {
    if (!alive) return;
    const now = new Date();

    if (timeEl) {
      if (fmt) {
        timeEl.textContent = fmt.format(now);
      } else {
        timeEl.textContent = now.toTimeString().split(' ')[0];
      }
    }

    if (zoneEl && !zoneEl.textContent) {
      zoneEl.textContent = CONFIG.label;
    }

    // Toggle sun vs moon based on local hour
    const hour = now.getUTCHours() + 7; // WIB is UTC+7
    const normalizedHour = (hour + 24) % 24;
    const isNight = normalizedHour < CONFIG.dayFrom || normalizedHour >= CONFIG.dayTo;
    host.classList.toggle('is-night', isNight);

    // Sleep precisely until next second boundary to avoid drift
    const delay = 1000 - (Date.now() % 1000);
    timer = setTimeout(tick, delay);
  }

  tick();

  return function destroy() {
    alive = false;
    clearTimeout(timer);
  };
});
