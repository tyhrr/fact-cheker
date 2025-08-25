/**
 * @fileoverview Text processing utilities for Croatian Labor Law database
 * Provides advanced text analysis, tokenization, and search functionality
 * @version 2.1.0
 */

/**
 * @typedef {Object} TextAnalysis
 * @property {string[]} tokens - Tokenized words
 * @property {string[]} stems - Stemmed words
 * @property {string[]} trigrams - Trigram combinations
 * @property {number} readabilityScore - Text readability score
 * @property {string[]} keywords - Extracted keywords
 * @property {Object} metadata - Additional metadata
 */

/**
 * @typedef {Object} SearchTokens
 * @property {string[]} terms - Individual search terms
 * @property {string[]} phrases - Quoted phrases
 * @property {string[]} operators - Boolean operators (AND, OR, NOT)
 * @property {string[]} wildcards - Wildcard patterns
 * @property {Object} filters - Parsed filters
 */

/**
 * TextProcessor class for advanced text analysis and search processing
 * Handles Croatian language specifics and provides comprehensive text utilities
 */
export class TextProcessor {
    constructor() {
        // Croatian language specific patterns
        this.croatianStopWords = new Set([
            'i', 'u', 'na', 'za', 'od', 'do', 'je', 'se', 'da', 'su', 'to', 'ili',
            'kao', 'ima', 'ali', 'ako', 'kod', 'pod', 'nad', 'pred', 'kroz', 'bez',
            'biti', 'biti će', 'biti su', 'bio', 'bila', 'bilo', 'bili', 'bile',
            'ovaj', 'ova', 'ovo', 'ovog', 'ove', 'ovom', 'taj', 'ta', 'to', 'tog',
            'te', 'tom', 'neki', 'neka', 'neko', 'nekog', 'neke', 'nekom',
            'jedan', 'jedna', 'jedno', 'jednog', 'jedne', 'jednom'
        ]);
        
        // Croatian diacritics mapping for normalization
        this.diacriticsMap = {
            'č': 'c', 'ć': 'c', 'đ': 'd', 'š': 's', 'ž': 'z',
            'Č': 'C', 'Ć': 'C', 'Đ': 'D', 'Š': 'S', 'Ž': 'Z'
        };
        
        // Legal terminology patterns
        this.legalTermPatterns = [
            /članak\s+\d+/gi,
            /stavak\s+\d+/gi,
            /točka\s+\d+/gi,
            /zakon\s+o\s+[\w\s]+/gi,
            /pravilnik\s+o\s+[\w\s]+/gi,
            /uredba\s+o\s+[\w\s]+/gi
        ];
        
        // Sentence boundary patterns
        this.sentenceBoundaries = /[.!?]+\s+/g;
        
        // Word tokenization pattern
        this.wordPattern = /\b[\wčćđšžČĆĐŠŽ]+\b/g;
        
        // Initialize caches
        this.stemCache = new Map();
        this.trigramCache = new Map();
        this.analysisCache = new Map();
    }

    /**
     * Analyze text and extract comprehensive information
     * @param {string} text - Text to analyze
     * @param {Object} [options] - Analysis options
     * @param {boolean} [options.includeStems=true] - Include word stems
     * @param {boolean} [options.includeTrigrams=true] - Include trigrams
     * @param {boolean} [options.includeKeywords=true] - Extract keywords
     * @param {boolean} [options.calculateReadability=true] - Calculate readability
     * @returns {TextAnalysis} Comprehensive text analysis
     */
    analyzeText(text, options = {}) {
        const {
            includeStems = true,
            includeTrigrams = true,
            includeKeywords = true,
            calculateReadability = true
        } = options;
        
        // Check cache first
        const cacheKey = `${text.substring(0, 100)}_${JSON.stringify(options)}`;
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }
        
        const analysis = {
            tokens: [],
            stems: [],
            trigrams: [],
            readabilityScore: 0,
            keywords: [],
            metadata: {}
        };
        
        // Tokenize text
        analysis.tokens = this.tokenize(text);
        
        // Generate stems if requested
        if (includeStems) {
            analysis.stems = analysis.tokens.map(token => this.stemWord(token));
        }
        
        // Generate trigrams if requested
        if (includeTrigrams) {
            analysis.trigrams = this.generateTrigrams(text);
        }
        
        // Extract keywords if requested
        if (includeKeywords) {
            analysis.keywords = this.extractKeywords(text, analysis.tokens);
        }
        
        // Calculate readability if requested
        if (calculateReadability) {
            analysis.readabilityScore = this.calculateReadability(text, analysis.tokens);
        }
        
        // Add metadata
        analysis.metadata = {
            wordCount: analysis.tokens.length,
            sentenceCount: this.countSentences(text),
            avgWordsPerSentence: analysis.tokens.length / Math.max(1, this.countSentences(text)),
            legalTerms: this.extractLegalTerms(text),
            languageDetected: this.detectLanguage(text),
            complexity: this.calculateComplexity(text, analysis.tokens)
        };
        
        // Cache the result
        this.analysisCache.set(cacheKey, analysis);
        
        return analysis;
    }

    /**
     * Tokenize text into words
     * @param {string} text - Text to tokenize
     * @returns {string[]} Array of tokens
     */
    tokenize(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }
        
        // Extract words using pattern
        const matches = text.match(this.wordPattern) || [];
        
        // Normalize and filter tokens
        return matches
            .map(token => this.normalizeWord(token.toLowerCase()))
            .filter(token => token.length > 1 && !this.croatianStopWords.has(token))
            .filter((token, index, array) => array.indexOf(token) === index); // Remove duplicates
    }

    /**
     * Normalize Croatian word by removing diacritics and standardizing
     * @param {string} word - Word to normalize
     * @returns {string} Normalized word
     */
    normalizeWord(word) {
        return word.replace(/[čćđšžČĆĐŠŽ]/g, char => this.diacriticsMap[char] || char);
    }

    /**
     * Generate stem for Croatian word (simplified stemming)
     * @param {string} word - Word to stem
     * @returns {string} Stemmed word
     */
    stemWord(word) {
        if (!word || typeof word !== 'string') {
            return '';
        }
        
        // Check cache first
        if (this.stemCache.has(word)) {
            return this.stemCache.get(word);
        }
        
        let stem = word.toLowerCase();
        
        // Croatian suffixes to remove (simplified approach)
        const suffixes = [
            'anja', 'enje', 'inja', 'unja', 'ava', 'eva', 'iva', 'ova',
            'an', 'en', 'in', 'un', 'ar', 'er', 'ir', 'or', 'ur',
            'ak', 'ek', 'ik', 'ok', 'uk', 'al', 'el', 'il', 'ol', 'ul',
            'am', 'em', 'im', 'om', 'um', 'at', 'et', 'it', 'ot', 'ut',
            'av', 'ev', 'iv', 'ov', 'uv'
        ];
        
        // Sort by length (longest first) to avoid partial matches
        suffixes.sort((a, b) => b.length - a.length);
        
        for (const suffix of suffixes) {
            if (stem.endsWith(suffix) && stem.length > suffix.length + 2) {
                stem = stem.slice(0, -suffix.length);
                break;
            }
        }
        
        // Cache the result
        this.stemCache.set(word, stem);
        
        return stem;
    }

    /**
     * Generate trigrams for improved fuzzy search
     * @param {string} text - Text to process
     * @returns {string[]} Array of trigrams
     */
    generateTrigrams(text) {
        if (!text || typeof text !== 'string' || text.length < 3) {
            return [];
        }
        
        // Check cache first
        const cacheKey = text.substring(0, 100);
        if (this.trigramCache.has(cacheKey)) {
            return this.trigramCache.get(cacheKey);
        }
        
        const normalized = this.normalizeWord(text.toLowerCase());
        const trigrams = [];
        
        // Add padding for better boundary matching
        const padded = `__${normalized}__`;
        
        for (let i = 0; i <= padded.length - 3; i++) {
            trigrams.push(padded.substring(i, i + 3));
        }
        
        // Remove duplicates
        const uniqueTrigrams = [...new Set(trigrams)];
        
        // Cache the result
        this.trigramCache.set(cacheKey, uniqueTrigrams);
        
        return uniqueTrigrams;
    }

    /**
     * Parse search query into structured tokens
     * @param {string} query - Search query to parse
     * @returns {SearchTokens} Parsed search tokens
     */
    parseSearchQuery(query) {
        if (!query || typeof query !== 'string') {
            return {
                terms: [],
                phrases: [],
                operators: [],
                wildcards: [],
                filters: {}
            };
        }
        
        const result = {
            terms: [],
            phrases: [],
            operators: [],
            wildcards: [],
            filters: {}
        };
        
        let processedQuery = query.trim();
        
        // Extract quoted phrases
        const phraseMatches = processedQuery.match(/"([^"]+)"/g) || [];
        phraseMatches.forEach(match => {
            const phrase = match.slice(1, -1); // Remove quotes
            result.phrases.push(phrase);
            processedQuery = processedQuery.replace(match, '');
        });
        
        // Extract operators
        const operatorMatches = processedQuery.match(/\b(AND|OR|NOT)\b/gi) || [];
        result.operators = operatorMatches.map(op => op.toUpperCase());
        processedQuery = processedQuery.replace(/\b(AND|OR|NOT)\b/gi, '');
        
        // Extract filters (field:value format)
        const filterMatches = processedQuery.match(/(\w+):(\w+)/g) || [];
        filterMatches.forEach(match => {
            const [field, value] = match.split(':');
            result.filters[field] = value;
            processedQuery = processedQuery.replace(match, '');
        });
        
        // Extract wildcard terms
        const wildcardMatches = processedQuery.match(/\w*[*?]\w*/g) || [];
        result.wildcards = wildcardMatches;
        processedQuery = processedQuery.replace(/\w*[*?]\w*/g, '');
        
        // Extract remaining terms
        const remainingTerms = this.tokenize(processedQuery);
        result.terms = remainingTerms.filter(term => 
            !result.operators.includes(term.toUpperCase())
        );
        
        return result;
    }

    /**
     * Calculate similarity between two texts using trigrams
     * @param {string} text1 - First text
     * @param {string} text2 - Second text
     * @returns {number} Similarity score (0-1)
     */
    calculateSimilarity(text1, text2) {
        if (!text1 || !text2) {
            return 0;
        }
        
        const trigrams1 = new Set(this.generateTrigrams(text1));
        const trigrams2 = new Set(this.generateTrigrams(text2));
        
        const intersection = new Set([...trigrams1].filter(t => trigrams2.has(t)));
        const union = new Set([...trigrams1, ...trigrams2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    /**
     * Extract keywords from text using frequency and position analysis
     * @param {string} text - Text to analyze
     * @param {string[]} tokens - Pre-tokenized words
     * @returns {string[]} Extracted keywords
     */
    extractKeywords(text, tokens) {
        if (!tokens || tokens.length === 0) {
            return [];
        }
        
        // Calculate word frequencies
        const frequencies = {};
        tokens.forEach(token => {
            frequencies[token] = (frequencies[token] || 0) + 1;
        });
        
        // Calculate position scores (words appearing earlier get higher scores)
        const positionScores = {};
        tokens.forEach((token, index) => {
            if (!positionScores[token]) {
                positionScores[token] = 1 - (index / tokens.length);
            }
        });
        
        // Calculate combined scores
        const scores = {};
        Object.keys(frequencies).forEach(word => {
            const frequency = frequencies[word];
            const position = positionScores[word] || 0;
            const length = word.length;
            
            // Combine frequency, position, and length factors
            scores[word] = frequency * position * Math.log(length + 1);
        });
        
        // Sort by score and return top keywords
        return Object.keys(scores)
            .sort((a, b) => scores[b] - scores[a])
            .slice(0, 10) // Top 10 keywords
            .filter(word => word.length > 2); // Filter short words
    }

    /**
     * Calculate text readability score (simplified for Croatian)
     * @param {string} text - Text to analyze
     * @param {string[]} tokens - Pre-tokenized words
     * @returns {number} Readability score (0-100, higher = more readable)
     */
    calculateReadability(text, tokens) {
        if (!text || !tokens || tokens.length === 0) {
            return 0;
        }
        
        const sentences = this.countSentences(text);
        const words = tokens.length;
        const avgWordsPerSentence = words / Math.max(1, sentences);
        const avgSyllablesPerWord = this.calculateAvgSyllables(tokens);
        
        // Simplified readability formula (adapted from Flesch Reading Ease)
        const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        
        // Normalize to 0-100 scale
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Count sentences in text
     * @param {string} text - Text to analyze
     * @returns {number} Number of sentences
     */
    countSentences(text) {
        if (!text) return 0;
        return (text.match(this.sentenceBoundaries) || []).length + 1;
    }

    /**
     * Calculate average syllables per word (approximation for Croatian)
     * @param {string[]} tokens - Array of words
     * @returns {number} Average syllables per word
     */
    calculateAvgSyllables(tokens) {
        if (!tokens || tokens.length === 0) return 0;
        
        const totalSyllables = tokens.reduce((sum, word) => {
            return sum + this.countSyllables(word);
        }, 0);
        
        return totalSyllables / tokens.length;
    }

    /**
     * Count syllables in a Croatian word (approximation)
     * @param {string} word - Word to analyze
     * @returns {number} Number of syllables
     */
    countSyllables(word) {
        if (!word) return 0;
        
        // Croatian vowels
        const vowels = 'aeiouAEIOU';
        let count = 0;
        let prevWasVowel = false;
        
        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i]);
            if (isVowel && !prevWasVowel) {
                count++;
            }
            prevWasVowel = isVowel;
        }
        
        // Minimum one syllable per word
        return Math.max(1, count);
    }

    /**
     * Extract legal terms from text
     * @param {string} text - Text to analyze
     * @returns {string[]} Extracted legal terms
     */
    extractLegalTerms(text) {
        if (!text) return [];
        
        const legalTerms = [];
        
        this.legalTermPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            legalTerms.push(...matches);
        });
        
        return [...new Set(legalTerms)]; // Remove duplicates
    }

    /**
     * Detect text language (simplified)
     * @param {string} text - Text to analyze
     * @returns {string} Detected language code
     */
    detectLanguage(text) {
        if (!text) return 'unknown';
        
        // Simple heuristic based on Croatian-specific characters
        const croatianChars = /[čćđšžČĆĐŠŽ]/g;
        const croatianMatches = (text.match(croatianChars) || []).length;
        
        // Croatian-specific words
        const croatianWords = ['članak', 'stavak', 'zakon', 'pravilnik', 'uredba', 'propis'];
        const croatianWordMatches = croatianWords.filter(word => 
            text.toLowerCase().includes(word)
        ).length;
        
        if (croatianMatches > 0 || croatianWordMatches > 0) {
            return 'hr';
        }
        
        // Simple English detection
        const englishWords = ['article', 'section', 'law', 'regulation', 'provision'];
        const englishWordMatches = englishWords.filter(word => 
            text.toLowerCase().includes(word)
        ).length;
        
        if (englishWordMatches > croatianWordMatches) {
            return 'en';
        }
        
        return 'hr'; // Default to Croatian for legal texts
    }

    /**
     * Calculate text complexity score
     * @param {string} text - Text to analyze
     * @param {string[]} tokens - Pre-tokenized words
     * @returns {number} Complexity score (0-10)
     */
    calculateComplexity(text, tokens) {
        if (!text || !tokens || tokens.length === 0) return 0;
        
        let complexity = 0;
        
        // Average word length factor
        const avgWordLength = tokens.reduce((sum, word) => sum + word.length, 0) / tokens.length;
        complexity += Math.min(avgWordLength / 2, 3);
        
        // Sentence length factor
        const sentences = this.countSentences(text);
        const avgSentenceLength = tokens.length / Math.max(1, sentences);
        complexity += Math.min(avgSentenceLength / 10, 3);
        
        // Legal terms factor
        const legalTerms = this.extractLegalTerms(text);
        complexity += Math.min(legalTerms.length / 2, 2);
        
        // Vocabulary diversity factor
        const uniqueWords = new Set(tokens);
        const diversity = uniqueWords.size / tokens.length;
        complexity += Math.min(diversity * 2, 2);
        
        return Math.min(complexity, 10);
    }

    /**
     * Clean up caches to prevent memory leaks
     * @param {number} [maxSize=1000] - Maximum cache size
     */
    cleanupCaches(maxSize = 1000) {
        if (this.stemCache.size > maxSize) {
            const entries = [...this.stemCache.entries()];
            this.stemCache.clear();
            // Keep most recent entries
            entries.slice(-maxSize / 2).forEach(([key, value]) => {
                this.stemCache.set(key, value);
            });
        }
        
        if (this.trigramCache.size > maxSize) {
            const entries = [...this.trigramCache.entries()];
            this.trigramCache.clear();
            entries.slice(-maxSize / 2).forEach(([key, value]) => {
                this.trigramCache.set(key, value);
            });
        }
        
        if (this.analysisCache.size > maxSize) {
            const entries = [...this.analysisCache.entries()];
            this.analysisCache.clear();
            entries.slice(-maxSize / 2).forEach(([key, value]) => {
                this.analysisCache.set(key, value);
            });
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            stemCache: this.stemCache.size,
            trigramCache: this.trigramCache.size,
            analysisCache: this.analysisCache.size,
            totalMemoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Estimate memory usage of caches (rough approximation)
     * @returns {number} Estimated memory usage in bytes
     * @private
     */
    estimateMemoryUsage() {
        let usage = 0;
        
        // Estimate stem cache
        this.stemCache.forEach((value, key) => {
            usage += (key.length + value.length) * 2; // Approximate UTF-16 encoding
        });
        
        // Estimate trigram cache
        this.trigramCache.forEach((value, key) => {
            usage += key.length * 2 + value.length * value[0]?.length * 2;
        });
        
        // Estimate analysis cache (rough approximation)
        usage += this.analysisCache.size * 1000; // Approximate size per analysis
        
        return usage;
    }
}

export default TextProcessor;
