/* Serie — inicio, cronómetro/descanso y registro de peso corporal */
(function (G) {
  'use strict';
  const { esc, ic, fmtDur, fmtLong, fmtShort, DAYS, DAYS_S, MONTHS, num, fmtN } = G;
  const S = () => G.S();
  G.ui = G.ui || {};
  G.views = G.views || {};
  const PLATE = ['red', 'blue', 'yellow', 'green', 'white', 'black', 'gray'];
  G.plateColor = (i) => PLATE[i % 5];

  G.musChips = (keys, max) => (keys || []).slice(0, max || 4).map((m) => `<span class="mus">${esc(G.MUSCLES[m] || m)}</span>`).join('');

  /* barra con discos: cada disco es un entrenamiento de la semana */
  function plateBar(done, goal) {
    const H = [84, 76, 68, 60, 52, 44, 36];
    let s = `<svg class="platebar" viewBox="0 0 320 96" role="img" aria-label="${done} de ${goal} entrenamientos esta semana">` +
      `<rect class="pb-bar" x="6" y="45" width="308" height="6" rx="3"/><rect class="pb-sleeve" x="6" y="41" width="100" height="14" rx="3"/><rect class="pb-sleeve" x="214" y="41" width="100" height="14" rx="3"/>` +
      `<rect class="pb-collar" x="120" y="36" width="6" height="24" rx="2"/><rect class="pb-collar" x="194" y="36" width="6" height="24" rx="2"/>`;
    for (let i = 0; i < goal; i++) {
      const h = H[i], y = 48 - h / 2, on = i < done, cls = 'pl pl-' + PLATE[i] + (on ? ' on' : '');
      s += `<rect class="${cls}" x="${106 - i * 14}" y="${y}" width="12" height="${h}" rx="3"/><rect class="${cls}" x="${202 + i * 14}" y="${y}" width="12" height="${h}" rx="3"/>`;
    }
    return s + '</svg>';
  }

  G.views.home = () => {
    const st = S(), now = new Date(), wk = G.weekCount(now), goal = st.settings.goal, stat = G.stats();
    const di = G.dayIdx(now), slots = G.slotsOn(di);
    let today = '';
    if (st.session) {
      today = `<section class="panel hero"><p class="eyebrow-free">Entrenamiento en curso</p><h2 class="big">${esc(st.session.name)}</h2>` +
        `<p class="muted"><span id="home-elapsed">${fmtDur((Date.now() - st.session.startedAt) / 1000)}</span> · ${st.session.items.reduce((a, i) => a + i.sets.filter((s) => s.done).length, 0)} series hechas</p>` +
        `<div class="btn-row"><button class="btn primary grow" data-act="open-workout">Continuar</button></div></section>`;
    } else if (slots.length) {
      today = slots.map((sl) => {
        const r = st.routines.find((x) => x.id === sl.routine);
        if (!r) return '';
        const done = G.doneToday(r.id), mus = G.routineMuscles(r);
        return `<section class="panel hero ${done ? 'is-done' : ''}"><p class="muted small">Hoy · ${esc(sl.time)}</p><h2 class="big">${esc(r.name)}</h2>` +
          `<p class="muted">${r.items.length} ejercicios · unos ${G.routineMin(r)} min</p><div class="mus-row">${G.musChips(mus.prim, 5)}</div>` +
          (done ? `<p class="done-line">${ic('check')} Hecho hoy</p><div class="btn-row"><button class="btn ghost grow" data-act="start-routine" data-id="${r.id}">Repetir</button></div>`
            : `<div class="btn-row"><button class="btn primary grow" data-act="start-routine" data-id="${r.id}">${G.icFill('play')} Empezar entrenamiento</button></div>`) + `</section>`;
      }).join('');
    } else if (!st.routines.length) {
      today = `<section class="panel hero"><h2 class="big">Crea tu primera rutina</h2><p class="muted">Usa una plantilla (Push/Pull/Legs, cuerpo completo, en casa) o arma la tuya con los ejercicios de la biblioteca.</p>` +
        `<div class="btn-row"><button class="btn primary grow" data-act="goto" data-tab="rutinas">Ir a Rutinas</button></div></section>`;
    } else {
      today = `<section class="panel hero"><h2 class="big">Hoy no tienes entrenamiento programado</h2><p class="muted">Elige una rutina o entrena sin plan y añade ejercicios sobre la marcha.</p>` +
        `<div class="btn-row"><button class="btn primary grow" data-act="pick-routine">Elegir rutina</button><button class="btn ghost grow" data-act="start-free">Entrenamiento libre</button></div></section>`;
    }
    const nx = G.nextSlot();
    let next = '';
    if (nx && !(nx.in === 0 && slots.length)) {
      const r = st.routines.find((x) => x.id === nx.slot.routine);
      if (r) next = `<div class="row"><div class="row-main"><span class="muted small">Próximo entrenamiento</span><b>${esc(r.name)}</b><span class="muted small">${nx.in === 0 ? 'Hoy' : nx.in === 1 ? 'Mañana' : fmtShort(G.dkey(nx.date))} · ${esc(nx.slot.time)}</span></div></div>`;
    }
    return `<div class="stack">${today}
      <section class="panel bar-panel"><div class="pb-wrap">${plateBar(wk, goal)}</div>
        <p class="pb-cap"><b class="num">${wk}</b> de ${goal} entrenamientos esta semana${wk > goal ? ` <span class="muted">(+${wk - goal} extra)</span>` : ''}</p>
        ${G.weightKg() > 0 && G.weekKcal() > 0 ? `<p class="pb-kcal">${ic('flame')} <b class="num">${Math.round(G.weekKcal())}</b> kcal quemadas esta semana (estimado)</p>` : ''}
        <p class="muted small">Cada disco es un entrenamiento. Cambia la meta en Más › Ajustes.</p></section>
      ${G.profileNudge()}
      <section class="quick">
        <button class="quick-b" data-act="open-timer" data-tab="sw">${ic('timer')}<span>Cronómetro</span></button>
        <button class="quick-b" data-act="open-timer" data-tab="rest">${ic('flag')}<span>Descanso</span></button>
        <button class="quick-b" data-act="body-log">${ic('scale')}<span>Peso corporal</span></button>
      </section>
      <section class="trio">
        <div><b class="num">${stat.streak}</b><span>racha</span></div>
        <div><b class="num">${stat.count}</b><span>entrenamientos</span></div>
        <div><b class="num">${stat.prs}</b><span>récords</span></div>
      </section>
      <p class="muted small cap-note">Racha: entrenamientos seguidos con un día de descanso como máximo entre ellos.</p>
      ${next ? `<section class="rows">${next}</section>` : ''}
    </div>`;
  };

  /* iniciar sesiones */
  G.newSession = (r) => {
    const items = r ? r.items.map((i) => ({ ex: i.ex, k: G.ex(i.ex).k, sets: Array.from({ length: i.sets }, () => ({ w: '', r: '', done: false })), note: '', rest: i.rest, ss: !!i.ss, target: i.reps, pb: G.bestEx(i.ex) })) : [];
    return { id: G.uid(), routineId: r ? r.id : null, name: r ? r.name : 'Entrenamiento libre', startedAt: Date.now(), items, ch: [] };
  };
  G.startSession = async (rid) => {
    const st = S();
    if (st.session) {
      const ok = await G.confirm('Ya tienes un entrenamiento en curso.', { title: 'Entrenamiento en curso', detail: 'Si empiezas otro, el actual se descartará.', ok: 'Descartar y empezar', danger: true });
      if (!ok) return;
    }
    const r = rid ? st.routines.find((x) => x.id === rid) : null;
    st.session = G.newSession(r); G.save(true);
    G.openWorkout();
    G.render();
  };
  G.act['start-routine'] = (t) => G.startSession(t.dataset.id);
  G.act['start-free'] = () => G.startSession(null);
  G.act['open-workout'] = () => G.openWorkout();
  G.act['pick-routine'] = () => {
    const st = S();
    const c = G.sheet(`<div class="rows">${st.routines.map((r, i) => `<button class="row pick-row" data-act="pick-go" data-id="${r.id}"><span class="dot pl-${G.plateColor(i)} on"></span><span class="row-main"><b>${esc(r.name)}</b><span class="muted small">${r.items.length} ejercicios · unos ${G.routineMin(r)} min</span></span>${ic('chev')}</button>`).join('') || '<p class="muted">Aún no tienes rutinas.</p>'}</div>`, { title: 'Elegir rutina' });
    G._pick = c;
  };
  G.act['pick-go'] = (t) => { if (G._pick) G._pick.close(); G.startSession(t.dataset.id); };
  G.act['goto'] = (t) => G.go(t.dataset.tab);

  /* cronómetro y descanso */
  G.ui.timerTab = 'sw';
  function timerBody() {
    const st = S();
    if (G.ui.timerTab === 'sw') {
      const laps = st.sw.laps, on = st.sw.run || G.sw.ms() > 0;
      return `<div class="seg"><button class="on" data-act="timer-tab" data-tab="sw">Cronómetro</button><button data-act="timer-tab" data-tab="rest">Descanso</button></div>
        <div class="sw-big" id="sw-time">${G.fmtSW(G.sw.ms())}</div>
        <div class="sw-kcal"><label class="field"><span>Actividad (para contar calorías)</span><select data-ch="sw-act">${G.ACTS.map((a) => `<option value="${a[0]}" ${a[0] === st.sw.act ? 'selected' : ''}>${esc(a[1])}</option>`).join('')}</select></label>
          ${G.weightKg() > 0 ? `<p class="kcal-live"><span class="num" id="sw-kcal" data-on="1">≈ ${Math.round(G.kcalAct(st.sw.act, G.sw.ms()))} kcal</span><span class="muted small">quemadas, estimado</span></p>` : `<p class="muted small">Añade tu peso para ver cuántas calorías quemas. <button class="link" data-act="profile-open">Añadir peso</button></p>`}</div>
        <div class="btn-row"><button class="btn ghost grow" data-act="sw-reset" ${on ? '' : 'disabled'}>Reiniciar</button><button class="btn ghost grow" data-act="sw-lap" ${on ? '' : 'disabled'}>${ic('flag')} Vuelta</button><button class="btn primary grow" data-act="sw-toggle">${st.sw.run ? 'Pausar' : (G.sw.ms() ? 'Seguir' : 'Iniciar')}</button></div>
        <div class="rows laps">${laps.slice().reverse().map((ms, i) => { const n = laps.length - i, prev = n > 1 ? laps[n - 2] : 0; return `<div class="row"><span class="muted">Vuelta ${n}</span><b class="num">${G.fmtSW(ms - prev)}</b><span class="muted num">${G.fmtSW(ms)}</span></div>`; }).join('')}</div>`;
    }
    const pre = [30, 45, 60, 90, 120, 180, 240];
    return `<div class="seg"><button data-act="timer-tab" data-tab="sw">Cronómetro</button><button class="on" data-act="timer-tab" data-tab="rest">Descanso</button></div>
      <p class="muted">Temporizador de descanso entre series. Suena y vibra al terminar.</p>
      <div class="chips">${pre.map((s) => `<button class="chip" data-act="rest-go" data-n="${s}">${s >= 60 ? (s % 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : s / 60 + ' min') : s + ' s'}</button>`).join('')}</div>
      <label class="field"><span>Otro tiempo (segundos)</span><div class="inline"><input id="rest-custom" type="number" inputmode="numeric" min="5" max="3600" placeholder="${st.settings.rest}"><button class="btn primary" data-act="rest-custom">Iniciar</button></div></label>
      ${st.rest ? `<div class="btn-row"><button class="btn ghost grow" data-act="rest-stop">Detener el descanso actual</button></div>` : ''}`;
  }
  G.act['open-timer'] = (t) => { G.ui.timerTab = (t && t.dataset.tab) || G.ui.timerTab; G.openTimer(); };
  G.openTimer = () => {
    if (G._timer && document.body.contains(G._timer.el)) { G._timer.set(timerBody()); return; }
    G._timer = G.sheet(timerBody(), { title: 'Tiempo', onClose: () => (G._timer = null) });
  };
  const refreshTimer = () => { if (G._timer) G._timer.set(timerBody()); };
  G.act['timer-tab'] = (t) => { G.ui.timerTab = t.dataset.tab; refreshTimer(); };
  G.act['sw-toggle'] = () => { G.unlock(); G.sw.toggle(); refreshTimer(); G.tick(); };
  G.chg['sw-act'] = (t) => { S().sw.act = t.value; G.save(); refreshTimer(); };
  G.act['sw-lap'] = () => { G.sw.lap(); refreshTimer(); };
  G.act['sw-reset'] = () => { G.sw.reset(); refreshTimer(); G.tick(); };
  G.act['rest-go'] = (t) => { G.rest.start(+t.dataset.n); G.toast('Descanso iniciado'); refreshTimer(); };
  G.act['rest-custom'] = () => { const v = parseInt(G.$('#rest-custom').value, 10) || S().settings.rest; G.rest.start(Math.max(5, Math.min(3600, v))); refreshTimer(); };

  /* peso corporal y medidas (registro rápido) */
  const MEAS = [['pecho', 'Pecho'], ['cintura', 'Cintura'], ['cadera', 'Cadera'], ['brazo', 'Brazo'], ['muslo', 'Muslo']];
  G.MEAS = MEAS;
  G.act['body-log'] = () => {
    const st = S(), last = st.body.slice().sort((a, b) => b.date.localeCompare(a.date))[0] || {}, u = st.settings.unit;
    const c = G.sheet(`<label class="field"><span>Peso corporal (${u})</span><input id="bl-w" type="text" inputmode="decimal" placeholder="${last.w ? fmtN(last.w) : ''}"></label>
      <p class="muted small">Medidas en cm (opcional)</p><div class="grid2">${MEAS.map((m) => `<label class="field"><span>${m[1]}</span><input data-m="${m[0]}" type="text" inputmode="decimal" placeholder="${last.m && last.m[m[0]] ? fmtN(last.m[m[0]]) : ''}"></label>`).join('')}</div>
      <div class="btn-row"><button class="btn primary grow" data-act="body-save">Guardar</button></div>`, { title: 'Peso y medidas' });
    G._bl = c;
  };
  G.act['body-save'] = () => {
    const st = S(), w = num(G.$('#bl-w').value), m = {};
    G.$$('[data-m]', G._bl.el).forEach((i) => { const v = num(i.value); if (v > 0) m[i.dataset.m] = v; });
    if (!(w > 0) && !Object.keys(m).length) { G.toast('Escribe tu peso o alguna medida'); return; }
    const today = G.dkey(), prev = st.body.find((b) => b.date === today);
    const e = prev || { date: today, w: 0, m: {} };
    if (w > 0) e.w = w; Object.assign(e.m, m);
    if (!prev) st.body.push(e);
    G.save(); G._bl.close(); G.toast('Guardado'); G.render();
  };
})((window.G = window.G || {}));
