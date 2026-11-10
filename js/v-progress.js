/* Serie — progreso: resumen, historial, gráficas, cuerpo (peso, medidas, fotos) y logros */
(function (G) {
  'use strict';
  const { esc, ic, num, fmtN, fmtDur, fmtShort, fmtLong, parseKey, dkey } = G;
  const S = () => G.S();
  G.ui.psub = 'resumen'; G.ui.chartEx = ''; G.ui.chartMetric = 'w';

  /* ---------- gráficas (una serie, sin leyenda; el título la nombra) ---------- */
  function niceTicks(min, max, n) {
    const span = max - min || 1, raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, t = [];
    for (let v = lo; v <= hi + step / 2; v += step) t.push(Math.round(v * 100) / 100);
    return t;
  }
  const W = 320, H = 190, M = { l: 40, r: 14, t: 16, b: 28 };
  function frame(ticks, y, labels, x) {
    let s = '';
    ticks.forEach((t) => { s += `<line class="ch-grid" x1="${M.l}" x2="${W - M.r}" y1="${y(t)}" y2="${y(t)}"/><text class="ch-tick" x="${M.l - 6}" y="${y(t) + 3.5}" text-anchor="end">${fmtN(t)}</text>`; });
    labels.forEach((l) => { s += `<text class="ch-tick" x="${x(l.i)}" y="${H - 8}" text-anchor="${l.a || 'middle'}">${esc(l.t)}</text>`; });
    return s;
  }
  function lineChart(pts, unit, name) {
    if (!pts.length) return '<p class="muted small empty-s">Todavía no hay datos para graficar.</p>';
    const vs = pts.map((p) => p.v); let min = Math.min.apply(null, vs), max = Math.max.apply(null, vs);
    if (min === max) { min -= 1; max += 1; }
    const ticks = niceTicks(min, max, 4), lo = ticks[0], hi = ticks[ticks.length - 1];
    const y = (v) => Math.round((H - M.b - ((v - lo) / (hi - lo)) * (H - M.b - M.t)) * 10) / 10;
    const n = pts.length, x = (i) => Math.round((n === 1 ? (M.l + W - M.r) / 2 : M.l + (i * (W - M.l - M.r)) / (n - 1)) * 10) / 10;
    const labels = [{ i: 0, t: pts[0].x, a: n === 1 ? 'middle' : 'start' }]; if (n > 1) labels.push({ i: n - 1, t: pts[n - 1].x, a: 'end' });
    const line = pts.map((p, i) => x(i) + ',' + y(p.v)).join(' ');
    let s = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de ${esc(name)}">` + frame(ticks, y, labels, x);
    if (n > 1) s += `<polyline class="ch-line" points="${line}"/>`;
    pts.forEach((p, i) => { s += `<circle class="ch-dot" cx="${x(i)}" cy="${y(p.v)}" r="4.5"/><circle class="hit" cx="${x(i)}" cy="${y(p.v)}" r="15" data-tip="${esc(p.x + ' · ' + fmtN(p.v) + ' ' + unit)}" data-px="${x(i) / W * 100}" data-py="${y(p.v) / H * 100}" tabindex="0" role="button" aria-label="${esc(p.x + ': ' + fmtN(p.v) + ' ' + unit)}"/>`; });
    const lp = pts[n - 1]; s += `<text class="ch-val" x="${Math.min(x(n - 1), W - M.r - 4)}" y="${y(lp.v) - 10}" text-anchor="${n > 1 ? 'end' : 'middle'}">${fmtN(lp.v)}</text>`;
    return `<div class="chart">${s}</svg><div class="tip" hidden></div></div>${tableHTML(pts, unit)}`;
  }
  function barChart(pts, unit, name) {
    const max = Math.max.apply(null, pts.map((p) => p.v).concat([1])), ticks = niceTicks(0, max, 4), hi = ticks[ticks.length - 1];
    const y = (v) => Math.round((H - M.b - (v / hi) * (H - M.b - M.t)) * 10) / 10;
    const n = pts.length, slot = (W - M.l - M.r) / n, bw = Math.max(8, slot - 8), x = (i) => M.l + i * slot + (slot - bw) / 2;
    const labels = pts.map((p, i) => ({ i, t: p.x })).filter((_, i) => n <= 6 || i % 2 === n % 2 - 0 || i === n - 1).map((l) => ({ i: l.i, t: l.t }));
    let s = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de ${esc(name)}">`;
    ticks.forEach((t) => { s += `<line class="ch-grid" x1="${M.l}" x2="${W - M.r}" y1="${y(t)}" y2="${y(t)}"/><text class="ch-tick" x="${M.l - 6}" y="${y(t) + 3.5}" text-anchor="end">${fmtN(t)}</text>`; });
    pts.forEach((p, i) => {
      const bx = x(i), by = y(p.v), bh = H - M.b - by, r = Math.min(4, bh, bw / 2);
      if (p.v > 0) s += `<path class="ch-bar" d="M${bx},${H - M.b} L${bx},${by + r} Q${bx},${by} ${bx + r},${by} L${bx + bw - r},${by} Q${bx + bw},${by} ${bx + bw},${by + r} L${bx + bw},${H - M.b} Z"/>`;
      s += `<rect class="hit" x="${bx - 2}" y="${M.t}" width="${bw + 4}" height="${H - M.b - M.t}" data-tip="${esc(p.x + ' · ' + fmtN(Math.round(p.v)) + ' ' + unit)}" data-px="${(bx + bw / 2) / W * 100}" data-py="${by / H * 100}" tabindex="0" role="button" aria-label="${esc(p.x + ': ' + fmtN(Math.round(p.v)) + ' ' + unit)}"/>`;
      if (labels.some((l) => l.i === i)) s += `<text class="ch-tick" x="${bx + bw / 2}" y="${H - 8}" text-anchor="middle">${esc(p.x)}</text>`;
    });
    return `<div class="chart">${s}<line class="ch-base" x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}"/></svg><div class="tip" hidden></div></div>${tableHTML(pts, unit)}`;
  }
  const tableHTML = (pts, unit) => `<details class="data"><summary>Ver datos</summary><table><tbody>${pts.slice().reverse().map((p) => `<tr><td>${esc(p.x)}</td><td class="num">${fmtN(Math.round(p.v * 10) / 10)} ${esc(unit)}</td></tr>`).join('')}</tbody></table></details>`;
  const showTip = (t) => {
    const box = t.closest('.chart'), tip = box && box.querySelector('.tip'); if (!tip) return;
    tip.textContent = t.dataset.tip; tip.hidden = false;
    tip.style.left = Math.max(12, Math.min(88, +t.dataset.px)) + '%'; tip.style.top = (+t.dataset.py - 6) + '%';
  };
  document.addEventListener('mouseover', (e) => { const t = e.target.closest && e.target.closest('.hit'); if (t) showTip(t); });
  document.addEventListener('mouseout', (e) => { const t = e.target.closest && e.target.closest('.hit'); if (t) { const tip = t.closest('.chart').querySelector('.tip'); tip.hidden = true; } });
  document.addEventListener('focusin', (e) => { const t = e.target.closest && e.target.closest('.hit'); if (t) showTip(t); });
  document.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('.hit'); if (t) showTip(t); });

  /* ---------- vista ---------- */
  const SUBS = [['resumen', 'Resumen'], ['historial', 'Historial'], ['graficas', 'Gráficas'], ['cuerpo', 'Cuerpo'], ['logros', 'Logros']];
  G.views.progreso = () => {
    const seg = `<div class="seg scroll">${SUBS.map((s) => `<button class="${G.ui.psub === s[0] ? 'on' : ''}" data-act="psub" data-v="${s[0]}">${s[1]}</button>`).join('')}</div>`;
    return `<div class="stack">${seg}${G.ui.psub === 'resumen' ? resumen() : G.ui.psub === 'historial' ? historial() : G.ui.psub === 'graficas' ? graficas() : G.ui.psub === 'cuerpo' ? cuerpo() : logros()}</div>`;
  };
  G.views.progreso.after = () => { if (G.ui.psub === 'cuerpo') loadPhotos(); };
  G.act.psub = (t) => { G.ui.psub = t.dataset.v; G.render(); };

  function weekly(fn) {
    const st = S(), now = new Date(), out = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7), ws = G.weekStart(d), k = dkey(ws);
      const v = Math.round(st.history.filter((h) => dkey(G.weekStart(parseKey(h.date))) === k).reduce((a, h) => a + fn(h), 0));
      out.push({ x: ws.getDate() + ' ' + G.MONTHS[ws.getMonth()].slice(0, 3), v });
    }
    return out;
  }
  const weeklyVolume = () => weekly((h) => (h.vol != null ? h.vol : G.sessVolume(h)));
  const weeklyKcal = () => weekly((h) => G.kcalOf(h));
  function resumen() {
    const st = S(), s = G.stats(), u = st.settings.unit;
    if (!st.history.length) return `<section class="empty"><h3>Tu progreso aparecerá aquí</h3><p class="muted">Termina tu primer entrenamiento y verás tu historial, tus récords y tus gráficas.</p></section>`;
    const wv = weeklyVolume();
    const ids = Array.from(new Set(st.history.flatMap((h) => h.items.map((i) => i.ex))));
    const recs = ids.map((id) => ({ id, ex: G.ex(id), b: G.bestEx(id), l: G.lastEx(id) })).filter((r) => r.b.e > 0 || r.b.t > 0).sort((a, b) => (b.l ? b.l.startedAt : 0) - (a.l ? a.l.startedAt : 0)).slice(0, 8);
    return `<section class="trio"><div><b class="num">${s.count}</b><span>entrenamientos</span></div><div><b class="num">${fmtN(Math.round(s.vol))}</b><span>volumen (${u})</span></div><div><b class="num">${s.prs}</b><span>récords</span></div></section>
      <section><h3>Volumen por semana</h3><p class="muted small">Peso × repeticiones, últimas 8 semanas</p>${barChart(wv, u, 'volumen semanal')}</section>
      ${G.weightKg() > 0 ? `<section><h3>Calorías por semana</h3><p class="muted small">Estimación a partir de tu peso, el tiempo y los ejercicios · esta semana ≈ ${Math.round(G.weekKcal())} kcal</p>${barChart(weeklyKcal(), 'kcal', 'calorías semanales')}</section>` : `<section class="panel soft nudge"><span class="row-main"><b>Cuenta tus calorías</b><span class="muted small">Añade tu peso para estimar cuánto quemas en cada entrenamiento.</span></span><span class="nudge-b"><button class="btn small primary" data-act="profile-open">Añadir peso</button></span></section>`}
      <section><h3>Mejores marcas</h3><div class="rows">${recs.map((r) => `<button class="row" data-act="ex-open" data-id="${r.id}"><span class="row-main"><b>${esc(r.ex.n)}</b><span class="muted small">${r.ex.k === 'time' ? '' : '1RM estimado'}</span></span><b class="num">${r.ex.k === 'time' ? fmtN(r.b.t) + ' s' : fmtN(Math.round(r.b.e * 10) / 10) + ' ' + u}</b></button>`).join('')}</div></section>`;
  }

  function historial() {
    const st = S(), u = st.settings.unit, hs = st.history.slice().sort((a, b) => b.startedAt - a.startedAt);
    if (!hs.length) return `<section class="empty"><h3>Sin entrenamientos todavía</h3><p class="muted">Cuando finalices uno, quedará guardado aquí.</p></section>`;
    return `<section class="rows">${hs.map((h) => `<button class="row" data-act="h-open" data-id="${h.id}"><span class="row-main"><b>${esc(h.name)}</b><span class="muted small">${esc(fmtShort(h.date))} · ${fmtDur(h.dur)} · ${G.sessSets(h)} series${G.kcalOf(h) > 0 ? ' · ≈ ' + Math.round(G.kcalOf(h)) + ' kcal' : ''}</span></span><span class="num muted">${fmtN(Math.round(h.vol || 0))} ${u}</span>${h.prs ? `<span class="fav">${G.icFill('star')}</span>` : ic('chev')}</button>`).join('')}</section>`;
  }
  G.act['h-open'] = (t) => {
    const st = S(), h = st.history.find((x) => x.id === t.dataset.id); if (!h) return; G._h = h.id; const u = st.settings.unit;
    const items = h.items.map((it) => { const e = G.ex(it.ex); return `<div class="h-ex"><b>${esc(e.n)}</b><div class="h-sets">${it.sets.map((s, j) => `<span class="h-set ${s.pr ? 'pr' : ''}"><i>${j + 1}</i>${it.k === 'time' ? fmtN(s.r) + ' s' : (s.w ? fmtN(s.w) + ' × ' : '') + fmtN(s.r)}${s.pr ? ' ★' : ''}</span>`).join('')}</div></div>`; }).join('');
    const canRepeat = h.routineId && st.routines.some((r) => r.id === h.routineId);
    const c = G.sheet(`<p class="muted">${esc(fmtLong(h.date))} · ${fmtDur(h.dur)} · volumen ${fmtN(Math.round(h.vol || 0))} ${u}${G.kcalOf(h) > 0 ? ' · ≈ ' + Math.round(G.kcalOf(h)) + ' kcal' : ''}</p>${items}<div class="btn-row">${canRepeat ? `<button class="btn ghost grow" data-act="h-repeat" data-id="${h.routineId}">Repetir esta rutina</button>` : ''}<button class="btn danger-ghost grow" data-act="h-del">${ic('trash')} Eliminar</button></div>`, { title: h.name });
    G._hc = c;
  };
  G.act['h-repeat'] = (t) => { G._hc.close(); G.startSession(t.dataset.id); };
  G.act['h-del'] = async () => {
    const ok = await G.confirm('¿Eliminar este entrenamiento del historial?', { title: 'Eliminar entrenamiento', detail: 'Se actualizarán tus marcas y gráficas.', ok: 'Eliminar', danger: true });
    if (!ok) return;
    const st = S(); st.history = st.history.filter((h) => h.id !== G._h); G.save(); G._hc.close(); G.toast('Entrenamiento eliminado'); G.render();
  };

  function graficas() {
    const st = S(), u = st.settings.unit;
    const ids = Array.from(new Set(st.history.flatMap((h) => h.items.map((i) => i.ex))));
    if (!ids.length) return `<section class="empty"><h3>Sin datos para graficar</h3><p class="muted">Registra ejercicios con peso y repeticiones y verás cómo evolucionan.</p></section>`;
    if (!ids.includes(G.ui.chartEx)) G.ui.chartEx = ids[0];
    const ex = G.ex(G.ui.chartEx), time = ex.k === 'time', met = G.ui.chartMetric;
    const hist = G.histEx(ex.id);
    const pts = hist.map((h) => {
      let v;
      if (time) v = Math.max.apply(null, h.sets.map((s) => num(s.r)));
      else if (met === 'e') v = Math.max.apply(null, h.sets.map((s) => G.e1rm(s.w, s.r)));
      else v = Math.max.apply(null, h.sets.map((s) => num(s.w)));
      return { x: fmtShort(h.date), v: Math.round(v * 10) / 10 };
    }).filter((p) => p.v > 0);
    const unit = time ? 's' : u;
    return `<label class="field"><span>Ejercicio</span><select data-ch="chart-ex">${ids.map((id) => `<option value="${id}" ${id === ex.id ? 'selected' : ''}>${esc(G.ex(id).n)}</option>`).join('')}</select></label>
      ${time ? '' : `<div class="seg small"><button class="${met === 'w' ? 'on' : ''}" data-act="chart-m" data-m="w">Peso máximo</button><button class="${met === 'e' ? 'on' : ''}" data-act="chart-m" data-m="e">1RM estimado</button></div>`}
      <h3>${esc(ex.n)}: ${time ? 'mejor tiempo' : met === 'e' ? '1RM estimado' : 'peso máximo'} por sesión</h3>${lineChart(pts, unit, ex.n)}`;
  }
  G.chg['chart-ex'] = (t) => { G.ui.chartEx = t.value; G.render(); };
  G.act['chart-m'] = (t) => { G.ui.chartMetric = t.dataset.m; G.render(); };

  /* ---------- cuerpo ---------- */
  function cuerpo() {
    const st = S(), u = st.settings.unit, b = st.body.slice().sort((a, c) => a.date.localeCompare(c.date));
    const wts = b.filter((e) => e.w > 0).map((e) => ({ x: fmtShort(e.date), v: e.w }));
    const first = {}, lastm = {};
    b.forEach((e) => Object.keys(e.m || {}).forEach((k) => { if (!(k in first)) first[k] = e.m[k]; lastm[k] = e.m[k]; }));
    const meas = G.MEAS.filter((m) => lastm[m[0]]).map((m) => { const d = lastm[m[0]] - first[m[0]]; return `<div class="row"><span>${m[1]}</span><b class="num">${fmtN(lastm[m[0]])} cm</b><span class="muted small num">${d ? (d > 0 ? '+' : '−') + fmtN(Math.abs(Math.round(d * 10) / 10)) : 'sin cambio'}</span></div>`; }).join('');
    return `<div class="btn-row"><button class="btn primary grow" data-act="body-log">${ic('scale')} Registrar peso y medidas</button></div>
      ${G.profileCard()}
      <section><h3>Peso corporal</h3>${lineChart(wts, u, 'peso corporal')}</section>
      ${meas ? `<section><h3>Medidas actuales</h3><p class="muted small">El cambio se compara con tu primer registro.</p><div class="rows">${meas}</div></section>` : ''}
      ${b.length ? `<section><h3>Registros</h3><div class="rows">${b.slice().reverse().slice(0, 10).map((e) => `<div class="row"><span>${esc(fmtShort(e.date))}</span><b class="num">${e.w ? fmtN(e.w) + ' ' + u : '—'}</b><button class="icon-btn" data-act="body-del" data-d="${e.date}" aria-label="Eliminar registro del ${esc(fmtShort(e.date))}">${ic('trash')}</button></div>`).join('')}</div></section>` : ''}
      <section><h3>Fotos de progreso</h3>${G.photos.ok ? '' : '<p class="muted small">Este navegador no permite guardar fotos de forma permanente; se perderán al cerrar.</p>'}<label class="btn ghost">${ic('camera')} Añadir foto<input type="file" accept="image/*" data-ch="ph-add" hidden></label><div class="photos" id="photos"></div></section>`;
  }
  G.act['body-del'] = async (t) => {
    const ok = await G.confirm('¿Eliminar el registro del ' + fmtShort(t.dataset.d) + '?', { title: 'Eliminar registro', ok: 'Eliminar', danger: true });
    if (!ok) return; const st = S(); st.body = st.body.filter((e) => e.date !== t.dataset.d); G.save(); G.render();
  };
  async function loadPhotos() {
    const box = G.$('#photos'); if (!box) return;
    const ps = (await G.photos.all()).sort((a, b) => b.date.localeCompare(a.date));
    box.innerHTML = ps.length ? ps.map((p) => `<button class="ph" data-act="ph-open" data-id="${p.id}"><img src="${p.data}" alt="Foto del ${esc(fmtShort(p.date))}"><span>${esc(fmtShort(p.date))}</span></button>`).join('') : '<p class="muted small">Aún no hay fotos.</p>';
  }
  G.chg['ph-add'] = async (t) => {
    const f = t.files && t.files[0]; if (!f) return;
    try { const data = await G.resizeImg(f, 900, 0.8); await G.photos.put({ id: G.uid(), date: dkey(), data }); G.flag('photo'); G.toast('Foto guardada'); loadPhotos(); } catch (e) { G.toast('No se pudo guardar la foto'); }
    t.value = '';
  };
  G.act['ph-open'] = async (t) => {
    const p = (await G.photos.all()).find((x) => x.id === t.dataset.id); if (!p) return;
    G._ph = p.id;
    G._phc = G.sheet(`<img class="ph-big" src="${p.data}" alt="Foto del ${esc(fmtShort(p.date))}"><div class="btn-row"><button class="btn danger-ghost grow" data-act="ph-del">${ic('trash')} Eliminar foto</button></div>`, { title: fmtLong(p.date) });
  };
  G.act['ph-del'] = async () => {
    const ok = await G.confirm('¿Eliminar esta foto?', { title: 'Eliminar foto', ok: 'Eliminar', danger: true });
    if (!ok) return; await G.photos.del(G._ph); G._phc.close(); loadPhotos();
  };

  /* ---------- logros ---------- */
  function logros() { return G.logrosView(); }
})((window.G = window.G || {}));
