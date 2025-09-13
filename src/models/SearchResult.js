/**
 * @fileoverview SearchResult model for Croatian Labor Law database
 * Represents search results with relevance scoring and metadata
 * @version 2.2.0
 */

/**
 * @typedef {Object} SearchMatch
 * @property {string} field - Field where match was found (title, content, keywords, etc.)
 * @property {string} text - Matched text snippet
 * @property {number} position - Position of match in the field
 * @property {number} score - Match score for this specific match
 */

/**
 * @typedef {Object} SearchHighlight
 * @property {string} field - Field to highlight
 * @property {number} start - Start position of highlight
 * @property {number} end - End position of highlight
 * @property {string} type - Type of highlight (exact, partial, fuzzy)
 */

/**
 * SearchResult class for managing search results with enhanced metadata
 * Provides detailed information about why an article matched a search query
 */
export class SearchResult {
    /**
     * Create a new SearchResult instance
     * @param {Object} data - Search result data
     * @param {import('./Article.js').Article} data.article - The matched article
     * @param {number} data.relevanceScore - Overall relevance score (0-100)
     * @param {SearchMatch[]} data.matches - Array of specific matches found
     * @param {SearchHighlight[]} [data.highlights] - Text highlights for display
     * @param {string} data.searchTerm - Original search term
     * @param {Object} [data.searchOptions] - Search options used
     * @param {number} [data.rank] - Result ranking position
     */
    constructor(data) {
        console.log('Creating SearchResult with data:', {
            hasArticle: !!data.article,
            articleId: data.article?.id,
            articleTitle: data.article?.title?.substring(0, 50),
            relevanceScore: data.relevanceScore,
            searchTerm: data.searchTerm
        });
        
        this.validateData(data);
        
        // Core properties
        this.id = data.id || data.article?.id || Math.random().toString(36);
        this.article = data.article;
        this.relevanceScore = data.relevanceScore;
        this.matches = Array.isArray(data.matches) ? [...data.matches] : [];
        this.highlights = Array.isArray(data.highlights) ? [...data.highlights] : [];
        this.searchTerm = data.searchTerm;
        this.searchOptions = data.searchOptions || {};
        this.rank = data.rank || 0;
        
        // Metadata
        this.timestamp = new Date().toISOString();
        this.searchDuration = 0; // Will be set by search engine
        
        // Generate derived properties
        this.generateSnippet();
        this.categorizeMatches();
    }

    /**
     * Validate search result data
     * @param {Object} data - Data to validate
     * @throws {Error} If required fields are missing or invalid
     */
    validateData(data) {
        if (!data.article) {
            throw new Error('SearchResult requires an article');
        }
        
        if (typeof data.relevanceScore !== 'number' || data.relevanceScore < 0 || data.relevanceScore > 100) {
            throw new Error('Relevance score must be a number between 0 and 100');
        }
        
        if (!data.searchTerm || typeof data.searchTerm !== 'string') {
            throw new Error('Search term must be a non-empty string');
        }
    }

    /**
     * Generate a text snippet showing the best match
     * @private
     */
    generateSnippet() {
        const SNIPPET_LENGTH = 200;
        const CONTEXT_LENGTH = 50;
        
        if (this.matches.length === 0) {
            // No specific matches, use beginning of content
            this.snippet = this.article.content.substring(0, SNIPPET_LENGTH);
            if (this.article.content.length > SNIPPET_LENGTH) {
                this.snippet += '...';
            }
            return;
        }
        
        // Find the best match (highest score)
        const bestMatch = this.matches.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        let text = '';
        let startPos = 0;
        
        // Get text based on match field
        switch (bestMatch.field) {
            case 'title':
                text = this.article.title;
                break;
            case 'content':
                text = this.article.content;
                break;
            case 'keywords':
                text = this.article.keywords.join(', ');
                break;
            case 'faq':
                // Find the specific FAQ that matched
                const faq = this.article.frequentlyAskedQuestions.find(f => 
                    f.question.includes(this.searchTerm) || f.answer.includes(this.searchTerm)
                );
                text = faq ? `${faq.question} ${faq.answer}` : this.article.content;
                break;
            default:
                text = this.article.content;
        }
        
        if (bestMatch.position !== undefined) {
            // Extract context around the match
            startPos = Math.max(0, bestMatch.position - CONTEXT_LENGTH);
            const endPos = Math.min(text.length, bestMatch.position + bestMatch.text.length + CONTEXT_LENGTH);
            
            this.snippet = text.substring(startPos, endPos);
            
            // Add ellipsis if we're not at the beginning/end
            if (startPos > 0) {
                this.snippet = '...' + this.snippet;
            }
            if (endPos < text.length) {
                this.snippet += '...';
            }
        } else {
            // No position info, use beginning of text
            this.snippet = text.substring(0, SNIPPET_LENGTH);
            if (text.length > SNIPPET_LENGTH) {
                this.snippet += '...';
            }
        }
        
        // Clean up snippet
        this.snippet = this.snippet.trim();
    }

    /**
     * Categorize matches by type and field
     * @private
     */
    categorizeMatches() {
        this.matchCategories = {
            exact: [],
            partial: [],
            fuzzy: [],
            byField: {
                title: [],
                content: [],
                keywords: [],
                faq: [],
                examples: [],
                references: []
            }
        };
        
        this.matches.forEach(match => {
            // Categorize by match type
            if (match.text.toLowerCase() === this.searchTerm.toLowerCase()) {
                this.matchCategories.exact.push(match);
            } else if (match.text.toLowerCase().includes(this.searchTerm.toLowerCase())) {
                this.matchCategories.partial.push(match);
            } else {
                this.matchCategories.fuzzy.push(match);
            }
            
            // Categorize by field
            if (this.matchCategories.byField[match.field]) {
                this.matchCategories.byField[match.field].push(match);
            }
        });
        
        // Calculate category scores
        this.exactMatchCount = this.matchCategories.exact.length;
        this.partialMatchCount = this.matchCategories.partial.length;
        this.fuzzyMatchCount = this.matchCategories.fuzzy.length;
    }

    /**
     * Add a match to this search result
     * @param {SearchMatch} match - Match to add
     */
    addMatch(match) {
        if (!match || !match.field || !match.text) {
            throw new Error('Match must include field and text');
        }
        
        this.matches.push({
            field: match.field,
            text: match.text,
            position: match.position || 0,
            score: match.score || 0
        });
        
        // Regenerate derived properties
        this.generateSnippet();
        this.categorizeMatches();
    }

    /**
     * Add a highlight to this search result
     * @param {SearchHighlight} highlight - Highlight to add
     */
    addHighlight(highlight) {
        if (!highlight || !highlight.field || highlight.start === undefined || highlight.end === undefined) {
            throw new Error('Highlight must include field, start, and end positions');
        }
        
        this.highlights.push({
            field: highlight.field,
            start: highlight.start,
            end: highlight.end,
            type: highlight.type || 'exact'
        });
    }

    /**
     * Get highlighted text for a specific field
     * @param {string} field - Field to get highlighted text for
     * @param {string} [wrapTag='mark'] - HTML tag to wrap highlights
     * @returns {string} Text with highlights applied
     */
    getHighlightedText(field, wrapTag = 'mark') {
        let text = '';
        
        // Get text for the field
        switch (field) {
            case 'title':
                text = this.article.title;
                break;
            case 'content':
                text = this.article.content;
                break;
            case 'snippet':
                text = this.snippet;
                break;
            default:
                return '';
        }
        
        // Get highlights for this field
        const fieldHighlights = this.highlights
            .filter(h => h.field === field)
            .sort((a, b) => b.start - a.start); // Sort by start position, descending
        
        if (fieldHighlights.length === 0) {
            return text;
        }
        
        // Apply highlights from end to beginning to preserve positions
        let result = text;
        fieldHighlights.forEach(highlight => {
            const before = result.substring(0, highlight.start);
            const highlighted = result.substring(highlight.start, highlight.end);
            const after = result.substring(highlight.end);
            
            result = `${before}<${wrapTag} class="search-highlight ${highlight.type}">${highlighted}</${wrapTag}>${after}`;
        });
        
        return result;
    }

    /**
     * Get match summary for display
     * @returns {Object} Summary of matches found
     */
    getMatchSummary() {
        const summary = {
            totalMatches: this.matches.length,
            exactMatches: this.exactMatchCount,
            partialMatches: this.partialMatchCount,
            fuzzyMatches: this.fuzzyMatchCount,
            fieldMatches: {}
        };
        
        // Count matches by field
        Object.keys(this.matchCategories.byField).forEach(field => {
            const count = this.matchCategories.byField[field].length;
            if (count > 0) {
                summary.fieldMatches[field] = count;
            }
        });
        
        return summary;
    }

    /**
     * Check if this result is better than another result
     * @param {SearchResult} other - Other search result to compare
     * @returns {boolean} True if this result is better
     */
    isBetterThan(other) {
        if (!other || !(other instanceof SearchResult)) {
            return true;
        }
        
        // Primary comparison: relevance score
        if (this.relevanceScore !== other.relevanceScore) {
            return this.relevanceScore > other.relevanceScore;
        }
        
        // Secondary comparison: exact matches
        if (this.exactMatchCount !== other.exactMatchCount) {
            return this.exactMatchCount > other.exactMatchCount;
        }
        
        // Tertiary comparison: total matches
        if (this.matches.length !== other.matches.length) {
            return this.matches.length > other.matches.length;
        }
        
        // Quaternary comparison: article access count
        return this.article.accessCount > other.article.accessCount;
    }

    /**
     * Export search result to JSON
     * @param {Object} [options] - Export options
     * @param {boolean} [options.includeArticle=false] - Include full article data
     * @param {boolean} [options.includeMatches=true] - Include match details
     * @param {boolean} [options.includeHighlights=true] - Include highlight data
     * @returns {Object} JSON representation
     */
    toJSON(options = {}) {
        const {
            includeArticle = false,
            includeMatches = true,
            includeHighlights = true
        } = options;
        
        const result = {
            articleId: this.article.id,
            relevanceScore: this.relevanceScore,
            searchTerm: this.searchTerm,
            rank: this.rank,
            snippet: this.snippet,
            timestamp: this.timestamp,
            searchDuration: this.searchDuration
        };
        
        if (includeArticle) {
            result.article = this.article.toJSON();
        } else {
            // Include minimal article info
            result.article = {
                id: this.article.id,
                title: this.article.title,
                category: this.article.category
            };
        }
        
        if (includeMatches) {
            result.matches = [...this.matches];
            result.matchSummary = this.getMatchSummary();
        }
        
        if (includeHighlights) {
            result.highlights = [...this.highlights];
        }
        
        return result;
    }

    /**
     * Create SearchResult from JSON data
     * @param {Object} json - JSON data
     * @param {import('./Article.js').Article} article - Article instance
     * @returns {SearchResult} New SearchResult instance
     */
    static fromJSON(json, article) {
        return new SearchResult({
            article: article,
            relevanceScore: json.relevanceScore,
            matches: json.matches || [],
            highlights: json.highlights || [],
            searchTerm: json.searchTerm,
            searchOptions: json.searchOptions || {},
            rank: json.rank || 0
        });
    }

    /**
     * Compare two search results for sorting
     * @param {SearchResult} a - First result
     * @param {SearchResult} b - Second result
     * @returns {number} Comparison result (-1, 0, 1)
     */
    static compare(a, b) {
        // Primary sort: relevance score (descending)
        if (a.relevanceScore !== b.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
        }
        
        // Secondary sort: exact matches (descending)
        if (a.exactMatchCount !== b.exactMatchCount) {
            return b.exactMatchCount - a.exactMatchCount;
        }
        
        // Tertiary sort: total matches (descending)
        if (a.matches.length !== b.matches.length) {
            return b.matches.length - a.matches.length;
        }
        
        // Quaternary sort: article access count (descending)
        return b.article.accessCount - a.article.accessCount;
    }
}

export default SearchResult;
