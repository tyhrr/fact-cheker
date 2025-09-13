/**
 * @fileoverview WORKING Search Engine for Croatian Labor Law database
 * Direct implementation that actually works with the database
 * @version 2.2.1-FIXED
 */

import { SearchResult } from '../models/SearchResult.js';

/**
 * WORKING SearchEngine - Fixed version that actually finds results
 */
export class SearchEngine {
    constructor(database, options = {}) {
        console.log('🚀 WORKING SearchEngine constructor called');
        
        // Handle both parameter styles robustly
        if (database && (database.articles || database.database)) {
            this.database = database;
        } else if (typeof database === 'object' && database.database) {
            this.database = database.database;
        } else {
            console.warn('❌ SearchEngine: No valid database provided');
            this.database = null;
        }
        
        this.options = {
            maxResults: 50,
            minRelevance: 0.001,
            fuzzyThreshold: 0.6,
            ...options
        };
        
        // Initialize if database is available
        if (this.database) {
            this.initialize();
        }
        
        console.log('✅ WORKING SearchEngine initialized:', {
            hasDatabase: !!this.database,
            articleCount: this.getArticleCount()
        });
    }
    
    initialize() {
        console.log('🔧 SearchEngine initializing...');
        
        // Find the articles data
        this.articlesData = this.findArticlesData();
        
        if (this.articlesData) {
            console.log('✅ Articles data found:', this.articlesData.size || this.articlesData.length, 'items');
        } else {
            console.error('❌ No articles data found in database');
        }
    }
    
    findArticlesData() {
        if (!this.database) return null;
        
        // Check direct articles property (array or Map)
        if (this.database.articles) {
            if (Array.isArray(this.database.articles) && this.database.articles.length > 0) {
                console.log('📊 Found articles array:', this.database.articles.length);
                return this.database.articles;
            }
            if (this.database.articles instanceof Map && this.database.articles.size > 0) {
                console.log('📊 Found articles Map:', this.database.articles.size);
                return this.database.articles;
            }
        }
        
        // Check other possible properties
        const possibleProps = ['_articles', 'data', '_data', 'items', '_items'];
        for (const prop of possibleProps) {
            if (this.database[prop]) {
                if (Array.isArray(this.database[prop]) && this.database[prop].length > 0) {
                    console.log(`📊 Found articles in ${prop}:`, this.database[prop].length);
                    return this.database[prop];
                }
                if (this.database[prop] instanceof Map && this.database[prop].size > 0) {
                    console.log(`📊 Found articles Map in ${prop}:`, this.database[prop].size);
                    return this.database[prop];
                }
            }
        }
        
        // Check methods
        const possibleMethods = ['getArticles', 'getAllArticles', 'getData'];
        for (const method of possibleMethods) {
            if (typeof this.database[method] === 'function') {
                try {
                    const result = this.database[method]();
                    if (result && ((Array.isArray(result) && result.length > 0) || 
                                 (result instanceof Map && result.size > 0))) {
                        console.log(`📊 Method ${method} returned articles:`, result.length || result.size);
                        return result;
                    }
                } catch (error) {
                    console.warn(`Method ${method} failed:`, error.message);
                }
            }
        }
        
        return null;
    }
    
    getArticleCount() {
        if (!this.articlesData) return 0;
        return this.articlesData.size || this.articlesData.length || 0;
    }
    
    /**
     * Main search function - ACTUALLY WORKS
     */
    async search(query, options = {}) {
        console.log(`🔍 WORKING SearchEngine: Searching for "${query}"`);
        
        if (!this.articlesData) {
            console.error('❌ No articles data available for search');
            return [];
        }
        
        const mergedOptions = { ...this.options, ...options };
        const maxResults = mergedOptions.maxResults || 50;
        const results = [];
        const searchTerm = query.toLowerCase();
        
        // Convert to searchable array
        const articlesToSearch = this.articlesData instanceof Map ? 
            Array.from(this.articlesData.entries()) : 
            this.articlesData.map((article, index) => [article.id || index, article]);
        
        console.log(`🔍 Searching through ${articlesToSearch.length} articles`);
        
        // Search through all articles
        for (const [id, article] of articlesToSearch) {
            if (!article) continue;
            
            const title = (article.title || '').toLowerCase();
            const content = (article.content || '').toLowerCase();
            const keywords = (article.keywords || []).join(' ').toLowerCase();
            
            // Check if the search term is found
            const titleMatch = title.includes(searchTerm);
            const contentMatch = content.includes(searchTerm);
            const keywordMatch = keywords.includes(searchTerm);
            
            if (titleMatch || contentMatch || keywordMatch) {
                
                // Calculate relevance score
                let score = 0;
                if (titleMatch) score += 3;     // Title matches are most important
                if (contentMatch) score += 1;   // Content matches
                if (keywordMatch) score += 2;   // Keyword matches are important
                
                // Bonus for exact matches
                if (title === searchTerm) score += 5;
                if (keywords === searchTerm) score += 3;
                
                // Create SearchResult object
                const searchResult = new SearchResult(
                    id,
                    article,
                    score / 10, // Normalize score to 0-1
                    [searchTerm], // Search terms
                    {
                        titleMatch,
                        contentMatch,
                        keywordMatch,
                        query: query
                    }
                );
                
                results.push(searchResult);
                
                if (results.length >= maxResults) break;
            }
        }
        
        // Sort by relevance score (highest first)
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        console.log(`✅ WORKING SearchEngine found ${results.length} results for "${query}"`);
        
        return results;
    }
    
    /**
     * Multi-language search with translations
     */
    async executeMultiLanguageSearch(translations, options = {}) {
        const allResults = [];
        
        // Search for all Croatian terms
        if (translations.croatian && Array.isArray(translations.croatian)) {
            for (const term of translations.croatian) {
                const termResults = await this.search(term, { maxResults: 50 });
                allResults.push(...termResults);
            }
        }
        
        // Remove duplicates by ID
        const uniqueResults = [];
        const seenIds = new Set();
        
        for (const result of allResults) {
            const id = result.id || result.article?.id;
            if (!seenIds.has(id)) {
                seenIds.add(id);
                uniqueResults.push(result);
            }
        }
        
        // Sort by relevance
        uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        const maxResults = options.maxResults || 50;
        return uniqueResults.slice(0, maxResults);
    }
    
    /**
     * Update database reference
     */
    updateDatabase(newDatabase) {
        this.database = newDatabase;
        this.initialize();
    }
    
    /**
     * Get search statistics
     */
    getStats() {
        return {
            articleCount: this.getArticleCount(),
            hasDatabase: !!this.database,
            hasArticles: !!this.articlesData,
            databaseType: typeof this.database,
            articlesType: this.articlesData ? (this.articlesData instanceof Map ? 'Map' : 'Array') : 'null'
        };
    }
}

// Auto-initialize when database becomes available
if (typeof window !== 'undefined') {
    window.addEventListener('databaseReady', () => {
        console.log('🔄 Database ready event received, updating SearchEngine...');
        if (window.searchEngine && (window.legalDatabase || window.enhancedDatabase)) {
            const database = window.legalDatabase || window.enhancedDatabase;
            window.searchEngine.updateDatabase(database);
        }
    });
    
    // Also check immediately if database is already available
    setTimeout(() => {
        if (window.searchEngine && (window.legalDatabase || window.enhancedDatabase)) {
            const database = window.legalDatabase || window.enhancedDatabase;
            console.log('🔄 Database found, updating SearchEngine immediately...');
            window.searchEngine.updateDatabase(database);
        }
    }, 1000);
}
