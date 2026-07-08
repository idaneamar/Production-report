/* טרי לי — service worker */
const CACHE = 'trelee-v12';
const SHELL = [
  './app.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* network-first, fallback to cache. HTML skips the HTTP cache so pushed updates arrive immediately */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  const isPage = e.request.mode === 'navigate' || e.request.destination === 'document' || /\.html($|\?)/.test(e.request.url) || e.request.url.endsWith('/');
  e.respondWith(
    fetch(e.request, isPage ? { cache: 'no-cache' } : undefined)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
