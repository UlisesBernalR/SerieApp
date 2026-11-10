/* Serie — rutinas, biblioteca de ejercicios, detalle de ejercicio y ejercicios propios */
(function (G) {
  'use strict';
  const { esc, ic, num, fmtN, fmtShort } = G;
  const S = () => G.S();
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  G.ui.rsub = 'rutinas';
  G.ui.lib = { q: '', g: 'Todos', eq: '', lv: '', fav: false };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const REST = [30, 45, 60, 90, 120, 150, 180, 240];

  G.copyText = async (txt) => {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
    try {
      const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  };
  G.resizeImg = (file, max, q) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const sc = Math.min(1, (max || 640) / Math.max(im.width, im.height));
        const cv = document.createElement('canvas'); cv.width = Math.round(im.width * sc); cv.height = Math.round(im.height * sc);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/jpeg', q || 0.78));
      };
      im.onerror = rej; im.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });

  /* ---------- pestaña Rutinas ---------- */
  G.views.rutinas = () => {
    const seg = `<div class="seg"><button class="${G.ui.rsub === 'rutinas' ? 'on' : ''}" data-act="rsub" data-v="rutinas">Mis rutinas</button><button class="${G.ui.rsub === 'biblioteca' ? 'on' : ''}" data-act="rsub" data-v="biblioteca">Biblioteca</button></div>`;
    return `<div class="stack">${seg}${G.ui.rsub === 'rutinas' ? routinesHTML() : libraryHTML()}</div>`;
  };
  G.act.rsub = (t) => { G.ui.rsub = t.dataset.v; G.render(); };

  function routinesHTML() {
    const rs = S().routines;
    const rows = rs.map((r, i) => {
      const mus = G.routineMuscles(r), last = G.lastDone(r.id);
      return `<div class="row"><button class="row-main-btn" data-act="routine-edit" data-id="${r.id}"><span class="dot pl-${G.plateColor(i)} on"></span><span class="row-main"><b>${esc(r.name)}</b><span class="muted small">${r.items.length} ejercicios · unos ${G.routineMin(r)} min${last ? ' · última vez ' + esc(fmtShort(last)) : ''}</span><span class="mus-row">${G.musChips(mus.prim, 4)}</span></span></button><button class="btn small primary" data-act="start-routine" data-id="${r.id}" aria-label="Empezar ${esc(r.name)}">${G.icFill('play')}</button></div>`;
    }).join('');
    return `<div class="btn-row"><button class="btn primary grow" data-act="routine-new">${ic('plus')} Nueva rutina</button><button class="btn ghost" data-act="tpl-open">Plantillas</button><button class="btn ghost" data-act="routine-import">Importar</button></div>
      ${rs.length ? `<section class="rows">${rows}</section>` : `<section class="empty"><h3>Aún no tienes rutinas</h3><p class="muted">Empieza con una plantilla lista para usar o crea la tuya eligiendo ejercicios de la biblioteca.</p><div class="btn-row"><button class="btn primary grow" data-act="tpl-open">Ver plantillas</button></div></section>`}`;
  }

  /* ---------- plantillas e importación ---------- */
  G.act['tpl-open'] = () => {
    const c = G.sheet(`<p class="muted">Cada plantilla se añade como una rutina que puedes editar.</p><div class="rows">${G.TEMPLATES.map((t) => `<div class="row"><span class="row-main"><b>${esc(t.name)}</b><span class="muted small">${esc(t.info)} · ${t.items.length} ejercicios</span></span><button class="btn small primary" data-act="tpl-add" data-id="${t.id}">Añadir</button></div>`).join('')}</div>`, { title: 'Plantillas' });
    G._tpl = c;
  };
  G.act['tpl-add'] = (t) => {
    const tp = G.TEMPLATES.find((x) => x.id === t.dataset.id);
    S().routines.push({ id: G.uid(), name: tp.name, items: clone(tp.items) }); G.save();
    if (G._tpl) G._tpl.close();
    G.toast('Rutina «' + tp.name + '» añadida'); G.render();
  };
  G.act['routine-import'] = () => {
    const c = G.sheet(`<p class="muted">Pega el código que te compartió otra persona (empieza con SERIE1:).</p><textarea id="imp-code" rows="5" placeholder="SERIE1:…"></textarea><div class="btn-row"><button class="btn primary grow" data-act="imp-go">Importar rutina</button></div>`, { title: 'Importar rutina' });
    G._imp = c;
  };
  G.act['imp-go'] = () => {
    try {
      const o = G.decodeRoutine(G.$('#imp-code').value); const r = G.importRoutine(o);
      G._imp.close(); G.toast('Rutina «' + r.name + '» importada'); G.render();
    } catch (e) { G.toast('Ese código no es válido'); }
  };

  /* ---------- editor de rutina ---------- */
  function edHTML() {
    const e = G.ed;
    const items = e.items.map((it, i) => {
      const ex = G.ex(it.ex);
      return `<div class="ed-item ${it.ss && i < e.items.length - 1 ? 'ss' : ''}"><span class="thumb">${G.exFig(ex, 0, { ghost: 1 })}</span>
        <button class="ed-main" data-act="ed-item" data-i="${i}"><b>${esc(ex.n)}</b><span class="muted small">${it.sets} × ${esc(it.reps)}${ex.k === 'time' ? '\u00A0s' : ''} · descanso ${it.rest}\u00A0s${it.ss && i < e.items.length - 1 ? ' · superserie con el siguiente' : ''}</span></button>
        <div class="ed-ctl"><button class="icon-btn" data-act="ed-up" data-i="${i}" aria-label="Subir" ${i === 0 ? 'disabled' : ''}>${ic('up')}</button><button class="icon-btn" data-act="ed-down" data-i="${i}" aria-label="Bajar" ${i === e.items.length - 1 ? 'disabled' : ''}>${ic('down')}</button></div></div>`;
    }).join('');
    return `<label class="field"><span>Nombre de la rutina</span><input id="ed-name" data-in="ed-name" type="text" maxlength="40" value="${esc(e.name)}" placeholder="Ej.: Pecho y tríceps"></label>
      <div id="ed-items">${items || '<p class="muted empty-s">Aún no hay ejercicios. Añade los de la biblioteca o crea uno propio.</p>'}</div>
      <button class="btn ghost block" data-act="ed-add">${ic('plus')} Añadir ejercicios</button>
      <div class="ed-foot"><button class="btn primary grow" data-act="ed-save">Guardar rutina</button></div>
      ${e.id ? `<div class="btn-row wrap"><button class="btn ghost grow" data-act="ed-share">${ic('share')} Compartir</button><button class="btn ghost grow" data-act="ed-dup">${ic('copy')} Duplicar</button><button class="btn danger-ghost grow" data-act="ed-del">${ic('trash')} Eliminar</button></div>` : ''}`;
  }
  const edRefresh = () => { if (G._ed) { const sc = G._ed.body.scrollTop; G._ed.set(edHTML()); G._ed.body.scrollTop = sc; } };
  G.openEditor = (id) => {
    const r = id ? S().routines.find((x) => x.id === id) : null;
    G.ed = { id: r ? r.id : null, name: r ? r.name : '', items: r ? clone(r.items) : [] };
    G._ed = G.sheet(edHTML(), { title: r ? 'Editar rutina' : 'Nueva rutina', full: true, onClose: () => (G._ed = null) });
  };
  G.act['routine-new'] = () => G.openEditor(null);
  G.act['routine-edit'] = (t) => G.openEditor(t.dataset.id);
  G.inp['ed-name'] = (t) => (G.ed.name = t.value);
  G.act['ed-up'] = (t) => { const i = +t.dataset.i, a = G.ed.items; [a[i - 1], a[i]] = [a[i], a[i - 1]]; edRefresh(); };
  G.act['ed-down'] = (t) => { const i = +t.dataset.i, a = G.ed.items; [a[i + 1], a[i]] = [a[i], a[i + 1]]; edRefresh(); };
  G.act['ed-add'] = () => G.openPicker((ids) => {
    ids.forEach((id) => { const ex = G.ex(id); G.ed.items.push({ ex: id, sets: 3, reps: ex.k === 'time' ? '30' : '10', rest: S().settings.rest, note: '', ss: false }); });
    edRefresh();
  });
  G.act['ed-item'] = (t) => {
    const i = +t.dataset.i, it = G.ed.items[i], ex = G.ex(it.ex); G._ei = i;
    const c = G.sheet(`<div class="ei-head"><span class="thumb big">${G.exFig(ex, 0, { ghost: 1 })}</span><div><b>${esc(ex.n)}</b><p class="muted small">${esc(ex.m.map((m) => G.MUSCLES[m]).join(', '))}</p></div></div>
      <div class="grid2"><label class="field"><span>Series</span><div class="stepper"><button class="icon-btn" data-act="ei-step" data-d="-1" aria-label="Menos series">−</button><input id="ei-sets" type="number" inputmode="numeric" min="1" max="10" value="${it.sets}"><button class="icon-btn" data-act="ei-step" data-d="1" aria-label="Más series">+</button></div></label>
      <label class="field"><span>${ex.k === 'time' ? 'Segundos' : 'Repeticiones'}</span><input id="ei-reps" type="text" value="${esc(it.reps)}" placeholder="${ex.k === 'time' ? '30' : '8-12'}"></label></div>
      <label class="field"><span>Descanso entre series</span><select id="ei-rest">${REST.map((s) => `<option value="${s}" ${s === it.rest ? 'selected' : ''}>${s >= 60 ? Math.floor(s / 60) + ' min' + (s % 60 ? ' ' + s % 60 + ' s' : '') : s + ' s'}</option>`).join('')}${REST.includes(it.rest) ? '' : `<option value="${it.rest}" selected>${it.rest} s</option>`}</select></label>
      <label class="field"><span>Nota para este ejercicio</span><input id="ei-note" type="text" maxlength="80" value="${esc(it.note || '')}" placeholder="Ej.: pausa de 1 s abajo"></label>
      ${i < G.ed.items.length - 1 ? `<label class="check"><input id="ei-ss" type="checkbox" ${it.ss ? 'checked' : ''}><span>Superserie con el siguiente ejercicio (sin descanso entre ambos)</span></label>` : ''}
      <div class="btn-row"><button class="btn danger-ghost" data-act="ei-del">Quitar</button><button class="btn primary grow" data-act="ei-save">Listo</button></div>`, { title: 'Ejercicio en la rutina' });
    G._eic = c;
  };
  G.act['ei-step'] = (t) => { const el = G.$('#ei-sets'); el.value = Math.max(1, Math.min(10, (parseInt(el.value, 10) || 3) + +t.dataset.d)); };
  G.act['ei-save'] = () => {
    const it = G.ed.items[G._ei];
    it.sets = Math.max(1, Math.min(10, parseInt(G.$('#ei-sets').value, 10) || 3)); it.reps = G.$('#ei-reps').value.trim() || '10';
    it.rest = parseInt(G.$('#ei-rest').value, 10) || 60; it.note = G.$('#ei-note').value.trim();
    const ss = G.$('#ei-ss'); it.ss = ss ? ss.checked : false;
    G._eic.close(); edRefresh();
  };
  G.act['ei-del'] = () => { G.ed.items.splice(G._ei, 1); G._eic.close(); edRefresh(); };
  G.act['ed-save'] = () => {
    const e = G.ed, st = S();
    if (!e.items.length) { G.toast('Añade al menos un ejercicio'); return; }
    const name = (e.name || '').trim() || 'Rutina ' + (st.routines.length + 1);
    if (e.id) { const r = st.routines.find((x) => x.id === e.id); r.name = name; r.items = clone(e.items); }
    else st.routines.push({ id: G.uid(), name, items: clone(e.items) });
    G.save(); G._ed.close(); G.toast('Rutina guardada'); G.render();
  };
  G.act['ed-del'] = async () => {
    const ok = await G.confirm('¿Eliminar la rutina «' + G.ed.name + '»?', { title: 'Eliminar rutina', detail: 'También se quitará de tu horario. El historial se conserva.', ok: 'Eliminar', danger: true });
    if (!ok) return;
    const st = S(), id = G.ed.id;
    st.routines = st.routines.filter((r) => r.id !== id); st.schedule = st.schedule.filter((s) => s.routine !== id);
    G.save(); if (G._ed) G._ed.close(); G.render(); G.toast('Rutina eliminada');
  };
  G.act['ed-dup'] = () => {
    const st = S(), r = st.routines.find((x) => x.id === G.ed.id);
    st.routines.push({ id: G.uid(), name: r.name + ' (copia)', items: clone(r.items) }); G.save(); G._ed.close(); G.toast('Rutina duplicada'); G.render();
  };
  G.act['ed-share'] = async () => {
    G.flag('shared');
    const r = S().routines.find((x) => x.id === G.ed.id), code = G.encodeRoutine(r);
    const c = G.sheet(`<p class="muted">Envía este código a quien quieras. Podrá importarlo desde Rutinas › Importar.</p><textarea id="share-code" rows="5" readonly>${esc(code)}</textarea><div class="btn-row"><button class="btn primary grow" data-act="share-copy">${ic('copy')} Copiar código</button></div>`, { title: 'Compartir rutina' });
    G._share = c;
  };
  G.act['share-copy'] = async () => { const ok = await G.copyText(G.$('#share-code').value); if (!ok) G.$('#share-code').select(); G.toast(ok ? 'Código copiado' : 'Selecciona el texto y cópialo'); };

  /* ---------- biblioteca ---------- */
  function filtered(f, extra) {
    const st = S(); let l = G.allEx();
    if (f.g !== 'Todos') l = l.filter((e) => e.g === f.g);
    if (f.eq) l = l.filter((e) => e.eq === f.eq);
    if (f.lv) l = l.filter((e) => e.lv === f.lv);
    if (f.fav) l = l.filter((e) => st.fav.includes(e.id));
    if (f.q) { const q = norm(f.q); l = l.filter((e) => norm(e.n + ' ' + e.m.concat(e.s).map((m) => G.MUSCLES[m]).join(' ') + ' ' + e.eq + ' ' + e.g).includes(q)); }
    return l.sort((a, b) => a.n.localeCompare(b.n, 'es'));
  }
  function exRow(e, o) {
    o = o || {};
    const fav = S().fav.includes(e.id);
    return `<button class="row ex-row ${o.sel ? 'sel' : ''}" data-act="${o.act || 'ex-open'}" data-id="${e.id}"><span class="thumb">${G.exFig(e, 0, { ghost: 1 })}</span><span class="row-main"><b>${esc(e.n)}</b><span class="muted small">${esc(e.m.map((m) => G.MUSCLES[m]).join(', '))} · ${esc(e.eq || 'Sin equipo')}</span></span>${o.check ? `<span class="tick ${o.sel ? 'on' : ''}">${o.sel ? ic('check') : ''}</span>` : (fav ? `<span class="fav">${G.icFill('star')}</span>` : ic('chev'))}</button>`;
  }
  const filtersHTML = (f, pre) => `<label class="search">${ic('search')}<input type="search" data-in="${pre}-q" value="${esc(f.q)}" placeholder="Buscar ejercicio o músculo" aria-label="Buscar ejercicio"></label>
    <div class="chips scroll">${['Todos'].concat(G.GROUPS).map((g) => `<button class="chip ${f.g === g ? 'on' : ''}" data-act="${pre}-g" data-g="${g}">${g}</button>`).join('')}</div>`;
  function libraryHTML() {
    const f = G.ui.lib;
    return `${filtersHTML(f, 'lib')}
      <div class="grid2 sel-row"><select data-ch="lib-eq" aria-label="Equipo"><option value="">Todo el equipo</option>${G.EQUIP.map((x) => `<option ${f.eq === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <select data-ch="lib-lv" aria-label="Nivel"><option value="">Todos los niveles</option>${G.LEVELS.map((x) => `<option ${f.lv === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="btn-row"><button class="chip ${f.fav ? 'on' : ''}" data-act="lib-fav">${G.icFill('star')} Solo favoritos</button><span class="grow"></span><button class="btn small ghost" data-act="exf-new">${ic('plus')} Crear ejercicio</button></div>
      <section class="rows" id="lib-list">${libList()}</section>`;
  }
  const libList = () => { const l = filtered(G.ui.lib); return l.length ? l.map((e) => exRow(e)).join('') : '<p class="muted empty-s">No hay ejercicios con esos filtros.</p>'; };
  G.inp['lib-q'] = (t) => { G.ui.lib.q = t.value; G.$('#lib-list').innerHTML = libList(); };
  G.act['lib-g'] = (t) => { G.ui.lib.g = t.dataset.g; G.render(); };
  G.chg['lib-eq'] = (t) => { G.ui.lib.eq = t.value; G.render(); };
  G.chg['lib-lv'] = (t) => { G.ui.lib.lv = t.value; G.render(); };
  G.act['lib-fav'] = () => { G.ui.lib.fav = !G.ui.lib.fav; G.render(); };

  /* ---------- selector de ejercicios (para rutinas y entrenamientos) ---------- */
  G.openPicker = (onAdd) => {
    const P = { q: '', g: 'Todos', eq: '', lv: '', fav: false, sel: [], onAdd };
    G._pk = P;
    const c = G.sheet(`${filtersHTML(P, 'pk')}<section class="rows" id="pk-list"></section><div class="ed-foot"><button class="btn ghost" data-act="exf-new">Crear ejercicio</button><button class="btn primary grow" data-act="pk-done" id="pk-done" disabled>Añadir</button></div>`, { title: 'Añadir ejercicios', full: true, onClose: () => { if (G._pk === P) G._pk = null; } });
    P.c = c; pkDraw();
  };
  function pkDraw() {
    const P = G._pk; if (!P) return;
    const l = filtered(P);
    G.$('#pk-list', P.c.el).innerHTML = l.length ? l.map((e) => exRow(e, { act: 'pk-toggle', check: true, sel: P.sel.includes(e.id) })).join('') : '<p class="muted empty-s">No hay ejercicios con esos filtros.</p>';
    const b = G.$('#pk-done', P.c.el); b.disabled = !P.sel.length; b.textContent = P.sel.length ? 'Añadir ' + P.sel.length : 'Añadir';
    G.$$('.chip', P.c.el).forEach((x) => x.classList.toggle('on', x.dataset.g === P.g));
  }
  G.inp['pk-q'] = (t) => { G._pk.q = t.value; pkDraw(); };
  G.act['pk-g'] = (t) => { G._pk.g = t.dataset.g; pkDraw(); };
  G.act['pk-toggle'] = (t) => { const P = G._pk, i = P.sel.indexOf(t.dataset.id); if (i >= 0) P.sel.splice(i, 1); else P.sel.push(t.dataset.id); pkDraw(); };
  G.act['pk-done'] = () => { const P = G._pk, ids = P.sel.slice(); P.c.close(); P.onAdd(ids); };

  /* ---------- detalle de ejercicio ---------- */
  G.act['ex-open'] = (t) => G.openExercise(t.dataset.id);
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  G.openExercise = (id) => {
    const e = G.ex(id), st = S(), best = G.bestEx(id), last = G.lastEx(id), fav = st.fav.includes(id);
    const animated = G.fig.has(id) && !e.photo && !G.fig.isStatic(id);
    const marks = last ? `<div class="rows"><div class="row"><span class="muted">Última vez · ${esc(fmtShort(last.date))}</span><b class="num">${last.sets.map((s) => (e.k === 'time' ? G.fmtN(num(s.r)) + ' s' : (num(s.w) ? fmtN(num(s.w)) + '×' : '') + fmtN(num(s.r)))).join(' · ')}</b></div>${e.k === 'time' ? (best.t ? `<div class="row"><span class="muted">Mejor marca</span><b class="num">${fmtN(best.t)} s</b></div>` : '') : (best.wr ? `<div class="row"><span class="muted">Mejor serie</span><b class="num">${fmtN(best.wr[0])} ${st.settings.unit} × ${fmtN(best.wr[1])}</b></div><div class="row"><span class="muted">1RM estimado</span><b class="num">${fmtN(Math.round(best.e * 10) / 10)} ${st.settings.unit}</b></div>` : '')}</div>` : '<p class="muted small">Todavía no has registrado este ejercicio.</p>';
    const html = `<div class="fig-box" id="exfig">${G.exFig(e, 0)}</div>
      ${animated ? `<div class="seg small"><button class="on" data-act="fig-mode" data-m="play">Animación</button><button data-act="fig-mode" data-m="0">Inicio</button><button data-act="fig-mode" data-m="1">Final</button></div>` : ''}
      <p class="muted small fig-note">${e.photo ? 'Foto propia.' : 'Ilustración esquemática de la técnica.'}${G.exMap[id] && animated ? ` <a class="link" href="gifs/${id}.gif" download="${esc(e.n)}.gif">Guardar como GIF</a>` : ''}</p>
      <div class="tags"><span class="tag">${esc(e.g)}</span>${e.eq ? `<span class="tag">${esc(e.eq)}</span>` : ''}${e.lv ? `<span class="tag">${esc(e.lv)}</span>` : ''}${e.k === 'time' ? '<span class="tag">Por tiempo</span>' : ''}</div>
      <h3>Músculos que trabaja</h3>
      <div class="mm-row">${G.fig.bodyMap(e.m, e.s)}<div class="mm-leg"><p><span class="sw sw1"></span><b>Principal</b><br>${e.m.length ? esc(e.m.map((m) => G.MUSCLES[m]).join(', ')) : '—'}</p><p><span class="sw sw2"></span><b>Secundarios</b><br>${e.s.length ? esc(e.s.map((m) => G.MUSCLES[m]).join(', ')) : '—'}</p></div></div>
      ${e.d ? `<h3>Cómo se hace</h3><p class="prose">${esc(e.d)}</p>` : ''}
      ${e.t && e.t.length ? `<ul class="tips">${e.t.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <h3>Tus marcas</h3>${marks}
      <h3>Tu nota</h3><textarea rows="2" data-in="ex-note" data-id="${id}" placeholder="Ajustes de máquina, sensaciones, lo que quieras recordar">${esc(st.notes[id] || '')}</textarea>
      <div class="btn-row wrap"><button class="btn ghost grow" data-act="ex-fav" data-id="${id}">${G.icFill('star')} <span>${fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}</span></button><button class="btn ghost grow" data-act="ex-toroutine" data-id="${id}">${ic('plus')} Añadir a una rutina</button>${!G.exMap[id] && !e.gone ? `<button class="btn ghost grow" data-act="exf-edit" data-id="${id}">${ic('edit')} Editar</button><button class="btn danger-ghost grow" data-act="exf-del" data-id="${id}">${ic('trash')} Eliminar</button>` : ''}</div>`;
    const c = G.sheet(html, { title: e.n, full: true, onClose: () => { if (c._raf) cancelAnimationFrame(c._raf); } });
    G._exs = c;
    if (animated && !reduced()) startAnim(c, e);
    else if (animated) c._mode = 0;
  };
  function startAnim(c, e) {
    c._mode = 'play'; const t0 = performance.now();
    const frame = (t) => {
      if (!document.body.contains(c.el)) return;
      if (c._mode === 'play') { const ph = ((t - t0) / 2800) % 1, u = (1 - Math.cos(ph * 2 * Math.PI)) / 2; const b = G.$('#exfig', c.el); if (b) b.innerHTML = G.fig.svg(e.id, u); }
      c._raf = requestAnimationFrame(frame);
    };
    c._raf = requestAnimationFrame(frame);
  }
  G.act['fig-mode'] = (t) => {
    const c = G._exs; if (!c) return; const m = t.dataset.m; c._mode = m === 'play' ? 'play' : +m;
    G.$$('.seg button', c.el).forEach((b) => b.classList.toggle('on', b === t));
    const id = G._exId(c);
    if (m !== 'play') G.$('#exfig', c.el).innerHTML = G.fig.svg(id, +m);
    else if (!c._raf) startAnim(c, G.ex(id));
  };
  G._exId = (c) => { const b = G.$('[data-act="ex-fav"]', c.el); return b ? b.dataset.id : ''; };
  G.inp['ex-note'] = (t) => { const st = S(); if (t.value.trim()) st.notes[t.dataset.id] = t.value; else delete st.notes[t.dataset.id]; G.save(); };
  G.act['ex-fav'] = (t) => {
    const st = S(), id = t.dataset.id, i = st.fav.indexOf(id);
    if (i >= 0) st.fav.splice(i, 1); else st.fav.push(id); G.save();
    t.querySelector('span').textContent = i >= 0 ? 'Añadir a favoritos' : 'Quitar de favoritos'; G.toast(i >= 0 ? 'Quitado de favoritos' : 'Añadido a favoritos');
    if (G.ui.rsub === 'biblioteca' && G.tab === 'rutinas') { const l = G.$('#lib-list'); if (l) l.innerHTML = libList(); }
  };
  G.act['ex-toroutine'] = (t) => {
    const st = S(), id = t.dataset.id;
    if (!st.routines.length) { G.toast('Primero crea una rutina'); return; }
    const c = G.sheet(`<div class="rows">${st.routines.map((r, i) => `<button class="row pick-row" data-act="ex-torg" data-r="${r.id}" data-id="${id}"><span class="dot pl-${G.plateColor(i)} on"></span><span class="row-main"><b>${esc(r.name)}</b><span class="muted small">${r.items.length} ejercicios</span></span>${ic('plus')}</button>`).join('')}</div>`, { title: 'Añadir a una rutina' });
    G._tor = c;
  };
  G.act['ex-torg'] = (t) => {
    const st = S(), r = st.routines.find((x) => x.id === t.dataset.r), ex = G.ex(t.dataset.id);
    r.items.push({ ex: ex.id, sets: 3, reps: ex.k === 'time' ? '30' : '10', rest: st.settings.rest, note: '', ss: false }); G.save();
    G._tor.close(); G.toast('Añadido a «' + r.name + '»'); G.render();
  };

  /* ---------- ejercicios propios ---------- */
  G.act['exf-new'] = () => G.openExForm(null);
  G.act['exf-edit'] = (t) => G.openExForm(t.dataset.id);
  G.act['exf-del'] = async (t) => {
    const id = t.dataset.id, e = G.ex(id);
    const ok = await G.confirm('¿Eliminar «' + e.n + '»?', { title: 'Eliminar ejercicio', detail: 'Se quitará de tus rutinas. El historial se conserva.', ok: 'Eliminar', danger: true });
    if (!ok) return;
    const st = S(); st.custom = st.custom.filter((x) => x.id !== id);
    st.routines.forEach((r) => (r.items = r.items.filter((i) => i.ex !== id))); st.fav = st.fav.filter((x) => x !== id);
    G.save(); if (G._exs) G._exs.close(); G.toast('Ejercicio eliminado'); G.render();
  };
  G.openExForm = (id) => {
    const e = id ? G.ex(id) : { n: '', g: 'Pecho', eq: 'Peso corporal', lv: 'Principiante', k: 'reps', m: [], s: [], d: '' };
    G._xf = { id, m: e.m.slice(), s: e.s.slice(), photo: e.photo || '' };
    const sel = (name, list, v) => `<select id="xf-${name}">${list.map((x) => `<option ${x === v ? 'selected' : ''}>${x}</option>`).join('')}</select>`;
    const chips = (kind) => Object.keys(G.MUSCLES).filter((m) => m !== 'cardio' || true).map((m) => `<button type="button" class="chip ${G._xf[kind].includes(m) ? 'on' : ''}" data-act="xf-mus" data-k="${kind}" data-m="${m}">${G.MUSCLES[m]}</button>`).join('');
    const c = G.sheet(`<label class="field"><span>Nombre</span><input id="xf-n" type="text" maxlength="50" value="${esc(e.n)}" placeholder="Ej.: Remo con mancuerna a una mano"></label>
      <div class="grid2"><label class="field"><span>Grupo</span>${sel('g', G.GROUPS, e.g)}</label><label class="field"><span>Equipo</span>${sel('eq', G.EQUIP, e.eq)}</label>
      <label class="field"><span>Nivel</span>${sel('lv', G.LEVELS, e.lv)}</label><label class="field"><span>Se mide en</span><select id="xf-k"><option value="reps" ${e.k === 'reps' ? 'selected' : ''}>Peso y repeticiones</option><option value="time" ${e.k === 'time' ? 'selected' : ''}>Tiempo (segundos)</option></select></label></div>
      <p class="muted small">Músculo principal</p><div class="chips" id="xf-m">${chips('m')}</div>
      <p class="muted small">Músculos secundarios</p><div class="chips" id="xf-s">${chips('s')}</div>
      <label class="field"><span>Cómo se hace (opcional)</span><textarea id="xf-d" rows="3" placeholder="Describe la técnica en pocas líneas">${esc(e.d || '')}</textarea></label>
      <div class="field"><span>Foto de referencia (opcional)</span><div class="inline"><span class="thumb big" id="xf-prev">${G._xf.photo ? `<img class="fig photo" src="${G._xf.photo}" alt="">` : G.fig.placeholder()}</span><label class="btn ghost">${ic('camera')} Elegir foto<input id="xf-photo" type="file" accept="image/*" data-ch="xf-photo" hidden></label></div></div>
      <div class="btn-row"><button class="btn primary grow" data-act="xf-save">Guardar ejercicio</button></div>`, { title: id ? 'Editar ejercicio' : 'Crear ejercicio', full: true });
    G._xfc = c;
  };
  G.act['xf-mus'] = (t) => {
    const k = t.dataset.k, m = t.dataset.m, a = G._xf[k], i = a.indexOf(m);
    if (i >= 0) a.splice(i, 1); else a.push(m);
    t.classList.toggle('on', i < 0);
  };
  G.chg['xf-photo'] = async (t) => {
    const f = t.files && t.files[0]; if (!f) return;
    try { G._xf.photo = await G.resizeImg(f, 640, 0.78); G.$('#xf-prev').innerHTML = `<img class="fig photo" src="${G._xf.photo}" alt="">`; } catch (e) { G.toast('No se pudo leer la imagen'); }
  };
  G.act['xf-save'] = () => {
    const st = S(), f = G._xf, n = G.$('#xf-n').value.trim();
    if (!n) { G.toast('Escribe un nombre'); return; }
    if (!f.m.length) { G.toast('Elige al menos un músculo principal'); return; }
    const o = { id: f.id || 'x-' + G.uid(), n, g: G.$('#xf-g').value, eq: G.$('#xf-eq').value, lv: G.$('#xf-lv').value, k: G.$('#xf-k').value, m: f.m, s: f.s.filter((x) => !f.m.includes(x)), d: G.$('#xf-d').value.trim(), t: [] };
    if (f.photo) o.photo = f.photo;
    const i = st.custom.findIndex((x) => x.id === o.id);
    if (i >= 0) st.custom[i] = o; else st.custom.push(o);
    G.save(); G._xfc.close(); G.toast('Ejercicio guardado');
    if (G._pk) pkDraw(); if (G._exs && f.id) G._exs.close();
    G.render();
  };
})((window.G = window.G || {}));
