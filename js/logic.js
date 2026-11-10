/* Serie — lógica: historial, récords, rachas, logros, discos, compartir y respaldo */
(function (G) {
  'use strict';
  const S = () => G.S();
  const { parseKey, dkey, dayIdx, num } = G;

  G.e1rm = (w, r) => { w = num(w); r = Math.min(30, num(r)); if (w <= 0 || r <= 0) return 0; return r <= 1 ? w : w * (1 + r / 30); };

  /* historial por ejercicio (más antiguo primero) */
  G.histEx = (exId) => {
    const out = [];
    S().history.forEach((h) => h.items.forEach((it) => {
      if (it.ex !== exId) return;
      const sets = it.sets.filter((s) => s.done);
      if (sets.length) out.push({ date: h.date, startedAt: h.startedAt, sets, k: it.k });
    }));
    return out.sort((a, b) => a.startedAt - b.startedAt);
  };
  G.lastEx = (exId) => { const h = G.histEx(exId); return h.length ? h[h.length - 1] : null; };
  G.bestEx = (exId) => {
    const b = { e: 0, w: 0, t: 0, wr: null };
    G.histEx(exId).forEach((h) => h.sets.forEach((s) => {
      if (h.k === 'time') { if (num(s.r) > b.t) b.t = num(s.r); return; }
      const e = G.e1rm(s.w, s.r);
      if (e > b.e) { b.e = e; b.wr = [num(s.w), num(s.r)]; }
      if (num(s.w) > b.w && num(s.r) > 0) b.w = num(s.w);
    }));
    return b;
  };
  // Banderas de récord por serie de un ejercicio de la sesión (usa item.pb = mejor marca previa)
  G.prFlags = (it) => {
    const pb = it.pb || { e: 0, t: 0 };
    let me = pb.e, mt = pb.t;
    return it.sets.map((s) => {
      if (!s.done) return false;
      if (it.k === 'time') { const t = num(s.r); if (pb.t > 0 && t > mt) { mt = t; return true; } mt = Math.max(mt, t); return false; }
      const e = G.e1rm(s.w, s.r);
      if (pb.e > 0 && e > me + 0.001) { me = e; return true; }
      me = Math.max(me, e); return false;
    });
  };

  G.sessVolume = (h) => {
    let v = 0;
    h.items.forEach((it) => { if (it.k === 'time') return; it.sets.forEach((s) => { if (s.done) v += num(s.w) * num(s.r); }); });
    return v;
  };
  G.sessSets = (h) => h.items.reduce((a, it) => a + it.sets.filter((s) => s.done).length, 0);

  /* semanas (lunes a domingo) */
  G.weekStart = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - dayIdx(x)); return x; };
  G.weekCount = (date) => { const ws = dkey(G.weekStart(date || new Date())); return S().history.filter((h) => dkey(G.weekStart(parseKey(h.date))) === ws).length; };

  /* racha: entrenamientos seguidos con, como máximo, un día de descanso entre ellos */
  G.streak = () => {
    const days = Array.from(new Set(S().history.map((h) => h.date))).sort();
    let best = 0, cur = 0, prev = null;
    days.forEach((d) => { const dt = parseKey(d); if (prev && (dt - prev) / 864e5 <= 2) cur++; else cur = 1; best = Math.max(best, cur); prev = dt; });
    const last = days.length ? parseKey(days[days.length - 1]) : null;
    const today = parseKey(dkey());
    const alive = last && (today - last) / 864e5 <= 2;
    return { cur: alive ? cur : 0, best };
  };

  G.stats = () => {
    const H = S().history, goal = S().settings.goal;
    const weeks = {}, groups = {};
    let vol = 0, prs = 0;
    H.forEach((h) => {
      vol += h.vol != null ? h.vol : G.sessVolume(h); prs += h.prs || 0;
      const k = dkey(G.weekStart(parseKey(h.date))); weeks[k] = (weeks[k] || 0) + 1;
      h.items.forEach((it) => { if (it.sets.some((s) => s.done)) groups[G.ex(it.ex).g] = 1; });
    });
    const weeksMet = Object.keys(weeks).filter((k) => weeks[k] >= goal).length;
    const st = G.streak();
    return { count: H.length, vol, prs, streak: st.cur, best: st.best, weeksMet, groups: Object.keys(groups).length };
  };

  /* rutinas */
  G.routineMuscles = (r) => {
    const p = {}, s = {};
    r.items.forEach((i) => { const e = G.ex(i.ex); e.m.forEach((m) => (p[m] = (p[m] || 0) + 1)); e.s.forEach((m) => (s[m] = (s[m] || 0) + 1)); });
    const prim = Object.keys(p).sort((a, b) => p[b] - p[a]);
    const sec = Object.keys(s).filter((m) => !p[m]).sort((a, b) => s[b] - s[a]);
    return { prim, sec };
  };
  G.routineMin = (r) => Math.round(r.items.reduce((a, i) => a + i.sets * ((G.ex(i.ex).k === 'time' ? num(i.reps) || 30 : 40) + (i.rest || 60)), 0) / 60);
  G.lastDone = (rid) => { const h = S().history.filter((x) => x.routineId === rid).sort((a, b) => b.startedAt - a.startedAt)[0]; return h ? h.date : null; };

  /* horario */
  G.slotsOn = (di) => S().schedule.filter((s) => s.days.indexOf(di) >= 0).sort((a, b) => a.time.localeCompare(b.time));
  G.nextSlot = () => {
    const now = new Date();
    for (let i = 0; i < 8; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const sl = G.slotsOn(dayIdx(d)).filter((s) => { if (i > 0) return true; const hm = s.time.split(':').map(Number); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hm[0], hm[1]).getTime() >= Date.now() - 3600000; });
      if (sl.length) return { slot: sl[0], date: d, in: i };
    }
    return null;
  };
  G.doneToday = (rid) => S().history.some((h) => h.date === dkey() && (!rid || h.routineId === rid));

  /* discos */
  G.platesFor = (target, bar, unit) => {
    let side = (target - bar) / 2;
    if (side < 0) return { err: true, perSide: [], rem: 0 };
    const out = [];
    G.PLATES[unit].colors.forEach((pc) => { const w = parseFloat(pc[0]); const n = Math.floor((side + 1e-9) / w); if (n > 0) { out.push({ p: pc[0], c: pc[1], n }); side -= n * w; } });
    return { perSide: out, rem: Math.round(side * 1000) / 1000 };
  };

  /* compartir rutinas */
  const b64e = (s) => { const b = new TextEncoder().encode(s); let bin = ''; b.forEach((x) => (bin += String.fromCharCode(x))); return btoa(bin); };
  const b64d = (t) => { const bin = atob(t); return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))); };
  G.encodeRoutine = (r) => {
    const custom = r.items.map((i) => i.ex).filter((id, ix, a) => !G.exMap[id] && a.indexOf(id) === ix)
      .map((id) => S().custom.find((e) => e.id === id)).filter(Boolean).map((e) => Object.assign({}, e, { photo: undefined }));
    return 'SERIE1:' + b64e(JSON.stringify({ v: 1, r: { name: r.name, items: r.items }, c: custom }));
  };
  G.decodeRoutine = (txt) => {
    txt = String(txt || '').trim();
    if (txt.indexOf('SERIE1:') !== 0) throw new Error('El código no es válido');
    const o = JSON.parse(b64d(txt.slice(7)));
    if (!o || !o.r || !Array.isArray(o.r.items)) throw new Error('El código no es válido');
    return o;
  };
  G.importRoutine = (o) => {
    (o.c || []).forEach((e) => { if (!G.exMap[e.id] && !S().custom.some((x) => x.id === e.id)) S().custom.push(e); });
    const items = o.r.items.filter((i) => G.exMap[i.ex] || S().custom.some((x) => x.id === i.ex))
      .map((i) => ({ ex: i.ex, sets: Math.max(1, +i.sets || 3), reps: String(i.reps || '10'), rest: +i.rest || 60, note: i.note || '', ss: !!i.ss }));
    const r = { id: G.uid(), name: String(o.r.name || 'Rutina importada').slice(0, 40), items };
    S().routines.push(r); G.save(); G.flag('imported'); return r;
  };

  /* ---------- calorías (estimación con MET) ----------
     kcal = MET × peso (kg) × horas. Los MET vienen del Compendio de Actividades Físicas;
     son promedios, así que el resultado es una estimación y no una medición. */
  G.ACTS = [
    ['pesas-m', 'Pesas, esfuerzo moderado', 3.5], ['pesas-i', 'Pesas, esfuerzo intenso', 6],
    ['circuito', 'Circuito o HIIT', 8], ['caminata', 'Caminata rápida', 4.3], ['trote', 'Trote', 7],
    ['correr', 'Correr (10 km/h)', 9.8], ['bici', 'Bicicleta, ritmo moderado', 8], ['cuerda', 'Cuerda para saltar', 11.8],
    ['nado', 'Natación suave', 5.8], ['yoga', 'Estiramientos o yoga', 2.5]
  ];
  const BIG = ['sentadilla', 'prensa', 'peso-muerto', 'peso-muerto-rumano', 'zancadas', 'dominadas', 'remo-barra', 'press-banca', 'press-militar', 'fondos-paralelas'];
  const MET_ID = { 'trote-cinta': 7, 'jumping-jacks': 8 };
  G.exMET = (id) => {
    if (MET_ID[id]) return MET_ID[id];
    if (BIG.indexOf(id) >= 0) return 6;
    const e = G.ex(id) || {};
    return e.g === 'Cardio' ? 7 : e.g === 'Core' ? 3.8 : e.g === 'Piernas' ? 5 : 3.5;
  };
  const LB = 2.20462;
  G.lastWeight = () => { const b = S().body.filter((e) => e.w > 0).sort((a, c) => a.date.localeCompare(c.date)); return b.length ? b[b.length - 1].w : 0; };
  G.weightKg = () => { const w = G.lastWeight(); return S().settings.unit === 'lb' ? w / LB : w; };
  G.toKg = (w) => (S().settings.unit === 'lb' ? w / LB : w);
  const MAX_H = 4 * 3600;
  G.kcalSession = (items, dur) => {
    const kg = G.weightKg(); if (!(kg > 0)) return 0;
    let n = 0, m = 0;
    items.forEach((it) => { const c = it.sets.filter((x) => x.done).length; n += c; m += c * G.exMET(it.ex); });
    return (n ? m / n : 3.5) * kg * Math.min(dur, MAX_H) / 3600;
  };
  G.kcalAct = (id, ms) => { const a = G.ACTS.find((x) => x[0] === id) || G.ACTS[0], kg = G.weightKg(); return kg > 0 ? a[2] * kg * ms / 3600000 : 0; };
  G.kcalOf = (h) => (h.kcal != null ? h.kcal : G.kcalSession(h.items, h.dur));
  G.weekKcal = (d) => { const k = G.dkey(G.weekStart(d || new Date())); return S().history.filter((h) => G.dkey(G.weekStart(G.parseKey(h.date))) === k).reduce((a, h) => a + G.kcalOf(h), 0); };
  G.bmi = (kg, cm) => (kg > 0 && cm > 0 ? kg / Math.pow(cm / 100, 2) : 0);
  G.bmiCat = (b) => (b < 18.5 ? 'Por debajo del rango normal' : b < 25 ? 'Rango normal' : b < 30 ? 'Sobrepeso' : 'Obesidad');
  /* metabolismo basal, fórmula de Mifflin-St Jeor */
  G.bmr = (kg, cm, age, sex) => (kg > 0 && cm > 0 && age > 0 && (sex === 'm' || sex === 'f') ? 10 * kg + 6.25 * cm - 5 * age + (sex === 'm' ? 5 : -161) : 0);

  /* respaldo */
  G.exportData = async () => {
    const photos = await G.photos.all();
    return JSON.stringify({ app: 'serie', v: 1, at: Date.now(), state: S(), photos });
  };
  G.importData = async (txt) => {
    const o = JSON.parse(txt);
    if (!o || o.app !== 'serie' || !o.state) throw new Error('El archivo no es un respaldo de Serie');
    G.setState(o.state);
    await G.photos.clear();
    for (const p of o.photos || []) await G.photos.put(p);
    G.applyTheme();
  };
})((window.G = window.G || {}));
