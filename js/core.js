/* Serie — núcleo: estado, utilidades, hojas (sheets), avisos, cronómetro y descanso */
(function (G) {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const parseKey = (k) => { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  const dayIdx = (d) => ((d || new Date()).getDay() + 6) % 7;
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const DAYS_S = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fmtDur = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? h + ':' + pad(m) + ':' + pad(x) : m + ':' + pad(x); };
  const fmtLong = (k) => { const d = parseKey(k); return DAYS[dayIdx(d)].toLowerCase() + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()]; };
  const fmtShort = (k) => { const d = parseKey(k); return DAYS_S[dayIdx(d)] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3); };
  const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
  const fmtN = (n) => { n = Math.round(n * 100) / 100; return String(n).replace('.', ','); };
  Object.assign(G, { $, $$, esc, uid, pad, dkey, parseKey, dayIdx, DAYS, DAYS_S, MONTHS, fmtDur, fmtLong, fmtShort, num, fmtN });

  /* ---------- iconos ---------- */
  const IC = {
    home: 'M3 11l9-8 9 8M5 10v10h14V10', list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    cal: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5', chart: 'M4 20V4M4 20h16M8 16v-5M13 16V8M18 16v-9',
    more: 'M5 12h.01M12 12h.01M19 12h.01', timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2 2M9 2h6',
    plus: 'M12 5v14M5 12h14', check: 'M5 12l5 5L20 7', x: 'M6 6l12 12M18 6L6 18',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', play: 'M7 4l13 8-13 8z',
    pause: 'M8 5v14M16 5v14', flag: 'M5 21V4M5 4h12l-2 4 2 4H5', chev: 'M9 6l6 6-6 6', up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6',
    copy: 'M9 9h11v11H9zM5 15V5h10', dumbbell: 'M2 9v6M5 6v12M19 6v12M22 9v6M5 12h14', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
    down2: 'M12 3v12M7 10l5 5 5-5M4 21h16', up2: 'M12 15V3M7 8l5-5 5 5M4 21h16', bell: 'M6 17v-6a6 6 0 1 1 12 0v6l2 2H4zM10 21h4',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    camera: 'M4 8h4l2-3h4l2 3h4v12H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6',
    trophy: 'M8 4h8v6a4 4 0 0 1-8 0zM8 6H4c0 3 1 5 4 5M16 6h4c0 3-1 5-4 5M12 14v4M8 20h8',
    flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z', scale: 'M5 4h14l2 16H3zM9 9a3 3 0 0 1 6 0',
    info: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', calc: 'M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01',
    share: 'M12 3v12M8 7l4-4 4 4M5 13v8h14v-8', warm: 'M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z', undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3'
  };
  G.ic = (n, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n] || ''}"/></svg>`;
  G.icFill = (n) => `<svg class="ic fill" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n]}"/></svg>`;

  /* ---------- estado y persistencia ---------- */
  const KEY = 'serie.v1';
  const DEF = () => ({
    v: 1,
    settings: { theme: 'system', unit: 'kg', rest: 90, sound: true, vibrate: true, goal: 3, bar: 20, wake: true },
    profile: { h: 0, age: 0, sex: '' }, retos: [], flags: {}, custom: [], fav: [], routines: [], schedule: [], history: [], notes: {}, body: [], photos: [],
    ach: {}, rem: {}, session: null, sw: { run: false, base: 0, start: 0, laps: [], act: 'pesas-m' }, rest: null
  });
  let S = DEF();
  G.persist = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const o = JSON.parse(raw);
      S = Object.assign(DEF(), o);
      S.settings = Object.assign(DEF().settings, o.settings || {});
      S.sw = Object.assign(DEF().sw, o.sw || {});
    }
  } catch (e) { G.persist = false; }
  G.S = () => S;
  G.setState = (o) => { S = Object.assign(DEF(), o); S.settings = Object.assign(DEF().settings, o.settings || {}); S.sw = Object.assign(DEF().sw, o.sw || {}); G.save(true); };
  let saveT = null;
  G.save = (now) => {
    if (G.onSave) G.onSave();
    const w = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { G.persist = false; } };
    if (now) { clearTimeout(saveT); saveT = null; w(); return; }
    clearTimeout(saveT); saveT = setTimeout(() => { saveT = null; w(); }, 200);
  };
  const flush = () => { if (saveT) G.save(true); };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  /* ---------- fotos (IndexedDB con respaldo en memoria) ---------- */
  G.photos = {
    db: null, ok: false, mem: [],
    open() {
      return new Promise((res) => {
        try {
          const r = indexedDB.open('serie-fotos', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('p', { keyPath: 'id' });
          r.onsuccess = () => { this.db = r.result; this.ok = true; res(true); };
          r.onerror = () => res(false); r.onblocked = () => res(false);
        } catch (e) { res(false); }
      });
    },
    all() {
      if (!this.ok) return Promise.resolve(this.mem.slice());
      return new Promise((res) => { const q = this.db.transaction('p').objectStore('p').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); });
    },
    put(o) {
      if (!this.ok) { this.mem.push(o); return Promise.resolve(); }
      return new Promise((res) => { const t = this.db.transaction('p', 'readwrite'); t.objectStore('p').put(o); t.oncomplete = () => res(); t.onerror = () => res(); });
    },
    del(id) {
      if (!this.ok) { this.mem = this.mem.filter((p) => p.id !== id); return Promise.resolve(); }
      return new Promise((res) => { const t = this.db.transaction('p', 'readwrite'); t.objectStore('p').delete(id); t.oncomplete = () => res(); t.onerror = () => res(); });
    },
    clear() {
      if (!this.ok) { this.mem = []; return Promise.resolve(); }
      return new Promise((res) => { const t = this.db.transaction('p', 'readwrite'); t.objectStore('p').clear(); t.oncomplete = () => res(); t.onerror = () => res(); });
    }
  };

  /* ---------- ejercicios (propios + biblioteca) ---------- */
  G.allEx = () => G.EX.concat(S.custom);
  G.ex = (id) => G.exMap[id] || S.custom.find((e) => e.id === id) || { id, n: 'Ejercicio eliminado', g: 'Core', m: [], s: [], eq: '', lv: '', d: '', t: [], k: 'reps', gone: true };
  G.exFig = (ex, u, opts) => {
    if (ex.photo) return `<img class="fig photo" src="${ex.photo}" alt="${esc(ex.n)}">`;
    return G.fig.svg(ex.id, u || 0, opts);
  };

  /* ---------- tema ---------- */
  G.applyTheme = () => {
    const t = S.settings.theme;
    const dark = t === 'dark' || (t === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', dark ? '#121315' : '#e7e9ec');
  };

  /* ---------- hojas (sheets), diálogos y avisos ---------- */
  /* Historial del navegador: mientras haya alguna hoja abierta existe UNA entrada «centinela»,
     así el botón Atrás del teléfono cierra la hoja de arriba en vez de salir de la app. */
  const sheets = []; let canHist = true, pendingBack = 0, pos = 0;
  const readPos = () => (history.state && history.state.sheet ? 1 : 0);
  try { if (readPos()) history.replaceState(null, ''); } catch (e) { canHist = false; }
  function sync() {
    if (!canHist) return;
    try {
      if (sheets.length && pos === 0) { history.pushState({ sheet: 1 }, ''); pos = 1; }
      else if (!sheets.length && pos === 1) { pos = 0; pendingBack++; history.back(); }
    } catch (e) { canHist = false; pendingBack = 0; }
  }
  function destroy(c) {
    const i = sheets.indexOf(c); if (i < 0) return;
    sheets.splice(i, 1); c.el.classList.remove('in');
    document.body.classList.toggle('sheet-open', sheets.length > 0);
    setTimeout(() => c.el.remove(), 200);
    if (c.onClose) try { c.onClose(); } catch (e) { console.error(e); }
  }
  G.sheet = (html, o) => {
    o = o || {};
    const el = document.createElement('div');
    el.className = 'sheet-wrap' + (o.full ? ' full' : '');
    el.innerHTML = `<div class="scrim" data-act="sheet-close"></div><div class="sheet ${o.cls || ''}" role="dialog" aria-modal="true" aria-label="${esc(o.title || '')}">` +
      (o.bare ? '' : `<div class="sheet-head"><h2>${esc(o.title || '')}</h2>${o.headRight || ''}<button class="icon-btn" data-act="sheet-close" aria-label="Cerrar">${G.ic('x')}</button></div>`) +
      `<div class="sheet-body">${html}</div></div>`;
    $('#layer').appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    const c = { el, body: $('.sheet-body', el), onClose: o.onClose,
      set(h) { this.body.innerHTML = h; },
      close() { closeSheet(this); } };
    sheets.push(c);
    document.body.classList.add('sheet-open');
    sync();
    return c;
  };
  function closeSheet(c) {
    if (sheets.indexOf(c) < 0) return;
    destroy(c); sync();
  }
  G.closeTop = () => { const c = sheets[sheets.length - 1]; if (c) closeSheet(c); };
  G.openSheets = () => sheets.length;
  window.addEventListener('popstate', () => {
    if (pendingBack > 0) { pendingBack--; if (pendingBack === 0) { pos = readPos(); sync(); } return; }
    pos = readPos();
    const c = sheets[sheets.length - 1]; if (c) destroy(c);
    sync();
  });
  G.confirm = (msg, o) => {
    o = o || {};
    return new Promise((res) => {
      let done = false;
      const end = (v) => { done = true; document.body.classList.remove('dlg-open'); res(v); };
      document.body.classList.add('dlg-open');
      const c = G.sheet(`<p class="dlg-msg">${esc(msg)}</p>${o.detail ? `<p class="muted small">${esc(o.detail)}</p>` : ''}<div class="btn-row"><button class="btn ghost" data-dlg="0">${esc(o.cancel || 'Cancelar')}</button><button class="btn ${o.danger ? 'danger' : 'primary'}" data-dlg="1">${esc(o.ok || 'Aceptar')}</button></div>`,
        { title: o.title || 'Confirmar', cls: 'dialog', onClose: () => { if (!done) end(false); } });
      c.el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-dlg]'); if (!b || done) return;
        end(b.dataset.dlg === '1'); c.close();
      });
    });
  };
  G.toast = (msg, o) => {
    o = o || {};
    const box = $('#toasts'); if (!box) return;
    const t = document.createElement('div'); t.className = 'toast' + (o.kind ? ' ' + o.kind : '');
    t.innerHTML = `<span>${esc(msg)}</span>` + (o.act ? `<button class="toast-act">${esc(o.act)}</button>` : '');
    if (o.act) t.querySelector('button').onclick = () => { try { o.fn(); } catch (e) { console.error(e); } t.remove(); };
    while (box.children.length >= 2) box.firstChild.remove();
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), o.ms || 3200);
    setTimeout(() => t.remove(), (o.ms || 3200) + 300);
  };

  /* ---------- eventos delegados ---------- */
  G.act = {}; G.inp = {}; G.chg = {};
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const f = G.act[t.dataset.act];
    if (f) { if (t.tagName === 'A') e.preventDefault(); try { f(t, e); } catch (err) { console.error(err); } }
  });
  document.addEventListener('input', (e) => { const t = e.target.closest('[data-in]'); if (t && G.inp[t.dataset.in]) try { G.inp[t.dataset.in](t, e); } catch (err) { console.error(err); } });
  document.addEventListener('change', (e) => { const t = e.target.closest('[data-ch]'); if (t && G.chg[t.dataset.ch]) try { G.chg[t.dataset.ch](t, e); } catch (err) { console.error(err); } });
  G.act['sheet-close'] = () => G.closeTop();

  /* ---------- sonido y vibración ---------- */
  let actx = null;
  G.unlock = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} };
  document.addEventListener('pointerdown', G.unlock, { passive: true });
  G.beep = (n) => {
    if (!S.settings.sound || !actx) return;
    try {
      for (let i = 0; i < (n || 3); i++) {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.28;
        o.type = 'sine'; o.frequency.value = i === (n || 3) - 1 ? 1175 : 880;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.25);
      }
    } catch (e) {}
  };
  G.vibrate = (p) => { if (S.settings.vibrate && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} };

  /* ---------- cronómetro ---------- */
  G.sw = {
    ms() { const s = S.sw; return s.base + (s.run ? Date.now() - s.start : 0); },
    toggle() { const s = S.sw; if (s.run) { s.base += Date.now() - s.start; s.run = false; } else { s.start = Date.now(); s.run = true; } G.save(); },
    lap() { if (this.ms() <= 0) return; S.sw.laps.push(this.ms()); G.save(); },
    reset() { S.sw = { run: false, base: 0, start: 0, laps: [], act: S.sw.act }; G.save(); }
  };
  const fmtSW = (ms) => { const t = Math.floor(ms / 100); const d = t % 10, s = Math.floor(t / 10) % 60, m = Math.floor(t / 600); return pad(m) + ':' + pad(s) + '<small>.' + d + '</small>'; };
  G.fmtSW = fmtSW;

  /* ---------- descanso (temporizador) ---------- */
  G.rest = {
    start(sec, label) { S.rest = { end: Date.now() + sec * 1000, total: sec, label: label || 'Descanso', done: false }; G.save(); G.unlock(); tick(); },
    add(sec) { if (!S.rest) return; S.rest.end += sec * 1000; S.rest.total = Math.max(1, S.rest.total + sec); S.rest.done = false; G.save(); tick(); },
    stop() { S.rest = null; G.save(); tick(); },
    left() { return S.rest ? Math.max(0, S.rest.end - Date.now()) : 0; }
  };
  const RING = 2 * Math.PI * 20;
  function renderRest() {
    let el = $('#restbar'); const r = S.rest;
    if (!r) { if (el) el.remove(); return; }
    const left = G.rest.left() / 1000, frac = r.total ? Math.min(1, left / r.total) : 0;
    if (!el) {
      el = document.createElement('div'); el.id = 'restbar'; el.className = 'restbar';
      el.innerHTML = `<svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="ring-bg" cx="24" cy="24" r="20"/><circle class="ring-fg" cx="24" cy="24" r="20" stroke-dasharray="${RING}" transform="rotate(-90 24 24)"/></svg>` +
        `<div class="rb-txt"><b id="rb-time">0:00</b><span id="rb-label"></span></div>` +
        `<button class="btn small ghost" data-act="rest-add" data-n="-15" aria-label="Restar 15 segundos">−15</button><button class="btn small ghost" data-act="rest-add" data-n="15" aria-label="Sumar 15 segundos">+15</button>` +
        `<button class="btn small primary" data-act="rest-stop" id="rb-stop">Saltar</button>`;
      $('#layer').appendChild(el);
    }
    el.classList.toggle('done', r.done);
    $('.ring-fg', el).style.strokeDashoffset = String(RING * (1 - frac));
    $('#rb-time', el).textContent = r.done ? '¡Listo!' : fmtDur(Math.ceil(left));
    $('#rb-label', el).textContent = r.label;
    $('#rb-stop', el).textContent = r.done ? 'Cerrar' : 'Saltar';
  }
  G.act['rest-add'] = (t) => G.rest.add(+t.dataset.n);
  G.act['rest-stop'] = () => G.rest.stop();

  /* ---------- reloj general ---------- */
  function tick() {
    // fin del descanso
    if (S.rest && !S.rest.done && G.rest.left() <= 0) {
      S.rest.done = true; G.save(); G.beep(3); G.vibrate([250, 120, 250, 120, 400]);
      const end = S.rest.end; setTimeout(() => { if (S.rest && S.rest.end === end && S.rest.done) G.rest.stop(); }, 6000);
    }
    renderRest();
    // chip del encabezado
    const chip = $('#chip-time');
    if (chip) {
      if (S.rest && !S.rest.done) chip.textContent = fmtDur(Math.ceil(G.rest.left() / 1000));
      else if (S.sw.run) chip.textContent = fmtDur(G.sw.ms() / 1000);
      else chip.textContent = '';
      $('#chip').classList.toggle('live', !!chip.textContent);
    }
    const sw = $('#sw-time'); if (sw) sw.innerHTML = fmtSW(G.sw.ms());
    const we = $('#wk-elapsed'); if (we && S.session) we.textContent = fmtDur((Date.now() - S.session.startedAt) / 1000);
    const wk = $('#wk-kcal'); if (wk && wk.dataset.on && S.session) wk.textContent = '≈ ' + Math.round(G.kcalSession(S.session.items, (Date.now() - S.session.startedAt) / 1000)) + ' kcal';
    const sk = $('#sw-kcal'); if (sk && sk.dataset.on) sk.textContent = '≈ ' + Math.round(G.kcalAct(S.sw.act, G.sw.ms())) + ' kcal';
  }
  G.tick = tick;
  setInterval(tick, 250);

  /* ---------- notificaciones y recordatorios ---------- */
  G.notifSupported = () => 'Notification' in window && !(G.isNative && G.isNative());
  // 'granted' | 'default' | 'denied' | 'unsupported' (web y app Android por igual)
  G.notifState = () => (G.isNative && G.isNative() ? G.nperm : G.notifSupported() ? Notification.permission : 'unsupported');
  G.notify = (title, body) => {
    G.toast(title + (body ? ' · ' + body : ''), { ms: 6000 });
    G.beep(2); G.vibrate([200, 100, 200]);
    try {
      if (G.notifSupported() && Notification.permission === 'granted') {
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
          navigator.serviceWorker.getRegistration().then((r) => { if (r && r.showNotification) r.showNotification(title, { body, icon: 'icons/icon-192.png', tag: 'serie' }); else new Notification(title, { body }); }).catch(() => { try { new Notification(title, { body }); } catch (e) {} });
        } else new Notification(title, { body });
      }
    } catch (e) {}
  };
  G.checkReminders = () => {
    const now = new Date(), today = dkey(now), di = dayIdx(now);
    // limpia avisos viejos
    Object.keys(S.rem).forEach((k) => { if (k.split('|')[1] !== today) delete S.rem[k]; });
    S.schedule.forEach((sl) => {
      if (sl.remind < 0 || sl.days.indexOf(di) < 0) return;
      const hm = sl.time.split(':').map(Number);
      const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hm[0], hm[1]).getTime();
      const key = sl.id + '|' + today;
      if (S.rem[key]) return;
      if (Date.now() >= t - sl.remind * 60000 && Date.now() < t + 3600000) {
        S.rem[key] = 1; G.save();
        const r = S.routines.find((x) => x.id === sl.routine);
        G.notify(sl.remind ? 'Entrenas en ' + sl.remind + ' min' : 'Es hora de entrenar', r ? r.name + ' · ' + sl.time : sl.time);
      }
    });
  };
  setInterval(() => G.checkReminders(), 30000);

  /* ---------- pantalla encendida durante el entrenamiento ---------- */
  let wl = null;
  G.keepAwake = async (on) => {
    try {
      if (on && S.settings.wake && navigator.wakeLock) { wl = await navigator.wakeLock.request('screen'); }
      else if (wl) { await wl.release(); wl = null; }
    } catch (e) { wl = null; }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.session && S.settings.wake) G.keepAwake(true); });
})((window.G = window.G || {}));
