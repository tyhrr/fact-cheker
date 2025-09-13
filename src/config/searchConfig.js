/**
 * @fileoverview Search configuration settings
 * Centralized configuration for search engine parameters
 * @version 1.0.0
 */

export const SEARCH_CONFIG = {
    // Result limits
    DEFAULT_MAX_RESULTS: 25,  // Increased from 20
    MINIMUM_DESIRED_RESULTS: 10,
    FALLBACK_MAX_RESULTS: 20,  // Increased from 15
    
    // Relevance thresholds - Made more permissive
    DEFAULT_MIN_RELEVANCE: 0.0001,  // Reduced from 0.001
    RELAXED_MIN_RELEVANCE: 0.00001,  // Reduced from 0.0001
    ULTRA_RELAXED_MIN_RELEVANCE: 0.000001,  // Very low threshold
    
    // Fuzzy search parameters
    DEFAULT_FUZZY_THRESHOLD: 0.5,  // Reduced from 0.6 for more flexibility
    RELAXED_FUZZY_THRESHOLD: 0.4,  // Reduced from 0.5
    
    // Search behavior
    DEFAULT_OPERATOR: 'OR', // 'AND' for strict, 'OR' for broader results
    ENABLE_FUZZY_SEARCH: true,
    ENABLE_FALLBACK_SEARCH: true,
    
    // Language-specific search limits - Increased all
    CROATIAN_SEARCH_LIMIT: 75,  // Increased from 50
    ENGLISH_SEARCH_LIMIT: 50,   // Increased from 30
    SPANISH_SEARCH_LIMIT: 50,   // Increased from 30
    
    // Performance settings
    SEARCH_TIMEOUT: 10000, // 10 seconds
    DEBOUNCE_DELAY: 300,
    MIN_QUERY_LENGTH: 2,
    
    // UI settings
    MAX_SUGGESTIONS: 8,
    MAX_HISTORY_ITEMS: 10,
    RESULTS_PER_PAGE: 25,  // Increased from 20
    
    // Relevance scoring weights
    TITLE_MATCH_WEIGHT: 3.0,
    KEYWORD_MATCH_WEIGHT: 2.0,
    CONTENT_MATCH_WEIGHT: 1.0,
    CATEGORY_MATCH_WEIGHT: 1.5,
    
    // Auto-search settings
    AUTO_SEARCH_MIN_LENGTH: 3,
    AUTO_SEARCH_RELEVANCE_THRESHOLD: 0.1,  // Reduced from 0.3
    AUTO_SEARCH_MAX_RESULTS: 8  // Increased from 5
};

/**
 * Get search options for different search scenarios
 */
export const getSearchOptions = {
    /**
     * Standard search options for normal queries
     */
    standard: () => ({
        maxResults: SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
        minRelevance: SEARCH_CONFIG.DEFAULT_MIN_RELEVANCE,
        fuzzyThreshold: SEARCH_CONFIG.DEFAULT_FUZZY_THRESHOLD,
        fuzzySearch: SEARCH_CONFIG.ENABLE_FUZZY_SEARCH
    }),
    
    /**
     * Relaxed search options for when few results are found
     */
    relaxed: () => ({
        maxResults: SEARCH_CONFIG.DEFAULT_MAX_RESULTS + 10,
        minRelevance: SEARCH_CONFIG.RELAXED_MIN_RELEVANCE,
        fuzzyThreshold: SEARCH_CONFIG.RELAXED_FUZZY_THRESHOLD,
        fuzzySearch: true
    }),
    
    /**
     * Ultra-relaxed search options for fallback searches
     */
    ultraRelaxed: () => ({
        maxResults: SEARCH_CONFIG.DEFAULT_MAX_RESULTS + 20,
        minRelevance: SEARCH_CONFIG.ULTRA_RELAXED_MIN_RELEVANCE,
        fuzzyThreshold: SEARCH_CONFIG.RELAXED_FUZZY_THRESHOLD,
        fuzzySearch: true
    }),
    
    /**
     * Auto-search options for real-time suggestions
     */
    autoSearch: () => ({
        maxResults: SEARCH_CONFIG.AUTO_SEARCH_MAX_RESULTS,
        minRelevance: SEARCH_CONFIG.AUTO_SEARCH_RELEVANCE_THRESHOLD,
        fuzzyThreshold: SEARCH_CONFIG.DEFAULT_FUZZY_THRESHOLD,
        fuzzySearch: true
    })
};

export default SEARCH_CONFIG;
