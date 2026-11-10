/* Serie — arranque, navegación y registro del service worker */
(function (G) {
  'use strict';
  const { $, ic, esc } = G;
  const TABS = [['inicio', 'Inicio', 'home'], ['rutinas', 'Rutinas', 'list'], ['horario', 'Horario', 'cal'], ['progreso', 'Progreso', 'chart'], ['mas', 'Más', 'more']];
  const VIEW = { inicio: 'home', rutinas: 'rutinas', horario: 'horario', progreso: 'progreso', mas: 'mas' };
  G.tab = 'inicio';

  function title() {
    if (G.tab === 'inicio') { const d = new Date(); return G.DAYS[G.dayIdx(d)] + ' ' + d.getDate() + ' de ' + G.MONTHS[d.getMonth()]; }
    return TABS.find((t) => t[0] === G.tab)[1];
  }
  G.render = () => {
    const v = G.views[VIEW[G.tab]];
    $('#page-title').textContent = title();
    $('#main').innerHTML = v();
    if (v.after) v.after();
    $('#nav').innerHTML = TABS.map((t) => `<button class="nav-b ${t[0] === G.tab ? 'on' : ''}" data-act="goto" data-tab="${t[0]}" ${t[0] === G.tab ? 'aria-current="page"' : ''}>${ic(t[2])}<span>${t[1]}</span></button>`).join('');
    G.sessBar(); G.tick();
    try { G.achToast(); } catch (e) { console.error(e); }
  };
  G.go = (tab) => { G.tab = tab; window.scrollTo(0, 0); G.render(); };

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); G._bip = e; if (G.tab === 'mas') G.render(); });
  window.addEventListener('appinstalled', () => { G._bip = null; });

  async function init() {
    G.applyTheme();
    if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', G.applyTheme); } catch (e) {} }
    await G.photos.open();
    $('#chip').innerHTML = `${ic('timer')}<span id="chip-time"></span>`;
    G.render();
    G.checkReminders();
    try { G.ninit(); } catch (e) {}
    try {
      if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
    } catch (e) {}
    document.documentElement.classList.add('ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})((window.G = window.G || {}));
