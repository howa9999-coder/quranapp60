const cacheName = "quran60-app-cache-v2"; // Update version when you add/remove assets

const assets = [
    "index.html",
    "index.js",
    "manifest.json",
    "quran (1).png",
    "quran192 (2).png",
    "main.js",
    "style.css",
    "back.jpg"
];

// Install event: Cache static assets
self.addEventListener('install', (installEvent) => {
    installEvent.waitUntil(
        caches.open(cacheName)
            .then((cache) => cache.addAll(assets))
            .catch((err) => console.log("error", err))
    );
    self.skipWaiting(); // Force activation
});

// Activate event: Clean up old caches
self.addEventListener('activate', (activateEvent) => {
    activateEvent.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== cacheName) // Filter out the current cache
                    .map((key) => caches.delete(key))   // Delete the old caches
            );
        })
    );
});

// Fetch event: Intercept network requests
self.addEventListener('fetch', (fetchEvent) => {
    const requestUrl = new URL(fetchEvent.request.url);

    // Check if the request is for an API endpoint
    if (requestUrl.origin === 'https://mp3quran.net' || requestUrl.origin === 'https://www.mp3quran.net') {
        // Handle API requests
        fetchEvent.respondWith(
            caches.match(fetchEvent.request).then((cachedResponse) => {
                // Return cached response if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Fetch from network if not cached
                return fetch(fetchEvent.request).then((networkResponse) => {
                    // Cache the API response for future use
                    const responseToCache = networkResponse.clone();
                    caches.open(cacheName).then((cache) => {
                        cache.put(fetchEvent.request, responseToCache);
                    });
                    return networkResponse;
                }).catch(() => {
                    // Fallback to a default response if offline and no cache is available
                    return new Response(JSON.stringify({ message: 'You are offline' }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                });
            })
        );
    } else {
        // Handle static assets
        fetchEvent.respondWith(
            caches.match(fetchEvent.request).then((res) => {
                return res || fetch(fetchEvent.request);
            })
        );
    }
});
