/* Serie — logros: definiciones, comprobación, retos manuales y vista por categorías */
(function (G) {
  'use strict';
  const { esc, ic, num, fmtN, fmtShort } = G;
  const S = () => G.S();
  const dkey = G.dkey, parseKey = G.parseKey;

  /* ---------- retos manuales: se marcan durante el entrenamiento ---------- */
  G.RETOS = [
    { id: 'socks', n: 'Calcetines rojos', d: 'Termina un entrenamiento con calcetines rojos' },
    { id: 'odd', n: 'Calcetines desparejados', d: 'Entrena con un calcetín de cada color' },
    { id: 'team', n: 'Con la camiseta del equipo', d: 'Entrena con la camiseta de tu equipo favorito' },
    { id: 'music', n: 'Banda sonora épica', d: 'Entrena con tu mejor playlist' },
    { id: 'friend', n: 'Mejor acompañado', d: 'Entrena con un amigo o amiga' },
    { id: 'water', n: 'Bien hidratado', d: 'Toma agua durante el entrenamiento' },
    { id: 'warm', n: 'Calentamiento completo', d: 'Calienta antes y estira al terminar' },
    { id: 'lazy', n: 'Sin ganas, pero aquí estoy', d: 'Entrena aunque hoy no tuvieras ganas' },
    { id: 'place', n: 'Lugar nuevo', d: 'Entrena en un gimnasio o espacio donde nunca habías entrenado' },
    { id: 'out', n: 'Al aire libre', d: 'Haz tu entrenamiento al aire libre' },
    { id: 'pj', n: 'Entrenamiento en pijama', d: 'Entrena en casa en pijama' },
    { id: 'bday', n: 'Cumpleañero', d: 'Entrena el día de tu cumpleaños' },
    { id: 'shoes', n: 'Tenis nuevos', d: 'Estrena zapatos para entrenar' },
    { id: 'rain', n: 'Contra la lluvia', d: 'Entrena un día de lluvia' }
  ];
  G.allRetos = () => G.RETOS.concat(S().retos || []);

  /* ---------- contexto: totales calculados del historial y del estado ---------- */
  const hrs = (h) => new Date(h.startedAt);
  const dt = (h) => parseKey(h.date);
  const exOf = (it) => G.ex(it.ex) || {};
  function build() {
    const st = S(), H = st.history.slice().sort((a, b) => a.startedAt - b.startedAt), lb = st.settings.unit === 'lb';
    const x = { H, lb, kg: (w) => (lb ? num(w) / 2.20462 : num(w)), bw: G.weightKg(), count: H.length, vol: 0, prs: 0, sets: 0, reps: 0, kcal: 0, secs: 0, maxWeek: 0, weeksMet: 0, unlocked: 0 };
    const wk = {}, grp = {}, ex = {}, built = {}, days = {}, dates = {};
    H.forEach((h) => {
      x.vol += h.vol != null ? h.vol : G.sessVolume(h); x.prs += h.prs || 0; x.kcal += G.kcalOf(h);
      x.secs += Math.min(h.dur || 0, 4 * 3600);
      const k = dkey(G.weekStart(dt(h))); wk[k] = (wk[k] || 0) + 1;
      days[dt(h).getDay()] = 1; dates[h.date] = 1;
      h.items.forEach((it) => {
        x.sets += it.sets.length; ex[it.ex] = 1; if (G.exMap[it.ex]) built[it.ex] = 1; grp[exOf(it).g] = 1;
        if (it.k !== 'time') it.sets.forEach((s) => { x.reps += num(s.r); });
      });
    });
    Object.keys(wk).forEach((k) => { if (wk[k] > x.maxWeek) x.maxWeek = wk[k]; if (wk[k] >= st.settings.goal) x.weeksMet++; });
    x.groups = Object.keys(grp).filter(Boolean).length; x.exN = Object.keys(ex).length; x.exBuilt = Object.keys(built).length;
    x.days = Object.keys(days).length; x.dates = dates; x.best = G.streak().best;
    x.bodyW = st.body.filter((b) => b.w > 0).length; x.bodyM = st.body.filter((b) => b.m && Object.keys(b.m).length).length;
    x.profile = st.profile.h > 0 && st.profile.age > 0 && !!st.profile.sex && G.lastWeight() > 0 ? 1 : 0;
    x.flags = st.flags || {};
    return x;
  }

  /* ---------- definiciones ---------- */
  const ACH = [];
  const C = { k: 'Constancia', f: 'Fuerza', v: 'Variedad', b: 'Cuerpo y calorías', d: 'Fechas y horas', r: 'Retos', m: 'Colección' };
  G.ACH_CATS = [C.k, C.f, C.v, C.b, C.d, C.r, 'Mis retos', C.m];
  /* T: acumulado (valor actual, meta). E: se cumple en una sesión; need = cuántas sesiones hacen falta. */
  const T = (id, c, n, d, t, o) => ACH.push(Object.assign({ id, c, n, d, t }, o));
  const E = (id, c, n, d, e, o) => ACH.push(Object.assign({ id, c, n, d, e }, o));
  const has = (h, g) => h.items.some((it) => exOf(it).g === g);
  const setsOf = (h) => h.items.reduce((a, it) => a + it.sets.length, 0);
  const anySet = (h, id, f) => h.items.some((it) => it.ex === id && it.sets.some(f));
  const date = (h) => dt(h), md = (h, m, d) => date(h).getMonth() === m && date(h).getDate() === d;
  const hour = (h) => hrs(h).getHours();

  /* Constancia */
  T('first', C.k, 'Primer entrenamiento', 'Termina tu primer entrenamiento', (x) => [x.count, 1]);
  [[10, 'c10'], [25, 'c25'], [50, 'c50'], [100, 'c100'], [250, 'c250']].forEach((a) => T(a[1], C.k, a[0] + ' entrenamientos', 'Completa ' + a[0] + ' entrenamientos', (x) => [x.count, a[0]]));
  [[5, 's5'], [10, 's10'], [20, 's20'], [30, 's30']].forEach((a) => T(a[1], C.k, 'Racha de ' + a[0], a[0] + ' entrenamientos seguidos con un día de descanso como máximo', (x) => [x.best, a[0]]));
  T('wk1', C.k, 'Semana cumplida', 'Llega a tu meta semanal', (x) => [x.weeksMet, 1]);
  T('wk4', C.k, '4 semanas cumplidas', 'Cumple tu meta semanal en 4 semanas', (x) => [x.weeksMet, 4]);
  T('wk12', C.k, '12 semanas cumplidas', 'Cumple tu meta semanal en 12 semanas', (x) => [x.weeksMet, 12]);
  T('wk26', C.k, 'Medio año de metas', 'Cumple tu meta semanal en 26 semanas', (x) => [x.weeksMet, 26]);
  T('wk5', C.k, 'Semana a tope', 'Entrena 5 veces en una misma semana', (x) => [x.maxWeek, 5]);
  T('seven', C.k, 'Los siete días', 'Entrena al menos una vez en cada día de la semana, de lunes a domingo', (x) => [x.days, 7]);
  E('mon4', C.k, 'Lunes de hierro', 'Entrena 4 lunes', (h) => date(h).getDay() === 1, { need: 4 });
  E('sun4', C.k, 'Domingo activo', 'Entrena 4 domingos', (h) => date(h).getDay() === 0, { need: 4 });
  E('weekend', C.k, 'Fin de semana completo', 'Entrena un sábado y el domingo siguiente', (h, i, x) => { const d = date(h); return d.getDay() === 0 && !!x.dates[dkey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))]; });
  E('comeback', C.k, 'Lo importante es volver', 'Vuelve a entrenar después de 14 días o más sin hacerlo', (h, i, x) => i > 0 && (date(h) - date(x.H[i - 1])) / 864e5 >= 14);
  E('double', C.k, 'Doble jornada', 'Entrena dos veces el mismo día', (h, i, x) => x.H.some((o, j) => j !== i && o.date === h.date), { secret: 1 });

  /* Fuerza */
  [[1, 'pr1', 'Primer récord', 'Supera tu mejor marca en un ejercicio'], [10, 'pr10', '10 récords', 'Supera tus marcas 10 veces'], [25, 'pr25', '25 récords', 'Supera tus marcas 25 veces'], [50, 'pr50', '50 récords', 'Supera tus marcas 50 veces']].forEach((a) => T(a[1], C.f, a[2], a[3], (x) => [x.prs, a[0]]));
  [[1000, 'v1k', '1 000'], [10000, 'v10', '10 000'], [50000, 'v50', '50 000'], [100000, 'v100', '100 000'], [500000, 'v500', '500 000'], [1000000, 'v1m', 'Un millón']].forEach((a) =>
    T(a[1], C.f, a[2] + ' de volumen', 'Suma ' + (a[0] === 1000000 ? '1 000 000' : a[2]) + ' (peso × repeticiones) en total', (x) => [Math.round(x.vol), a[0]]));
  [[100, 'sets100'], [500, 'sets500'], [1000, 'sets1000']].forEach((a) => T(a[1], C.f, fmtK(a[0]) + ' series', 'Completa ' + fmtK(a[0]) + ' series en total', (x) => [x.sets, a[0]]));
  [[1000, 'reps1k'], [5000, 'reps5k']].forEach((a) => T(a[1], C.f, fmtK(a[0]) + ' repeticiones', 'Suma ' + fmtK(a[0]) + ' repeticiones en total', (x) => [x.reps, a[0]]));
  E('club100', C.f, 'Club de los 100', 'Levanta 100 kg (220 lb) o más en una sola serie', (h, i, x) => h.items.some((it) => it.k !== 'time' && it.sets.some((s) => x.kg(s.w) >= 100)));
  E('club140', C.f, 'Club de los 140', 'Levanta 140 kg (310 lb) o más en una sola serie', (h, i, x) => h.items.some((it) => it.k !== 'time' && it.sets.some((s) => x.kg(s.w) >= 140)));
  E('bw_bench', C.f, 'Banca con tu propio peso', 'Haz una serie de press de banca con tu peso corporal o más (guarda tu peso en Más › Mi perfil)', (h, i, x) => x.bw > 0 && anySet(h, 'press-banca', (s) => num(s.r) >= 1 && x.kg(s.w) >= x.bw));
  E('bw_squat', C.f, 'Sentadilla y media', 'Haz una serie de sentadilla con 1,5 veces tu peso corporal', (h, i, x) => x.bw > 0 && anySet(h, 'sentadilla', (s) => num(s.r) >= 1 && x.kg(s.w) >= 1.5 * x.bw));
  E('bw_dead', C.f, 'Peso muerto doble', 'Haz una serie de peso muerto con el doble de tu peso corporal', (h, i, x) => x.bw > 0 && anySet(h, 'peso-muerto', (s) => num(s.r) >= 1 && x.kg(s.w) >= 2 * x.bw));
  E('pull10', C.f, 'Diez dominadas', 'Haz 10 dominadas en una sola serie', (h) => anySet(h, 'dominadas', (s) => num(s.r) >= 10));
  E('push30', C.f, 'Treinta flexiones', 'Haz 30 flexiones en una sola serie', (h) => anySet(h, 'flexiones', (s) => num(s.r) >= 30));
  E('plank60', C.f, 'Plancha de un minuto', 'Aguanta 60 segundos en plancha', (h) => anySet(h, 'plancha', (s) => num(s.r) >= 60));
  E('plank180', C.f, 'Plancha de tres minutos', 'Aguanta 3 minutos en plancha', (h) => anySet(h, 'plancha', (s) => num(s.r) >= 180));
  E('long', C.f, 'Sesión larga', 'Entrena 90 minutos o más en una sesión', (h) => h.dur >= 5400 && h.dur <= 6 * 3600);
  E('marathon', C.f, 'Maratón de hierro', 'Entrena 2 horas o más en una sesión', (h) => h.dur >= 7200 && h.dur <= 6 * 3600);
  E('express', C.f, 'Exprés', 'Completa 5 series o más en 25 minutos o menos', (h) => setsOf(h) >= 5 && h.dur > 0 && h.dur <= 1500);
  E('sets20', C.f, 'Sesión de 20 series', 'Completa 20 series o más en un solo entrenamiento', (h) => setsOf(h) >= 20);
  E('bigday', C.f, 'Día pesado', 'Suma 5 000 de volumen en un solo entrenamiento', (h) => (h.vol != null ? h.vol : G.sessVolume(h)) >= 5000);
  E('perfect1', C.f, 'Rutina perfecta', 'Termina un entrenamiento sin dejar series sin marcar', (h) => h.full === true);
  E('perfect10', C.f, 'Disciplina total', 'Termina 10 entrenamientos sin dejar series sin marcar', (h) => h.full === true, { need: 10 });

  /* Variedad */
  T('all', C.v, 'Cuerpo completo', 'Entrena los 6 grupos: pecho, espalda, hombros, brazos, piernas y core', (x) => [x.groups, 6]);
  E('fullsess', C.v, 'Un poco de todo', 'Trabaja 4 grupos musculares o más en un solo entrenamiento', (h) => { const g = {}; h.items.forEach((it) => { g[exOf(it).g] = 1; }); return Object.keys(g).length >= 4; });
  T('ex10', C.v, 'Explorador', 'Prueba 10 ejercicios distintos', (x) => [x.exN, 10]);
  T('ex20', C.v, 'Coleccionista de ejercicios', 'Prueba 20 ejercicios distintos', (x) => [x.exN, 20]);
  T('exall', C.v, 'Catálogo completo', 'Prueba todos los ejercicios que trae la app', (x) => [x.exBuilt, G.EX.length]);
  E('leg10', C.v, 'Nunca saltes pierna', 'Entrena piernas en 10 sesiones', (h) => has(h, 'Piernas'), { need: 10 });
  E('core10', C.v, 'Core de acero', 'Entrena core en 10 sesiones', (h) => has(h, 'Core'), { need: 10 });
  E('cardio1', C.v, 'Un poco de cardio', 'Incluye trote o saltos de tijera en un entrenamiento', (h) => has(h, 'Cardio'));
  E('cardio10', C.v, 'Corazón fuerte', 'Incluye cardio en 10 entrenamientos', (h) => has(h, 'Cardio'), { need: 10 });
  E('free', C.v, 'Libre como el viento', 'Haz un entrenamiento libre, sin rutina', (h) => !h.routineId);
  E('ss', C.v, 'Superserie', 'Completa una superserie', (h) => h.items.some((it) => it.ss));
  T('custom1', C.v, 'Hecho a tu medida', 'Crea tu propio ejercicio', () => [S().custom.length, 1]);
  T('rt1', C.v, 'Mi primera rutina', 'Crea o añade una rutina', () => [S().routines.length, 1]);
  T('rt3', C.v, 'Arquitecto', 'Ten 3 rutinas', () => [S().routines.length, 3]);
  T('sc1', C.v, 'Con horario', 'Programa un entrenamiento en el horario', () => [S().schedule.length, 1]);
  T('sc5', C.v, 'Semana planeada', 'Programa 5 entrenamientos en el horario', () => [S().schedule.length, 5]);
  T('shared', C.v, 'Compartir es de campeones', 'Comparte una rutina con un código', (x) => [x.flags.shared ? 1 : 0, 1]);
  T('imported', C.v, 'Rutina prestada', 'Importa una rutina que te compartieron', (x) => [x.flags.imported ? 1 : 0, 1]);

  /* Cuerpo y calorías */
  T('profile', C.b, 'Perfil completo', 'Guarda tu altura, peso, edad y sexo en Más › Mi perfil', (x) => [x.profile, 1]);
  T('bw1', C.b, 'Primer pesaje', 'Registra tu peso corporal', (x) => [x.bodyW, 1]);
  T('bw10', C.b, '10 pesajes', 'Registra tu peso corporal 10 veces', (x) => [x.bodyW, 10]);
  T('bw30', C.b, 'Constancia en la báscula', 'Registra tu peso corporal 30 veces', (x) => [x.bodyW, 30]);
  T('ms1', C.b, 'Cinta métrica', 'Registra una medida corporal', (x) => [x.bodyM, 1]);
  T('ms5', C.b, 'Seguimiento de medidas', 'Registra tus medidas en 5 ocasiones', (x) => [x.bodyM, 5]);
  T('photo', C.b, 'Antes y después', 'Guarda tu primera foto de progreso', (x) => [x.flags.photo ? 1 : 0, 1]);
  T('backup', C.b, 'Precavido', 'Haz un respaldo de tus datos', (x) => [x.flags.backup ? 1 : 0, 1]);
  E('k300', C.b, '300 kcal en una sesión', 'Quema unas 300 kcal (estimado) en un entrenamiento', (h) => G.kcalOf(h) >= 300);
  E('k600', C.b, '600 kcal en una sesión', 'Quema unas 600 kcal (estimado) en un entrenamiento', (h) => G.kcalOf(h) >= 600);
  [[1000, 'kt1k', '1 000'], [10000, 'kt10k', '10 000'], [50000, 'kt50k', '50 000']].forEach((a) => T(a[1], C.b, a[2] + ' kcal quemadas', 'Suma ' + a[2] + ' kcal (estimado) entre todos tus entrenamientos', (x) => [Math.round(x.kcal), a[0]]));
  [[10, 'h10'], [50, 'h50'], [100, 'h100']].forEach((a) => T(a[1], C.b, a[0] + ' horas entrenando', 'Acumula ' + a[0] + ' horas de entrenamiento', (x) => [Math.floor(x.secs / 3600), a[0]]));

  /* Fechas y horas */
  E('fri13', C.d, 'Viernes 13', 'Termina un entrenamiento un viernes 13', (h) => date(h).getDay() === 5 && date(h).getDate() === 13);
  E('ny', C.d, 'Año nuevo, series nuevas', 'Entrena un 1 de enero', (h) => md(h, 0, 1));
  E('valentine', C.d, 'Cita con las pesas', 'Entrena un 14 de febrero', (h) => md(h, 1, 14));
  E('leap', C.d, 'Día extra', 'Entrena un 29 de febrero', (h) => md(h, 1, 29), { secret: 1 });
  E('halloween', C.d, 'Noche de brujas', 'Entrena un 31 de octubre', (h) => md(h, 9, 31));
  E('muertos', C.d, 'Día de Muertos', 'Entrena un 1 o 2 de noviembre', (h) => md(h, 10, 1) || md(h, 10, 2));
  E('xmas', C.d, 'Navidad con mancuernas', 'Entrena un 24 o 25 de diciembre', (h) => md(h, 11, 24) || md(h, 11, 25));
  E('nye', C.d, 'Cierra el año', 'Entrena un 31 de diciembre', (h) => md(h, 11, 31));
  E('dbl', C.d, 'Fecha doble', 'Entrena cuando el día y el mes coinciden, como el 11 de noviembre (11/11)', (h) => date(h).getDate() === date(h).getMonth() + 1);
  E('early', C.d, 'Madrugador', 'Empieza un entrenamiento entre las 5:00 y las 7:59', (h) => hour(h) >= 5 && hour(h) < 8);
  E('early10', C.d, 'Reloj despertador', 'Empieza 10 entrenamientos entre las 5:00 y las 7:59', (h) => hour(h) >= 5 && hour(h) < 8, { need: 10 });
  E('lunch', C.d, 'Hora del almuerzo', 'Empieza un entrenamiento entre las 12:00 y las 13:59', (h) => hour(h) === 12 || hour(h) === 13);
  E('night', C.d, 'Noctámbulo', 'Empieza un entrenamiento a las 22:00 o más tarde', (h) => hour(h) >= 22);
  E('midnight', C.d, 'Medianoche', 'Empieza un entrenamiento entre las 0:00 y las 3:59', (h) => hour(h) < 4, { secret: 1 });
  E('magic', C.d, 'Reloj repetido', 'Empieza un entrenamiento cuando la hora y los minutos coinciden, como a las 11:11 o las 22:22', (h) => hrs(h).getHours() === hrs(h).getMinutes(), { secret: 1 });
  E('anniv', C.d, 'Aniversario', 'Entrena un año o más después de tu primer entrenamiento', (h, i, x) => i > 0 && (date(h) - date(x.H[0])) / 864e5 >= 365, { secret: 1 });

  /* Retos manuales (los de la lista; los propios se añaden en allAch) */
  const marked = (id) => (h) => (h.ch || []).indexOf(id) >= 0;
  G.RETOS.forEach((r) => E('r_' + r.id, C.r, r.n, r.d, marked(r.id), { man: 1 }));
  E('r_socks7', C.r, 'Semana roja', 'Entrena con calcetines rojos 7 veces', marked('socks'), { need: 7, man: 1 });
  E('r_friend5', C.r, 'Dúo dinámico', 'Entrena con un amigo o amiga 5 veces', marked('friend'), { need: 5, man: 1 });
  E('r_warm10', C.r, 'Cuidado personal', 'Calienta y estira en 10 entrenamientos', marked('warm'), { need: 10, man: 1 });

  /* Colección */
  [[10, 'meta10', 'Coleccionista de logros'], [25, 'meta25', 'Cazador de logros'], [50, 'meta50', 'Leyenda del gimnasio'], [75, 'meta75', 'Casi completista']].forEach((a) =>
    T(a[1], C.m, a[2], 'Desbloquea ' + a[0] + ' logros', (x) => [x.unlocked, a[0]], { meta: 1 }));

  function fmtK(n) { return n >= 1000 ? Math.floor(n / 1000) + ' ' + String(n % 1000).padStart(3, '0') : String(n); }
  G.ACH = ACH;
  const META = {}; ACH.forEach((a) => { if (a.meta) META[a.id] = 1; });
  /* con los retos propios del usuario */
  G.allAch = () => ACH.concat((S().retos || []).map((r) => ({ id: r.id, c: 'Mis retos', n: r.n, d: r.d || 'Reto propio', e: marked(r.id), man: 1, custom: 1 })));

  /* progreso de un logro: {cur, need, ok, cnt, date} */
  G.achProg = (a, x) => {
    if (a.t) { const p = a.t(x); return { cur: Math.min(p[0], p[1]), need: p[1], ok: p[0] >= p[1] }; }
    const need = a.need || 1; let cnt = 0, dd = null;
    x.H.forEach((h, i) => { if (a.e(h, i, x)) { cnt++; if (cnt === need) dd = h.date; } });
    return { cur: Math.min(cnt, need), need, cnt, ok: cnt >= need, date: dd };
  };

  /* Devuelve los logros recién desbloqueados y los guarda */
  G.checkAch = () => {
    const st = S(), x = build(), out = [], all = G.allAch();
    const run = (list) => list.forEach((a) => { if (st.ach[a.id]) return; const p = G.achProg(a, x); if (p.ok) { st.ach[a.id] = p.date || dkey(); out.push(a); } });
    run(all.filter((a) => !a.meta));
    x.unlocked = all.filter((a) => !a.meta && st.ach[a.id]).length;
    run(all.filter((a) => a.meta));
    if (out.length) G.save(true);
    return out;
  };
  /* aviso al desbloquear fuera de un entrenamiento (perfil, rutinas, pesaje, etc.) */
  G.achToast = () => {
    const out = G.checkAch(); if (!out.length) return;
    const go = { act: 'Ver', fn: () => { G.ui.psub = 'logros'; G.go('progreso'); }, ms: 5000 };
    if (out.length <= 2) out.forEach((a) => G.toast('Logro desbloqueado: ' + a.n, go));
    else G.toast(out.length + ' logros desbloqueados', go);
  };
  G.flag = (k) => { const st = S(); st.flags = st.flags || {}; if (!st.flags[k]) { st.flags[k] = dkey(); G.save(true); } };

  /* ---------- retos en la pantalla de entrenamiento ---------- */
  G.retosBox = (open) => {
    const se = S().session, on = (se && se.ch) || [];
    return `<details class="wk-box" id="wk-retos" ${open ? 'open' : ''}><summary>${ic('trophy')} Retos del día${on.length ? ' · ' + on.length : ''}</summary>
      <p class="muted small">Marca los que cumples hoy; se desbloquean al finalizar.</p>
      <div class="chips reto-chips">${G.allRetos().map((r) => `<button class="chip" data-act="reto-tog" data-id="${esc(r.id)}" aria-pressed="${on.indexOf(r.id) >= 0}" title="${esc(r.d || '')}">${esc(r.n)}</button>`).join('')}</div></details>`;
  };
  G.act['reto-tog'] = (t) => {
    const se = S().session; if (!se) return;
    se.ch = se.ch || []; const id = t.dataset.id, i = se.ch.indexOf(id);
    if (i >= 0) se.ch.splice(i, 1); else se.ch.push(id);
    G.save();
    const el = G.$('#wk-retos'); if (!el) return;
    const tmp = document.createElement('div'); tmp.innerHTML = G.retosBox(true); el.replaceWith(tmp.firstElementChild);
  };

  /* ---------- retos propios ---------- */
  G.act['reto-new'] = () => {
    G._rn = G.sheet(`<label class="field"><span>Nombre del reto</span><input id="rn-n" type="text" maxlength="40" placeholder="Ej.: Entrenar con la camiseta de la suerte"></label>
      <label class="field"><span>Descripción (opcional)</span><input id="rn-d" type="text" maxlength="90" placeholder="Ej.: Termina un entrenamiento con ella puesta"></label>
      <p class="muted small">Aparecerá en «Retos del día» durante tus entrenamientos. Se desbloquea la primera vez que lo marques y finalices.</p>
      <div class="btn-row"><button class="btn primary grow" data-act="reto-save">Crear reto</button></div>`, { title: 'Nuevo reto' });
  };
  G.act['reto-save'] = () => {
    const n = G.$('#rn-n').value.trim(), d = G.$('#rn-d').value.trim();
    if (!n) { G.toast('Ponle un nombre al reto'); return; }
    const st = S(); st.retos = st.retos || [];
    if (st.retos.length >= 30) { G.toast('Ya tienes 30 retos propios'); return; }
    st.retos.push({ id: 'u' + G.uid(), n: n.slice(0, 40), d: d.slice(0, 90) }); G.save(true);
    G._rn.close(); G.ui.achOpen = G.ui.achOpen || {}; G.ui.achOpen['Mis retos'] = true; G.toast('Reto creado'); G.render();
  };
  G.act['reto-del'] = async (t) => {
    const ok = await G.confirm('¿Borrar este reto?', { title: 'Borrar reto', detail: 'Si ya lo desbloqueaste, seguirá contando en tu historial.', ok: 'Borrar', danger: true });
    if (!ok) return; const st = S(); st.retos = (st.retos || []).filter((r) => r.id !== t.dataset.id); G.save(true); G.render();
  };

  /* ---------- vista ---------- */
  G.ui = G.ui || {}; G.ui.achOpen = { Constancia: true }; G.ui.achF = 'all';
  const meterRow = (a, p, ok, st) => {
    const secret = a.secret && !ok;
    const date = ok ? `<span class="small ach-date">Desbloqueado el ${esc(fmtShort(st.ach[a.id]))}${a.man && p.cnt > 1 ? ' · ' + p.cnt + ' veces' : ''}</span>` : '';
    let extra = '';
    if (!ok && !secret) {
      if (p.need > 1) { const pc = Math.min(100, Math.round(p.cur / p.need * 100)); extra = `<span class="meter" role="progressbar" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pc}%"></i></span><span class="muted small num">${fmtN(p.cur)} de ${fmtN(p.need)}</span>`; }
    }
    return `<div class="row ach ${ok ? 'on' : ''}"><span class="ach-ic">${ic(ok ? 'trophy' : 'lock')}</span><span class="row-main"><b>${secret ? 'Logro secreto' : esc(a.n)}</b><span class="muted small">${secret ? 'Sigue entrenando para descubrirlo' : esc(a.d)}</span>${date}${extra}</span>` +
      (a.custom ? `<button class="icon-btn" data-act="reto-del" data-id="${esc(a.id)}" aria-label="Borrar el reto ${esc(a.n)}">${ic('trash')}</button>` : '') + '</div>';
  };
  G.logrosView = () => {
    const st = S(), x = build(), all = G.allAch(), f = G.ui.achF;
    x.unlocked = all.filter((a) => !a.meta && st.ach[a.id]).length;
    const rows = all.map((a) => ({ a, p: G.achProg(a, x), ok: !!st.ach[a.id] }));
    const done = rows.filter((r) => r.ok).length, pc = Math.round(done / rows.length * 100);
    const seg = `<div class="seg small">${[['all', 'Todos'], ['todo', 'Pendientes'], ['done', 'Conseguidos']].map((o) => `<button class="${f === o[0] ? 'on' : ''}" data-act="ach-f" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>`;
    const cats = G.ACH_CATS.map((c) => {
      const all2 = rows.filter((r) => r.a.c === c), shown = all2.filter((r) => f === 'all' || (f === 'done' ? r.ok : !r.ok));
      if (!all2.length && c !== 'Mis retos') return '';
      if (!shown.length && !(c === 'Mis retos' && f === 'all')) return '';
      const open = !!G.ui.achOpen[c], n = all2.filter((r) => r.ok).length;
      const list = open ? `<div class="rows">${c === 'Retos' ? '<p class="muted small">Estos retos se marcan en «Retos del día», dentro de la pantalla de entrenamiento, y se desbloquean al finalizar.</p>' : ''}${shown.map((r) => meterRow(r.a, r.p, r.ok, st)).join('')}${c === 'Mis retos' ? `${all2.length ? '' : '<p class="muted small">Inventa tus propios retos: una camiseta de la suerte, una playlist, un lugar…</p>'}<div class="btn-row"><button class="btn ghost grow" data-act="reto-new">${ic('plus')} Crear mi propio reto</button></div>` : ''}</div>` : '';
      return `<section class="ach-cat"><button class="ach-h" data-act="ach-cat" data-c="${esc(c)}" aria-expanded="${open}"><b>${esc(c)}</b><span class="muted small num">${n} de ${all2.length}</span>${ic(open ? 'up' : 'down')}</button>${list}</section>`;
    }).join('');
    return `<section class="panel soft ach-top"><div class="ach-count"><b class="num">${done}</b><span>de ${rows.length} logros</span></div><span class="meter" role="progressbar" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pc}%"></i></span></section>${seg}${cats}`;
  };
  G.act['ach-cat'] = (t) => { const o = G.ui.achOpen, c = t.dataset.c; o[c] = !o[c]; G.render(); };
  G.act['ach-f'] = (t) => { G.ui.achF = t.dataset.v; G.render(); };
})((window.G = window.G || {}));
