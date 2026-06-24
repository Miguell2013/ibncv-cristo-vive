// Service worker — IBNCV Cristo Vive
// 1) Habilita "Instalar app" (PWA) e auto-atualização do HTML
// 2) WEB PUSH: recebe avisos (ex.: novo membro no grupo) e abre o app ao tocar
const SW_VERSION = 'ibncv-v1-2026-06-24';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-cache' }).catch(() => fetch(req)),
    );
    return;
  }
});

// ——— WEB PUSH ———
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Cristo Vive';
  const options = {
    body: data.body || '',
    icon: data.icon || 'https://ibncv.b-cdn.net/logo-trasparente.png',
    badge: 'https://ibncv.b-cdn.net/logo-trasparente.png',
    data: { url: data.url || '/' },
    tag: data.tag || 'ibncv',
    renotify: true,
    vibrate: [120, 60, 120],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) {
        try { await c.navigate(url); } catch (_e) {}
        return c.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});
