/* ==========================================================================
   lifecycle.js — Container-scoped module lifecycle for Barba navigation.
   AffanShz Creative Portfolio System.
   ========================================================================== */
(() => {
  'use strict';

  const modules = [];

  function register(name, boot) {
    if (typeof boot !== 'function') return;
    modules.push({ name, boot });
  }

  // Modules allowed to mount behind the mobile gate door
  const GATE_OK = { gate: 1, 'contact-cta': 1 };

  function mount(scope) {
    const root = scope || document;
    const downs = [];
    const gated = document.documentElement.classList.contains('is-gated');

    for (const m of modules) {
      if (gated && !GATE_OK[m.name]) continue;
      let down;
      try {
        down = m.boot(root);
      } catch (err) {
        console.error(`[PAGE] Module "${m.name}" failed to mount:`, err);
        continue;
      }
      if (typeof down === 'function') {
        downs.push([m.name, down]);
      }
    }

    return {
      scope: root,
      unmount() {
        for (let i = downs.length - 1; i >= 0; i--) {
          try {
            downs[i][1]();
          } catch (err) {
            console.error(`[PAGE] Module "${downs[i][0]}" failed to unmount:`, err);
          }
        }
      }
    };
  }

  /* Leak-free event binding helper: collects listeners and releases all at teardown */
  function bindings() {
    const offs = [];
    return Object.assign(
      (el, ev, fn, opt) => {
        if (!el) return;
        el.addEventListener(ev, fn, opt);
        offs.push(() => el.removeEventListener(ev, fn, opt));
      },
      {
        release() {
          offs.forEach(f => f());
          offs.length = 0;
        }
      }
    );
  }

  window.PAGE = {
    register,
    mount,
    bindings,
    live: null,
    pending: null
  };

  /* Auto-mount: single-page build mounts the whole body once DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.PAGE.mount(document.body));
  } else {
    window.PAGE.mount(document.body);
  }
})();
