/**
 * @fileoverview Integration example for Croatian Labor Law Database
 * Demonstrates how to integrate the enhanced database with existing system
 * @version 2.2.0
 */

import { LegalDatabase } from './core/LegalDatabase.js';
import { Article } from './models/Article.js';

/**
 * Enhanced Croatian Labor Law Database Integration
 * Replaces the existing database.js functionality with advanced features
 */
class EnhancedFactChecker {
    constructor(options = {}) {
        // Initialize the enhanced database
        this.database = new LegalDatabase({
            enableCache: true,
            enableSearch: true,
            enableValidation: true,
            language: 'hr',
            cacheSize: 200,
            ...options
        });
        
        // Compatibility layer for existing code
        this.articles = [];
        this.isLoaded = false;
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for database changes
     * @private
     */
    setupEventListeners() {
        this.database.on('initialized', (data) => {
            console.log('Database initialized:', data);
            this.isLoaded = true;
            this.updateArticlesArray();
        });

        this.database.on('articleAdded', (data) => {
            console.log('Article added:', data.article.title);
            this.updateArticlesArray();
        });

        this.database.on('searchPerformed', (data) => {
            console.log(`Search "${data.query}" returned ${data.resultCount} results`);
        });
    }

    /**
     * Initialize the database with Croatian Labor Law data
     * @param {string|Object} dataSource - Data URL or data object
     * @returns {Promise<void>}
     */
    async initialize(dataSource = './src/search-engine/data/croatian-labor-law.json') {
        try {
            console.log('🚀 Initializing Enhanced Croatian Labor Law Database...');
            
            await this.database.initialize(dataSource);
            
            console.log('✅ Database ready!');
            console.log(`📊 Statistics:`, this.database.getStats());
            
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            throw error;
        }
    }

    /**
     * Search articles with enhanced capabilities
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async search(query, options = {}) {
        if (!this.isLoaded) {
            throw new Error('Database not initialized. Call initialize() first.');
        }

        const searchOptions = {
            fuzzySearch: true,
            maxResults: 50,
            minRelevance: 0.1,
            includeTranslations: false,
            ...options
        };

        const results = await this.database.search(query, searchOptions);
        
        // Convert to compatible format for existing UI
        return results.map(result => ({
            id: result.articleId,
            title: result.title,
            content: result.snippet,
            category: result.category,
            relevance: result.relevanceScore,
            matchedTerms: result.matchedTerms,
            highlights: result.highlights,
            lastModified: result.lastModified
        }));
    }

    /**
     * Get article by ID (compatibility method)
     * @param {string} id - Article ID
     * @returns {Promise<Object|null>} Article data
     */
    async getArticle(id) {
        const article = await this.database.getArticle(id);
        return article ? this.convertArticleToLegacyFormat(article) : null;
    }

    /**
     * Get all articles (compatibility method)
     * @param {Object} filters - Optional filters
     * @returns {Array} Articles array
     */
    getArticles(filters = {}) {
        const articles = this.database.getArticles(filters);
        return articles.map(article => this.convertArticleToLegacyFormat(article));
    }

    /**
     * Get articles by category (compatibility method)
     * @param {string} category - Category name
     * @returns {Array} Articles in category
     */
    getArticlesByCategory(category) {
        const articles = this.database.getArticlesByCategory(category);
        return articles.map(article => this.convertArticleToLegacyFormat(article));
    }

    /**
     * Get all categories
     * @returns {Array} Categories array
     */
    getCategories() {
        return this.database.getCategories();
    }

    /**
     * Add new article
     * @param {Object} articleData - Article data
     * @returns {Promise<Object>} Added article
     */
    async addArticle(articleData) {
        const article = await this.database.addArticle(articleData);
        return this.convertArticleToLegacyFormat(article);
    }

    /**
     * Update existing article
     * @param {string} id - Article ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} Updated article
     */
    async updateArticle(id, updates) {
        const article = await this.database.updateArticle(id, updates);
        return this.convertArticleToLegacyFormat(article);
    }

    /**
     * Remove article
     * @param {string} id - Article ID
     * @returns {Promise<boolean>} True if removed
     */
    async removeArticle(id) {
        return await this.database.removeArticle(id);
    }

    /**
     * Export data in various formats
     * @param {string} format - Export format (pdf, csv, json, xml)
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportData(format = 'json', options = {}) {
        return await this.database.export(format, options);
    }

    /**
     * Import data from various formats
     * @param {string|File} data - Data to import
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async importData(data, options = {}) {
        return await this.database.import(data, options);
    }

    /**
     * Get database statistics
     * @returns {Object} Database statistics
     */
    getStatistics() {
        return this.database.getStats();
    }

    /**
     * Check if database is initialized
     * @returns {boolean} True if database is initialized
     */
    get isInitialized() {
        return this.database.isInitialized;
    }

    /**
     * Perform advanced search with multiple criteria
     * @param {Object} criteria - Search criteria
     * @returns {Promise<Array>} Search results
     */
    async advancedSearch(criteria) {
        const {
            query = '',
            category = null,
            keywords = [],
            dateRange = null,
            language = 'hr',
            includeTranslations = false,
            sortBy = 'relevance',
            sortOrder = 'desc'
        } = criteria;

        const searchOptions = {
            categories: category ? [category] : undefined,
            languages: [language],
            includeTranslations,
            sortBy,
            sortOrder,
            fuzzySearch: true,
            maxResults: 100
        };

        let results;
        
        if (query) {
            // Text search
            results = await this.database.search(query, searchOptions);
        } else {
            // Filter-only search
            const filters = {};
            if (category) filters.category = category;
            if (dateRange) filters.modifiedSince = dateRange.from;
            
            const articles = this.database.getArticles(filters);
            results = articles.map(article => ({
                articleId: article.id,
                title: article.title,
                snippet: article.content.substring(0, 200) + '...',
                category: article.category,
                relevanceScore: 1.0,
                matchedTerms: [],
                lastModified: article.lastModified
            }));
        }

        // Additional filtering by keywords
        if (keywords.length > 0) {
            results = results.filter(result => {
                const article = this.database.getArticle(result.articleId);
                return article && keywords.some(keyword => 
                    article.keywords && article.keywords.includes(keyword)
                );
            });
        }

        return results.map(result => ({
            id: result.articleId,
            title: result.title,
            content: result.snippet,
            category: result.category,
            relevance: result.relevanceScore,
            matchedTerms: result.matchedTerms,
            lastModified: result.lastModified
        }));
    }

    /**
     * Get search suggestions
     * @param {string} partialQuery - Partial search query
     * @returns {Array} Suggestions
     */
    getSearchSuggestions(partialQuery) {
        if (!this.database.searchEngine) {
            return [];
        }
        return this.database.searchEngine.getSuggestions(partialQuery);
    }

    /**
     * Clear all cached data
     * @returns {Promise<void>}
     */
    async clearCache() {
        if (this.database.cacheManager) {
            await this.database.cacheManager.clear();
        }
    }

    /**
     * Save current database state
     * @returns {Promise<void>}
     */
    async saveState() {
        await this.database.save();
    }

    /**
     * Load saved database state
     * @returns {Promise<boolean>} True if loaded successfully
     */
    async loadState() {
        const loaded = await this.database.load();
        if (loaded) {
            this.isLoaded = true;
            this.updateArticlesArray();
        }
        return loaded;
    }

    /**
     * Convert Article instance to legacy format
     * @param {Article} article - Article instance
     * @returns {Object} Legacy format object
     * @private
     */
    convertArticleToLegacyFormat(article) {
        return {
            id: article.id,
            title: article.title,
            content: article.content,
            category: article.category,
            keywords: article.keywords || [],
            lastModified: article.lastModified,
            translations: article.translations || {},
            legalReferences: article.legalReferences || [],
            practicalExamples: article.practicalExamples || [],
            frequentlyAskedQuestions: article.frequentlyAskedQuestions || []
        };
    }

    /**
     * Update the articles array for compatibility
     * @private
     */
    updateArticlesArray() {
        this.articles = this.getArticles();
    }

    /**
     * Destroy database and cleanup resources
     */
    destroy() {
        this.database.destroy();
        this.articles = [];
        this.isLoaded = false;
    }
}

// Backward compatibility: Global instance
let globalFactChecker = null;

/**
 * Initialize global fact checker instance
 * @param {Object} options - Initialization options
 * @returns {Promise<EnhancedFactChecker>} Fact checker instance
 */
export async function initializeFactChecker(options = {}) {
    if (globalFactChecker) {
        globalFactChecker.destroy();
    }

    globalFactChecker = new EnhancedFactChecker(options);
    
    // Try to load from saved state first
    const loadedFromState = await globalFactChecker.loadState();
    
    if (!loadedFromState) {
        // Initialize with default data
        await globalFactChecker.initialize(options.dataUrl);
    }

    return globalFactChecker;
}

/**
 * Get global fact checker instance
 * @returns {EnhancedFactChecker|null} Fact checker instance
 */
export function getFactChecker() {
    return globalFactChecker;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use initializeFactChecker instead
 */
export async function initializeDatabase(dataUrl) {
    return await initializeFactChecker({ dataUrl });
}

/**
 * Legacy search function for backward compatibility
 * @deprecated Use getFactChecker().search instead
 */
export async function searchArticles(query, options = {}) {
    if (!globalFactChecker) {
        throw new Error('Database not initialized');
    }
    return await globalFactChecker.search(query, options);
}

/**
 * Enhanced search with analytics
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Enhanced search results with analytics
 */
export async function searchWithAnalytics(query, options = {}) {
    const startTime = performance.now();
    
    const results = await globalFactChecker.search(query, options);
    
    const endTime = performance.now();
    const searchTime = endTime - startTime;
    
    // Generate search analytics
    const analytics = {
        query,
        resultCount: results.length,
        searchTime: Math.round(searchTime),
        categories: [...new Set(results.map(r => r.category))],
        averageRelevance: results.length > 0 ? 
            results.reduce((sum, r) => sum + r.relevance, 0) / results.length : 0,
        topMatches: results.slice(0, 3).map(r => ({
            id: r.id,
            title: r.title,
            relevance: r.relevance
        }))
    };
    
    return {
        results,
        analytics,
        timestamp: new Date().toISOString()
    };
}

// Browser compatibility
if (typeof window !== 'undefined') {
    window.EnhancedFactChecker = EnhancedFactChecker;
    window.initializeFactChecker = initializeFactChecker;
    window.getFactChecker = getFactChecker;
    window.searchWithAnalytics = searchWithAnalytics;
}

export { EnhancedFactChecker };
export default EnhancedFactChecker;
