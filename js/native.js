/* Serie — avisos con la app cerrada (solo en la app Android / APK).
   Usa el plugin de notificaciones locales de Capacitor: Android guarda los avisos y los muestra
   a su hora aunque Serie esté cerrada. No necesita internet ni servidor.
   En la versión web no hace nada. */
(function (G) {
  'use strict';
  const DAYS_AHEAD = 28;   // cuántos días por delante se programan
  const MAX = 60;          // tope de avisos programados a la vez
  const CH = 'avisos';

  G.isNative = () => { const c = window.Capacitor; return !!(c && typeof c.isNativePlatform === 'function' && c.isNativePlatform()); };
  G.nperm = 'default';     // 'granted' | 'denied' | 'default'

  let ln = null;
  const LN = () => {
    if (ln) return ln;
    const c = window.Capacitor; if (!c) return null;
    ln = (c.Plugins && c.Plugins.LocalNotifications) || (typeof c.registerPlugin === 'function' ? c.registerPlugin('LocalNotifications') : null);
    return ln;
  };
  const map = (d) => (d === 'granted' ? 'granted' : d === 'denied' ? 'denied' : 'default');

  let chOK = null;
  const channel = async () => {
    if (chOK !== null) return chOK;
    try {
      await LN().createChannel({ id: CH, name: 'Avisos de entrenamiento', description: 'Recordatorios de tu horario', importance: 4, visibility: 1, vibration: true });
      chOK = true;
    } catch (e) { chOK = false; }
    return chOK;
  };

  /* Avisos de los próximos días según el horario. Cada uno es una notificación suelta con su fecha exacta
     (así el aviso previo que cruza la medianoche y los cambios de hora salen bien). */
  G.nplan = () => {
    const st = G.S(), now = Date.now(), d0 = new Date(), out = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i), di = G.dayIdx(d);
      st.schedule.forEach((sl) => {
        if (sl.remind < 0 || sl.days.indexOf(di) < 0) return;
        const hm = String(sl.time).split(':').map(Number);
        if (hm.length < 2 || isNaN(hm[0]) || isNaN(hm[1])) return;
        const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hm[0], hm[1] - sl.remind);
        if (at.getTime() <= now + 15000) return;
        const r = st.routines.find((x) => x.id === sl.routine);
        out.push({ at, title: sl.remind ? 'Entrenas en ' + sl.remind + ' min' : 'Es hora de entrenar', body: (r ? r.name + ' · ' : '') + sl.time });
      });
    }
    out.sort((a, b) => a.at - b.at);
    return out.slice(0, MAX);
  };

  let last = null, busy = false, again = false;
  G.nsync = async (force) => {
    if (!G.isNative() || !LN() || G.nperm !== 'granted') return;
    if (busy) { again = true; return; }
    busy = true;
    try {
      const plan = G.nplan(), sig = JSON.stringify(plan.map((x) => [+x.at, x.title, x.body]));
      if (!force && sig === last) return;
      const ok = await channel(), base = { smallIcon: 'ic_stat_serie', iconColor: '#C8102E' };
      if (ok) base.channelId = CH;
      const pend = await LN().getPending();
      if (pend && pend.notifications && pend.notifications.length) await LN().cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) });
      if (plan.length) {
        const list = plan.map((x, i) => Object.assign({ id: i + 1, title: x.title, body: x.body, schedule: { at: x.at, allowWhileIdle: true } }, base));
        // Si pasan semanas sin abrir Serie, el último aviso lo recuerda. Se renueva solo cada vez que entras.
        list.push(Object.assign({ id: plan.length + 1, title: 'Abre Serie para renovar tus avisos', body: 'Se actualizan cada vez que entras a la app.', schedule: { at: new Date(+plan[plan.length - 1].at + 3 * 3600000), allowWhileIdle: true } }, base));
        await LN().schedule({ notifications: list });
      }
      last = sig;
    } catch (e) { last = null; console.warn('avisos', e); }
    finally { busy = false; if (again) { again = false; G.nsync(); } }
  };

  G.nrefresh = async () => {
    try { const p = map((await LN().checkPermissions()).display), ch = p !== G.nperm; G.nperm = p; return ch; } catch (e) { return false; }
  };

  G.nask = async () => {
    if (!LN()) return false;
    try { G.nperm = map((await LN().requestPermissions()).display); } catch (e) { G.nperm = 'denied'; }
    if (G.nperm === 'granted') { last = null; await G.nsync(true); }
    return G.nperm === 'granted';
  };

  G.ninit = async () => {
    if (!G.isNative() || !LN()) return;
    await channel();
    const changed = await G.nrefresh();
    if (changed && G.tab === 'horario') G.render();
    G.nsync();
  };

  let t = null;
  G.onSave = () => {   // cualquier cambio en el horario o las rutinas vuelve a programar los avisos
    if (!G.isNative()) return;
    clearTimeout(t); t = setTimeout(() => G.nsync(), 1500);
  };
  const wake = () => { if (!document.hidden) G.ninit(); };
  document.addEventListener('resume', wake);
  document.addEventListener('visibilitychange', wake);
})((window.G = window.G || {}));
