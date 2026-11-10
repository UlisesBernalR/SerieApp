/* Serie — perfil (altura, peso, edad, sexo), IMC y metabolismo basal */
(function (G) {
  'use strict';
  const { esc, ic, num, fmtN } = G;
  const S = () => G.S();
  const r1 = (n) => fmtN(Math.round(n * 10) / 10);

  /* resumen corto para la fila de Más y para la tarjeta */
  G.profileLine = () => {
    const st = S(), p = st.profile, w = G.lastWeight(), u = st.settings.unit, bits = [];
    if (p.h) bits.push(fmtN(p.h) + ' cm');
    if (w) bits.push(fmtN(w) + ' ' + u);
    const b = G.bmi(G.weightKg(), p.h);
    if (b) bits.push('IMC ' + r1(b));
    return bits.join(' · ');
  };

  G.profileRow = () => {
    const line = G.profileLine();
    return `<button class="row" data-act="profile-open"><span class="ico-l">${ic('scale')}</span><span class="row-main"><b>${line ? 'Mi perfil' : 'Añade tu altura y peso'}</b><span class="muted small">${line ? esc(line) : 'Para estimar las calorías que quemas y tu IMC'}</span></span>${ic('chev')}</button>`;
  };

  /* tarjeta de la pestaña Cuerpo */
  G.profileCard = () => {
    const st = S(), p = st.profile, kg = G.weightKg(), b = G.bmi(kg, p.h), bm = G.bmr(kg, p.h, p.age, p.sex);
    if (!kg && !p.h) return '';
    return `<section class="panel soft prof-card"><div class="prof-top"><h3>Mi perfil</h3><button class="btn small ghost" data-act="profile-open">Editar</button></div>
      <div class="sum-grid"><div><b class="num">${p.h ? fmtN(p.h) : '—'}</b><span>cm</span></div><div><b class="num">${G.lastWeight() ? fmtN(G.lastWeight()) : '—'}</b><span>${st.settings.unit}</span></div><div><b class="num">${b ? r1(b) : '—'}</b><span>IMC</span></div></div>
      ${b ? bmiBar(b) : '<p class="muted small">Añade tu altura y peso para ver tu IMC.</p>'}
      ${bm ? `<p class="small">Metabolismo basal: <b class="num">${Math.round(bm)}</b> kcal al día en reposo.</p>` : ''}</section>`;
  };

  /* escala del IMC: 15 a 40 */
  function bmiBar(b) {
    const pos = Math.max(0, Math.min(100, (b - 15) / 25 * 100));
    return `<div class="bmi" role="img" aria-label="IMC ${r1(b)}: ${G.bmiCat(b)}"><div class="bmi-bar"><i style="flex:3.5"></i><i style="flex:6.5"></i><i style="flex:5"></i><i style="flex:10"></i><b style="left:${pos}%"></b></div>
      <p class="small"><b>${G.bmiCat(b)}</b> <span class="muted">· referencia para adultos</span></p></div>`;
  }

  /* hoja de edición */
  G.act['profile-open'] = () => {
    const st = S(), p = st.profile, u = st.settings.unit, w = G.lastWeight();
    const c = G.sheet(`<div class="grid2">
        <label class="field"><span>Altura (cm)</span><input id="pf-h" data-in="pf-calc" type="text" inputmode="decimal" value="${p.h ? fmtN(p.h) : ''}" placeholder="170"></label>
        <label class="field"><span>Peso (${u})</span><input id="pf-w" data-in="pf-calc" type="text" inputmode="decimal" value="${w ? fmtN(w) : ''}" placeholder="${u === 'kg' ? '70' : '155'}"></label>
        <label class="field"><span>Edad (opcional)</span><input id="pf-a" data-in="pf-calc" type="text" inputmode="numeric" value="${p.age || ''}" placeholder="25"></label>
        <label class="field"><span>Sexo (opcional)</span><select id="pf-s" data-ch="pf-calc"><option value="">Sin indicar</option><option value="m" ${p.sex === 'm' ? 'selected' : ''}>Hombre</option><option value="f" ${p.sex === 'f' ? 'selected' : ''}>Mujer</option></select></label></div>
      <div id="pf-out"></div>
      <p class="muted small">Estos datos se guardan solo en este dispositivo y se usan para estimar calorías. La edad y el sexo solo sirven para calcular el metabolismo basal.</p>
      <div class="btn-row"><button class="btn primary grow" data-act="pf-save">Guardar</button></div>`, { title: 'Mi perfil' });
    G._pf = c; calc();
  };
  function vals() {
    return { h: num(G.$('#pf-h').value), w: num(G.$('#pf-w').value), a: Math.round(num(G.$('#pf-a').value)), s: G.$('#pf-s').value };
  }
  function calc() {
    const out = G.$('#pf-out'); if (!out) return;
    const v = vals(), kg = v.w > 0 ? G.toKg(v.w) : 0, b = G.bmi(kg, v.h), bm = G.bmr(kg, v.h, v.a, v.s);
    out.innerHTML = (b ? bmiBar(b) : '<p class="muted small">Escribe tu altura y peso para ver tu IMC.</p>') +
      (bm ? `<p>Metabolismo basal: <b class="num">${Math.round(bm)}</b> kcal al día en reposo.</p>` : '') +
      '<p class="muted small">El IMC no distingue músculo de grasa: si entrenas fuerza, tómalo solo como referencia.</p>';
  }
  G.inp['pf-calc'] = calc;
  G.chg['pf-calc'] = calc;

  G.act['pf-save'] = () => {
    const v = vals(), st = S();
    if (v.h && (v.h < 100 || v.h > 250)) { G.toast('La altura va entre 100 y 250 cm'); return; }
    if (v.a && (v.a < 10 || v.a > 100)) { G.toast('La edad va entre 10 y 100 años'); return; }
    if (v.w && G.toKg(v.w) > 400) { G.toast('Revisa el peso'); return; }
    st.profile = { h: v.h || 0, age: v.a || 0, sex: v.s || '' };
    if (v.w > 0) {
      const today = G.dkey(), prev = st.body.find((b) => b.date === today);
      if (prev) prev.w = v.w; else st.body.push({ date: today, w: v.w, m: {} });
    }
    G.save(true); G._pf.close(); G.toast('Perfil guardado'); G.render();
  };

  /* aviso en Inicio mientras falte el peso */
  G.profileNudge = () => {
    const st = S();
    if (G.weightKg() > 0 || st.settings.hideNudge) return '';
    return `<section class="panel soft nudge"><span class="row-main"><b>Cuenta tus calorías</b><span class="muted small">Añade tu altura y peso para estimar cuánto quemas al entrenar.</span></span><span class="nudge-b"><button class="btn small primary" data-act="profile-open">Añadir</button><button class="btn small ghost" data-act="nudge-hide">Ahora no</button></span></section>`;
  };
  G.act['nudge-hide'] = () => { S().settings.hideNudge = true; G.save(); G.render(); };
})((window.G = window.G || {}));
