'use strict';

/** 
 *  Service Worker
 *  Caches all static assets on install so the app works offline.
 *  Update CACHE_VERSION when deploying new files.
 */
const CACHE_VERSION = 'v3';
const CACHE_NAME    = `aes256-encryptor-${CACHE_VERSION}`;

/**
 * All files to cache on install 
 */
const STATIC_ASSETS = [
  '/aes256-encryptor/',
  '/aes256-encryptor/index.html',
  '/aes256-encryptor/manifest.json',
  '/aes256-encryptor/assets/js/app.js',
  '/aes256-encryptor/assets/js/alpine.min.js',
  '/aes256-encryptor/assets/css/tailwind.min.css',
  '/aes256-encryptor/assets/icons/icon-192x192.png',
  '/aes256-encryptor/assets/icons/icon-512x512.png',
];

/**
 * Install: cache all static assets 
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate: delete old caches 
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch: serve from cache, fallback to network 
 */
self.addEventListener('fetch', event => {
  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached ?? fetch(event.request))
  );
});
