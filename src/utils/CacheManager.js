/**
 * @fileoverview Cache management utilities for Croatian Labor Law database
 * Provides efficient browser storage with expiration, memory management, and performance optimization
 * @version 2.1.0
 */

/**
 * @typedef {Object} CacheEntry
 * @property {any} data - Cached data
 * @property {number} timestamp - Cache creation timestamp
 * @property {number} expiration - Cache expiration timestamp
 * @property {number} accessCount - Number of times accessed
 * @property {number} lastAccessed - Last access timestamp
 * @property {string} [checksum] - Data integrity checksum
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} CacheStats
 * @property {number} totalSize - Total cache size in bytes (estimated)
 * @property {number} entryCount - Number of cache entries
 * @property {number} hitRate - Cache hit rate percentage
 * @property {number} missRate - Cache miss rate percentage
 * @property {Object} storageUsage - Storage usage by type
 * @property {Array} topEntries - Most accessed entries
 */

/**
 * @typedef {Object} CacheOptions
 * @property {number} [defaultTTL=3600000] - Default time to live in milliseconds (1 hour)
 * @property {number} [maxSize=50] - Maximum number of entries in memory cache
 * @property {number} [maxStorageSize=5242880] - Maximum storage size in bytes (5MB)
 * @property {boolean} [useCompression=true] - Enable data compression
 * @property {boolean} [enableStats=true] - Enable statistics tracking
 * @property {string} [prefix='cllaw_'] - Storage key prefix
 */

/**
 * Cache manager for efficient data storage and retrieval
 * Supports multiple storage layers: memory, localStorage, sessionStorage, IndexedDB
 */
export class CacheManager {
    constructor(options = {}) {
        this.options = {
            defaultTTL: 3600000, // 1 hour
            maxSize: 50,
            maxStorageSize: 5 * 1024 * 1024, // 5MB
            useCompression: true,
            enableStats: true,
            prefix: 'cllaw_',
            ...options
        };
        
        // Memory cache for fast access
        this.memoryCache = new Map();
        
        // Cache statistics
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            compressionRatio: 0,
            totalDataSize: 0
        };
        
        // Storage availability detection
        this.storageAvailable = {
            localStorage: this.isStorageAvailable('localStorage'),
            sessionStorage: this.isStorageAvailable('sessionStorage'),
            indexedDB: this.isIndexedDBAvailable()
        };
        
        // Initialize cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 300000); // Clean every 5 minutes
        
        // Initialize IndexedDB if available
        if (this.storageAvailable.indexedDB) {
            this.initIndexedDB();
        }
        
        // Performance monitoring
        this.performanceMetrics = {
            averageGetTime: 0,
            averageSetTime: 0,
            totalOperations: 0
        };
    }

    /**
     * Check if storage type is available
     * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
     * @returns {boolean} True if available
     * @private
     */
    isStorageAvailable(type) {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if IndexedDB is available
     * @returns {boolean} True if available
     * @private
     */
    isIndexedDBAvailable() {
        return typeof window !== 'undefined' && 'indexedDB' in window;
    }

    /**
     * Initialize IndexedDB
     * @private
     */
    async initIndexedDB() {
        if (!this.storageAvailable.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('CroatianLaborLawCache', 1);
            
            request.onerror = () => {
                this.storageAvailable.indexedDB = false;
                resolve();
            };
            
            request.onsuccess = (event) => {
                this.indexedDB = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'key' });
                    store.createIndex('expiration', 'expiration', { unique: false });
                    store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('searches')) {
                    db.createObjectStore('searches', { keyPath: 'query' });
                }
            };
        });
    }

    /**
     * Get data from cache
     * @param {string} key - Cache key
     * @param {Object} [options] - Get options
     * @param {boolean} [options.updateAccess=true] - Update access statistics
     * @param {boolean} [options.fallbackToStorage=true] - Check storage if not in memory
     * @returns {Promise<any|null>} Cached data or null if not found/expired
     */
    async get(key, options = {}) {
        const startTime = performance.now();
        const {
            updateAccess = true,
            fallbackToStorage = true
        } = options;
        
        try {
            const fullKey = this.options.prefix + key;
            let result = null;
            
            // Check memory cache first
            if (this.memoryCache.has(fullKey)) {
                const entry = this.memoryCache.get(fullKey);
                
                if (this.isExpired(entry)) {
                    this.memoryCache.delete(fullKey);
                    this.stats.misses++;
                } else {
                    if (updateAccess) {
                        entry.accessCount++;
                        entry.lastAccessed = Date.now();
                    }
                    this.stats.hits++;
                    result = entry.data;
                }
            }
            
            // Fallback to storage if not in memory
            if (result === null && fallbackToStorage) {
                result = await this.getFromStorage(fullKey, updateAccess);
                
                // Store in memory cache for faster future access
                if (result !== null) {
                    this.setInMemory(fullKey, result, this.options.defaultTTL);
                }
            }
            
            // Update performance metrics
            const endTime = performance.now();
            this.updatePerformanceMetrics('get', endTime - startTime);
            
            return result;
            
        } catch (error) {
            console.warn('Cache get error:', error);
            this.stats.misses++;
            return null;
        }
    }

    /**
     * Set data in cache
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} [ttl] - Time to live in milliseconds
     * @param {Object} [options] - Set options
     * @param {boolean} [options.persistent=false] - Store in persistent storage
     * @param {boolean} [options.compress=true] - Compress data
     * @returns {Promise<boolean>} True if successfully cached
     */
    async set(key, data, ttl = this.options.defaultTTL, options = {}) {
        const startTime = performance.now();
        const {
            persistent = false,
            compress = this.options.useCompression
        } = options;
        
        try {
            const fullKey = this.options.prefix + key;
            const timestamp = Date.now();
            const expiration = timestamp + ttl;
            
            // Create cache entry
            const entry = {
                data,
                timestamp,
                expiration,
                accessCount: 0,
                lastAccessed: timestamp,
                metadata: {
                    originalSize: this.estimateSize(data),
                    compressed: false
                }
            };
            
            // Add checksum for integrity
            if (this.options.enableStats) {
                entry.checksum = this.generateChecksum(data);
            }
            
            // Compress data if enabled
            if (compress && this.shouldCompress(data)) {
                try {
                    entry.data = await this.compressData(data);
                    entry.metadata.compressed = true;
                    entry.metadata.compressedSize = this.estimateSize(entry.data);
                } catch (error) {
                    console.warn('Compression failed, storing uncompressed:', error);
                }
            }
            
            // Store in memory cache
            this.setInMemory(fullKey, entry.data, ttl, entry);
            
            // Store in persistent storage if requested
            if (persistent) {
                await this.setInStorage(fullKey, entry);
            }
            
            this.stats.sets++;
            
            // Update performance metrics
            const endTime = performance.now();
            this.updatePerformanceMetrics('set', endTime - startTime);
            
            return true;
            
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Set data in memory cache
     * @param {string} fullKey - Full cache key with prefix
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live
     * @param {CacheEntry} [existingEntry] - Existing cache entry
     * @private
     */
    setInMemory(fullKey, data, ttl, existingEntry = null) {
        const timestamp = Date.now();
        const entry = existingEntry || {
            data,
            timestamp,
            expiration: timestamp + ttl,
            accessCount: 0,
            lastAccessed: timestamp
        };
        
        // Check if memory cache is full
        if (this.memoryCache.size >= this.options.maxSize) {
            this.evictLRU();
        }
        
        this.memoryCache.set(fullKey, entry);
    }

    /**
     * Get data from storage
     * @param {string} fullKey - Full cache key
     * @param {boolean} updateAccess - Update access statistics
     * @returns {Promise<any|null>} Cached data or null
     * @private
     */
    async getFromStorage(fullKey, updateAccess) {
        // Try IndexedDB first
        if (this.storageAvailable.indexedDB && this.indexedDB) {
            const result = await this.getFromIndexedDB(fullKey);
            if (result !== null) {
                if (updateAccess) {
                    this.updateAccessInIndexedDB(fullKey);
                }
                return result;
            }
        }
        
        // Try localStorage
        if (this.storageAvailable.localStorage) {
            const result = this.getFromWebStorage('localStorage', fullKey);
            if (result !== null) {
                return result;
            }
        }
        
        // Try sessionStorage
        if (this.storageAvailable.sessionStorage) {
            return this.getFromWebStorage('sessionStorage', fullKey);
        }
        
        this.stats.misses++;
        return null;
    }

    /**
     * Set data in storage
     * @param {string} fullKey - Full cache key
     * @param {CacheEntry} entry - Cache entry
     * @returns {Promise<boolean>} Success status
     * @private
     */
    async setInStorage(fullKey, entry) {
        // Try IndexedDB first
        if (this.storageAvailable.indexedDB && this.indexedDB) {
            const success = await this.setInIndexedDB(fullKey, entry);
            if (success) return true;
        }
        
        // Fallback to localStorage
        if (this.storageAvailable.localStorage) {
            return this.setInWebStorage('localStorage', fullKey, entry);
        }
        
        // Fallback to sessionStorage
        if (this.storageAvailable.sessionStorage) {
            return this.setInWebStorage('sessionStorage', fullKey, entry);
        }
        
        return false;
    }

    /**
     * Get data from IndexedDB
     * @param {string} key - Cache key
     * @returns {Promise<any|null>} Cached data
     * @private
     */
    async getFromIndexedDB(key) {
        return new Promise((resolve) => {
            const transaction = this.indexedDB.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                if (result && !this.isExpired(result)) {
                    this.stats.hits++;
                    
                    // Decompress if needed
                    if (result.metadata && result.metadata.compressed) {
                        this.decompressData(result.data)
                            .then(resolve)
                            .catch(() => resolve(null));
                    } else {
                        resolve(result.data);
                    }
                } else {
                    if (result) {
                        // Remove expired entry
                        const deleteTransaction = this.indexedDB.transaction(['cache'], 'readwrite');
                        deleteTransaction.objectStore('cache').delete(key);
                    }
                    this.stats.misses++;
                    resolve(null);
                }
            };
            
            request.onerror = () => {
                this.stats.misses++;
                resolve(null);
            };
        });
    }

    /**
     * Set data in IndexedDB
     * @param {string} key - Cache key
     * @param {CacheEntry} entry - Cache entry
     * @returns {Promise<boolean>} Success status
     * @private
     */
    async setInIndexedDB(key, entry) {
        return new Promise((resolve) => {
            const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            
            const request = store.put({ key, ...entry });
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    }

    /**
     * Update access statistics in IndexedDB
     * @param {string} key - Cache key
     * @private
     */
    async updateAccessInIndexedDB(key) {
        if (!this.indexedDB) return;
        
        const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        const getRequest = store.get(key);
        getRequest.onsuccess = () => {
            const entry = getRequest.result;
            if (entry) {
                entry.accessCount = (entry.accessCount || 0) + 1;
                entry.lastAccessed = Date.now();
                store.put(entry);
            }
        };
    }

    /**
     * Get data from web storage (localStorage/sessionStorage)
     * @param {string} storageType - Storage type
     * @param {string} key - Cache key
     * @returns {any|null} Cached data
     * @private
     */
    getFromWebStorage(storageType, key) {
        try {
            const stored = window[storageType].getItem(key);
            if (stored) {
                const entry = JSON.parse(stored);
                if (!this.isExpired(entry)) {
                    this.stats.hits++;
                    return entry.data;
                } else {
                    window[storageType].removeItem(key);
                    this.stats.misses++;
                }
            } else {
                this.stats.misses++;
            }
        } catch (error) {
            console.warn(`${storageType} get error:`, error);
            this.stats.misses++;
        }
        return null;
    }

    /**
     * Set data in web storage
     * @param {string} storageType - Storage type
     * @param {string} key - Cache key
     * @param {CacheEntry} entry - Cache entry
     * @returns {boolean} Success status
     * @private
     */
    setInWebStorage(storageType, key, entry) {
        try {
            // Check storage quota
            const serialized = JSON.stringify(entry);
            const currentSize = this.getStorageSize(storageType);
            
            if (currentSize + serialized.length > this.options.maxStorageSize) {
                this.evictFromStorage(storageType);
            }
            
            window[storageType].setItem(key, serialized);
            return true;
        } catch (error) {
            console.warn(`${storageType} set error:`, error);
            // Try to free space and retry
            if (error.name === 'QuotaExceededError') {
                this.evictFromStorage(storageType);
                try {
                    window[storageType].setItem(key, JSON.stringify(entry));
                    return true;
                } catch {
                    return false;
                }
            }
            return false;
        }
    }

    /**
     * Check if cache entry is expired
     * @param {CacheEntry} entry - Cache entry
     * @returns {boolean} True if expired
     * @private
     */
    isExpired(entry) {
        return Date.now() > entry.expiration;
    }

    /**
     * Evict least recently used item from memory cache
     * @private
     */
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, entry] of this.memoryCache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.memoryCache.delete(oldestKey);
            this.stats.evictions++;
        }
    }

    /**
     * Evict items from storage to free space
     * @param {string} storageType - Storage type
     * @private
     */
    evictFromStorage(storageType) {
        const storage = window[storageType];
        const keys = [];
        
        // Collect cache keys
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(this.options.prefix)) {
                keys.push(key);
            }
        }
        
        // Sort by last accessed and remove oldest 25%
        const entries = keys.map(key => {
            try {
                const entry = JSON.parse(storage.getItem(key));
                return { key, lastAccessed: entry.lastAccessed || 0 };
            } catch {
                return { key, lastAccessed: 0 };
            }
        }).sort((a, b) => a.lastAccessed - b.lastAccessed);
        
        const toRemove = Math.ceil(entries.length * 0.25);
        for (let i = 0; i < toRemove; i++) {
            storage.removeItem(entries[i].key);
            this.stats.evictions++;
        }
    }

    /**
     * Remove item from cache
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} True if removed
     */
    async remove(key) {
        const fullKey = this.options.prefix + key;
        let removed = false;
        
        // Remove from memory
        if (this.memoryCache.has(fullKey)) {
            this.memoryCache.delete(fullKey);
            removed = true;
        }
        
        // Remove from IndexedDB
        if (this.storageAvailable.indexedDB && this.indexedDB) {
            await new Promise((resolve) => {
                const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.delete(fullKey);
                request.onsuccess = () => {
                    removed = true;
                    resolve();
                };
                request.onerror = () => resolve();
            });
        }
        
        // Remove from web storage
        if (this.storageAvailable.localStorage) {
            if (window.localStorage.getItem(fullKey)) {
                window.localStorage.removeItem(fullKey);
                removed = true;
            }
        }
        
        if (this.storageAvailable.sessionStorage) {
            if (window.sessionStorage.getItem(fullKey)) {
                window.sessionStorage.removeItem(fullKey);
                removed = true;
            }
        }
        
        if (removed) {
            this.stats.deletes++;
        }
        
        return removed;
    }

    /**
     * Clear all cache entries
     * @param {Object} [options] - Clear options
     * @param {boolean} [options.memoryOnly=false] - Clear only memory cache
     * @returns {Promise<void>}
     */
    async clear(options = {}) {
        const { memoryOnly = false } = options;
        
        // Clear memory cache
        this.memoryCache.clear();
        
        if (!memoryOnly) {
            // Clear IndexedDB
            if (this.storageAvailable.indexedDB && this.indexedDB) {
                await new Promise((resolve) => {
                    const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
                    const store = transaction.objectStore('cache');
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => resolve();
                });
            }
            
            // Clear web storage
            this.clearWebStorage('localStorage');
            this.clearWebStorage('sessionStorage');
        }
        
        // Reset stats
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            compressionRatio: 0,
            totalDataSize: 0
        };
    }

    /**
     * Clear web storage entries with prefix
     * @param {string} storageType - Storage type
     * @private
     */
    clearWebStorage(storageType) {
        if (!this.storageAvailable[storageType]) return;
        
        const storage = window[storageType];
        const keysToRemove = [];
        
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(this.options.prefix)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
    }

    /**
     * Cleanup expired entries
     * @returns {Promise<number>} Number of entries cleaned
     */
    async cleanup() {
        let cleaned = 0;
        
        // Cleanup memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (this.isExpired(entry)) {
                this.memoryCache.delete(key);
                cleaned++;
            }
        }
        
        // Cleanup IndexedDB
        if (this.storageAvailable.indexedDB && this.indexedDB) {
            cleaned += await this.cleanupIndexedDB();
        }
        
        // Cleanup web storage
        cleaned += this.cleanupWebStorage('localStorage');
        cleaned += this.cleanupWebStorage('sessionStorage');
        
        return cleaned;
    }

    /**
     * Cleanup expired entries from IndexedDB
     * @returns {Promise<number>} Number of entries cleaned
     * @private
     */
    async cleanupIndexedDB() {
        return new Promise((resolve) => {
            const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const index = store.index('expiration');
            const range = IDBKeyRange.upperBound(Date.now());
            const request = index.openCursor(range);
            
            let cleaned = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cleaned++;
                    cursor.continue();
                } else {
                    resolve(cleaned);
                }
            };
            
            request.onerror = () => resolve(0);
        });
    }

    /**
     * Cleanup expired entries from web storage
     * @param {string} storageType - Storage type
     * @returns {number} Number of entries cleaned
     * @private
     */
    cleanupWebStorage(storageType) {
        if (!this.storageAvailable[storageType]) return 0;
        
        const storage = window[storageType];
        const keysToRemove = [];
        let cleaned = 0;
        
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(this.options.prefix)) {
                try {
                    const entry = JSON.parse(storage.getItem(key));
                    if (this.isExpired(entry)) {
                        keysToRemove.push(key);
                    }
                } catch {
                    keysToRemove.push(key); // Remove corrupted entries
                }
            }
        }
        
        keysToRemove.forEach(key => {
            storage.removeItem(key);
            cleaned++;
        });
        
        return cleaned;
    }

    /**
     * Get cache statistics
     * @returns {CacheStats} Cache statistics
     */
    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
        const missRate = totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0;
        
        return {
            totalSize: this.estimateTotalSize(),
            entryCount: this.memoryCache.size,
            hitRate: Math.round(hitRate * 100) / 100,
            missRate: Math.round(missRate * 100) / 100,
            totalRequests,
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            deletes: this.stats.deletes,
            evictions: this.stats.evictions,
            storageUsage: {
                memory: this.memoryCache.size,
                localStorage: this.getStorageSize('localStorage'),
                sessionStorage: this.getStorageSize('sessionStorage')
            },
            topEntries: this.getTopEntries(),
            performance: this.performanceMetrics
        };
    }

    /**
     * Get top accessed entries
     * @returns {Array} Top entries by access count
     * @private
     */
    getTopEntries() {
        return Array.from(this.memoryCache.entries())
            .map(([key, entry]) => ({
                key: key.replace(this.options.prefix, ''),
                accessCount: entry.accessCount,
                lastAccessed: new Date(entry.lastAccessed).toISOString(),
                size: this.estimateSize(entry.data)
            }))
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, 10);
    }

    /**
     * Estimate total cache size
     * @returns {number} Estimated size in bytes
     * @private
     */
    estimateTotalSize() {
        let size = 0;
        for (const entry of this.memoryCache.values()) {
            size += this.estimateSize(entry);
        }
        return size;
    }

    /**
     * Get storage size for web storage
     * @param {string} storageType - Storage type
     * @returns {number} Size in bytes
     * @private
     */
    getStorageSize(storageType) {
        if (!this.storageAvailable[storageType]) return 0;
        
        let size = 0;
        const storage = window[storageType];
        
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(this.options.prefix)) {
                const value = storage.getItem(key);
                size += key.length + (value ? value.length : 0);
            }
        }
        
        return size * 2; // UTF-16 encoding
    }

    /**
     * Estimate object size in bytes
     * @param {any} obj - Object to estimate
     * @returns {number} Estimated size
     * @private
     */
    estimateSize(obj) {
        const str = JSON.stringify(obj);
        return str ? str.length * 2 : 0; // UTF-16 encoding
    }

    /**
     * Determine if data should be compressed
     * @param {any} data - Data to check
     * @returns {boolean} True if should compress
     * @private
     */
    shouldCompress(data) {
        const size = this.estimateSize(data);
        return size > 1024; // Compress if larger than 1KB
    }

    /**
     * Compress data (simplified implementation)
     * @param {any} data - Data to compress
     * @returns {Promise<string>} Compressed data
     * @private
     */
    async compressData(data) {
        // Simple compression using built-in compression
        // In a real implementation, you might use a library like pako
        const jsonString = JSON.stringify(data);
        
        if (typeof CompressionStream !== 'undefined') {
            const stream = new CompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(new TextEncoder().encode(jsonString));
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) chunks.push(value);
            }
            
            const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                compressed.set(chunk, offset);
                offset += chunk.length;
            }
            
            return btoa(String.fromCharCode(...compressed));
        }
        
        // Fallback: just return the JSON string
        return jsonString;
    }

    /**
     * Decompress data
     * @param {string} compressedData - Compressed data
     * @returns {Promise<any>} Decompressed data
     * @private
     */
    async decompressData(compressedData) {
        // Simple decompression
        if (typeof DecompressionStream !== 'undefined') {
            try {
                const binaryString = atob(compressedData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                const stream = new DecompressionStream('gzip');
                const writer = stream.writable.getWriter();
                const reader = stream.readable.getReader();
                
                writer.write(bytes);
                writer.close();
                
                const chunks = [];
                let done = false;
                
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) chunks.push(value);
                }
                
                const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                let offset = 0;
                for (const chunk of chunks) {
                    decompressed.set(chunk, offset);
                    offset += chunk.length;
                }
                
                const jsonString = new TextDecoder().decode(decompressed);
                return JSON.parse(jsonString);
            } catch (error) {
                console.warn('Decompression failed:', error);
                return JSON.parse(compressedData);
            }
        }
        
        // Fallback: assume it's just JSON
        return JSON.parse(compressedData);
    }

    /**
     * Generate checksum for data integrity
     * @param {any} data - Data to checksum
     * @returns {string} Checksum
     * @private
     */
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    /**
     * Update performance metrics
     * @param {string} operation - Operation type
     * @param {number} duration - Duration in milliseconds
     * @private
     */
    updatePerformanceMetrics(operation, duration) {
        this.performanceMetrics.totalOperations++;
        
        if (operation === 'get') {
            const total = this.performanceMetrics.averageGetTime * (this.performanceMetrics.totalOperations - 1);
            this.performanceMetrics.averageGetTime = (total + duration) / this.performanceMetrics.totalOperations;
        } else if (operation === 'set') {
            const total = this.performanceMetrics.averageSetTime * (this.performanceMetrics.totalOperations - 1);
            this.performanceMetrics.averageSetTime = (total + duration) / this.performanceMetrics.totalOperations;
        }
    }

    /**
     * Cleanup resources and stop intervals
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        if (this.indexedDB) {
            this.indexedDB.close();
            this.indexedDB = null;
        }
        
        this.memoryCache.clear();
    }
}

export default CacheManager;
