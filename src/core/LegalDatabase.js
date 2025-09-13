/**
 * @fileoverview Main Croatian Labor Law database class
 * Integrates all components for comprehensive legal article management
 * @version 2.2.0
 */

import { Article } from '../models/Article.js';
import { SearchResult } from '../models/SearchResult.js';
import { SearchEngine } from '../search-engine/SearchEngine.js';
import { TextProcessor } from '../utils/TextProcessor.js';
import { CacheManager } from '../utils/CacheManager.js';
import { Validator } from '../utils/Validator.js';
import { ExportManager } from '../utils/ExportManager.js';

/**
 * @typedef {Object} DatabaseOptions
 * @property {string} [dataUrl] - URL to load initial data
 * @property {boolean} [enableCache=true] - Enable caching
 * @property {boolean} [enableSearch=true] - Enable search functionality
 * @property {boolean} [enableValidation=true] - Enable data validation
 * @property {boolean} [autoSave=false] - Auto-save changes
 * @property {number} [cacheSize=100] - Cache size limit
 * @property {string} [language='hr'] - Default language
 * @property {Object} [searchOptions] - Search engine options
 * @property {Object} [cacheOptions] - Cache manager options
 */

/**
 * @typedef {Object} DatabaseStats
 * @property {number} totalArticles - Total number of articles
 * @property {number} totalCategories - Number of categories
 * @property {number} totalTranslations - Number of translations
 * @property {Object} categoryDistribution - Articles per category
 * @property {Object} languageDistribution - Articles per language
 * @property {Object} searchStats - Search engine statistics
 * @property {Object} cacheStats - Cache performance statistics
 * @property {Date} lastUpdated - Last update timestamp
 */

/**
 * Main database class for Croatian Labor Law articles
 * Provides comprehensive functionality for article management, search, and data operations
 */
export class LegalDatabase {
    constructor(options = {}) {
        this.options = {
            enableCache: true,
            enableSearch: true,
            enableValidation: true,
            autoSave: false,
            cacheSize: 100,
            language: 'hr',
            ...options
        };
        
        // Core data storage
        this.articles = new Map(); // id -> Article
        this.categories = new Set();
        this.languages = new Set(['hr']); // Default Croatian
        
        // Component initialization
        this.textProcessor = new TextProcessor();
        
        if (this.options.enableCache) {
            this.cacheManager = new CacheManager({
                maxSize: this.options.cacheSize,
                prefix: 'legal_db_',
                ...this.options.cacheOptions
            });
        }
        
        if (this.options.enableSearch) {
            this.searchEngine = new SearchEngine({
                database: this,
                ...this.options.searchOptions
            });
        }
        
        if (this.options.enableValidation) {
            this.validator = new Validator();
        }
        
        this.exportManager = new ExportManager();
        
        // Database state
        this.isInitialized = false;
        this.isIndexed = false;
        this.lastModified = new Date();
        
        // Event listeners for changes
        this.eventListeners = new Map();
        
        // Performance metrics
        this.metrics = {
            operationsCount: 0,
            lastOperationTime: 0,
            totalOperationTime: 0,
            averageOperationTime: 0
        };
        
        // Batch operation support
        this.batchMode = false;
        this.batchOperations = [];
        
        console.log('LegalDatabase initialized with options:', this.options);
    }

    /**
     * Initialize the database
     * @param {string|Object} [data] - Initial data URL or data object
     * @returns {Promise<void>}
     */
    async initialize(data = null) {
        const startTime = performance.now();
        
        try {
            console.log('Initializing Croatian Labor Law Database...');
            
            // Load initial data if provided
            if (data) {
                if (typeof data === 'string') {
                    await this.loadFromUrl(data);
                } else if (typeof data === 'object') {
                    await this.loadFromData(data);
                }
            } else if (this.options.dataUrl) {
                await this.loadFromUrl(this.options.dataUrl);
            }
            
            // Build search index if search is enabled
            if (this.options.enableSearch && this.articles.size > 0) {
                await this.buildSearchIndex();
            }
            
            this.isInitialized = true;
            this.lastModified = new Date();
            
            const endTime = performance.now();
            console.log(`Database initialized in ${Math.round(endTime - startTime)}ms`);
            console.log(`Loaded ${this.articles.size} articles across ${this.categories.size} categories`);
            
            // Emit initialization complete event
            this.emit('initialized', {
                articleCount: this.articles.size,
                categoryCount: this.categories.size,
                languageCount: this.languages.size,
                initTime: endTime - startTime
            });
            
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw new Error(`Failed to initialize database: ${error.message}`);
        }
    }

    /**
     * Load data from URL
     * @param {string} url - Data URL
     * @returns {Promise<void>}
     * @private
     */
    async loadFromUrl(url) {
        try {
            console.log(`Loading data from: ${url}`);
            
            // Check cache first
            if (this.cacheManager) {
                const cachedData = await this.cacheManager.get(`data_${url}`);
                if (cachedData) {
                    console.log('Loading data from cache');
                    await this.loadFromData(cachedData);
                    return;
                }
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            await this.loadFromData(data);
            
            // Cache the loaded data
            if (this.cacheManager) {
                await this.cacheManager.set(`data_${url}`, data, 3600000); // 1 hour cache
            }
            
        } catch (error) {
            throw new Error(`Failed to load data from ${url}: ${error.message}`);
        }
    }

    /**
     * Load data from object
     * @param {Object|Array} data - Data object or array
     * @returns {Promise<void>}
     * @private
     */
    async loadFromData(data) {
        try {
            let articles = [];
            
            // Handle different data formats
            if (Array.isArray(data)) {
                articles = data;
            } else if (data.articles && Array.isArray(data.articles)) {
                articles = data.articles;
            } else if (typeof data === 'object') {
                articles = [data]; // Single article
            } else {
                throw new Error('Invalid data format');
            }
            
            console.log(`Processing ${articles.length} articles...`);
            
            // Process each article
            for (const articleData of articles) {
                await this.addArticle(articleData, { skipIndexing: true, skipValidation: false });
            }
            
            console.log(`Successfully loaded ${this.articles.size} articles`);
            
        } catch (error) {
            throw new Error(`Failed to process data: ${error.message}`);
        }
    }

    /**
     * Add an article to the database
     * @param {Object|Article} articleData - Article data or Article instance
     * @param {Object} [options] - Add options
     * @param {boolean} [options.skipValidation=false] - Skip validation
     * @param {boolean} [options.skipIndexing=false] - Skip search indexing
     * @param {boolean} [options.overwrite=false] - Overwrite existing article
     * @returns {Promise<Article>} Added article
     */
    async addArticle(articleData, options = {}) {
        const startTime = performance.now();
        
        try {
            const {
                skipValidation = false,
                skipIndexing = false,
                overwrite = false
            } = options;
            
            // Create Article instance if needed
            let article;
            if (articleData instanceof Article) {
                article = articleData;
            } else {
                article = new Article(articleData);
            }
            
            // Validate article if validation is enabled
            if (this.options.enableValidation && !skipValidation) {
                const validationResult = this.validator.validateArticle(article.toJSON());
                if (!validationResult.isValid) {
                    throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
                }
            }
            
            // Check for existing article
            if (this.articles.has(article.id) && !overwrite) {
                throw new Error(`Article with ID ${article.id} already exists`);
            }
            
            // Add to storage
            this.articles.set(article.id, article);
            
            // Update categories and languages
            if (article.category) {
                this.categories.add(article.category);
            }
            
            if (article.translations) {
                Object.keys(article.translations).forEach(lang => {
                    this.languages.add(lang);
                });
            }
            
            // Index for search if enabled
            if (this.options.enableSearch && !skipIndexing && this.isIndexed) {
                await this.searchEngine.indexArticle(article);
            }
            
            this.lastModified = new Date();
            
            // Update metrics
            this.updateMetrics(performance.now() - startTime);
            
            // Emit article added event
            this.emit('articleAdded', { article, overwritten: overwrite });
            
            // Auto-save if enabled
            if (this.options.autoSave) {
                await this.save();
            }
            
            return article;
            
        } catch (error) {
            console.error('Failed to add article:', error);
            throw error;
        }
    }

    /**
     * Get article by ID
     * @param {string} id - Article ID
     * @returns {Promise<Article|null>} Article or null if not found
     */
    async getArticle(id) {
        const startTime = performance.now();
        
        try {
            // Check cache first
            if (this.cacheManager) {
                const cached = await this.cacheManager.get(`article_${id}`);
                if (cached) {
                    this.updateMetrics(performance.now() - startTime);
                    // Return the cached data directly if it's already an Article instance
                    return cached instanceof Article ? cached : new Article(cached);
                }
            }
            
            const articleData = this.articles.get(id);
            if (!articleData) {
                this.updateMetrics(performance.now() - startTime);
                return null;
            }
            
            // If it's already an Article instance, return it directly
            if (articleData instanceof Article) {
                this.updateMetrics(performance.now() - startTime);
                return articleData;
            }
            
            // For debugging: create a copy with fallback values for missing fields
            const safeArticleData = {
                id: articleData.id || id,
                title: articleData.title || articleData.content?.substring(0, 50) || 'Untitled',
                content: articleData.content || articleData.title || '',
                category: articleData.category || 'general',
                ...articleData // Keep all other original properties
            };
            
            // Create Article instance from the safe data
            const article = new Article(safeArticleData);
            
            // Cache the result
            if (this.cacheManager) {
                await this.cacheManager.set(`article_${id}`, article, 1800000); // 30 minutes
            }
            
            this.updateMetrics(performance.now() - startTime);
            return article;
            
        } catch (error) {
            console.error('Failed to get article:', error);
            throw error;
        }
    }

    /**
     * Update an existing article
     * @param {string} id - Article ID
     * @param {Object} updates - Updates to apply
     * @param {Object} [options] - Update options
     * @returns {Promise<Article>} Updated article
     */
    async updateArticle(id, updates, options = {}) {
        const startTime = performance.now();
        
        try {
            const article = this.articles.get(id);
            if (!article) {
                throw new Error(`Article with ID ${id} not found`);
            }
            
            // Apply updates
            Object.assign(article, updates);
            article.lastModified = new Date().toISOString();
            
            // Validate if enabled
            if (this.options.enableValidation && !options.skipValidation) {
                const validationResult = this.validator.validateArticle(article.toJSON());
                if (!validationResult.isValid) {
                    throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
                }
            }
            
            // Update search index if needed
            if (this.options.enableSearch && this.isIndexed) {
                await this.searchEngine.indexArticle(article);
            }
            
            // Clear cache
            if (this.cacheManager) {
                await this.cacheManager.remove(`article_${id}`);
            }
            
            this.lastModified = new Date();
            this.updateMetrics(performance.now() - startTime);
            
            // Emit article updated event
            this.emit('articleUpdated', { article, updates });
            
            // Auto-save if enabled
            if (this.options.autoSave) {
                await this.save();
            }
            
            return article;
            
        } catch (error) {
            console.error('Failed to update article:', error);
            throw error;
        }
    }

    /**
     * Remove an article from the database
     * @param {string} id - Article ID
     * @returns {Promise<boolean>} True if removed, false if not found
     */
    async removeArticle(id) {
        const startTime = performance.now();
        
        try {
            const article = this.articles.get(id);
            if (!article) {
                return false;
            }
            
            // Remove from storage
            this.articles.delete(id);
            
            // Clear cache
            if (this.cacheManager) {
                await this.cacheManager.remove(`article_${id}`);
            }
            
            // Rebuild search index if needed
            if (this.options.enableSearch && this.isIndexed) {
                await this.buildSearchIndex();
            }
            
            this.lastModified = new Date();
            this.updateMetrics(performance.now() - startTime);
            
            // Emit article removed event
            this.emit('articleRemoved', { article });
            
            // Auto-save if enabled
            if (this.options.autoSave) {
                await this.save();
            }
            
            return true;
            
        } catch (error) {
            console.error('Failed to remove article:', error);
            throw error;
        }
    }

    /**
     * Search articles
     * @param {string} query - Search query
     * @param {Object} [options] - Search options
     * @returns {Promise<SearchResult[]>} Search results
     */
    async search(query, options = {}) {
        if (!this.options.enableSearch) {
            throw new Error('Search is not enabled');
        }
        
        if (!this.isIndexed) {
            await this.buildSearchIndex();
        }
        
        const startTime = performance.now();
        
        try {
            const results = await this.searchEngine.search(query, {
                language: this.options.language,
                ...options
            });
            
            this.updateMetrics(performance.now() - startTime);
            
            // Emit search performed event
            this.emit('searchPerformed', { query, resultCount: results.length, options });
            
            return results;
            
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        }
    }

    /**
     * Get articles by category
     * @param {string} category - Category name
     * @returns {Article[]} Articles in category
     */
    getArticlesByCategory(category) {
        return Array.from(this.articles.values()).filter(article => 
            article.category === category
        );
    }

    /**
     * Get all categories
     * @returns {string[]} Array of categories
     */
    getCategories() {
        return Array.from(this.categories).sort();
    }

    /**
     * Get all supported languages
     * @returns {string[]} Array of language codes
     */
    getLanguages() {
        return Array.from(this.languages).sort();
    }

    /**
     * Get total number of articles in the database
     * @returns {number} Number of articles
     */
    getArticleCount() {
        return this.articles.size;
    }

    /**
     * Check if database is loaded and ready
     * @returns {boolean} True if database is loaded
     */
    get isLoaded() {
        return this.isInitialized && this.articles.size > 0;
    }

    /**
     * Get database statistics
     * @returns {Object} Database statistics
     */
    getStats() {
        return {
            totalArticles: this.articles.size,
            totalCategories: this.categories.size,
            totalLanguages: this.languages.size,
            isInitialized: this.isInitialized,
            isIndexed: this.isIndexed,
            lastModified: this.lastModified
        };
    }

    /**
     * Get all articles
     * @param {Object} [filters] - Optional filters
     * @returns {Article[]} Array of articles
     */
    getArticles(filters = {}) {
        let articles = Array.from(this.articles.values());
        
        // Apply filters
        if (filters.category) {
            articles = articles.filter(article => article.category === filters.category);
        }
        
        if (filters.language) {
            articles = articles.filter(article => 
                article.translations && article.translations[filters.language]
            );
        }
        
        if (filters.keywords) {
            const keywords = Array.isArray(filters.keywords) ? filters.keywords : [filters.keywords];
            articles = articles.filter(article => 
                article.keywords && keywords.some(keyword => 
                    article.keywords.includes(keyword)
                )
            );
        }
        
        if (filters.modifiedSince) {
            const since = new Date(filters.modifiedSince);
            articles = articles.filter(article => 
                article.lastModified && new Date(article.lastModified) >= since
            );
        }
        
        return articles;
    }

    /**
     * Build or rebuild search index
     * @returns {Promise<void>}
     */
    async buildSearchIndex() {
        if (!this.options.enableSearch) {
            return;
        }
        
        console.log('Building search index...');
        const startTime = performance.now();
        
        try {
            const articles = Array.from(this.articles.values());
            await this.searchEngine.buildIndex(articles);
            
            this.isIndexed = true;
            
            const endTime = performance.now();
            console.log(`Search index built in ${Math.round(endTime - startTime)}ms`);
            
            // Emit index built event
            this.emit('indexBuilt', { 
                articleCount: articles.length,
                buildTime: endTime - startTime 
            });
            
        } catch (error) {
            console.error('Failed to build search index:', error);
            throw error;
        }
    }

    /**
     * Export articles
     * @param {string} format - Export format (pdf, csv, json, xml)
     * @param {Object} [options] - Export options
     * @returns {Promise<Object>} Export result
     */
    async export(format, options = {}) {
        const articles = this.getArticles(options.filters || {});
        
        return await this.exportManager.exportArticles(articles, {
            format,
            language: this.options.language,
            ...options
        });
    }

    /**
     * Import articles
     * @param {string|File} data - Data to import
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async import(data, options = {}) {
        const result = await this.exportManager.importArticles(data, options);
        
        if (result.success && result.imported > 0) {
            // Rebuild search index
            if (this.options.enableSearch) {
                await this.buildSearchIndex();
            }
            
            this.lastModified = new Date();
            
            // Emit import completed event
            this.emit('importCompleted', result);
        }
        
        return result;
    }

    /**
     * Save database state
     * @param {string} [key] - Storage key
     * @returns {Promise<void>}
     */
    async save(key = 'database_state') {
        if (!this.cacheManager) {
            throw new Error('Cache manager not available for saving');
        }
        
        try {
            const state = {
                articles: Array.from(this.articles.entries()),
                categories: Array.from(this.categories),
                languages: Array.from(this.languages),
                lastModified: this.lastModified.toISOString(),
                version: '2.2.0'
            };
            
            await this.cacheManager.set(key, state, 0, { persistent: true }); // No expiration
            
            console.log('Database state saved');
            this.emit('saved', { key, timestamp: new Date() });
            
        } catch (error) {
            console.error('Failed to save database state:', error);
            throw error;
        }
    }

    /**
     * Load database state
     * @param {string} [key] - Storage key
     * @returns {Promise<boolean>} True if loaded successfully
     */
    async load(key = 'database_state') {
        if (!this.cacheManager) {
            throw new Error('Cache manager not available for loading');
        }
        
        try {
            const state = await this.cacheManager.get(key);
            if (!state) {
                return false;
            }
            
            // Clear current state
            this.articles.clear();
            this.categories.clear();
            this.languages.clear();
            
            // Restore state
            state.articles.forEach(([id, articleData]) => {
                this.articles.set(id, new Article(articleData));
            });
            
            state.categories.forEach(category => {
                this.categories.add(category);
            });
            
            state.languages.forEach(language => {
                this.languages.add(language);
            });
            
            this.lastModified = new Date(state.lastModified);
            
            // Rebuild search index if needed
            if (this.options.enableSearch) {
                await this.buildSearchIndex();
            }
            
            console.log(`Database state loaded: ${this.articles.size} articles`);
            this.emit('loaded', { key, articleCount: this.articles.size });
            
            return true;
            
        } catch (error) {
            console.error('Failed to load database state:', error);
            return false;
        }
    }

    /**
     * Get database statistics
     * @returns {DatabaseStats} Database statistics
     */
    getStats() {
        const categoryDistribution = {};
        const languageDistribution = {};
        
        // Calculate distributions
        this.articles.forEach(article => {
            // Category distribution
            const category = article.category || 'Uncategorized';
            categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
            
            // Language distribution
            languageDistribution['hr'] = (languageDistribution['hr'] || 0) + 1;
            if (article.translations) {
                Object.keys(article.translations).forEach(lang => {
                    languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
                });
            }
        });
        
        return {
            totalArticles: this.articles.size,
            totalCategories: this.categories.size,
            totalTranslations: Object.keys(languageDistribution).length - 1, // Exclude Croatian
            categoryDistribution,
            languageDistribution,
            searchStats: this.options.enableSearch ? this.searchEngine.getStats() : null,
            cacheStats: this.cacheManager ? this.cacheManager.getStats() : null,
            lastUpdated: this.lastModified,
            performance: this.metrics,
            memoryUsage: {
                articlesSize: this.articles.size,
                categoriesSize: this.categories.size,
                languagesSize: this.languages.size
            }
        };
    }

    /**
     * Clear all data
     * @returns {Promise<void>}
     */
    async clear() {
        this.articles.clear();
        this.categories.clear();
        this.languages.clear();
        this.languages.add('hr'); // Keep Croatian as default
        
        if (this.cacheManager) {
            await this.cacheManager.clear();
        }
        
        if (this.searchEngine) {
            this.searchEngine.clearCache();
        }
        
        this.isIndexed = false;
        this.lastModified = new Date();
        
        console.log('Database cleared');
        this.emit('cleared', { timestamp: new Date() });
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {any} data - Event data
     * @private
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Update performance metrics
     * @param {number} operationTime - Operation time in milliseconds
     * @private
     */
    updateMetrics(operationTime) {
        this.metrics.operationsCount++;
        this.metrics.lastOperationTime = operationTime;
        this.metrics.totalOperationTime += operationTime;
        this.metrics.averageOperationTime = this.metrics.totalOperationTime / this.metrics.operationsCount;
    }

    /**
     * Start batch mode for multiple operations
     */
    startBatch() {
        this.batchMode = true;
        this.batchOperations = [];
    }

    /**
     * Commit batch operations
     * @returns {Promise<void>}
     */
    async commitBatch() {
        if (!this.batchMode) {
            return;
        }
        
        try {
            // Execute all batch operations
            for (const operation of this.batchOperations) {
                await operation();
            }
            
            // Rebuild search index once at the end
            if (this.options.enableSearch) {
                await this.buildSearchIndex();
            }
            
            this.batchMode = false;
            this.batchOperations = [];
            
            this.emit('batchCommitted', { 
                operationCount: this.batchOperations.length 
            });
            
        } catch (error) {
            this.batchMode = false;
            this.batchOperations = [];
            throw error;
        }
    }

    /**
     * Rollback batch operations
     */
    rollbackBatch() {
        this.batchMode = false;
        this.batchOperations = [];
        this.emit('batchRolledBack', {});
    }

    /**
     * Destroy database and cleanup resources
     */
    destroy() {
        // Clear all data
        this.articles.clear();
        this.categories.clear();
        this.languages.clear();
        
        // Cleanup components
        if (this.cacheManager) {
            this.cacheManager.destroy();
        }
        
        if (this.searchEngine) {
            this.searchEngine.clearCache();
        }
        
        // Clear event listeners
        this.eventListeners.clear();
        
        console.log('Database destroyed');
    }
}

export default LegalDatabase;
