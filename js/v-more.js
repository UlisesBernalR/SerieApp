/* Serie — Más: herramientas (discos, 1RM, calentamiento), ajustes y respaldo */
(function (G) {
  'use strict';
  const { esc, ic, num, fmtN } = G;
  const S = () => G.S();

  const sw = (id, on, label, sub) => `<label class="switch-row"><span class="row-main"><b>${label}</b>${sub ? `<span class="muted small">${sub}</span>` : ''}</span><input type="checkbox" role="switch" data-ch="set-sw" data-k="${id}" ${on ? 'checked' : ''}></label>`;

  G.views.mas = () => {
    const st = S(), s = st.settings;
    const warn = G.persist ? '' : `<section class="panel warn"><b>Los datos no se están guardando</b><p class="small">Este navegador bloquea el almacenamiento. Lo que registres se perderá al cerrar la página. Usa «Copiar respaldo» para conservarlo.</p></section>`;
    const install = G._bip ? `<button class="row" data-act="install"><span class="row-main"><b>Instalar en tu pantalla de inicio</b><span class="muted small">Se abre como una app y funciona sin internet</span></span>${ic('down2')}</button>` : '';
    return `<div class="stack">${warn}
      <section class="rows"><h3 class="rows-h">Mi cuerpo</h3>${G.profileRow()}</section>
      <section class="rows"><h3 class="rows-h">Herramientas</h3>
        <button class="row" data-act="open-timer" data-tab="sw"><span class="ico-l">${ic('timer')}</span><span class="row-main"><b>Cronómetro y descanso</b><span class="muted small">También está en el botón de arriba</span></span>${ic('chev')}</button>
        <button class="row" data-act="tool-plates"><span class="ico-l">${ic('dumbbell')}</span><span class="row-main"><b>Calculadora de discos</b><span class="muted small">Qué discos poner en cada lado de la barra</span></span>${ic('chev')}</button>
        <button class="row" data-act="tool-1rm"><span class="ico-l">${ic('calc')}</span><span class="row-main"><b>Calculadora de 1RM</b><span class="muted small">Tu repetición máxima estimada y porcentajes</span></span>${ic('chev')}</button>
        <button class="row" data-act="tool-warm"><span class="ico-l">${ic('warm')}</span><span class="row-main"><b>Calentamiento y estiramientos</b><span class="muted small">Según los músculos que vas a trabajar</span></span>${ic('chev')}</button>
        <button class="row" data-act="routine-import"><span class="ico-l">${ic('share')}</span><span class="row-main"><b>Importar una rutina</b><span class="muted small">Con un código que te compartieron</span></span>${ic('chev')}</button>
        ${install}</section>
      <section><h3>Ajustes</h3>
        <div class="field"><span>Tema</span><div class="seg small">${[['system', 'Sistema'], ['light', 'Claro'], ['dark', 'Oscuro']].map((t) => `<button class="${s.theme === t[0] ? 'on' : ''}" data-act="set-theme" data-v="${t[0]}">${t[1]}</button>`).join('')}</div></div>
        <div class="field"><span>Unidad de peso</span><div class="seg small">${['kg', 'lb'].map((u) => `<button class="${s.unit === u ? 'on' : ''}" data-act="set-unit" data-v="${u}">${u}</button>`).join('')}</div></div>
        <div class="grid2"><label class="field"><span>Descanso por defecto</span><select data-ch="set-rest">${[30, 45, 60, 90, 120, 150, 180, 240].map((x) => `<option value="${x}" ${x === s.rest ? 'selected' : ''}>${x} s</option>`).join('')}</select></label>
        <label class="field"><span>Meta semanal</span><select data-ch="set-goal">${[1, 2, 3, 4, 5, 6, 7].map((x) => `<option value="${x}" ${x === s.goal ? 'selected' : ''}>${x} por semana</option>`).join('')}</select></label></div>
        <label class="field"><span>Peso de tu barra (${s.unit})</span><input type="text" inputmode="decimal" data-in="set-bar" value="${fmtN(s.bar)}"></label>
        <div class="rows">${sw('sound', s.sound, 'Sonido al terminar el descanso')}${sw('vibrate', s.vibrate, 'Vibración', 'Solo en dispositivos compatibles')}${sw('wake', s.wake, 'Mantener la pantalla encendida', 'Durante el entrenamiento')}</div></section>
      <section><h3>Respaldo</h3><p class="muted small">Tus datos se guardan solo en este dispositivo. Haz un respaldo de vez en cuando, o para pasarlos a otro teléfono.</p>
        <div class="btn-row wrap"><button class="btn ghost grow" data-act="bk-dl">${ic('down2')} Descargar</button><button class="btn ghost grow" data-act="bk-copy">${ic('copy')} Copiar</button></div>
        <div class="btn-row wrap"><label class="btn ghost grow">${ic('up2')} Cargar archivo<input type="file" accept=".json,application/json" hidden data-ch="bk-file"></label><button class="btn ghost grow" data-act="bk-paste">Pegar copia</button></div>
        <div class="btn-row"><button class="btn danger-ghost grow" data-act="bk-wipe">${ic('trash')} Borrar todos los datos</button></div></section>
      <section><h3>Ayuda</h3>
        <details class="faq"><summary>¿Cómo la instalo en el teléfono?</summary><p>Ábrela en el navegador. En Android (Chrome): menú ⋮ › Instalar app. En iPhone (Safari): Compartir › Añadir a pantalla de inicio. Después funciona sin internet.</p></details>
        <details class="faq"><summary>¿Los avisos suenan con la app cerrada?</summary><p>No. Como app web, los avisos del horario se muestran mientras la app está abierta o instalada y en uso. Para avisos con la app cerrada hace falta empaquetarla como APK (por ejemplo con Capacitor y notificaciones locales).</p></details>
        <details class="faq"><summary>¿Qué es el 1RM?</summary><p>Es el máximo peso que podrías levantar una sola vez. Se estima a partir del peso y las repeticiones de una serie.</p></details>
        <details class="faq"><summary>¿Qué es una superserie?</summary><p>Dos ejercicios seguidos sin descanso entre ellos. El descanso llega después del segundo.</p></details></section>
      <p class="muted small center">Serie · tus datos son tuyos y no salen de tu dispositivo.</p></div>`;
  };

  G.act['install'] = async () => { if (!G._bip) return; G._bip.prompt(); try { await G._bip.userChoice; } catch (e) {} G._bip = null; G.render(); };

  /* ajustes */
  G.act['set-theme'] = (t) => { S().settings.theme = t.dataset.v; G.save(); G.applyTheme(); G.render(); };
  G.act['set-unit'] = (t) => {
    const s = S().settings, u = t.dataset.v; if (u === s.unit) return;
    const f = u === 'lb' ? 2.20462 : 1 / 2.20462;
    S().body.forEach((b) => { if (b.w > 0) b.w = Math.round(b.w * f * 10) / 10; });
    s.unit = u; s.bar = u === 'kg' ? 20 : 45; G.save(); G.toast('Tu peso corporal se convirtió; los pesos de las series no'); G.render();
  };
  G.chg['set-rest'] = (t) => { S().settings.rest = +t.value; G.save(); };
  G.chg['set-goal'] = (t) => { S().settings.goal = +t.value; G.save(); };
  G.inp['set-bar'] = (t) => { const v = num(t.value); if (v > 0) { S().settings.bar = v; G.save(); } };
  G.chg['set-sw'] = (t) => { S().settings[t.dataset.k] = t.checked; G.save(); if (t.dataset.k === 'sound' && t.checked) { G.unlock(); G.beep(1); } };

  /* calculadora de discos */
  const PH = [84, 76, 68, 58, 46, 38, 30];
  G.act['tool-plates'] = () => {
    const s = S().settings; G._pc = { w: '' };
    G._pcc = G.sheet(`<label class="field"><span>Peso total que quieres levantar (${s.unit})</span><input id="pc-w" data-in="pc-w" type="text" inputmode="decimal" placeholder="${s.unit === 'kg' ? '100' : '225'}" autofocus></label>
      <p class="muted small">Barra de ${fmtN(s.bar)} ${s.unit} (cámbiala en Más › Ajustes). Discos disponibles: ${G.PLATES[s.unit].colors.map((c) => c[0]).join(', ')}.</p><div id="pc-out"></div>`, { title: 'Calculadora de discos' });
    G.inp['pc-w']({ value: '' });
  };
  G.inp['pc-w'] = (t) => {
    const s = S().settings, out = G.$('#pc-out'); if (!out) return;
    const w = num(t.value);
    if (!(w > 0)) { out.innerHTML = '<p class="muted">Escribe el peso total para ver los discos de cada lado.</p>'; return; }
    const r = G.platesFor(w, s.bar, s.unit);
    if (r.err) { out.innerHTML = `<p class="warn-t">Ese peso es menor que la barra (${fmtN(s.bar)} ${s.unit}).</p>`; return; }
    const colors = G.PLATES[s.unit].colors;
    let x = 14, svg = `<svg class="platebar calc" viewBox="0 0 320 96" role="img" aria-label="Discos por lado"><rect class="pb-bar" x="6" y="45" width="308" height="6" rx="3"/><rect class="pb-sleeve" x="${x - 6}" y="41" width="300" height="14" rx="3"/><rect class="pb-collar" x="8" y="30" width="6" height="36" rx="2"/>`;
    r.perSide.forEach((p) => { const idx = colors.findIndex((c) => c[0] === p.p), h = PH[idx] || 30; for (let k = 0; k < p.n; k++) { const wd = idx >= 5 ? 6 : idx >= 4 ? 8 : 12; svg += `<rect class="pl pl-${p.c} on" x="${x + 6}" y="${48 - h / 2}" width="${wd}" height="${h}" rx="2"/>`; x += wd + 2; } });
    svg += '</svg>';
    out.innerHTML = svg + (r.perSide.length ? `<div class="rows">${r.perSide.map((p) => `<div class="row"><span class="dot pl-${p.c} on"></span><b>${p.n} × ${p.p} ${s.unit}</b><span class="muted small">por lado</span></div>`).join('')}</div>` : '<p class="muted">Solo la barra.</p>') + (r.rem > 0 ? `<p class="warn-t">Con tus discos no se puede cargar exacto: quedan ${fmtN(r.rem * 2)} ${s.unit} sin cubrir (${fmtN(r.rem)} por lado).</p>` : '');
  };

  /* calculadora de 1RM */
  G.act['tool-1rm'] = () => {
    const s = S().settings;
    G.sheet(`<div class="grid2"><label class="field"><span>Peso (${s.unit})</span><input id="rm-w" data-in="rm" type="text" inputmode="decimal" placeholder="80"></label><label class="field"><span>Repeticiones</span><input id="rm-r" data-in="rm" type="text" inputmode="numeric" placeholder="6"></label></div><div id="rm-out"><p class="muted">Escribe el peso y las repeticiones de una serie al límite.</p></div>`, { title: 'Calculadora de 1RM' });
  };
  G.inp['rm'] = () => {
    const w = num(G.$('#rm-w').value), r = Math.round(num(G.$('#rm-r').value)), u = S().settings.unit, out = G.$('#rm-out');
    if (!(w > 0) || !(r > 0)) { out.innerHTML = '<p class="muted">Escribe el peso y las repeticiones de una serie al límite.</p>'; return; }
    if (r > 12) { out.innerHTML = '<p class="warn-t">Con más de 12 repeticiones la estimación pierde precisión. Prueba con una serie más pesada.</p>'; return; }
    const ep = r === 1 ? w : w * (1 + r / 30), br = r === 1 ? w : (w * 36) / (37 - r), rm = (ep + br) / 2;
    const rows = [[95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [60, 15], [50, 20]].map((p) => `<div class="row"><span class="num">${p[0]} %</span><b class="num">${fmtN(Math.round((rm * p[0]) / 100 * 2) / 2)} ${u}</b><span class="muted small">≈ ${p[1]} repeticiones</span></div>`).join('');
    out.innerHTML = `<div class="sum-grid one"><div><b class="num big-n">${fmtN(Math.round(rm * 10) / 10)} ${u}</b><span>1RM estimado</span></div></div><div class="rows">${rows}</div>`;
  };

  /* calentamiento y estiramientos por músculo */
  G.act['tool-warm'] = () => {
    const st = S(); let mus = [];
    const slot = G.slotsOn(G.dayIdx())[0], r = slot && st.routines.find((x) => x.id === slot.routine);
    if (r) mus = G.routineMuscles(r).prim.slice(0, 4);
    G._wm2 = { mus };
    const c = G.sheet(`<p class="muted small">Elige los músculos que vas a trabajar.</p><div class="chips">${Object.keys(G.MUSCLES).map((m) => `<button class="chip ${mus.includes(m) ? 'on' : ''}" data-act="wm2-mus" data-m="${m}">${G.MUSCLES[m]}</button>`).join('')}</div><div id="wm2-out"></div>`, { title: 'Calentamiento y estiramientos', full: true });
    G._wm2.c = c; wm2Draw();
  };
  G.act['wm2-mus'] = (t) => { const a = G._wm2.mus, m = t.dataset.m, i = a.indexOf(m); if (i >= 0) a.splice(i, 1); else a.push(m); t.classList.toggle('on', i < 0); wm2Draw(); };
  function wm2Draw() {
    const mus = G._wm2.mus, out = G.$('#wm2-out', G._wm2.c.el), w = G.warmStretch(mus);
    out.innerHTML = mus.length ? w.warm.replace('<details class="wk-box">', '<details class="wk-box" open>') + w.stretch.replace('<details class="wk-box">', '<details class="wk-box" open>') : '<p class="muted empty-s">Elige al menos un músculo.</p>';
  }

  /* respaldo */
  G.act['bk-dl'] = async () => {
    G.flag('backup');
    const txt = await G.exportData();
    try {
      const b = new Blob([txt], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'serie-respaldo-' + G.dkey() + '.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000); G.toast('Respaldo descargado. Si no aparece, usa «Copiar».', { ms: 4500 });
    } catch (e) { G.toast('No se pudo descargar. Usa «Copiar».'); }
  };
  G.act['bk-copy'] = async () => {
    G.flag('backup'); const ok = await G.copyText(await G.exportData()); G.toast(ok ? 'Respaldo copiado. Pégalo en un lugar seguro.' : 'No se pudo copiar'); };
  async function restore(txt) {
    const ok = await G.confirm('Se reemplazarán todos los datos actuales por los del respaldo.', { title: 'Restaurar respaldo', ok: 'Restaurar', danger: true });
    if (!ok) return;
    try { await G.importData(txt); G.toast('Respaldo restaurado'); G.render(); } catch (e) { G.toast(e.message || 'El respaldo no es válido'); }
  }
  G.chg['bk-file'] = async (t) => { const f = t.files && t.files[0]; if (!f) return; restore(await f.text()); t.value = ''; };
  G.act['bk-paste'] = () => {
    G._bkp = G.sheet(`<p class="muted">Pega aquí el texto del respaldo.</p><textarea id="bk-txt" rows="6" placeholder='{"app":"serie",…}'></textarea><div class="btn-row"><button class="btn primary grow" data-act="bk-paste-go">Restaurar</button></div>`, { title: 'Pegar copia' });
  };
  G.act['bk-paste-go'] = () => { const v = G.$('#bk-txt').value; G._bkp.close(); restore(v); };
  G.act['bk-wipe'] = async () => {
    const ok = await G.confirm('¿Borrar todos tus datos?', { title: 'Borrar todo', detail: 'Se eliminarán rutinas, horario, historial, medidas y fotos. No se puede deshacer.', ok: 'Borrar todo', danger: true });
    if (!ok) return;
    G.setState({}); await G.photos.clear(); G.applyTheme(); G.rest.stop(); G.toast('Datos borrados'); G.go('inicio');
  };
})((window.G = window.G || {}));
