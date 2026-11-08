/* ==========================================================================
   palette.js — QUICK ACCESS command palette. Ctrl+K / Cmd+K to open,
   or '/' when not typing in a field. Keyboard-first: arrows + Enter run,
   Esc closes. Feature-degrades around missing globals (PROJECTS /
   CASESTUDY / CONTACT / CV). Pure DOM, no dependencies.
   AffanShz Creative Portfolio.
   ========================================================================== */

window.PAGE.register('palette', function (scope) {
  'use strict';

  const on = window.PAGE.bindings();
  const REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GITHUB_URL = 'https://github.com/AffanShz';
  const FALLBACK_EMAIL = 'affanshahzada@gmail.com';

  /* ---------------- Fuzzy subsequence matcher ------------------------------ */
  // Returns the array of matched indices into `text`, or null when the query
  // is not a case-insensitive subsequence of it. Spaces in the query are free.
  function fuzzy(query, text) {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    const idx = [];
    let pos = 0;
    for (let i = 0; i < q.length; i++) {
      if (q[i] === ' ') continue;
      const found = t.indexOf(q[i], pos);
      if (found === -1) return null;
      idx.push(found);
      pos = found + 1;
    }
    return idx;
  }

  /* ---------------- Command items ------------------------------------------ */
  // Rebuilt on every open so late-loading globals (CASESTUDY, CV) are seen.
  function buildItems() {
    const items = [];

    // Section jumps
    const SECTIONS = ['#sec-index', '#sec-work', '#sec-err'];
    for (let i = 0; i < SECTIONS.length; i++) {
      const hash = SECTIONS[i];
      items.push({ label: 'GO // ' + hash.replace('#sec-', '').toUpperCase(), run() { location.hash = hash; } });
    }

    const prjs = window.PROJECTS || [];
    for (let i = 0; i < prjs.length; i++) {
      const prj = prjs[i];
      items.push({
        label: 'OPEN FILE // ' + (prj.title || prj.n || '?'),
        run() {
          if (window.CASESTUDY && typeof window.CASESTUDY.open === 'function') {
            window.CASESTUDY.open(prj.n);
          } else if (prj.url) {
            window.open(prj.url, '_blank', 'noopener');
          }
        }
      });
    }

    items.push({
      label: 'COPY // EMAIL',
      stay: true,
      run() {
        copyText((window.CONTACT && window.CONTACT.email) || FALLBACK_EMAIL, () => {
          flash('[COPIED]');
          closeTimer = setTimeout(close, 600);
        });
      }
    });

    items.push({
      label: 'GITHUB // OPEN PROFILE',
      run() { window.open(GITHUB_URL, '_blank', 'noopener'); }
    });

    // Resume PDF is optional — no CV global, no item
    if (window.CV && window.CV.url) {
      items.push({
        label: 'CV // DOWNLOAD',
        run() {
          const a = document.createElement('a');
          a.href = window.CV.url;
          a.download = '';
          a.rel = 'noopener';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    }

    return items;
  }

  /* ---------------- Clipboard helpers --------------------------------------- */
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => legacyCopy(text, done));
    } else {
      legacyCopy(text, done);
    }
  }

  function legacyCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (err) {
      /* clipboard unavailable — flash simply never fires */
    }
    document.body.removeChild(ta);
  }

  /* ---------------- Build the overlay --------------------------------------- */
  const overlay = document.createElement('div');
  overlay.className = 'pal';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Quick access');

  const panel = document.createElement('div');
  panel.className = 'pal__panel';

  const corners = ['tl', 'tr', 'bl', 'br'];
  for (let i = 0; i < corners.length; i++) {
    const c = document.createElement('span');
    c.className = 'pal__corner pal__corner--' + corners[i];
    c.setAttribute('aria-hidden', 'true');
    panel.appendChild(c);
  }

  const head = document.createElement('div');
  head.className = 'pal__head';

  function span(cls, text) {
    const s = document.createElement('span');
    s.className = cls;
    if (text) s.textContent = text;
    return s;
  }

  const dot = span('pal__dot');
  dot.setAttribute('aria-hidden', 'true');
  const statusEl = span('pal__status');
  head.appendChild(dot);
  head.appendChild(span('pal__title', '// QUICK ACCESS'));
  head.appendChild(statusEl);
  head.appendChild(span('pal__hint', 'ESC // CLOSE'));

  const input = document.createElement('input');
  input.className = 'pal__input';
  input.type = 'text';
  input.spellcheck = false;
  input.autocomplete = 'off';
  input.placeholder = 'TYPE TO SEARCH RECORDS';
  input.setAttribute('aria-label', 'Search commands');

  const list = document.createElement('div');
  list.className = 'pal__list';
  list.setAttribute('role', 'listbox');

  const empty = document.createElement('div');
  empty.className = 'pal__empty';
  empty.textContent = '// NO MATCHING RECORDS';

  panel.appendChild(head);
  panel.appendChild(input);
  panel.appendChild(list);
  panel.appendChild(empty);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  /* ---------------- State ---------------------------------------------------- */
  let openState = false;
  let lastFocus = null;
  let rows = [];       // [{ item, el }]
  let sel = 0;         // active row index
  let closeTimer = null;

  function flash(text) {
    statusEl.textContent = text;
  }

  /* ---------------- Rendering ------------------------------------------------ */
  function renderLabel(el, label, idx) {
    el.textContent = '';
    if (!idx) { el.textContent = label; return; }
    const set = {};
    for (let i = 0; i < idx.length; i++) set[idx[i]] = 1;
    for (let i = 0; i < label.length; i++) {
      el.appendChild(set[i] ? span('pal__hl', label[i]) : document.createTextNode(label[i]));
    }
  }

  function paint() {
    for (let i = 0; i < rows.length; i++) {
      const active = i === sel;
      rows[i].el.classList.toggle('is-active', active);
      rows[i].el.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active && rows[i].el.scrollIntoView) {
        rows[i].el.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function render(query) {
    list.textContent = '';
    rows = [];
    const items = buildItems();
    for (let i = 0; i < items.length; i++) {
      const idx = fuzzy(query, items[i].label);
      if (!idx) continue;
      const row = document.createElement('div');
      row.className = 'pal__item';
      row.setAttribute('role', 'option');
      row.dataset.index = String(rows.length);
      renderLabel(row, items[i].label, idx);
      list.appendChild(row);
      rows.push({ item: items[i], el: row });
    }
    overlay.classList.toggle('is-empty', rows.length === 0);
    sel = 0;
    paint();
  }

  function move(delta) {
    if (!rows.length) return;
    sel = (sel + delta + rows.length) % rows.length;
    paint();
  }

  function execute() {
    const row = rows[sel];
    if (!row) return;
    row.item.run();
    if (!row.item.stay) close();
  }

  /* ---------------- Open / close --------------------------------------------- */
  function open() {
    if (openState) return;
    openState = true;
    lastFocus = document.activeElement;
    input.value = '';
    statusEl.textContent = '';
    render('');
    overlay.hidden = false;
    document.body.classList.add('pal-lock');
    // Next frame so the entrance transition (if any) can run
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    input.focus();
  }

  function close() {
    if (!openState) return;
    openState = false;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    overlay.classList.remove('is-open');
    document.body.classList.remove('pal-lock');
    // Reduced motion: hide instantly; otherwise let the exit transition settle
    if (REDUCED) overlay.hidden = true;
    else closeTimer = setTimeout(() => { overlay.hidden = true; closeTimer = null; }, 220);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }

  /* ---------------- Global keyboard entry ------------------------------------- */
  function isTypingTarget(t) {
    if (!t || !t.tagName) return false;
    const tag = t.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
      t.isContentEditable === true;
  }

  on(document, 'keydown', e => {
    const k = e.key;

    // Ctrl+K / Cmd+K toggles from anywhere
    if ((e.ctrlKey || e.metaKey) && k && k.toLowerCase() === 'k') {
      e.preventDefault();
      if (openState) close(); else open();
      return;
    }

    if (openState) {
      const acts = {
        Escape: close,
        ArrowDown: () => move(1),
        ArrowUp: () => move(-1),
        Enter: execute
      };
      const act = acts[k];
      if (act) { e.preventDefault(); act(); }
      return;
    }

    // '/' opens only when the user is not typing in a field
    if (k === '/' && !e.ctrlKey && !e.metaKey && !e.altKey &&
        !isTypingTarget(e.target)) {
      e.preventDefault();
      open();
    }
  });

  /* ---------------- Pointer interaction --------------------------------------- */
  // Clicking the darkened field (outside the panel) dismisses
  on(overlay, 'pointerdown', e => {
    if (e.target === overlay) close();
  });

  on(list, 'mouseover', e => {
    const row = e.target.closest && e.target.closest('.pal__item');
    if (!row) return;
    const i = Number(row.dataset.index);
    if (i !== sel) {
      sel = i;
      paint();
    }
  });

  on(list, 'click', e => {
    const row = e.target.closest && e.target.closest('.pal__item');
    if (!row) return;
    sel = Number(row.dataset.index);
    execute();
  });

  on(input, 'input', () => render(input.value));

  return function destroy() {
    on.release();
    if (closeTimer) clearTimeout(closeTimer);
    document.body.classList.remove('pal-lock');
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };
});
