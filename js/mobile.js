/* ==========================================================================
   mobile.js — Compact Terminal: mobile entry gate + one-column project feed.
   Converts the desktop-only gate (< 720px) into a real entry screen and
   mounts a vertical archive feed behind it. Gated states only — desktop
   (html without .is-gated) is never touched.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('mobile', function () {
  'use strict';

  const doc = document.documentElement;
  const mql = window.matchMedia('(max-width: 720px)');
  const EMAIL = 'affanshahzada@gmail.com';
  const GITHUB = 'https://github.com/AffanShz';

  let booted = false; // gate reworked + feed built for the current gated phase
  const on = window.PAGE.bindings();

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------------- Entry gate rework ---------------------------------------
     Keeps the logo + foot, shortens the say line and appends a real
     activation button (styled in gate.css like .err__return).
     -------------------------------------------------------------------------- */
  function reworkGate() {
    const gate = document.querySelector('.gate');
    if (!gate || gate.dataset.mobileReady) return;
    gate.dataset.mobileReady = '1';

    const say = gate.querySelector('.gate__say');
    if (say) {
      say.textContent = '';
      say.appendChild(document.createTextNode('COMPACT TERMINAL'));
      say.appendChild(document.createElement('br'));
      say.appendChild(document.createTextNode('TAP TO JACK IN'));
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gate__btn';

    const label = document.createElement('span');
    label.setAttribute('data-label', '');
    label.textContent = 'JACK IN';
    btn.appendChild(label);

    // + mark, same language as the err__return / bar__btn marks
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'gate__mark');
    svg.setAttribute('viewBox', '0 0 6 6.67');
    svg.setAttribute('width', '6');
    svg.setAttribute('height', '6.67');
    svg.setAttribute('fill', 'none');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 0v6.67M0 3.33h6');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '.9');
    svg.appendChild(path);
    btn.appendChild(svg);

    on(btn, 'click', activate);
    gate.appendChild(btn);
  }

  /* ---------------- Jack-in: fade the gate, unlock the terminal ------------- */
  function activate() {
    if (doc.classList.contains('is-mobile-active')) return;
    doc.classList.add('is-mobile-active');
    window.scrollTo(0, 0);

    const gate = document.querySelector('.gate');
    if (!gate) return;
    if (reducedMotion()) {
      gate.classList.add('is-gone');
      return;
    }
    gate.classList.add('is-leaving');
    let done = false;
    const settle = () => {
      if (done) return;
      done = true;
      gate.classList.add('is-gone');
      gate.classList.remove('is-leaving');
    };
    const timer = setTimeout(settle, 500);
    gate.addEventListener('transitionend', function h(e) {
      if (e.target !== gate || done) return;
      clearTimeout(timer);
      gate.removeEventListener('transitionend', h);
      settle();
    });
  }

  /* ---------------- Compact feed -------------------------------------------- */
  function corners(host) {
    ['tl', 'tr', 'bl', 'br'].forEach(c => {
      const i = document.createElement('i');
      i.className = 'mfeed__c mfeed__c--' + c;
      i.setAttribute('aria-hidden', 'true');
      host.appendChild(i);
    });
  }

  function buildCard(prj) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mfeed__card';
    corners(card);

    if (prj.img) {
      const img = document.createElement('img');
      img.className = 'mfeed__img';
      img.src = prj.img;
      img.alt = prj.title + ' // COVER';
      img.loading = 'lazy';
      img.decoding = 'async';
      card.appendChild(img);
    }

    const meta = document.createElement('p');
    meta.className = 'mfeed__metaRow';
    const num = document.createElement('span');
    num.className = 'mfeed__num';
    num.textContent = '//' + prj.n;
    const status = document.createElement('span');
    status.className = 'mfeed__status';
    status.textContent = prj.status || '—';
    const year = document.createElement('span');
    year.className = 'mfeed__year';
    year.textContent = prj.year || '';
    meta.appendChild(num);
    meta.appendChild(status);
    meta.appendChild(year);
    card.appendChild(meta);

    const title = document.createElement('span');
    title.className = 'mfeed__title';
    title.textContent = prj.title || 'UNTITLED FILE';
    card.appendChild(title);

    const cat = document.createElement('span');
    cat.className = 'mfeed__cat';
    cat.textContent = prj.category || '';
    card.appendChild(cat);

    const desc = document.createElement('span');
    desc.className = 'mfeed__desc';
    desc.textContent = prj.desc || '';
    card.appendChild(desc);

    const open = document.createElement('span');
    open.className = 'mfeed__open';
    open.textContent = 'OPEN FILE // TAP TO DECRYPT';
    card.appendChild(open);

    // Dossier overlay when available, source link as fallback
    on(card, 'click', () => {
      if (window.CASESTUDY && typeof window.CASESTUDY.open === 'function') {
        window.CASESTUDY.open(prj.n);
      } else if (prj.url) {
        window.open(prj.url, '_blank', 'noopener');
      }
    });

    return card;
  }

  function buildFeed() {
    if (document.querySelector('.mfeed')) return;
    const main = document.querySelector('main');
    if (!main || !window.PROJECTS || !window.PROJECTS.length) return;

    const feed = document.createElement('div');
    feed.className = 'mfeed';

    const label = document.createElement('p');
    label.className = 'mfeed__label';
    label.textContent = '// PROJECT ARCHIVE';
    feed.appendChild(label);

    window.PROJECTS.forEach(prj => feed.appendChild(buildCard(prj)));

    // Open channel — same data-copy-email mechanism the bar CTA uses
    // (contact-cta binds it as long as mobile.js mounts before it does)
    const chan = document.createElement('div');
    chan.className = 'mfeed__chan';
    corners(chan);

    const clabel = document.createElement('p');
    clabel.className = 'mfeed__label';
    clabel.textContent = '// OPEN CHANNEL';
    chan.appendChild(clabel);

    const mail = document.createElement('button');
    mail.type = 'button';
    mail.className = 'mfeed__btn';
    mail.setAttribute('data-copy-email', EMAIL);
    const mlabel = document.createElement('span');
    mlabel.setAttribute('data-label', '');
    mlabel.textContent = 'INITIATE TRANSMISSION';
    mail.appendChild(mlabel);
    chan.appendChild(mail);

    const gh = document.createElement('a');
    gh.className = 'mfeed__btn';
    gh.href = GITHUB;
    gh.target = '_blank';
    gh.rel = 'noopener';
    const glabel = document.createElement('span');
    glabel.textContent = 'GITHUB // SOURCE ARCHIVE';
    gh.appendChild(glabel);
    chan.appendChild(gh);

    const cmeta = document.createElement('p');
    cmeta.className = 'mfeed__meta';
    cmeta.textContent = 'AFFAN SHAHZADA // MOBILE SOFTWARE ENGINEER // SEMARANG, ID';
    chan.appendChild(cmeta);
    feed.appendChild(chan);

    const end = document.createElement('p');
    end.className = 'mfeed__end';
    end.textContent = '// END OF FEED //';
    feed.appendChild(end);

    main.appendChild(feed);
  }

  /* ---------------- Gated phase flips --------------------------------------- */
  function teardown() {
    doc.classList.remove('is-mobile-active');
    const feed = document.querySelector('.mfeed');
    if (feed) feed.remove();
    const gate = document.querySelector('.gate');
    if (gate) gate.classList.remove('is-leaving', 'is-gone');
  }

  function flip() {
    // gate.js owns the .is-gated class — read it as the source of truth
    if (doc.classList.contains('is-gated')) {
      if (!booted) {
        booted = true;
        reworkGate();
        buildFeed();
      }
    } else {
      teardown();
      booted = false;
    }
  }

  if (doc.classList.contains('is-gated')) {
    booted = true;
    reworkGate();
    buildFeed();
  }

  mql.addEventListener?.('change', flip);

  return function destroy() {
    mql.removeEventListener?.('change', flip);
    on.release();
  };
});
