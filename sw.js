/* =========================================
   Service Worker
   Croatian Labor Law Fact Checker v2.2.0
   ========================================= */

const CACHE_NAME = 'croatian-law-checker-v3.4.0';
const STATIC_CACHE = 'static-cache-v3.4.0';
const DYNAMIC_CACHE = 'dynamic-cache-v3.4.0';

// Files to cache immediately
const STATIC_FILES = [
    './',
    './index.html',
    './src/styles/neumorphism.css',
    './src/styles/style.css',
    './src/styles/enhanced.css',
    './src/scripts/main.js',
    './src/core/LegalDatabase.js',
    './src/search-engine/data/croatian-labor-law.json',
    './src/search-engine/SearchManager.js',
    './src/search-engine/SearchEngine.js',
    './src/scripts/i18n.js',
    './src/scripts/security.js',
    './src/scripts/gdpr.js',
    './src/scripts/feedback.js',
    './src/scripts/tests.js',
    './assets/icons/favicon.svg',
    './assets/icons/favicon.ico',
    './assets/icons/favicon-16x16.png',
    './assets/icons/favicon-32x32.png',
    './manifest.json'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                // Cache files individually to handle missing files gracefully
                return Promise.allSettled(
                    STATIC_FILES.map(url => 
                        cache.add(url).catch(error => {
                            console.warn(`Service Worker: Failed to cache ${url}:`, error);
                            return null;
                        })
                    )
                );
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
                        console.warn('Service Worker: Fetch failed for:', event.request.url, error);
                        
                        // Return offline fallback for HTML requests
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        // For CSS/JS files, try to find cached version or return empty response
                        if (event.request.url.includes('.css') || event.request.url.includes('.js')) {
                            return caches.match(event.request.url.replace('.min.', '.')) || 
                                   new Response('/* File not available */', {
                                       status: 200,
                                       statusText: 'OK',
                                       headers: { 'Content-Type': 'text/plain' }
                                   });
                        }
                        
                        // Return empty response for other failed requests
                        return new Response('Resource not available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
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
        icon: '/public/assets/icons/favicon-32x32.png',
        badge: '/public/assets/icons/favicon-16x16.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Update',
                icon: '/public/assets/icons/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/public/assets/icons/favicon-32x32.png'
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
