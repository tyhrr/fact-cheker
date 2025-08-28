/**
 * @fileoverview Advanced search engine for Croatian Labor Law database
 * Provides boolean search, phrase matching, fuzzy search, and intelligent ranking
 * @version 2.2.0
 */

import { TextProcessor } from '../utils/TextProcessor.js';
import { SearchResult } from '../models/SearchResult.js';

/**
 * @typedef {Object} SearchOptions
 * @property {boolean} [fuzzySearch=true] - Enable fuzzy search
 * @property {number} [maxResults=50] - Maximum number of results
 * @property {number} [minRelevance=0.1] - Minimum relevance score (0-1)
 * @property {string[]} [categories] - Filter by categories
 * @property {string[]} [languages] - Search in specific languages
 * @property {boolean} [includeTranslations=true] - Search in translations
 * @property {boolean} [caseSensitive=false] - Case sensitive search
 * @property {boolean} [wholeWords=false] - Match whole words only
 * @property {string} [sortBy='relevance'] - Sort by: 'relevance', 'date', 'title'
 * @property {string} [sortOrder='desc'] - Sort order: 'asc', 'desc'
 * @property {Object} [filters] - Additional filters
 */

/**
 * @typedef {Object} SearchQuery
 * @property {string} original - Original query string
 * @property {string[]} terms - Individual search terms
 * @property {string[]} phrases - Quoted phrases
 * @property {string[]} required - Required terms (prefixed with +)
 * @property {string[]} excluded - Excluded terms (prefixed with -)
 * @property {string[]} wildcards - Wildcard terms (containing *)
 * @property {Object[]} booleanExpressions - Boolean expressions
 * @property {string} processedQuery - Processed query for search
 */

/**
 * @typedef {Object} SearchIndex
 * @property {Map<string, Set<string>>} termIndex - Term to article IDs mapping
 * @property {Map<string, Set<string>>} trigramIndex - Trigram to article IDs mapping
 * @property {Map<string, Object>} articleMetadata - Article metadata cache
 * @property {Map<string, number>} termFrequency - Term frequency across corpus
 * @property {number} totalDocuments - Total number of documents
 * @property {Date} lastUpdated - Last index update timestamp
 */

/**
 * Advanced search engine with boolean logic, fuzzy matching, and intelligent ranking
 */
export class SearchEngine {
    constructor(options = {}) {
        this.database = options.database || null;
        
        this.options = {
            maxResults: 50,
            minRelevance: 0.1,
            fuzzyThreshold: 0.7,
            enableBooleanSearch: true,
            enablePhraseSearch: true,
            enableWildcardSearch: true,
            enableFuzzySearch: true,
            defaultOperator: 'AND',
            ...options
        };
        
        // Initialize text processor
        this.textProcessor = new TextProcessor();
        
        // Search indexes
        this.indexes = {
            termIndex: new Map(),           // term -> Set of article IDs
            trigramIndex: new Map(),        // trigram -> Set of article IDs
            phraseIndex: new Map(),         // phrase -> Set of article IDs
            categoryIndex: new Map(),       // category -> Set of article IDs
            keywordIndex: new Map(),        // keyword -> Set of article IDs
            titleIndex: new Map(),          // title terms -> Set of article IDs
            contentIndex: new Map()         // content terms -> Set of article IDs
        };
        
        // Document metadata for scoring
        this.documentMetadata = new Map();
        
        // Term frequency and document frequency statistics
        this.termStats = {
            termFrequency: new Map(),       // term -> frequency across all documents
            documentFrequency: new Map(),   // term -> number of documents containing term
            averageDocumentLength: 0,
            totalDocuments: 0
        };
        
        // Query cache for performance
        this.queryCache = new Map();
        this.maxCacheSize = 100;
        
        // Performance metrics
        this.metrics = {
            totalSearches: 0,
            averageSearchTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // Boolean operators
        this.booleanOperators = ['AND', 'OR', 'NOT', '&&', '||', '!'];
        
        // Search preprocessing patterns
        this.searchPatterns = {
            phrase: /"([^"]+)"/g,
            required: /\+(\S+)/g,
            excluded: /-(\S+)/g,
            wildcard: /\*\w+|\w+\*/g,
            boolean: /\b(AND|OR|NOT|&&|\|\||!)\b/gi
        };
    }

    /**
     * Build search indexes from articles
     * @param {Array} articles - Array of Article objects
     * @returns {Promise<void>}
     */
    async buildIndex(articles) {
        console.log('Building search index...');
        const startTime = performance.now();
        
        // Clear existing indexes
        this.clearIndexes();
        
        // Process each article
        for (const article of articles) {
            await this.indexArticle(article);
        }
        
        // Calculate statistics
        this.calculateDocumentStats();
        
        const endTime = performance.now();
        console.log(`Index built in ${Math.round(endTime - startTime)}ms for ${articles.length} articles`);
    }

    /**
     * Index a single article
     * @param {Article} article - Article to index
     * @private
     */
    async indexArticle(article) {
        const articleId = article.id;
        
        // Store document metadata
        this.documentMetadata.set(articleId, {
            title: article.title,
            category: article.category,
            keywords: article.keywords || [],
            lastModified: article.lastModified,
            contentLength: article.content.length,
            titleLength: article.title.length
        });
        
        // Index main content
        await this.indexText(article.title, articleId, 'title', 3.0); // Higher weight for title
        await this.indexText(article.content, articleId, 'content', 1.0);
        
        // Index category
        this.addToIndex(this.indexes.categoryIndex, article.category, articleId);
        
        // Index keywords
        if (article.keywords) {
            for (const keyword of article.keywords) {
                this.addToIndex(this.indexes.keywordIndex, keyword.toLowerCase(), articleId);
                await this.indexText(keyword, articleId, 'keyword', 2.0); // Higher weight for keywords
            }
        }
        
        // Index translations
        if (article.translations) {
            for (const [lang, translation] of Object.entries(article.translations)) {
                await this.indexText(translation.title, articleId, `title_${lang}`, 2.5);
                await this.indexText(translation.content, articleId, `content_${lang}`, 0.8);
                
                if (translation.keywords) {
                    for (const keyword of translation.keywords) {
                        await this.indexText(keyword, articleId, `keyword_${lang}`, 1.8);
                    }
                }
            }
        }
        
        // Index FAQ content
        if (article.frequentlyAskedQuestions) {
            for (const faq of article.frequentlyAskedQuestions) {
                await this.indexText(faq.question, articleId, 'faq_question', 1.5);
                await this.indexText(faq.answer, articleId, 'faq_answer', 1.2);
            }
        }
        
        // Index practical examples
        if (article.practicalExamples) {
            for (const example of article.practicalExamples) {
                await this.indexText(example.scenario, articleId, 'example', 1.3);
                await this.indexText(example.application, articleId, 'example', 1.3);
            }
        }
    }

    /**
     * Index text content
     * @param {string} text - Text to index
     * @param {string} articleId - Article ID
     * @param {string} field - Field type
     * @param {number} weight - Field weight for scoring
     * @private
     */
    async indexText(text, articleId, field, weight = 1.0) {
        if (!text || typeof text !== 'string') return;
        
        // Process text using analyzeText method
        const analysis = this.textProcessor.analyzeText(text, {
            includeStems: true,
            includeTrigrams: true,
            includeKeywords: true
        });
        
        const terms = analysis.tokens || [];
        const trigrams = analysis.trigrams || [];
        
        // Index individual terms
        for (const term of terms) {
            this.addToIndex(this.indexes.termIndex, term, articleId);
            
            // Add to field-specific index
            if (field === 'title') {
                this.addToIndex(this.indexes.titleIndex, term, articleId);
            } else if (field === 'content') {
                this.addToIndex(this.indexes.contentIndex, term, articleId);
            }
            
            // Update term statistics
            this.updateTermStats(term, articleId, weight);
        }
        
        // Index trigrams for fuzzy search
        for (const trigram of trigrams) {
            this.addToIndex(this.indexes.trigramIndex, trigram, articleId);
        }
        
        // Index phrases (for phrase search)
        const phrases = this.extractPhrases(text);
        for (const phrase of phrases) {
            this.addToIndex(this.indexes.phraseIndex, phrase.toLowerCase(), articleId);
        }
    }

    /**
     * Add term to index
     * @param {Map} index - Index to add to
     * @param {string} term - Term to add
     * @param {string} articleId - Article ID
     * @private
     */
    addToIndex(index, term, articleId) {
        if (!index.has(term)) {
            index.set(term, new Set());
        }
        index.get(term).add(articleId);
    }

    /**
     * Update term statistics
     * @param {string} term - Term
     * @param {string} articleId - Article ID
     * @param {number} weight - Term weight
     * @private
     */
    updateTermStats(term, articleId, weight) {
        // Update term frequency
        const currentTF = this.termStats.termFrequency.get(term) || 0;
        this.termStats.termFrequency.set(term, currentTF + weight);
        
        // Update document frequency
        if (!this.termStats.documentFrequency.has(term)) {
            this.termStats.documentFrequency.set(term, new Set());
        }
        this.termStats.documentFrequency.get(term).add(articleId);
    }

    /**
     * Calculate document statistics
     * @private
     */
    calculateDocumentStats() {
        this.termStats.totalDocuments = this.documentMetadata.size;
        
        // Calculate average document length
        let totalLength = 0;
        for (const metadata of this.documentMetadata.values()) {
            totalLength += metadata.contentLength;
        }
        this.termStats.averageDocumentLength = totalLength / this.termStats.totalDocuments;
        
        // Convert document frequency sets to counts
        const dfMap = new Map();
        for (const [term, docSet] of this.termStats.documentFrequency.entries()) {
            dfMap.set(term, docSet.size);
        }
        this.termStats.documentFrequency = dfMap;
    }

    /**
     * Search articles
     * @param {string} queryString - Search query
     * @param {SearchOptions} [options] - Search options
     * @returns {Promise<SearchResult[]>} Search results
     */
    async search(queryString, options = {}) {
        const startTime = performance.now();
        this.metrics.totalSearches++;
        
        // Merge options with defaults
        const searchOptions = { ...this.options, ...options };
        
        // Check cache first
        const cacheKey = this.generateCacheKey(queryString, searchOptions);
        if (this.queryCache.has(cacheKey)) {
            this.metrics.cacheHits++;
            return this.queryCache.get(cacheKey);
        }
        
        this.metrics.cacheMisses++;
        
        try {
            // Parse query
            const parsedQuery = this.parseQuery(queryString);
            
            // Execute search
            const results = await this.executeSearch(parsedQuery, searchOptions);
            
            // Cache results
            this.cacheResults(cacheKey, results);
            
            // Update performance metrics
            const endTime = performance.now();
            this.updateSearchMetrics(endTime - startTime);
            
            return results;
            
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    /**
     * Parse search query
     * @param {string} queryString - Query string to parse
     * @returns {SearchQuery} Parsed query
     * @private
     */
    parseQuery(queryString) {
        const query = {
            original: queryString,
            terms: [],
            phrases: [],
            required: [],
            excluded: [],
            wildcards: [],
            booleanExpressions: [],
            processedQuery: queryString
        };
        
        let workingQuery = queryString;
        
        // Extract phrases
        const phraseMatches = workingQuery.match(this.searchPatterns.phrase);
        if (phraseMatches) {
            for (const match of phraseMatches) {
                const phrase = match.slice(1, -1); // Remove quotes
                query.phrases.push(phrase);
                workingQuery = workingQuery.replace(match, '');
            }
        }
        
        // Extract required terms
        const requiredMatches = workingQuery.match(this.searchPatterns.required);
        if (requiredMatches) {
            for (const match of requiredMatches) {
                const term = match.slice(1); // Remove +
                query.required.push(term);
                workingQuery = workingQuery.replace(match, '');
            }
        }
        
        // Extract excluded terms
        const excludedMatches = workingQuery.match(this.searchPatterns.excluded);
        if (excludedMatches) {
            for (const match of excludedMatches) {
                const term = match.slice(1); // Remove -
                query.excluded.push(term);
                workingQuery = workingQuery.replace(match, '');
            }
        }
        
        // Extract wildcard terms
        const wildcardMatches = workingQuery.match(this.searchPatterns.wildcard);
        if (wildcardMatches) {
            for (const match of wildcardMatches) {
                query.wildcards.push(match);
                workingQuery = workingQuery.replace(match, '');
            }
        }
        
        // Extract boolean expressions
        const booleanMatches = workingQuery.match(this.searchPatterns.boolean);
        if (booleanMatches) {
            query.booleanExpressions = booleanMatches;
        }
        
        // Extract remaining terms
        const remainingTerms = this.textProcessor.extractTerms(workingQuery);
        query.terms = remainingTerms.filter(term => term.length > 0);
        
        // Create processed query
        query.processedQuery = [...query.terms, ...query.phrases, ...query.required].join(' ');
        
        return query;
    }

    /**
     * Execute search based on parsed query
     * @param {SearchQuery} query - Parsed query
     * @param {SearchOptions} options - Search options
     * @returns {Promise<SearchResult[]>} Search results
     * @private
     */
    async executeSearch(query, options) {
        const candidateArticles = new Set();
        const termScores = new Map();
        
        // Search for exact terms
        for (const term of query.terms) {
            const articleIds = this.searchTerm(term, options);
            articleIds.forEach(id => candidateArticles.add(id));
            termScores.set(term, articleIds);
        }
        
        // Search for required terms
        for (const term of query.required) {
            const articleIds = this.searchTerm(term, options);
            if (articleIds.size === 0) {
                return []; // Required term not found, no results
            }
            articleIds.forEach(id => candidateArticles.add(id));
            termScores.set(term, articleIds);
        }
        
        // Search for phrases
        for (const phrase of query.phrases) {
            const articleIds = this.searchPhrase(phrase, options);
            articleIds.forEach(id => candidateArticles.add(id));
            termScores.set(phrase, articleIds);
        }
        
        // Search for wildcards
        for (const wildcard of query.wildcards) {
            const articleIds = this.searchWildcard(wildcard, options);
            articleIds.forEach(id => candidateArticles.add(id));
            termScores.set(wildcard, articleIds);
        }
        
        // Fuzzy search if enabled and no exact matches
        if (options.fuzzySearch && candidateArticles.size === 0 && query.terms.length > 0) {
            for (const term of query.terms) {
                const fuzzyArticles = await this.fuzzySearch(term, options);
                fuzzyArticles.forEach(id => candidateArticles.add(id));
            }
        }
        
        // Filter by excluded terms
        if (query.excluded.length > 0) {
            for (const term of query.excluded) {
                const excludedIds = this.searchTerm(term, options);
                excludedIds.forEach(id => candidateArticles.delete(id));
            }
        }
        
        // Apply category filters
        if (options.categories && options.categories.length > 0) {
            const filteredCandidates = new Set();
            for (const category of options.categories) {
                const categoryArticles = this.indexes.categoryIndex.get(category) || new Set();
                categoryArticles.forEach(id => {
                    if (candidateArticles.has(id)) {
                        filteredCandidates.add(id);
                    }
                });
            }
            candidateArticles.clear();
            filteredCandidates.forEach(id => candidateArticles.add(id));
        }
        
        // Calculate relevance scores and create results
        const results = [];
        for (const articleId of candidateArticles) {
            const metadata = this.documentMetadata.get(articleId);
            if (!metadata) continue;
            
            const relevanceScore = this.calculateRelevance(articleId, query, termScores, options);
            
            if (relevanceScore >= options.minRelevance) {
                // Get the full article from the database
                const article = this.database ? await this.database.getArticle(articleId) : null;
                
                if (!article) {
                    console.warn(`Article not found for ID: ${articleId}`);
                    continue;
                }
                
                const searchResult = new SearchResult({
                    article: article,
                    relevanceScore,
                    searchTerm: query.original,
                    matches: [],
                    highlights: []
                });
                
                results.push(searchResult);
            }
        }
        
        // Sort results
        this.sortResults(results, options);
        
        // Limit results
        return results.slice(0, options.maxResults);
    }

    /**
     * Search for a specific term
     * @param {string} term - Term to search
     * @param {SearchOptions} options - Search options
     * @returns {Set<string>} Set of article IDs
     * @private
     */
    searchTerm(term, options) {
        const normalizedTerm = this.textProcessor.normalizeText(term).toLowerCase();
        const results = new Set();
        
        // Search in term index
        const termResults = this.indexes.termIndex.get(normalizedTerm) || new Set();
        termResults.forEach(id => results.add(id));
        
        // Search in keyword index
        const keywordResults = this.indexes.keywordIndex.get(normalizedTerm) || new Set();
        keywordResults.forEach(id => results.add(id));
        
        // Search in title index (with higher priority)
        const titleResults = this.indexes.titleIndex.get(normalizedTerm) || new Set();
        titleResults.forEach(id => results.add(id));
        
        return results;
    }

    /**
     * Search for a phrase
     * @param {string} phrase - Phrase to search
     * @param {SearchOptions} options - Search options
     * @returns {Set<string>} Set of article IDs
     * @private
     */
    searchPhrase(phrase, options) {
        const normalizedPhrase = this.textProcessor.normalizeText(phrase).toLowerCase();
        return this.indexes.phraseIndex.get(normalizedPhrase) || new Set();
    }

    /**
     * Search with wildcards
     * @param {string} wildcard - Wildcard pattern
     * @param {SearchOptions} options - Search options
     * @returns {Set<string>} Set of article IDs
     * @private
     */
    searchWildcard(wildcard, options) {
        const results = new Set();
        const pattern = wildcard.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`, 'i');
        
        // Search through all terms
        for (const term of this.indexes.termIndex.keys()) {
            if (regex.test(term)) {
                const termResults = this.indexes.termIndex.get(term) || new Set();
                termResults.forEach(id => results.add(id));
            }
        }
        
        return results;
    }

    /**
     * Perform fuzzy search
     * @param {string} term - Term to search
     * @param {SearchOptions} options - Search options
     * @returns {Promise<Set<string>>} Set of article IDs
     * @private
     */
    async fuzzySearch(term, options) {
        const results = new Set();
        const termTrigrams = this.textProcessor.generateTrigrams(term);
        const candidateTerms = new Map(); // term -> similarity score
        
        // Find terms with similar trigrams
        for (const trigram of termTrigrams) {
            const trigramResults = this.indexes.trigramIndex.get(trigram) || new Set();
            trigramResults.forEach(id => results.add(id));
        }
        
        // Also check for similar terms by edit distance
        for (const indexedTerm of this.indexes.termIndex.keys()) {
            const similarity = this.textProcessor.calculateSimilarity(term, indexedTerm);
            if (similarity >= this.options.fuzzyThreshold) {
                const termResults = this.indexes.termIndex.get(indexedTerm) || new Set();
                termResults.forEach(id => results.add(id));
            }
        }
        
        return results;
    }

    /**
     * Calculate relevance score for an article
     * @param {string} articleId - Article ID
     * @param {SearchQuery} query - Search query
     * @param {Map} termScores - Term scores map
     * @param {SearchOptions} options - Search options
     * @returns {number} Relevance score (0-1)
     * @private
     */
    calculateRelevance(articleId, query, termScores, options) {
        const metadata = this.documentMetadata.get(articleId);
        if (!metadata) return 0;
        
        let totalScore = 0;
        let maxPossibleScore = 0;
        const allTerms = [...query.terms, ...query.phrases, ...query.required, ...query.wildcards];
        
        for (const term of allTerms) {
            const termWeight = this.getTermWeight(term, query);
            maxPossibleScore += termWeight;
            
            // Check if article contains this term
            const termArticles = termScores.get(term) || new Set();
            if (termArticles.has(articleId)) {
                // Calculate TF-IDF score
                const tfIdfScore = this.calculateTfIdf(term, articleId, metadata);
                
                // Apply position bonus (title vs content)
                const positionBonus = this.calculatePositionBonus(term, articleId, metadata);
                
                // Apply frequency bonus
                const frequencyBonus = this.calculateFrequencyBonus(term, articleId);
                
                totalScore += (tfIdfScore + positionBonus + frequencyBonus) * termWeight;
            }
        }
        
        // Normalize score
        let normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
        
        // Apply additional factors
        normalizedScore *= this.calculateDocumentBonus(metadata, options);
        normalizedScore *= this.calculateRecencyBonus(metadata);
        
        return Math.min(1.0, Math.max(0.0, normalizedScore));
    }

    /**
     * Calculate TF-IDF score for a term in a document
     * @param {string} term - Search term
     * @param {string} articleId - Article ID
     * @param {Object} metadata - Article metadata
     * @returns {number} TF-IDF score
     * @private
     */
    calculateTfIdf(term, articleId, metadata) {
        // Term frequency (normalized by document length)
        const termFreq = this.termStats.termFrequency.get(term) || 0;
        const tf = termFreq / metadata.contentLength;
        
        // Inverse document frequency
        const docFreq = this.termStats.documentFrequency.get(term) || 1;
        const idf = Math.log(this.termStats.totalDocuments / docFreq);
        
        return tf * idf;
    }

    /**
     * Calculate position bonus (title vs content)
     * @param {string} term - Search term
     * @param {string} articleId - Article ID
     * @param {Object} metadata - Article metadata
     * @returns {number} Position bonus
     * @private
     */
    calculatePositionBonus(term, articleId, metadata) {
        let bonus = 0;
        
        // Title bonus
        const titleTerms = this.indexes.titleIndex.get(term);
        if (titleTerms && titleTerms.has(articleId)) {
            bonus += 0.3;
        }
        
        // Keyword bonus
        const keywordTerms = this.indexes.keywordIndex.get(term);
        if (keywordTerms && keywordTerms.has(articleId)) {
            bonus += 0.2;
        }
        
        return bonus;
    }

    /**
     * Calculate frequency bonus
     * @param {string} term - Search term
     * @param {string} articleId - Article ID
     * @returns {number} Frequency bonus
     * @private
     */
    calculateFrequencyBonus(term, articleId) {
        const termFreq = this.termStats.termFrequency.get(term) || 0;
        const avgFreq = this.termStats.termFrequency.size > 0 ? 
            Array.from(this.termStats.termFrequency.values()).reduce((a, b) => a + b) / this.termStats.termFrequency.size : 1;
        
        return Math.min(0.2, termFreq / avgFreq * 0.1);
    }

    /**
     * Calculate document bonus based on metadata
     * @param {Object} metadata - Article metadata
     * @param {SearchOptions} options - Search options
     * @returns {number} Document bonus multiplier
     * @private
     */
    calculateDocumentBonus(metadata, options) {
        let bonus = 1.0;
        
        // Length bonus (prefer moderate length documents)
        const idealLength = this.termStats.averageDocumentLength;
        const lengthRatio = metadata.contentLength / idealLength;
        if (lengthRatio >= 0.5 && lengthRatio <= 2.0) {
            bonus += 0.1;
        }
        
        // Category preference
        if (options.categories && options.categories.includes(metadata.category)) {
            bonus += 0.2;
        }
        
        return bonus;
    }

    /**
     * Calculate recency bonus
     * @param {Object} metadata - Article metadata
     * @returns {number} Recency bonus multiplier
     * @private
     */
    calculateRecencyBonus(metadata) {
        if (!metadata.lastModified) return 1.0;
        
        const now = new Date();
        const modified = new Date(metadata.lastModified);
        const daysDiff = (now - modified) / (1000 * 60 * 60 * 24);
        
        // Recent documents get a small bonus
        if (daysDiff < 30) return 1.1;
        if (daysDiff < 90) return 1.05;
        return 1.0;
    }

    /**
     * Get term weight based on query context
     * @param {string} term - Search term
     * @param {SearchQuery} query - Search query
     * @returns {number} Term weight
     * @private
     */
    getTermWeight(term, query) {
        if (query.required.includes(term)) return 2.0;
        if (query.phrases.some(phrase => phrase.includes(term))) return 1.5;
        if (query.wildcards.includes(term)) return 1.3;
        return 1.0;
    }

    /**
     * Get matched terms for an article
     * @param {string} articleId - Article ID
     * @param {SearchQuery} query - Search query
     * @param {Map} termScores - Term scores map
     * @returns {string[]} Matched terms
     * @private
     */
    getMatchedTerms(articleId, query, termScores) {
        const matched = [];
        const allTerms = [...query.terms, ...query.phrases, ...query.required, ...query.wildcards];
        
        for (const term of allTerms) {
            const termArticles = termScores.get(term) || new Set();
            if (termArticles.has(articleId)) {
                matched.push(term);
            }
        }
        
        return matched;
    }

    /**
     * Generate snippet for search result
     * @param {string} articleId - Article ID
     * @param {SearchQuery} query - Search query
     * @returns {Promise<string>} Generated snippet
     * @private
     */
    async generateSnippet(articleId, query) {
        const metadata = this.documentMetadata.get(articleId);
        if (!metadata) return '';
        
        // This is a simplified snippet generation
        // In a real implementation, you'd want to fetch the full article content
        // and extract the most relevant sentences containing the search terms
        
        const title = metadata.title;
        const maxLength = 200;
        
        if (title.length <= maxLength) {
            return title;
        }
        
        return title.substring(0, maxLength - 3) + '...';
    }

    /**
     * Sort search results
     * @param {SearchResult[]} results - Results to sort
     * @param {SearchOptions} options - Search options
     * @private
     */
    sortResults(results, options) {
        const sortBy = options.sortBy || 'relevance';
        const sortOrder = options.sortOrder || 'desc';
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        
        results.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'relevance':
                    comparison = a.relevanceScore - b.relevanceScore;
                    break;
                case 'date':
                    comparison = new Date(a.lastModified) - new Date(b.lastModified);
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                default:
                    comparison = a.relevanceScore - b.relevanceScore;
            }
            
            return comparison * multiplier;
        });
    }

    /**
     * Extract phrases from text
     * @param {string} text - Text to extract phrases from
     * @returns {string[]} Extracted phrases
     * @private
     */
    extractPhrases(text) {
        const phrases = [];
        const words = text.toLowerCase().split(/\s+/);
        
        // Extract 2-3 word phrases
        for (let i = 0; i < words.length - 1; i++) {
            if (words[i].length > 2 && words[i + 1].length > 2) {
                phrases.push(`${words[i]} ${words[i + 1]}`);
                
                if (i < words.length - 2 && words[i + 2].length > 2) {
                    phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
                }
            }
        }
        
        return phrases;
    }

    /**
     * Generate cache key
     * @param {string} query - Search query
     * @param {SearchOptions} options - Search options
     * @returns {string} Cache key
     * @private
     */
    generateCacheKey(query, options) {
        const optionsString = JSON.stringify({
            fuzzySearch: options.fuzzySearch,
            maxResults: options.maxResults,
            minRelevance: options.minRelevance,
            categories: options.categories,
            languages: options.languages,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder
        });
        
        return `${query}|${optionsString}`;
    }

    /**
     * Cache search results
     * @param {string} cacheKey - Cache key
     * @param {SearchResult[]} results - Results to cache
     * @private
     */
    cacheResults(cacheKey, results) {
        if (this.queryCache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.queryCache.keys().next().value;
            this.queryCache.delete(firstKey);
        }
        
        this.queryCache.set(cacheKey, results);
    }

    /**
     * Update search performance metrics
     * @param {number} searchTime - Search time in milliseconds
     * @private
     */
    updateSearchMetrics(searchTime) {
        const totalTime = this.metrics.averageSearchTime * (this.metrics.totalSearches - 1);
        this.metrics.averageSearchTime = (totalTime + searchTime) / this.metrics.totalSearches;
    }

    /**
     * Clear all indexes
     * @private
     */
    clearIndexes() {
        Object.values(this.indexes).forEach(index => index.clear());
        this.documentMetadata.clear();
        this.termStats.termFrequency.clear();
        this.termStats.documentFrequency.clear();
        this.termStats.totalDocuments = 0;
        this.termStats.averageDocumentLength = 0;
    }

    /**
     * Get search statistics
     * @returns {Object} Search statistics
     */
    getStats() {
        return {
            indexStats: {
                totalDocuments: this.termStats.totalDocuments,
                totalTerms: this.indexes.termIndex.size,
                totalTrigrams: this.indexes.trigramIndex.size,
                totalPhrases: this.indexes.phraseIndex.size,
                averageDocumentLength: Math.round(this.termStats.averageDocumentLength)
            },
            searchStats: {
                totalSearches: this.metrics.totalSearches,
                averageSearchTime: Math.round(this.metrics.averageSearchTime * 100) / 100,
                cacheHitRate: this.metrics.totalSearches > 0 ? 
                    Math.round((this.metrics.cacheHits / this.metrics.totalSearches) * 100) : 0,
                cacheSize: this.queryCache.size
            },
            memoryUsage: {
                termIndexSize: this.indexes.termIndex.size,
                trigramIndexSize: this.indexes.trigramIndex.size,
                metadataSize: this.documentMetadata.size,
                cacheSize: this.queryCache.size
            }
        };
    }

    /**
     * Clear search cache
     */
    clearCache() {
        this.queryCache.clear();
        this.metrics.cacheHits = 0;
        this.metrics.cacheMisses = 0;
    }

    /**
     * Get suggestions for query
     * @param {string} partialQuery - Partial query string
     * @param {number} [maxSuggestions=5] - Maximum suggestions to return
     * @returns {string[]} Query suggestions
     */
    getSuggestions(partialQuery, maxSuggestions = 5) {
        if (!partialQuery || partialQuery.length < 2) return [];
        
        const suggestions = new Set();
        const normalizedQuery = this.textProcessor.normalizeText(partialQuery).toLowerCase();
        
        // Find matching terms
        for (const term of this.indexes.termIndex.keys()) {
            if (term.startsWith(normalizedQuery)) {
                suggestions.add(term);
                if (suggestions.size >= maxSuggestions) break;
            }
        }
        
        // Find matching keywords
        for (const keyword of this.indexes.keywordIndex.keys()) {
            if (keyword.startsWith(normalizedQuery) && !suggestions.has(keyword)) {
                suggestions.add(keyword);
                if (suggestions.size >= maxSuggestions) break;
            }
        }
        
        return Array.from(suggestions).slice(0, maxSuggestions);
    }
}

export default SearchEngine;
