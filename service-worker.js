// Cache only the self-contained connection fallback; live pages and prices stay network-first.
const CACHE = 'ogogo-connectivity-v1';
const OFFLINE = new URL('offline.html', self.registration.scope).href;
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE).then(cache => cache.add(OFFLINE)).then(() => self.skipWaiting()));});
self.addEventListener('activate', event => {event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ogogo-connectivity-') && key !== CACHE).map(key => caches.delete(key)))), self.clients.claim()]));});
self.addEventListener('fetch', event => {
 if (event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
 event.respondWith(fetch(event.request).catch(async () => (await caches.match(OFFLINE)) || new Response('Connection unavailable. Please try again.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
