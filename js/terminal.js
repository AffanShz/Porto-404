/* ==========================================================================
   terminal.js — Secure Shell Easter Egg for the ERROR sector.
   Injects an [OPEN TERMINAL] trigger + social links into .err-room, then
   runs a small in-page shell: help / whoami / projects / open <nn> /
   contact / date / clear / sudo / hack / exit. Command history via
   arrows, Esc to close, body scroll locked while open.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PAGE.register('terminal', function (scope) {
  'use strict';

  const on = window.PAGE.bindings();

  const room = scope.querySelector('.err-room');
  if (!room || room.querySelector('[data-term-trigger]')) return;

  const REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CONTACT = Object.assign({
    email: 'affanshahzada@gmail.com',
    github: 'https://github.com/AffanShz'
  }, window.CONTACT || {});

  const PROMPT = 'affanshz@terra:~$ ';
  const TITLE = 'AFFANSHZ // SECURE SHELL v2.6';

  let panel = null, input = null, body = null;
  let open = false, prevOverflow = '', prevFocus = null;
  let hist = [], histIdx = 0;
  let hackTimers = [];

  /* ---------------- Injected chrome: trigger + social row ---------------- */

  const anchor = room.querySelector('.err__return');

  const social = document.createElement('div');
  social.className = 'term-social';
  [['// GITHUB', CONTACT.github], ['// EMAIL', 'mailto:' + CONTACT.email]]
    .forEach(([label, href]) => {
      const a = document.createElement('a');
      a.className = 'term-social__link';
      a.href = href;
      a.textContent = label;
      if (/^https:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
      social.appendChild(a);
    });

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'term-trigger';
  trigger.dataset.termTrigger = '';
  trigger.setAttribute('aria-label', 'Open secure terminal');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.textContent = '[OPEN TERMINAL]';

  if (anchor && anchor.parentNode) {
    anchor.after(trigger, social);
  } else {
    room.appendChild(trigger);
    room.appendChild(social);
  }

  /* ---------------- Output helpers --------------------------------------- */

  function line(text, cls) {
    const div = document.createElement('div');
    div.className = 'term__row' + (cls ? ' term__row--' + cls : '');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function lines(list) {
    list.forEach(l => line(typeof l === 'string' ? l : l.t, l.c));
  }


  /* ---------------- Commands --------------------------------------------- */

  function cmdHelp() {
    lines([
      { t: 'AVAILABLE COMMANDS //', c: 'dim' },
      '  help            list commands',
      '  whoami          operative profile',
      '  projects        list archive entries',
      '  open <nn>       open project source (e.g. open 001)',
      '  contact         transmission channels',
      '  date            system clock',
      '  clear           wipe terminal',
      '  exit            close secure shell'
    ]);
  }

  function cmdWhoami() {
    lines([
      { t: 'OPERATIVE PROFILE //', c: 'dim' },
      '  NAME       : AFFAN SHAHZADA',
      '  ALIAS      : AFFANSHZ',
      '  ROLE       : MOBILE / CREATIVE ENGINEER',
      '  LOCATION   : SEMARANG, ID // GMT+7',
      '  CLEARANCE  : LEVEL 5 (COFFEE-BASED, NON-TRANSFERABLE)'
    ]);
  }

  function cmdProjects() {
    const P = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    if (!P.length) { line('ARCHIVE OFFLINE // NO PROJECTS LOADED', 'red'); return; }
    line('PROJECT ARCHIVE // ' + P.length + ' ENTRIES', 'dim');
    P.forEach(p => line('  [' + p.n + '] ' + (p.title || 'UNNAMED') +
      ' // ' + (p.category || 'UNCLASSIFIED')));
  }

  function cmdOpen(arg) {
    const P = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    const p = P.find(x => String(x.n) === String(arg));
    if (!p || !p.url) {
      line('UNKNOWN TARGET // ' + (arg || '???') + ' // RUN projects', 'red');
      return;
    }
    window.open(p.url, '_blank', 'noopener');
    line('LAUNCHING [' + p.n + '] ' + (p.title || '') + ' // NEW TAB', 'ok');
  }

  function cmdContact() {
    lines([
      { t: 'TRANSMISSION CHANNELS //', c: 'dim' },
      '  EMAIL  : ' + CONTACT.email,
      '  GITHUB : ' + CONTACT.github
    ]);
  }

  function cmdDate() {
    line('SYSTEM CLOCK // ' + new Date().toString().toUpperCase());
  }

  function cmdSudo() {
    line('PERMISSION DENIED // NICE TRY', 'red');
  }

  function cmdHack() {
    const seq = [
      'BYPASSING FIREWALL ... OK',
      'INJECTING PAYLOAD ... OK',
      'CRACKING HASH 0x8F2A ... 47%',
      'CRACKING HASH 0x8F2A ... 92%',
      'ROOT ACCESS GRANTED',
      'DOWNLOADING ENTIRE INTERNET ... 0.0002%'
    ];
    line('INITIATING MAINFRAME BREACH //', 'dim');
    if (REDUCED) {
      seq.forEach(t => line(t));
      return line('JUST KIDDING // STAY ETHICAL', 'red');
    }
    seq.forEach((t, i) => {
      hackTimers.push(setTimeout(() => line(t), 260 * (i + 1)));
    });
    hackTimers.push(setTimeout(() => {
      line('JUST KIDDING // STAY ETHICAL', 'red');
    }, 260 * (seq.length + 1)));
  }

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    line(PROMPT + text, 'cmd');
    if (raw !== hist[hist.length - 1]) hist.push(raw);
    histIdx = hist.length;

    const sp = text.indexOf(' ');
    const cmd = (sp === -1 ? text : text.slice(0, sp)).toLowerCase();
    const arg = sp === -1 ? '' : text.slice(sp + 1).trim();

    switch (cmd) {
      case 'help':     cmdHelp(); break;
      case 'whoami':   cmdWhoami(); break;
      case 'projects': cmdProjects(); break;
      case 'open':     cmdOpen(arg); break;
      case 'contact':  cmdContact(); break;
      case 'date':     cmdDate(); break;
      case 'sudo':     cmdSudo(); break;
      case 'hack':     cmdHack(); break;
      case 'clear':    body.textContent = ''; break;
      case 'exit':
      case 'close':    close(); break;
      default:         line('COMMAND NOT RECOGNIZED // TYPE help', 'red');
    }
  }

  /* ---------------- Panel build / open / close ---------------------------- */

  function build() {
    panel = document.createElement('div');
    panel.className = 'term';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', TITLE);

    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
      const c = document.createElement('i');
      c.className = 'term__c term__c--' + pos;
      c.setAttribute('aria-hidden', 'true');
      panel.appendChild(c);
    });

    const title = document.createElement('div');
    title.className = 'term__title';
    title.textContent = TITLE;
    const hint = document.createElement('span');
    hint.className = 'term__titleHint';
    hint.textContent = '[ESC TO CLOSE]';
    title.appendChild(hint);

    body = document.createElement('div');
    body.className = 'term__body';

    const row = document.createElement('div');
    row.className = 'term__line';
    const prompt = document.createElement('span');
    prompt.className = 'term__prompt';
    prompt.textContent = PROMPT;
    prompt.setAttribute('aria-hidden', 'true');
    input = document.createElement('input');
    input.className = 'term__input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', 'Terminal command input');
    input.placeholder = 'type help';
    row.appendChild(prompt);
    row.appendChild(input);

    panel.append(title, body, row);
    document.body.appendChild(panel);

    on(input, 'keydown', e => {
      if (e.key === 'Enter') {
        run(input.value);
        input.value = '';
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        if (histIdx > 0) input.value = hist[--histIdx] || '';
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (histIdx < hist.length) input.value = hist[++histIdx] || '';
        e.preventDefault();
      } else if (e.key === 'Escape') {
        close();
        e.preventDefault();
      }
    });

    on(panel, 'click', () => { if (open) input.focus(); });
    on(document, 'keydown', e => { if (open && e.key === 'Escape') close(); });
  }

  function boot() {
    lines([
      { t: TITLE, c: 'red' },
      'CONNECTION ESTABLISHED // NODE: TERRA-062-X',
      { t: 'UNAUTHORIZED ACCESS IS LOGGED AND MOCKED. TYPE help.', c: 'dim' }
    ]);
  }

  function openTerm() {
    if (open) return;
    if (!panel) build();
    open = true;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    prevFocus = document.activeElement;
    panel.style.display = '';
    boot();
    trigger.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  function close() {
    if (!open) return;
    open = false;
    hackTimers.forEach(clearTimeout);
    hackTimers = [];
    document.body.style.overflow = prevOverflow;
    panel.style.display = 'none';
    body.textContent = '';
    trigger.setAttribute('aria-expanded', 'false');
    if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
    else trigger.focus();
  }

  on(trigger, 'click', openTerm);

  return function destroy() {
    hackTimers.forEach(clearTimeout);
    hackTimers = [];
    on.release();
    if (panel) panel.remove();
    if (open) document.body.style.overflow = prevOverflow;
    social.remove();
    trigger.remove();
  };
});
