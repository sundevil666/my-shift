/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() as
    | { title?: string; body?: string; tag?: string; kind?: string; url?: string }
    | undefined;
  event.waitUntil(
    self.registration.showNotification(data?.title ?? 'My Shift', {
      body: data?.body ?? '',
      tag: data?.tag ?? 'my-shift:push',
      icon: '/icons/my-shift-icon-v2-192.png',
      badge: '/icons/favicon-96x96.png',
      data: { url: data?.url ?? '/' },
      requireInteraction: data?.kind === 'alarm',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(
    (event.notification.data as { url?: string } | undefined)?.url ?? '/',
    self.location.origin,
  ).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((item) => item.url.startsWith(self.location.origin));
      return client ? client.focus() : self.clients.openWindow(targetUrl);
    }),
  );
});
