/* ==========================================================================
   case-study.js — Full-screen 'DECRYPTED FILE' dossier overlay.
   Intercepts .wcard clicks at capture phase (beats work-grid's bubble
   handler), exposes window.CASESTUDY { open(n), close(), isOpen() }.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('case-study', function (scope) {
  'use strict';

  const CONFIG = {
    email: 'affanshahzada@gmail.com',
    dragTolerance: 8,   // same threshold work-grid uses to ignore drag-release clicks
    copiedHoldMs: 2000
  };

  const root = document.createElement('div');
  root.className = 'case';
  document.body.appendChild(root);

  const panel = document.createElement('div');
  panel.className = 'case__panel';
  root.appendChild(panel);

  const on = window.PAGE.bindings();

  let isOpenFlag = false;
  let lastFocus = null;
  let copyTimer = 0;
  let downX = 0, downY = 0, hasDown = false;

  /* ---------------- Utilities ---------------------------------------------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function findProject(n) {
    const list = window.PROJECTS || [];
    const key = String(n == null ? '' : n);
    const norm = /^\d+$/.test(key) ? key.padStart(3, '0') : key;
    for (let i = 0; i < list.length; i++) {
      if (String(list[i].n) === norm || String(list[i].n) === key) return list[i];
    }
    return null;
  }

  // Self-contained clipboard copy (no dependency on contact-cta.js)
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

  /* ---------------- Rendering ----------------------------------------------- */

  function render(prj) {
    let i = 0;
    const step = () => ` style="--i:${i++}"`;

    const tagline = prj.tagline || '';
    const role = prj.role || '';
    const stack = Array.isArray(prj.stack) ? prj.stack : [];
    const problem = prj.problem || '';
    const solution = prj.solution || '';
    const outcome = Array.isArray(prj.outcome) ? prj.outcome : [];
    const gallery = Array.isArray(prj.gallery) ? prj.gallery : [];
    const href = (prj.links && prj.links[0] && prj.links[0].href) || prj.url || '';

    function section(label, text) {
      return `<section class="case__sec anim"${step()}>
        <p class="case__label">${esc(label)}</p>
        <p class="case__text">${esc(text)}</p>
      </section>`;
    }

    const metaParts = [prj.status, prj.year, prj.category].filter(Boolean).map(esc);
    const metaHtml = metaParts.join(' <span class="case__sep">//</span> ');

    // Role / Stack meta grid — skipped entirely if the dossier carries neither
    const metaGrid = (role || stack.length) ? `
      <div class="case__grid anim"${step()}>
        ${role ? `<div class="case__cell">
          <p class="case__label">// ROLE</p>
          <p class="case__celltext">${esc(role)}</p>
        </div>` : ''}
        ${stack.length ? `<div class="case__cell">
          <p class="case__label">// STACK</p>
          <div class="case__chips">${stack.map(s => `<span class="case__chip">${esc(s)}</span>`).join('')}</div>
        </div>` : ''}
      </div>` : '';

    // Problem / Solution — degrade to a single brief when both are absent
    let bodyHtml = '';
    if (problem) bodyHtml += section('// PROBLEM', problem);
    if (solution) bodyHtml += section('// SOLUTION', solution);
    if (!bodyHtml && prj.desc) bodyHtml += section('// BRIEF', prj.desc);

    const outcomeHtml = outcome.length ? `
      <section class="case__sec anim"${step()}>
        <p class="case__label">// OUTCOME</p>
        <ul class="case__out">${outcome.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
      </section>` : '';

    const galHtml = gallery.length ? `
      <section class="case__sec anim"${step()}>
        <p class="case__label">// VISUAL EVIDENCE</p>
        <div class="case__gal">${gallery.map(g =>
          `<img src="${esc(g)}" alt="${esc(prj.title)} evidence" loading="lazy" decoding="async" />`
        ).join('')}</div>
      </section>` : '';

    panel.innerHTML = `
      <span class="case__corner case__corner--tl"></span>
      <span class="case__corner case__corner--tr"></span>
      <span class="case__corner case__corner--bl"></span>
      <span class="case__corner case__corner--br"></span>

      <button class="case__close" type="button" aria-label="Close case file">[ ESC ] CLOSE</button>

      <div class="case__scroll">
        <header class="case__head">
          <p class="case__file anim"${step()}>// FILE ${esc(prj.n)} — DECRYPTED</p>
          <h2 class="case__title anim"${step()}>${esc(prj.title)}</h2>
          ${metaParts.length ? `<p class="case__meta anim"${step()}>${metaHtml}</p>` : ''}
          ${tagline ? `<p class="case__tagline anim"${step()}>${esc(tagline)}</p>` : ''}
        </header>

        <div class="case__rule"></div>

        ${metaGrid}
        ${bodyHtml}
        ${outcomeHtml}
        ${galHtml}

        <div class="case__actions anim"${step()}>
          ${href ? `<a class="case__btn case__btn--primary" href="${esc(href)}" target="_blank" rel="noopener noreferrer">VIEW SOURCE // GITHUB ↗</a>` : ''}
          <button class="case__btn case__btn--ghost" type="button" data-copy-email-btn>COPY EMAIL</button>
        </div>
      </div>
    `;

    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', `Case file ${prj.title}`);
  }

  /* ---------------- Open / Close --------------------------------------------- */

  function open(n) {
    const prj = findProject(n);
    if (!prj) return;

    lastFocus = document.activeElement;
    render(prj);
    root.classList.add('is-open');
    document.documentElement.classList.add('is-case-open');
    isOpenFlag = true;

    const closeBtn = panel.querySelector('.case__close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!isOpenFlag) return;
    isOpenFlag = false;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('is-case-open');

    const el = lastFocus;
    lastFocus = null;
    if (el && el.isConnected && typeof el.focus === 'function') el.focus();
  }

  function isOpen() {
    return isOpenFlag;
  }

  /* ---------------- Events ----------------------------------------------------- */

  // Capture-phase interception of card clicks — beats work-grid's
  // bubble-phase handler, which would window.open the GitHub URL.
  on(document, 'click', e => {
    const card = e.target && e.target.closest ? e.target.closest('.wcard') : null;
    if (!card) return;

    // Ignore clicks that end a field drag (same threshold as work-grid)
    if (hasDown && Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > CONFIG.dragTolerance) return;

    // Map the card back to its dossier via the '// 001' index label
    const numEl = card.querySelector('.wcard__num');
    const m = numEl ? (numEl.textContent || '').match(/(\d+)/) : null;
    if (!m) return;

    const prj = findProject(m[1]);
    if (!prj) return;

    e.preventDefault();
    e.stopPropagation();
    open(prj.n);
  }, true);

  // Track pointer-down position to distinguish clicks from drag releases
  on(document, 'pointerdown', e => {
    downX = e.clientX;
    downY = e.clientY;
    hasDown = true;
  }, true);

  // Esc closes the dossier while it is on screen
  on(document, 'keydown', e => {
    if (e.key !== 'Escape' || !isOpenFlag) return;
    e.preventDefault();
    e.stopPropagation();
    close();
  });

  // Backdrop click closes
  on(root, 'click', e => {
    if (e.target === root) close();
  });

  // Panel delegation: close button + self-contained clipboard copy feedback
  on(panel, 'click', async e => {
    if (e.target.closest('.case__close')) {
      close();
      return;
    }

    const btn = e.target.closest('[data-copy-email-btn]');
    if (!btn) return;

    clearTimeout(copyTimer);
    const ok = await copyText(CONFIG.email);
    btn.textContent = ok ? 'EMAIL // [COPIED]' : 'EMAIL // [FAILED]';
    btn.classList.add('is-copied');
    copyTimer = setTimeout(() => {
      btn.textContent = 'COPY EMAIL';
      btn.classList.remove('is-copied');
    }, CONFIG.copiedHoldMs);
  });

  /* ---------------- Global API --------------------------------------------------- */

  window.CASESTUDY = { open, close, isOpen };

  return function destroy() {
    on.release();
    clearTimeout(copyTimer);
    document.documentElement.classList.remove('is-case-open');
    root.remove();
    if (window.CASESTUDY && window.CASESTUDY.open === open) window.CASESTUDY = null;
  };
});
