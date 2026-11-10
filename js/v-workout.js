/* Serie — pantalla de entrenamiento: registro de series, descanso automático, récords y resumen */
(function (G) {
  'use strict';
  const { esc, ic, num, fmtN, fmtDur, fmtShort } = G;
  const S = () => G.S();
  const sess = () => S().session;

  function prevSets(it) { const l = G.lastEx(it.ex); return l ? l.sets : []; }
  const setTxt = (it, s) => (it.k === 'time' ? fmtN(num(s.r)) + ' s' : (num(s.w) ? fmtN(num(s.w)) + ' × ' : '') + fmtN(num(s.r)));

  function itemHTML(i) {
    const se = sess(), it = se.items[i], ex = G.ex(it.ex), u = S().settings.unit, prev = prevSets(it), flags = G.prFlags(it);
    const next = se.items[i + 1], linkedNext = it.ss && next, linkedPrev = i > 0 && se.items[i - 1].ss;
    const time = it.k === 'time';
    const rows = it.sets.map((s, j) => {
      const p = prev[j] || prev[prev.length - 1];
      return `<div class="set-row ${s.done ? 'done' : ''}"><span class="set-n" ${flags[j] ? 'title="Récord" aria-label="Serie ' + (j + 1) + ', récord"' : ''}>${flags[j] ? G.icFill('star') : j + 1}</span><span class="set-prev muted">${p ? esc(setTxt(it, p)) : '—'}</span>` +
        (time ? '' : `<input class="in-w" inputmode="decimal" data-in="wk-w" data-i="${i}" data-j="${j}" value="${esc(s.w)}" placeholder="${p && num(p.w) ? fmtN(num(p.w)) : ''}" aria-label="Peso de la serie ${j + 1}">`) +
        `<input class="in-r" inputmode="numeric" data-in="wk-r" data-i="${i}" data-j="${j}" value="${esc(s.r)}" placeholder="${p ? fmtN(num(p.r)) : ''}" aria-label="${time ? 'Segundos' : 'Repeticiones'} de la serie ${j + 1}">` +
        `<button class="set-ok" data-act="wk-done" data-i="${i}" data-j="${j}" aria-label="${s.done ? 'Desmarcar' : 'Marcar'} serie ${j + 1}" aria-pressed="${s.done}">${ic('check')}</button></div>`;
    }).join('');
    const last = prev.length ? 'Última vez: ' + prev.map((s) => setTxt(it, s)).join(' · ') : 'Primera vez que lo registras';
    return `<section class="wk-ex ${time ? 'time' : ''} ${linkedNext ? 'ss-down' : ''} ${linkedPrev ? 'ss-up' : ''}" id="wk-ex-${i}">
      ${linkedPrev ? '<p class="ss-tag">Superserie</p>' : ''}
      <div class="wk-ex-head"><button class="thumb" data-act="wk-info" data-i="${i}" aria-label="Ver técnica de ${esc(ex.n)}">${G.exFig(ex, 0, { ghost: 1 })}</button>
        <div class="wk-ex-t"><b>${esc(ex.n)}</b><span class="muted small">Objetivo ${it.sets.length} × ${esc(it.target || '—')}${time ? '\u00A0s' : ''} · descanso ${it.rest}\u00A0s</span></div>
        <button class="icon-btn" data-act="wk-menu" data-i="${i}" aria-label="Opciones de ${esc(ex.n)}">${ic('more')}</button></div>
      <p class="muted small">${esc(last)}</p>${S().notes[it.ex] ? `<p class="note-line">${esc(S().notes[it.ex])}</p>` : ''}
      <div class="set-head"><span>Serie</span><span>Anterior</span>${time ? '' : `<span>${u}</span>`}<span>${time ? 'Seg' : 'Reps'}</span><span></span></div>${rows}
      <div class="btn-row"><button class="btn small ghost" data-act="wk-addset" data-i="${i}">${ic('plus')} Serie</button>${it.sets.length > 1 ? `<button class="btn small ghost" data-act="wk-delset" data-i="${i}" aria-label="Quitar última serie">Quitar serie</button>` : ''}</div>
    </section>`;
  }

  G.warmStretch = (mus) => {
    if (!mus.length) return { warm: '', stretch: '' };
    const warm = `<details class="wk-box"><summary>${ic('warm')} Calentamiento</summary><div class="rows">` +
      G.WARMUP_GENERAL.map((w) => `<div class="row"><span class="row-main"><b>${esc(w.t)}</b><span class="muted small">${esc(w.d)}</span></span><button class="btn small ghost" data-act="tm-go" data-s="${w.s}" data-l="${esc(w.t)}">${ic('timer')} ${fmtDur(w.s)}</button></div>`).join('') +
      mus.slice(0, 6).map((m) => `<div class="row"><span class="row-main"><b>${esc(G.MUSCLES[m])}</b><span class="muted small">${esc(G.WARMUP[m] || '')}</span></span></div>`).join('') +
      `<div class="row"><span class="muted small">${esc(G.WARMUP_SET)}</span></div></div></details>`;
    const stretch = `<details class="wk-box"><summary>${ic('flag')} Estiramientos al terminar</summary><div class="rows">` +
      mus.slice(0, 8).map((m) => { const s = G.STRETCH[m]; return s ? `<div class="row"><span class="row-main"><b>${esc(G.MUSCLES[m])}</b><span class="muted small">${esc(s[0])} · ${s[1]} s</span></span><button class="btn small ghost" data-act="tm-go" data-s="${s[1]}" data-l="Estiramiento">${ic('timer')} ${s[1]} s</button></div>` : ''; }).join('') + `</div></details>`;
    return { warm, stretch };
  };

  function wkHTML() {
    const se = sess(), mus = [];
    se.items.forEach((it) => G.ex(it.ex).m.forEach((m) => { if (!mus.includes(m)) mus.push(m); }));
    const ws = G.warmStretch(mus);
    return `<header class="wk-head"><button class="icon-btn" data-act="wk-min" aria-label="Minimizar el entrenamiento">${ic('down')}</button><div class="wk-title"><b>${esc(se.name)}</b><span class="wk-sub"><span class="num" id="wk-elapsed">${fmtDur((Date.now() - se.startedAt) / 1000)}</span>${G.weightKg() > 0 ? ` · <span class="num" id="wk-kcal" data-on="1">≈ ${Math.round(G.kcalSession(se.items, (Date.now() - se.startedAt) / 1000))} kcal</span>` : ` · <button class="link" data-act="profile-open">Añade tu peso</button>`}</span></div><button class="icon-btn" data-act="open-timer" data-tab="sw" aria-label="Cronómetro">${ic('timer')}</button><button class="btn small primary" data-act="wk-finish">Finalizar</button></header>
      <div class="wk-body">${ws.warm}${G.retosBox(false)}${se.items.map((_, i) => itemHTML(i)).join('')}
        <button class="btn ghost block" data-act="wk-add">${ic('plus')} Añadir ejercicio</button>${ws.stretch}
        <div class="btn-row"><button class="btn danger-ghost grow" data-act="wk-discard">Descartar entrenamiento</button></div></div>`;
  }
  const wkRefresh = () => { if (G._wk) { const sc = G._wk.body.scrollTop; G._wk.set(wkHTML()); G._wk.body.scrollTop = sc; } };
  const itemRefresh = (i) => { const el = G.$('#wk-ex-' + i); if (el) { const tmp = document.createElement('div'); tmp.innerHTML = itemHTML(i); el.replaceWith(tmp.firstElementChild); } };

  G.openWorkout = () => {
    if (!sess()) return;
    if (G._wk && document.body.contains(G._wk.el)) return;
    G._wk = G.sheet(wkHTML(), { bare: true, full: true, cls: 'workout', onClose: () => { G._wk = null; G.keepAwake(false); G.render(); } });
    G.keepAwake(true);
  };
  G.act['wk-min'] = () => { if (G._wk) G._wk.close(); };
  G.act['tm-go'] = (t) => { G.rest.start(+t.dataset.s, t.dataset.l); G.toast('Temporizador iniciado'); };

  /* entradas */
  G.inp['wk-w'] = (t) => { sess().items[+t.dataset.i].sets[+t.dataset.j].w = t.value; G.save(); };
  G.inp['wk-r'] = (t) => { sess().items[+t.dataset.i].sets[+t.dataset.j].r = t.value; G.save(); };

  G.act['wk-done'] = (t) => {
    const i = +t.dataset.i, j = +t.dataset.j, it = sess().items[i], s = it.sets[j], prev = prevSets(it);
    if (s.done) { s.done = false; G.save(); itemRefresh(i); return; }
    const p = prev[j] || prev[prev.length - 1];
    if (String(s.r).trim() === '' && p) s.r = String(p.r);
    if (it.k !== 'time' && String(s.w).trim() === '' && p && num(p.w)) s.w = String(p.w);
    if (num(s.r) <= 0) { G.toast(it.k === 'time' ? 'Escribe los segundos' : 'Escribe las repeticiones'); return; }
    const before = G.prFlags(it)[j];
    s.done = true;
    const after = G.prFlags(it)[j];
    G.save(); itemRefresh(i);
    if (after && !before) { G.toast('¡Récord en ' + G.ex(it.ex).n + '!', { kind: 'pr', ms: 4000 }); G.vibrate([80, 60, 80]); }
    if (!it.ss) G.rest.start(it.rest, G.ex(it.ex).n);
  };
  G.act['wk-addset'] = (t) => { const i = +t.dataset.i, it = sess().items[i]; it.sets.push({ w: '', r: '', done: false }); G.save(); itemRefresh(i); };
  G.act['wk-delset'] = (t) => { const i = +t.dataset.i, it = sess().items[i]; if (it.sets.length > 1) it.sets.pop(); G.save(); itemRefresh(i); };
  G.act['wk-info'] = (t) => G.openExercise(sess().items[+t.dataset.i].ex);
  G.act['wk-add'] = () => G.openPicker((ids) => {
    ids.forEach((id) => { const ex = G.ex(id); sess().items.push({ ex: id, k: ex.k, sets: [0, 1, 2].map(() => ({ w: '', r: '', done: false })), note: '', rest: S().settings.rest, ss: false, target: ex.k === 'time' ? '30' : '10', pb: G.bestEx(id) }); });
    G.save(); wkRefresh();
  });
  G.act['wk-menu'] = (t) => {
    const i = +t.dataset.i, it = sess().items[i], ex = G.ex(it.ex); G._wm = i;
    const rest = [30, 45, 60, 90, 120, 150, 180, 240];
    const c = G.sheet(`<p class="muted small">Descanso de este ejercicio</p><div class="chips">${rest.map((s) => `<button class="chip ${s === it.rest ? 'on' : ''}" data-act="wm-rest" data-n="${s}">${s} s</button>`).join('')}</div>
      <div class="rows">${i < sess().items.length - 1 ? `<button class="row" data-act="wm-ss"><span class="row-main"><b>${it.ss ? 'Quitar superserie con el siguiente' : 'Superserie con el siguiente'}</b><span class="muted small">Sin descanso entre ambos ejercicios</span></span>${ic('link')}</button>` : ''}
      ${i > 0 ? `<button class="row" data-act="wm-up"><span class="row-main"><b>Subir un puesto</b></span>${ic('up')}</button>` : ''}
      ${i < sess().items.length - 1 ? `<button class="row" data-act="wm-down"><span class="row-main"><b>Bajar un puesto</b></span>${ic('down')}</button>` : ''}
      <button class="row danger-row" data-act="wm-del"><span class="row-main"><b>Quitar ${esc(ex.n)} del entrenamiento</b></span>${ic('trash')}</button></div>`, { title: ex.n });
    G._wmc = c;
  };
  G.act['wm-rest'] = (t) => { sess().items[G._wm].rest = +t.dataset.n; G.save(); G._wmc.close(); itemRefresh(G._wm); };
  G.act['wm-ss'] = () => { const it = sess().items[G._wm]; it.ss = !it.ss; G.save(); G._wmc.close(); wkRefresh(); };
  G.act['wm-up'] = () => { const a = sess().items, i = G._wm;[a[i - 1], a[i]] = [a[i], a[i - 1]]; G.save(); G._wmc.close(); wkRefresh(); };
  G.act['wm-down'] = () => { const a = sess().items, i = G._wm;[a[i + 1], a[i]] = [a[i], a[i + 1]]; G.save(); G._wmc.close(); wkRefresh(); };
  G.act['wm-del'] = () => { sess().items.splice(G._wm, 1); G.save(); G._wmc.close(); wkRefresh(); };

  G.act['wk-discard'] = async () => {
    const ok = await G.confirm('¿Descartar este entrenamiento?', { title: 'Descartar', detail: 'No se guardará nada de lo que has registrado.', ok: 'Descartar', danger: true });
    if (!ok) return;
    S().session = null; G.rest.stop(); G.save(true); if (G._wk) G._wk.close(); G.render();
  };

  G.act['wk-finish'] = async () => {
    const se = sess(), done = se.items.reduce((a, it) => a + it.sets.filter((s) => s.done).length, 0), pend = se.items.reduce((a, it) => a + it.sets.filter((s) => !s.done).length, 0);
    if (!done) { G.toast('Marca al menos una serie con ✓ para guardar'); return; }
    const ok = await G.confirm('¿Finalizar el entrenamiento?', { title: 'Finalizar', detail: pend ? `Hay ${pend} ${pend === 1 ? 'serie' : 'series'} sin marcar: no se guardarán.` : 'Se guardará en tu historial.', ok: 'Finalizar' });
    if (!ok) return;
    const prs = [];
    const items = se.items.filter((it) => it.sets.some((s) => s.done)).map((it) => {
      const flags = G.prFlags(it); if (flags.some(Boolean)) prs.push(G.ex(it.ex).n);
      return { ex: it.ex, k: it.k, ss: it.ss ? 1 : undefined, sets: it.sets.map((s, j) => ({ w: num(s.w), r: num(s.r), done: s.done, pr: flags[j] })).filter((s) => s.done) };
    });
    const h = { id: se.id, date: G.dkey(new Date(se.startedAt)), startedAt: se.startedAt, dur: Math.round((Date.now() - se.startedAt) / 1000), routineId: se.routineId, name: se.name, items, prs: prs.length, ch: (se.ch || []).slice(), full: pend === 0 };
    h.vol = G.sessVolume(h); h.kcal = Math.round(G.kcalSession(items, h.dur));
    const st = S(); st.history.push(h); st.session = null; G.rest.stop(); G.save(true);
    const newAch = G.checkAch();
    if (G._wk) G._wk.close();
    summary(h, prs, newAch);
    G.render();
  };

  function summary(h, prs, ach) {
    const u = S().settings.unit;
    G.sheet(`<div class="sum-grid ${G.weightKg() > 0 ? 'four' : ''}"><div><b class="num">${fmtDur(h.dur)}</b><span>duración</span></div><div><b class="num">${G.sessSets(h)}</b><span>series</span></div><div><b class="num">${fmtN(Math.round(h.vol))}</b><span>volumen (${u})</span></div>${G.weightKg() > 0 ? `<div><b class="num">${h.kcal}</b><span>kcal (estimado)</span></div>` : ''}</div>
      ${G.weightKg() > 0 ? '' : `<p class="muted small">Añade tu peso en Más › Mi perfil para ver las calorías de tus entrenamientos.</p>`}
      ${h.ch && h.ch.length ? `<p class="small">Retos de hoy: ${h.ch.map((id) => { const r = G.allRetos().find((x) => x.id === id); return r ? esc(r.n) : ''; }).filter(Boolean).join(', ')}</p>` : ''}
      ${prs.length ? `<h3>Récords</h3><div class="rows">${prs.map((n) => `<div class="row">${G.icFill('star')}<b>${esc(n)}</b></div>`).join('')}</div>` : ''}
      ${ach.length ? `<h3>Logros nuevos</h3><div class="rows">${ach.map((a) => `<div class="row">${ic('trophy')}<span class="row-main"><b>${esc(a.n)}</b><span class="muted small">${esc(a.d)}</span></span></div>`).join('')}</div>` : ''}
      <p class="muted small">Guardado en tu historial. Puedes verlo en Progreso.</p><div class="btn-row"><button class="btn primary grow" data-act="sheet-close">Listo</button></div>`, { title: '¡Entrenamiento guardado!' });
  }

  /* barra «entrenamiento en curso» cuando la pantalla está minimizada */
  G.sessBar = () => {
    let el = G.$('#sessbar'); const se = sess(), open = G._wk && document.body.contains(G._wk.el);
    document.body.classList.toggle('has-sess', !!se && !open);
    if (!se || open) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('button'); el.id = 'sessbar'; el.className = 'sessbar'; el.setAttribute('data-act', 'open-workout'); G.$('#layer').appendChild(el); }
    el.innerHTML = `${G.icFill('play')}<span><b>${esc(se.name)}</b> en curso</span><span class="num" id="sess-el">${fmtDur((Date.now() - se.startedAt) / 1000)}</span>`;
  };
  setInterval(() => { const e = G.$('#sess-el'); if (e && sess()) e.textContent = fmtDur((Date.now() - sess().startedAt) / 1000); const h = G.$('#home-elapsed'); if (h && sess()) h.textContent = fmtDur((Date.now() - sess().startedAt) / 1000); }, 1000);
})((window.G = window.G || {}));
