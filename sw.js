/* =========================================
   Service Worker
   Croatian Labor Law Fact Checker v2.1.0
   ========================================= */

const CACHE_NAME = 'croatian-law-checker-v2.1.0';
const STATIC_CACHE = 'static-cache-v2.1.0';
const DYNAMIC_CACHE = 'dynamic-cache-v2.1.0';

// Files to cache immediately
const STATIC_FILES = [
    './',
    './index.html',
    './css/neumorphism.css',
    './css/style.css',
    './js/main.js',
    './js/database.js',
    './js/search.js',
    './js/i18n.js',
    './js/security.js',
    './js/gdpr.js',
    './assets/icons/favicon.svg',
    './assets/icons/favicon.ico',
    './manifest.json'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response for caching
                        const responseToCache = response.clone();

                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(error => {
                                console.error('Service Worker: Error caching dynamic content:', error);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Service Worker: Fetch failed:', error);
                        
                        // Return offline fallback for HTML requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications (for future features)
self.addEventListener('push', event => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/assets/icons/android-chrome-192x192.png',
        badge: '/assets/icons/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Update',
                icon: '/assets/icons/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/favicon-32x32.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Croatian Law Checker', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function for background sync
async function doBackgroundSync() {
    try {
        console.log('Service Worker: Performing background sync');
        // Add background sync logic here if needed
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
        throw error;
    }
}

// Message handler for communication with main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Send response back to client
    event.ports[0].postMessage({
        type: 'SW_RESPONSE',
        message: 'Service Worker received message'
    });
});
