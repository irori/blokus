importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

// Use stale-while-revalidate for same-origin resources
workbox.routing.registerRoute(/\//, workbox.strategies.staleWhileRevalidate());

// Cache first for Google Fonts
workbox.routing.registerRoute(/https?:\/\/fonts.(?:googleapis|gstatic).com\/css/, workbox.strategies.cacheFirst());
