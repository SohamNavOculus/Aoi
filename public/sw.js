// Service Worker for Aoi Japanese AI Friend Chat App
// Handles background push notifications and notification click actions

const CACHE_NAME = 'aoi-chat-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications (proactive messaging architecture)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Aoi (葵)',
    body: 'hey! got a free second? ☕',
    icon: '/src/assets/aoi_avatar.jpg',
    badge: '/src/assets/aoi_avatar.jpg',
    tag: 'aoi-message',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    renotify: true,
    data: {
      url: '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Focus or open chat when user taps notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
