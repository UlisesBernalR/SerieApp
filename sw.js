/* Serie — service worker: guarda la app para que funcione sin internet */
const CACHE = 'serie-v1';
const FILES = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'js/figures.js', 'js/data.js', 'js/core.js', 'js/logic.js', 'js/v-home.js', 'js/v-routines.js',
  'js/v-schedule.js', 'js/v-workout.js', 'js/v-progress.js', 'js/v-more.js', 'js/v-profile.js', 'js/logros.js', 'js/native.js', 'js/main.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero la red (para recibir mejoras); si no hay internet, lo guardado.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
  );
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => (cs.length ? cs[0].focus() : self.clients.openWindow('./'))));
});
