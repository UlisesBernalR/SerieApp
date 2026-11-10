/* Serie — ilustraciones de ejercicios (SVG propio, vista lateral) y mapa muscular */
(function (G) {
  'use strict';
  const FLOOR = 166;
  const LEN = { torso: 42, ua: 22, fa: 21, th: 30, sh: 30, ft: 11, neck: 13 };
  const R = (d) => (d * Math.PI) / 180;
  const r1 = (n) => Math.round(n * 10) / 10;
  const add = (p, a, l) => [p[0] + l * Math.cos(R(a)), p[1] + l * Math.sin(R(a))];
  const P = (p) => r1(p[0]) + ',' + r1(p[1]);

  /* ---------- cinemática ---------- */
  function ik(root, target, a, b, bend) {
    const dx = target[0] - root[0], dy = target[1] - root[1];
    const base = Math.atan2(dy, dx);
    const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(a - b) + 1), a + b - 0.01);
    const end = [root[0] + Math.cos(base) * d, root[1] + Math.sin(base) * d];
    const c = (a * a + d * d - b * b) / (2 * a * d);
    const A = Math.acos(Math.max(-1, Math.min(1, c)));
    const ang = base - bend * A;
    return [[root[0] + a * Math.cos(ang), root[1] + a * Math.sin(ang)], end];
  }
  function limb(root, s, a, b, head) {
    if (s.ik) {
      const t = s.ik === 'head' ? [head[0] + (s.off ? s.off[0] : 0), head[1] + (s.off ? s.off[1] : 0)] : s.ik;
      return ik(root, t, a, b, s.b === undefined ? 1 : s.b);
    }
    const a1 = s.ua !== undefined ? s.ua : s.th;
    const a2 = s.fa !== undefined ? s.fa : s.sh;
    const m = add(root, a1, a);
    return [m, add(m, a2, b)];
  }
  function solve(p) {
    const leg1 = p.leg, leg2 = p.leg2 || p.leg;
    let hip = p.hip;
    if (!hip) {
      const h0 = [p.hx, 0];
      const a = limb(h0, leg1, LEN.th, LEN.sh), b = limb(h0, leg2, LEN.th, LEN.sh);
      const t1 = add(a[1], leg1.ft || 0, LEN.ft), t2 = add(b[1], leg2.ft || 0, LEN.ft);
      const my = Math.max(a[1][1], t1[1], b[1][1], t2[1]);
      hip = [p.hx, FLOOR - my - (p.lift || 0)];
    }
    const sh = add(hip, p.t, LEN.torso);
    const head = add(sh, p.t + (p.hd || 0), LEN.neck);
    const A1 = limb(sh, p.arm, LEN.ua, LEN.fa, head);
    const A2 = limb(sh, p.arm2 || p.arm, LEN.ua, LEN.fa, head);
    const L1 = limb(hip, leg1, LEN.th, LEN.sh);
    const L2 = limb(hip, leg2, LEN.th, LEN.sh);
    return {
      hip, sh, head,
      el: A1[0], hand: A1[1], el2: A2[0], hand2: A2[1],
      kn: L1[0], an: L1[1], toe: add(L1[1], leg1.ft || 0, LEN.ft),
      kn2: L2[0], an2: L2[1], toe2: add(L2[1], leg2.ft || 0, LEN.ft),
      shinA: leg1.sh !== undefined ? leg1.sh : Math.atan2(L1[1][1] - L1[0][1], L1[1][0] - L1[0][0]) * 180 / Math.PI
    };
  }
  function mix(a, b, u) {
    if (typeof a === 'number') return a + (b - a) * u;
    if (Array.isArray(a)) return a.map((v, i) => mix(v, b[i], u));
    if (a && typeof a === 'object') {
      const o = {};
      for (const k in a) o[k] = k in b ? mix(a[k], b[k], u) : a[k];
      return o;
    }
    return a;
  }

  /* ---------- piezas de escena ---------- */
  const S = {
    floor: () => `<line class="floor" x1="6" y1="${FLOOR + 2}" x2="234" y2="${FLOOR + 2}"/>`,
    bench: (x1, x2, y) =>
      `<rect class="eq" x="${x1}" y="${y}" width="${x2 - x1}" height="7" rx="3"/>` +
      `<rect class="eq" x="${x1 + 8}" y="${y + 7}" width="5" height="${FLOOR + 2 - y - 7}"/>` +
      `<rect class="eq" x="${x2 - 13}" y="${y + 7}" width="5" height="${FLOOR + 2 - y - 7}"/>`,
    plate: (p, r) =>
      `<circle class="plate" cx="${r1(p[0])}" cy="${r1(p[1])}" r="${r}"/>` +
      `<circle class="hub" cx="${r1(p[0])}" cy="${r1(p[1])}" r="${r1(r * 0.3)}"/>`,
    db: (p) => `<circle class="dbell" cx="${r1(p[0])}" cy="${r1(p[1])}" r="5.5"/>`,
    ln: (a, b, c) => `<line class="${c || 'cable'}" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`,
    rect: (x, y, w, h, c) => `<rect class="${c || 'eq'}" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`,
    pad: (p, ang, w, h) => {
      w = w || 18; h = h || 7;
      return `<rect class="eq2" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" transform="translate(${r1(p[0])} ${r1(p[1])}) rotate(${r1(ang)})"/>`;
    },
    tower: (x, top, py) =>
      `<rect class="eq" x="${x - 3}" y="${top}" width="6" height="${FLOOR + 2 - top}"/>` +
      `<circle class="eq2" cx="${x - 5}" cy="${py}" r="5"/>`,
    backrest: (j, ext) => {
      // línea paralela al torso, desplazada hacia abajo
      const dx = j.sh[0] - j.hip[0], dy = j.sh[1] - j.hip[1];
      const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
      let nx = -uy, ny = ux; if (ny < 0) { nx = -nx; ny = -ny; }
      const o = 9;
      const a = [j.hip[0] + nx * o + ux * 10, j.hip[1] + ny * o + uy * 10];
      const b = [j.sh[0] + nx * o + ux * ext, j.sh[1] + ny * o + uy * ext];
      return `<line class="eqline" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`;
    }
  };

  /* ---------- dibujo de la figura ---------- */
  function drawFig(j) {
    const pl = (pts, c) => `<polyline class="${c || 'b'}" points="${pts.map(P).join(' ')}"/>`;
    const diff = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) > 1.5;
    let s = '';
    if (diff(j.hand, j.hand2) || diff(j.el, j.el2)) s += pl([j.sh, j.el2, j.hand2], 'b far');
    if (diff(j.an, j.an2) || diff(j.kn, j.kn2)) s += pl([j.hip, j.kn2, j.an2, j.toe2], 'b far');
    s += pl([j.hip, j.sh], 'b torso');
    s += pl([j.hip, j.kn, j.an, j.toe]);
    s += pl([j.sh, j.el, j.hand]);
    s += `<circle class="head" cx="${r1(j.head[0])}" cy="${r1(j.head[1])}" r="8.5"/>`;
    return s;
  }

  /* ---------- vista frontal ---------- */
  function frontPose(p) {
    const cx = 120, lift = p.lift || 0;
    const hipY = FLOOR - 60 - lift, shY = hipY - 42;
    const pts = { head: [cx, shY - 13], sh: [cx, shY], hip: [cx, hipY] };
    const arm = (side) => {
      const s = [cx + side * 15, shY + 1];
      const e = [s[0] + side * 22 * Math.sin(R(p.ua)), s[1] + 22 * Math.cos(R(p.ua))];
      const h = [e[0] + side * 21 * Math.sin(R(p.fa)), e[1] + 21 * Math.cos(R(p.fa))];
      return [s, e, h];
    };
    const leg = (side) => {
      const s = [cx + side * 7, hipY];
      const e = [s[0] + side * 60 * Math.sin(R(p.leg)), s[1] + 60 * Math.cos(R(p.leg))];
      return [s, e, [e[0] + side * 9, e[1]]];
    };
    return { pts, arms: [arm(-1), arm(1)], legs: [leg(-1), leg(1)], shY };
  }
  function drawFront(p, db) {
    const f = frontPose(p);
    const pl = (pts, c) => `<polyline class="${c || 'b'}" points="${pts.map(P).join(' ')}"/>`;
    let s = '';
    f.legs.forEach((l) => (s += pl(l)));
    s += pl([[120 - 15, f.shY + 1], [120 + 15, f.shY + 1]], 'b torso');
    s += pl([f.pts.sh, f.pts.hip], 'b torso');
    f.arms.forEach((a) => (s += pl(a)));
    s += `<circle class="head" cx="${r1(f.pts.head[0])}" cy="${r1(f.pts.head[1])}" r="8.5"/>`;
    if (db) f.arms.forEach((a) => (s += S.db(a[2])));
    return s;
  }

  /* ---------- poses por ejercicio ---------- */
  const ST = { th: 90, sh: 90, ft: 0 };
  const FIG = {};

  FIG['press-banca'] = {
    a: { hip: [140, 108], t: 180, leg: { ik: [158, 162], b: 1, ft: 0 }, arm: { ik: [98, 62], b: -1 } },
    b: { hip: [140, 108], t: 180, leg: { ik: [158, 162], b: 1, ft: 0 }, arm: { ik: [106, 94], b: -1 } },
    sc: () => S.bench(40, 172, 116) + S.rect(66, 66, 5, 50) + S.rect(66, 66, 14, 4),
    fr: (j) => S.plate(j.hand, 11)
  };
  FIG['press-inclinado-mancuernas'] = {
    a: { hip: [122, 112], t: 210, leg: { ik: [152, 162], b: 1, ft: 0 }, arm: { ik: [88, 48], b: -1 } },
    b: { hip: [122, 112], t: 210, leg: { ik: [152, 162], b: 1, ft: 0 }, arm: { ik: [94, 84], b: -1 } },
    sc: (j) => S.backrest(j, 14) + S.rect(100, 122, 46, 7) + S.rect(118, 129, 6, FLOOR + 2 - 129),
    fr: (j) => S.db(j.hand)
  };
  FIG['flexiones'] = {
    a: { hip: [105, 128], t: 350, leg: { ik: [40, 164], b: 1, ft: 55 }, arm: { ik: [146, 164], b: -1 } },
    b: { hip: [108, 142], t: 355, leg: { ik: [40, 160], b: 1, ft: 55 }, arm: { ik: [148, 164], b: -1 } }
  };
  FIG['fondos-paralelas'] = {
    a: { hip: [104, 89], t: 295, leg: { ik: [84, 138], b: 1, ft: 40 }, arm: { ik: [122, 94], b: -1 } },
    b: { hip: [106, 110], t: 295, leg: { ik: [86, 158], b: 1, ft: 40 }, arm: { ik: [124, 94], b: -1 } },
    sc: () => S.rect(104, 94, 46, 5, 'eq') + S.rect(108, 99, 5, FLOOR - 97, 'eq') + S.rect(141, 99, 5, FLOOR - 97, 'eq')
  };
  FIG['dominadas'] = {
    a: { hip: [116, 102], t: 270, leg: { ik: [98, 152], b: 1, ft: 40 }, arm: { ik: [130, 16], b: -1 } },
    b: { hip: [112, 72], t: 270, leg: { ik: [94, 122], b: 1, ft: 40 }, arm: { ik: [130, 16], b: -1 } },
    noFloor: true,
    sc: () => S.rect(66, 12, 108, 5, 'eq') + S.rect(66, 12, 5, 150, 'eq') + S.rect(169, 12, 5, 150, 'eq')
  };
  FIG['jalon-pecho'] = {
    a: { hip: [100, 122], t: 262, leg: { ik: [142, 162], b: 1, ft: 0 }, arm: { ik: [122, 34], b: -1 } },
    b: { hip: [100, 122], t: 262, leg: { ik: [142, 162], b: 1, ft: 0 }, arm: { ik: [112, 86], b: -1 } },
    sc: () => S.rect(78, 129, 46, 7) + S.rect(98, 136, 6, FLOOR - 134) + S.rect(131, 6, 7, FLOOR - 4) + S.rect(104, 6, 34, 6),
    fr: (j) => S.ln(j.hand, [128, 12]) + `<circle class="dbell" cx="${r1(j.hand[0])}" cy="${r1(j.hand[1])}" r="4"/>`
  };
  FIG['remo-barra'] = {
    a: { hip: [98, 106], t: 335, leg: { ik: [90, 162], b: 1, ft: 0 }, arm: { ik: [138, 132], b: -1 } },
    b: { hip: [98, 106], t: 335, leg: { ik: [90, 162], b: 1, ft: 0 }, arm: { ik: [125, 104], b: -1 } },
    fr: (j) => S.plate(j.hand, 9)
  };
  FIG['remo-polea'] = {
    a: { hip: [96, 142], t: 280, leg: { ik: [150, 160], b: 1, ft: -20 }, arm: { ik: [140, 106], b: -1 } },
    b: { hip: [96, 142], t: 262, leg: { ik: [150, 160], b: 1, ft: -20 }, arm: { ik: [110, 120], b: -1 } },
    sc: () => S.rect(58, 149, 68, 7) + S.rect(78, 156, 6, 10) + S.rect(152, 140, 6, 26) + S.rect(214, 92, 8, 74),
    fr: (j) => S.ln(j.hand, [214, 112]) + `<circle class="dbell" cx="${r1(j.hand[0])}" cy="${r1(j.hand[1])}" r="3.5"/>`
  };
  FIG['peso-muerto'] = {
    a: { hip: [72, 126], t: 335, leg: { ik: [100, 162], b: 1, ft: 0 }, arm: { ik: [110, 152], b: -1 } },
    b: { hip: [100, 106], t: 270, leg: { ik: [100, 166], b: 1, ft: 0 }, arm: { ik: [106, 108], b: -1 } },
    fr: (j) => S.plate(j.hand, 12)
  };
  FIG['press-militar'] = {
    a: { hx: 110, t: 270, leg: ST, arm: { ik: [119, 60], b: -1 } },
    b: { hx: 110, t: 270, leg: ST, arm: { ik: [113, 18], b: -1 } },
    fr: (j) => S.plate(j.hand, 10)
  };
  FIG['press-hombro-mancuernas'] = {
    a: { hip: [100, 118], t: 268, leg: { ik: [142, 162], b: 1, ft: 0 }, arm: { ik: [108, 80], b: -1 } },
    b: { hip: [100, 118], t: 268, leg: { ik: [142, 162], b: 1, ft: 0 }, arm: { ik: [104, 36], b: -1 } },
    sc: () => S.rect(70, 124, 60, 7) + S.rect(96, 131, 6, FLOOR - 129) + `<line class="eqline" x1="76" y1="126" x2="71" y2="62"/>`,
    fr: (j) => S.db(j.hand)
  };
  FIG['elevaciones-laterales'] = {
    view: 'front', db: true,
    a: { ua: 6, fa: 10, leg: 3, lift: 0 },
    b: { ua: 80, fa: 92, leg: 3, lift: 0 }
  };
  FIG['face-pull'] = {
    a: { hx: 96, t: 266, leg: ST, arm: { ik: [132, 62], b: 1 } },
    b: { hx: 96, t: 266, leg: ST, arm: { ik: [110, 54], b: 1 } },
    sc: () => S.tower(205, 30, 60),
    fr: (j) => S.ln(j.hand, [200, 60]) + `<circle class="dbell" cx="${r1(j.hand[0])}" cy="${r1(j.hand[1])}" r="3.5"/>`
  };
  FIG['curl-barra'] = {
    a: { hx: 106, t: 270, leg: ST, arm: { ik: [116, 104], b: -1 } },
    b: { hx: 106, t: 270, leg: ST, arm: { ik: [126, 64], b: -1 } },
    fr: (j) => S.plate(j.hand, 9)
  };
  FIG['curl-alterno'] = {
    a: { hx: 106, t: 270, leg: ST, arm: { ik: [114, 104], b: -1 }, arm2: { ik: [126, 66], b: -1 } },
    b: { hx: 106, t: 270, leg: ST, arm: { ik: [126, 66], b: -1 }, arm2: { ik: [114, 104], b: -1 } },
    fr: (j) => S.db(j.hand2) + S.db(j.hand)
  };
  FIG['pushdown-triceps'] = {
    a: { hx: 128, t: 274, leg: ST, arm: { ik: [148, 80], b: -1 } },
    b: { hx: 128, t: 274, leg: ST, arm: { ik: [136, 106], b: -1 } },
    sc: () => S.tower(180, 24, 32),
    fr: (j) => S.ln(j.hand, [175, 32]) + `<circle class="dbell" cx="${r1(j.hand[0])}" cy="${r1(j.hand[1])}" r="3.5"/>`
  };
  FIG['press-frances'] = {
    a: { hip: [140, 108], t: 180, leg: { ik: [158, 162], b: 1, ft: 0 }, arm: { ua: 270, fa: 270 } },
    b: { hip: [140, 108], t: 180, leg: { ik: [158, 162], b: 1, ft: 0 }, arm: { ua: 270, fa: 170 } },
    sc: () => S.bench(40, 172, 116),
    fr: (j) => S.plate(j.hand, 8)
  };
  FIG['sentadilla'] = {
    a: { hip: [106, 106], t: 268, leg: { ik: [106, 166], b: 1, ft: 0 }, arm: { ua: 105, fa: 277 } },
    b: { hip: [86, 128], t: 300, leg: { ik: [106, 166], b: 1, ft: 0 }, arm: { ua: 105, fa: 277 } },
    fr: (j) => S.plate(j.hand, 9)
  };
  FIG['prensa'] = {
    a: { hip: [84, 128], t: 215, leg: { ik: [118, 106], b: 1, ft: -35 }, arm: { ik: [88, 116], b: -1 } },
    b: { hip: [84, 128], t: 215, leg: { ik: [160, 72], b: 1, ft: -35 }, arm: { ik: [88, 116], b: -1 } },
    sc: (j) => S.backrest(j, 12) + S.rect(66, 140, 36, 7) + S.ln([98, 150], [186, 84], 'eqline'),
    fr: (j) => S.pad(j.an, 55, 6, 34)
  };
  FIG['zancadas'] = {
    a: { hip: [110, 106], t: 270, leg: { ik: [110, 166], b: 1, ft: 0 }, leg2: { ik: [110, 166], b: 1, ft: 0 }, arm: { ua: 90, fa: 90 } },
    b: { hip: [120, 126], t: 270, leg: { ik: [148, 166], b: 1, ft: 0 }, leg2: { ik: [72, 158], b: 1, ft: 70 }, arm: { ua: 90, fa: 90 } },
    fr: (j) => S.db(j.hand)
  };
  FIG['peso-muerto-rumano'] = {
    a: { hip: [108, 106], t: 270, leg: { ik: [108, 166], b: 1, ft: 0 }, arm: { ik: [112, 106], b: -1 } },
    b: { hip: [82, 106], t: 345, leg: { ik: [96, 166], b: 1, ft: 0 }, arm: { ik: [120, 140], b: -1 } },
    fr: (j) => S.plate(j.hand, 9)
  };
  FIG['curl-femoral'] = {
    a: { hip: [104, 126], t: 180, leg: { th: 0, sh: 0, ft: 90 }, arm: { ik: [66, 136], b: 1 } },
    b: { hip: [104, 126], t: 180, leg: { th: 0, sh: -105, ft: -15 }, arm: { ik: [66, 136], b: 1 } },
    sc: () => S.bench(58, 142, 134),
    fr: (j) => S.pad(j.an, j.shinA + 90, 16, 8)
  };
  FIG['extension-cuadriceps'] = {
    a: { hip: [94, 120], t: 272, leg: { th: 0, sh: 90, ft: 0 }, arm: { ik: [100, 122], b: -1 } },
    b: { hip: [94, 120], t: 272, leg: { th: 0, sh: -10, ft: -80 }, arm: { ik: [100, 122], b: -1 } },
    sc: () => S.rect(66, 127, 62, 7) + S.rect(96, 134, 6, FLOOR - 132) + `<line class="eqline" x1="72" y1="128" x2="72" y2="66"/>`,
    fr: (j) => S.pad(j.an, j.shinA + 90, 16, 8)
  };
  FIG['elevacion-talones'] = {
    a: { hx: 110, t: 270, leg: { th: 90, sh: 90, ft: 0 }, arm: { ua: 92, fa: 92 } },
    b: { hx: 110, t: 270, leg: { th: 90, sh: 90, ft: 62 }, arm: { ua: 92, fa: 92 } },
    fr: (j) => S.db(j.hand)
  };
  FIG['puente-gluteos'] = {
    a: { hip: [106.5, 154], t: 214.8, leg: { ik: [150, 164], b: 1, ft: 0 }, arm: { ua: 20, fa: 20 } },
    b: { hip: [114, 128], t: 177.3, leg: { ik: [150, 164], b: 1, ft: 0 }, arm: { ua: 20, fa: 20 } },
    sc: () => S.bench(34, 86, 136)
  };
  FIG['plancha'] = {
    static: true,
    a: { hip: [98, 143], t: 356, leg: { ik: [40, 158], b: 1, ft: 55 }, arm: { ua: 90, fa: 0 } },
    b: { hip: [98, 143], t: 356, leg: { ik: [40, 158], b: 1, ft: 55 }, arm: { ua: 90, fa: 0 } }
  };
  FIG['crunch'] = {
    a: { hip: [124, 158], t: 180, leg: { ik: [156, 164], b: 1, ft: 0 }, arm: { ik: 'head', off: [4, -6], b: 1 } },
    b: { hip: [124, 158], t: 215, leg: { ik: [156, 164], b: 1, ft: 0 }, arm: { ik: 'head', off: [4, -6], b: 1 } }
  };
  FIG['elevacion-piernas'] = {
    a: { hip: [128, 158], t: 180, leg: { th: 0, sh: 0, ft: -90 }, arm: { ua: 5, fa: 5 } },
    b: { hip: [128, 158], t: 180, leg: { th: -90, sh: -90, ft: -180 }, arm: { ua: 5, fa: 5 } }
  };
  FIG['superman'] = {
    a: { hip: [122, 158], t: 180, leg: { th: 0, sh: 0, ft: 90 }, arm: { ua: 178, fa: 175 } },
    b: { hip: [122, 158], t: 195, leg: { th: -14, sh: -14, ft: 76 }, arm: { ua: 200, fa: 205 } }
  };
  FIG['trote-cinta'] = {
    a: { hx: 104, t: 280, leg: { th: -20, sh: 80, ft: 10 }, leg2: { th: 112, sh: 175, ft: 70 }, arm: { ua: 60, fa: -40 }, arm2: { ua: 125, fa: 75 } },
    b: { hx: 104, t: 280, leg: { th: 112, sh: 175, ft: 70 }, leg2: { th: -20, sh: 80, ft: 10 }, arm: { ua: 125, fa: 75 }, arm2: { ua: 60, fa: -40 } },
    sc: () => S.rect(34, FLOOR + 1, 150, 6, 'eq') + S.rect(190, 70, 6, 98, 'eq') + S.rect(170, 66, 40, 10, 'eq2')
  };
  FIG['jumping-jacks'] = {
    view: 'front',
    a: { ua: 8, fa: 8, leg: 4, lift: 0 },
    b: { ua: 150, fa: 168, leg: 20, lift: 8 }
  };

  /* ---------- render ---------- */
  function figSVG(id, u, opts) {
    opts = opts || {};
    const F = FIG[id];
    if (!F) return placeholder();
    const parts = [];
    if (!F.noFloor && !F.view) parts.push(S.floor());
    if (F.view === 'front') {
      parts.push(S.floor());
      if (opts.ghost !== undefined) parts.push(`<g class="ghost">${drawFront(mix(F.a, F.b, opts.ghost), F.db)}</g>`);
      parts.push(drawFront(mix(F.a, F.b, u), F.db));
    } else {
      const jm = solve(mix(F.a, F.b, u));
      if (F.sc) parts.push(F.sc(jm, u));
      if (opts.ghost !== undefined) parts.push(`<g class="ghost">${drawFig(solve(mix(F.a, F.b, opts.ghost)))}</g>`);
      parts.push(drawFig(jm));
      if (F.fr) parts.push(F.fr(jm, u));
      parts.push(`<circle class="hand" cx="${r1(jm.hand[0])}" cy="${r1(jm.hand[1])}" r="3.4"/>`);
    }
    return `<svg class="fig" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustración del ejercicio">${parts.join('')}</svg>`;
  }
  function placeholder() {
    return `<svg class="fig" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sin ilustración"><g class="eqline" transform="translate(120 90)"><line x1="-46" y1="0" x2="46" y2="0" stroke-width="5"/><rect class="plate" x="-60" y="-24" width="12" height="48" rx="4"/><rect class="plate" x="48" y="-24" width="12" height="48" rx="4"/><rect class="eq2" x="-72" y="-14" width="10" height="28" rx="3"/><rect class="eq2" x="62" y="-14" width="10" height="28" rx="3"/></g></svg>`;
  }
  const hasFig = (id) => !!FIG[id];
  const isStatic = (id) => !!(FIG[id] && FIG[id].static);

  /* ---------- mapa muscular ---------- */
  const ln = (x1, y1, x2, y2, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${w}" stroke-linecap="round"/>`;
  const MM = {
    base: `<circle cx="50" cy="16" r="11"/><rect x="45" y="25" width="10" height="10" rx="3"/><path d="M27 38 Q50 30 73 38 L69 100 Q68 112 62 118 L38 118 Q32 112 31 100 Z"/>` +
      ln(22, 46, 16, 80, 12) + ln(78, 46, 84, 80, 12) + ln(15, 84, 12, 114, 9) + ln(85, 84, 88, 114, 9) +
      ln(41, 120, 38, 166, 19) + ln(59, 120, 62, 166, 19) + ln(38, 170, 38, 196, 13) + ln(62, 170, 62, 196, 13),
    front: {
      hombros: `<circle cx="24" cy="44" r="8"/><circle cx="76" cy="44" r="8"/>`,
      pecho: `<ellipse cx="39" cy="57" rx="11" ry="9"/><ellipse cx="61" cy="57" rx="11" ry="9"/>`,
      abdomen: `<rect x="42" y="70" width="16" height="40" rx="6"/>`,
      biceps: ln(21, 54, 17, 76, 10) + ln(79, 54, 83, 76, 10),
      antebrazos: ln(15, 86, 12, 112, 8) + ln(85, 86, 88, 112, 8),
      cuadriceps: ln(41, 124, 38, 160, 17) + ln(59, 124, 62, 160, 17),
      pantorrillas: ln(38, 172, 38, 194, 10) + ln(62, 172, 62, 194, 10)
    },
    back: {
      trapecio: `<path d="M50 33 L34 43 L50 70 L66 43 Z"/>`,
      hombros: `<circle cx="24" cy="44" r="8"/><circle cx="76" cy="44" r="8"/>`,
      dorsales: `<path d="M35 50 L47 72 L47 92 L38 90 Q31 70 35 50Z"/><path d="M65 50 L53 72 L53 92 L62 90 Q69 70 65 50Z"/>`,
      lumbar: `<rect x="43" y="94" width="14" height="16" rx="5"/>`,
      triceps: ln(21, 54, 17, 76, 10) + ln(79, 54, 83, 76, 10),
      antebrazos: ln(15, 86, 12, 112, 8) + ln(85, 86, 88, 112, 8),
      gluteos: `<ellipse cx="42" cy="125" rx="10" ry="9"/><ellipse cx="58" cy="125" rx="10" ry="9"/>`,
      isquios: ln(41, 142, 39, 164, 16) + ln(59, 142, 61, 164, 16),
      pantorrillas: ln(38, 172, 38, 194, 11) + ln(62, 172, 62, 194, 11)
    }
  };
  function bodyMap(prim, sec) {
    prim = prim || []; sec = sec || [];
    const st = (k) => (prim.includes(k) ? 'm1' : sec.includes(k) ? 'm2' : 'm0');
    const view = (name, dx) => {
      let g = `<g transform="translate(${dx} 0)"><g class="mm-base">${MM.base}</g>`;
      for (const k in MM[name]) g += `<g class="mm ${st(k)}" data-m="${k}">${MM[name][k]}</g>`;
      return g + `</g>`;
    };
    return `<svg class="bodymap" viewBox="0 0 210 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa de músculos trabajados">${view('front', 0)}${view('back', 110)}</svg>`;
  }

  G.fig = { svg: figSVG, has: hasFig, isStatic, placeholder, bodyMap };
})((window.G = window.G || {}));
