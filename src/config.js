/* =========================================
   Configuration Module - Enhanced v2.2.0
   Croatian Labor Law Fact Checker
   ========================================= */

// Environment detection
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' && 
                    window.location.hostname !== '';

// Configuration by environment
export const config = {
    development: {
        dataUrl: './src/data/croatian-labor-law.json',
        enableCache: true,
        enableValidation: true,
        enableDebugLogs: true,
        cacheSize: 50,
        logLevel: 'debug',
        searchConfig: {
            debounceDelay: 300,
            minQueryLength: 2,
            maxSuggestions: 8,
            maxResults: 50,
            fuzzySearchThreshold: 0.6
        },
        cacheConfig: {
            defaultTTL: 1800000,     // 30 minutes in dev
            maxSize: 50,
            maxStorageSize: 5242880  // 5MB in dev
        }
    },
    
    production: {
        dataUrl: './src/data/croatian-labor-law.json',
        enableCache: true,
        enableValidation: false,  // Disabled for performance
        enableDebugLogs: false,
        cacheSize: 200,
        logLevel: 'error',
        searchConfig: {
            debounceDelay: 200,
            minQueryLength: 2,
            maxSuggestions: 10,
            maxResults: 100,
            fuzzySearchThreshold: 0.7
        },
        cacheConfig: {
            defaultTTL: 3600000,     // 1 hour in prod
            maxSize: 200,
            maxStorageSize: 10485760 // 10MB in prod
        }
    }
};

// Get current environment configuration
export function getConfig() {
    const env = isProduction ? 'production' : 'development';
    const envConfig = config[env];
    
    console.log(`Running in ${env} mode`);
    return envConfig;
}

// Cache configuration by data type
export const cacheConfig = {
    // Article cache - persistent and long-lived
    articleCache: {
        ttl: 7200000,           // 2 hours
        persistent: true,        // Save to IndexedDB
        compression: true
    },
    
    // Search cache - shorter lived
    searchCache: {
        ttl: 1800000,           // 30 minutes
        persistent: false,       // Memory only
        compression: false
    },
    
    // Export cache - for generated files
    exportCache: {
        ttl: 3600000,           // 1 hour
        persistent: true,        // Save large exports
        compression: true
    },
    
    // Suggestions cache - very short lived
    suggestionsCache: {
        ttl: 600000,            // 10 minutes
        persistent: false,       // Memory only
        compression: false
    }
};

// Performance monitoring configuration
export const performanceConfig = {
    enableMetrics: true,
    maxSearchTime: 1000,        // 1 second warning threshold
    maxLoadTime: 5000,          // 5 second warning threshold
    reportingInterval: 60000,   // Report every minute
    maxStoredMetrics: 100       // Keep last 100 measurements
};

// Feature flags
export const features = {
    enhancedSearch: true,
    realTimeSearch: true,
    searchSuggestions: true,
    exportFeatures: true,
    multilingual: true,
    analytics: true,
    offlineMode: true,
    pdfSupport: true,
    advancedFilters: true,
    bookmarks: true
};

// API endpoints (if needed in future)
export const apiConfig = {
    baseUrl: isProduction ? 'https://api.labor-law.hr' : 'http://localhost:3000',
    endpoints: {
        search: '/api/search',
        article: '/api/article',
        export: '/api/export',
        feedback: '/api/feedback'
    },
    timeout: 10000,
    retryAttempts: 3
};

// Internationalization configuration
export const i18nConfig = {
    defaultLanguage: 'hr',
    supportedLanguages: ['hr', 'en'],
    fallbackLanguage: 'en',
    loadRemoteTranslations: false,
    translationsPath: './data/translations.json'
};

// Security configuration
export const securityConfig = {
    enableCSP: true,
    allowedDomains: [
        'localhost',
        '127.0.0.1',
        'labor-law.hr',
        'www.labor-law.hr'
    ],
    maxFileSize: 10485760,      // 10MB
    allowedFileTypes: ['json', 'csv', 'pdf'],
    sanitizeInput: true
};

// Export unified configuration
export default function getAppConfig() {
    return {
        ...getConfig(),
        cache: cacheConfig,
        performance: performanceConfig,
        features,
        api: apiConfig,
        i18n: i18nConfig,
        security: securityConfig,
        version: '2.2.0',
        buildDate: '2025-08-25',
        environment: isProduction ? 'production' : 'development'
    };
}
