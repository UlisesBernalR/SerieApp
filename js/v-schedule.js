/* Serie — horario semanal y avisos */
(function (G) {
  'use strict';
  const { esc, ic, DAYS, DAYS_S } = G;
  const S = () => G.S();
  const REMIND = [[-1, 'Sin aviso'], [0, 'A la hora'], [10, '10 minutos antes'], [30, '30 minutos antes'], [60, '1 hora antes']];

  G.views.horario = () => {
    const st = S(), di = G.dayIdx();
    const total = st.schedule.reduce((a, s) => a + s.days.length, 0);
    let perm = '';
    const ns = G.notifState(), nat = G.isNative();
    if (ns === 'default') {
      perm = `<section class="panel soft"><p><b>Activa los avisos</b></p><p class="muted small">${nat ? 'Te recordamos tu entrenamiento a la hora que elijas, aunque la app esté cerrada. Android te pedirá permiso.' : 'Te recordamos tu entrenamiento a la hora que elijas. Los avisos funcionan mientras la app esté abierta o instalada en tu pantalla de inicio.'}</p><div class="btn-row"><button class="btn primary grow" data-act="notif-ask">${ic('bell')} Permitir avisos</button></div></section>`;
    } else if (ns === 'denied') {
      perm = nat ? `<p class="muted small">Los avisos están bloqueados. Actívalos en Ajustes de Android → Aplicaciones → Serie → Notificaciones.</p>`
        : `<p class="muted small">Las notificaciones están bloqueadas en este navegador. Los avisos se verán solo dentro de la app.</p>`;
    } else if (ns === 'granted' && nat && total) {
      perm = `<p class="muted small">Avisos activados: suenan aunque la app esté cerrada.</p>`;
    }
    const days = DAYS.map((name, i) => {
      const sl = G.slotsOn(i);
      const rows = sl.map((s) => {
        const r = st.routines.find((x) => x.id === s.routine);
        const rm = REMIND.find((x) => x[0] === s.remind);
        return `<button class="row sl-row" data-act="slot-edit" data-id="${s.id}"><b class="num time">${esc(s.time)}</b><span class="row-main"><b>${r ? esc(r.name) : 'Rutina eliminada'}</b><span class="muted small">${rm ? rm[1] : ''}</span></span>${ic('chev')}</button>`;
      }).join('');
      return `<section class="day ${i === di ? 'today' : ''}"><div class="day-head"><h3>${name}${i === di ? ' <span class="tag">Hoy</span>' : ''}</h3><button class="icon-btn" data-act="slot-new" data-day="${i}" aria-label="Añadir entrenamiento el ${name.toLowerCase()}">${ic('plus')}</button></div>${rows ? `<div class="rows">${rows}</div>` : '<p class="muted small rest-day">Descanso</p>'}</section>`;
    }).join('');
    return `<div class="stack">${total ? `<p class="muted">${total} ${total === 1 ? 'entrenamiento programado' : 'entrenamientos programados'} por semana.</p>` : `<section class="empty"><h3>Aún no tienes horario</h3><p class="muted">Elige qué rutina haces cada día y a qué hora. El inicio mostrará el entrenamiento de hoy.</p></section>`}
      <div class="btn-row"><button class="btn primary grow" data-act="slot-new">${ic('plus')} Añadir entrenamiento</button></div>${perm}${days}</div>`;
  };

  G.act['notif-ask'] = async () => {
    if (G.isNative()) { const ok = await G.nask(); G.toast(ok ? 'Avisos activados' : 'No se activaron los avisos'); G.render(); return; }
    try { const p = await Notification.requestPermission(); G.toast(p === 'granted' ? 'Avisos activados' : 'No se activaron los avisos'); } catch (e) { G.toast('Este navegador no permite avisos aquí'); }
    G.render();
  };

  G.act['slot-new'] = (t) => G.openSlot(null, t && t.dataset.day !== undefined ? +t.dataset.day : null);
  G.act['slot-edit'] = (t) => G.openSlot(t.dataset.id, null);
  G.openSlot = (id, day) => {
    const st = S();
    if (!st.routines.length) { G.toast('Primero crea una rutina'); G.go('rutinas'); return; }
    const s = id ? st.schedule.find((x) => x.id === id) : { days: day !== null && day !== undefined ? [day] : [G.dayIdx()], time: '18:00', routine: st.routines[0].id, remind: 10 };
    G._sl = { id, days: s.days.slice() };
    const c = G.sheet(`<p class="muted small">Días</p><div class="chips" id="sl-days">${DAYS_S.map((d, i) => `<button type="button" class="chip ${G._sl.days.includes(i) ? 'on' : ''}" data-act="sl-day" data-d="${i}" aria-label="${DAYS[i]}">${d}</button>`).join('')}</div>
      <div class="grid2"><label class="field"><span>Hora</span><input id="sl-time" type="time" value="${esc(s.time)}"></label>
      <label class="field"><span>Aviso</span><select id="sl-rem">${REMIND.map((r) => `<option value="${r[0]}" ${r[0] === s.remind ? 'selected' : ''}>${r[1]}</option>`).join('')}</select></label></div>
      <label class="field"><span>Rutina</span><select id="sl-routine">${st.routines.map((r) => `<option value="${r.id}" ${r.id === s.routine ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>
      <div class="btn-row">${id ? `<button class="btn danger-ghost" data-act="sl-del">${ic('trash')}</button>` : ''}<button class="btn primary grow" data-act="sl-save">Guardar</button></div>`, { title: id ? 'Editar horario' : 'Nuevo horario' });
    G._slc = c;
  };
  G.act['sl-day'] = (t) => {
    const d = +t.dataset.d, a = G._sl.days, i = a.indexOf(d);
    if (i >= 0) a.splice(i, 1); else a.push(d);
    t.classList.toggle('on', i < 0);
  };
  G.act['sl-save'] = () => {
    const st = S(), f = G._sl;
    if (!f.days.length) { G.toast('Elige al menos un día'); return; }
    const time = G.$('#sl-time').value; if (!time) { G.toast('Elige una hora'); return; }
    const o = { id: f.id || G.uid(), days: f.days.slice().sort(), time, routine: G.$('#sl-routine').value, remind: parseInt(G.$('#sl-rem').value, 10) };
    const i = st.schedule.findIndex((x) => x.id === o.id);
    if (i >= 0) st.schedule[i] = o; else st.schedule.push(o);
    G.save(); G._slc.close(); G.toast('Horario guardado'); G.checkReminders(); G.render();
    if (G.isNative() && G.nperm === 'default' && o.remind >= 0) G.nask().then(() => G.render());
  };
  G.act['sl-del'] = async () => {
    const ok = await G.confirm('¿Quitar este entrenamiento del horario?', { title: 'Quitar del horario', ok: 'Quitar', danger: true });
    if (!ok) return;
    const st = S(); st.schedule = st.schedule.filter((x) => x.id !== G._sl.id); G.save(); G._slc.close(); G.render();
  };
})((window.G = window.G || {}));
