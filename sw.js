const CACHE_NAME = 'avia-calc-v3.1'; // Версия кэша. МЕНЯЙТЕ при каждом обновлении!
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Установка: кэшируем основные файлы и активируемся сразу
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Активируемся немедленно
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Активация: удаляем старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Слушаем сообщение от страницы (кнопка "Обновить")
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Перехват запросов: если нет сети, отдаем из кэша
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
