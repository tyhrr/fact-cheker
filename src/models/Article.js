/**
 * @fileoverview Article model for Croatian Labor Law database
 * Represents a single legal article with enhanced metadata and relationships
 * @version 2.2.0
 */

/**
 * @typedef {Object} LegalReference
 * @property {string} law - Name of the referenced law
 * @property {string} article - Article number or section
 * @property {string} description - Description of the reference
 * @property {string} url - URL to the referenced law
 */

/**
 * @typedef {Object} PracticalExample
 * @property {string} scenario - Description of the practical scenario
 * @property {string} application - How the article applies to the scenario
 * @property {string} outcome - Expected legal outcome
 * @property {string} dateAdded - ISO date when example was added
 */

/**
 * @typedef {Object} FAQ
 * @property {string} question - Frequently asked question
 * @property {string} answer - Comprehensive answer
 * @property {string[]} keywords - Related keywords for search
 * @property {number} popularity - How often this FAQ is accessed
 */

/**
 * @typedef {Object} CaseStudy
 * @property {string} caseId - Unique identifier for the case
 * @property {string} title - Case title or reference
 * @property {string} summary - Brief summary of the case
 * @property {string} ruling - Court ruling or decision
 * @property {string} date - Date of the ruling
 * @property {string} court - Court that made the ruling
 * @property {string} relevance - How this case relates to the article
 */

/**
 * Enhanced Article class for Croatian Labor Law
 * Provides comprehensive article management with metadata, relationships, and validation
 */
export class Article {
    /**
     * Create a new Article instance
     * @param {Object} data - Article data object
     * @param {string} data.id - Unique article identifier
     * @param {string} data.title - Article title
     * @param {string} data.content - Article content/text
     * @param {string} data.category - Article category
     * @param {string[]} data.keywords - Search keywords
     * @param {Object} data.translations - Multi-language translations
     * @param {string} [data.lastModified] - Last modification date (ISO string)
     * @param {string[]} [data.precedingArticles] - IDs of preceding articles
     * @param {string[]} [data.followingArticles] - IDs of following articles
     * @param {LegalReference[]} [data.legalReferences] - Cross-references to other laws
     * @param {PracticalExample[]} [data.practicalExamples] - Real-world examples
     * @param {FAQ[]} [data.frequentlyAskedQuestions] - Common questions and answers
     * @param {CaseStudy[]} [data.relatedCaseStudies] - Related judicial decisions
     */
    constructor(data) {
        this.validateData(data);
        
        // First, copy ALL original properties
        Object.assign(this, data);
        
        // Then override with enhanced versions where needed
        this.keywords = Array.isArray(data.keywords) ? [...data.keywords] : [];
        this.translations = data.translations || {};
        
        // Enhanced metadata (only set if not already present)
        if (!this.lastModified) this.lastModified = new Date().toISOString();
        if (!this.precedingArticles) this.precedingArticles = Array.isArray(data.precedingArticles) ? [...data.precedingArticles] : [];
        if (!this.followingArticles) this.followingArticles = Array.isArray(data.followingArticles) ? [...data.followingArticles] : [];
        if (!this.legalReferences) this.legalReferences = Array.isArray(data.legalReferences) ? [...data.legalReferences] : [];
        if (!this.practicalExamples) this.practicalExamples = Array.isArray(data.practicalExamples) ? [...data.practicalExamples] : [];
        if (!this.frequentlyAskedQuestions) this.frequentlyAskedQuestions = Array.isArray(data.frequentlyAskedQuestions) ? [...data.frequentlyAskedQuestions] : [];
        if (!this.relatedCaseStudies) this.relatedCaseStudies = Array.isArray(data.relatedCaseStudies) ? [...data.relatedCaseStudies] : [];
        
        // Performance and analytics
        this.accessCount = 0;
        this.lastAccessed = null;
        this.searchRelevanceScore = 0;
        
        // Validation flags
        this.isValid = true;
        this.validationErrors = [];
        
        // Generate derived properties
        this.generateSearchText();
        this.calculateComplexityScore();
    }

    /**
     * Validate article data structure
     * @param {Object} data - Data to validate
     * @throws {Error} If required fields are missing or invalid
     */
    validateData(data) {
        const required = ['id', 'title', 'content', 'category'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        if (typeof data.id !== 'string' || data.id.trim().length === 0) {
            throw new Error('Article ID must be a non-empty string');
        }
        
        if (typeof data.title !== 'string' || data.title.trim().length === 0) {
            throw new Error('Article title must be a non-empty string');
        }
        
        if (typeof data.content !== 'string' || data.content.trim().length === 0) {
            throw new Error('Article content must be a non-empty string');
        }
        
        if (typeof data.category !== 'string' || data.category.trim().length === 0) {
            throw new Error('Article category must be a non-empty string');
        }
    }

    /**
     * Generate combined search text for efficient searching
     * @private
     */
    generateSearchText() {
        const parts = [
            this.title,
            this.content,
            this.keywords.join(' '),
            this.category
        ];
        
        // Add translation text
        Object.values(this.translations).forEach(translation => {
            if (translation.title) parts.push(translation.title);
            if (translation.content) parts.push(translation.content);
        });
        
        // Add FAQ text
        this.frequentlyAskedQuestions.forEach(faq => {
            parts.push(faq.question, faq.answer, faq.keywords.join(' '));
        });
        
        this.searchText = parts.join(' ').toLowerCase();
    }

    /**
     * Calculate article complexity score based on various factors
     * @private
     */
    calculateComplexityScore() {
        let score = 0;
        
        // Content length factor
        score += Math.min(this.content.length / 1000, 10);
        
        // Legal references factor
        score += this.legalReferences.length * 2;
        
        // Keywords complexity
        score += this.keywords.length * 0.5;
        
        // FAQ complexity
        score += this.frequentlyAskedQuestions.length * 1.5;
        
        // Case studies complexity
        score += this.relatedCaseStudies.length * 3;
        
        this.complexityScore = Math.round(score * 10) / 10;
    }

    /**
     * Get article translation for specified language
     * @param {string} language - Language code (e.g., 'en', 'hr', 'de')
     * @returns {Object|null} Translation object or null if not found
     */
    getTranslation(language) {
        return this.translations[language] || null;
    }

    /**
     * Add or update translation for specified language
     * @param {string} language - Language code
     * @param {Object} translation - Translation object
     * @param {string} translation.title - Translated title
     * @param {string} translation.content - Translated content
     * @param {string[]} [translation.keywords] - Translated keywords
     */
    setTranslation(language, translation) {
        if (!language || typeof language !== 'string') {
            throw new Error('Language code must be a non-empty string');
        }
        
        if (!translation || !translation.title || !translation.content) {
            throw new Error('Translation must include title and content');
        }
        
        this.translations[language] = {
            title: translation.title,
            content: translation.content,
            keywords: translation.keywords || []
        };
        
        this.updateModificationDate();
        this.generateSearchText();
    }

    /**
     * Add a legal reference to this article
     * @param {LegalReference} reference - Legal reference to add
     */
    addLegalReference(reference) {
        if (!reference || !reference.law || !reference.article) {
            throw new Error('Legal reference must include law and article');
        }
        
        // Check for duplicates
        const exists = this.legalReferences.some(ref => 
            ref.law === reference.law && ref.article === reference.article
        );
        
        if (!exists) {
            this.legalReferences.push({
                law: reference.law,
                article: reference.article,
                description: reference.description || '',
                url: reference.url || ''
            });
            
            this.updateModificationDate();
            this.calculateComplexityScore();
        }
    }

    /**
     * Add a practical example to this article
     * @param {PracticalExample} example - Practical example to add
     */
    addPracticalExample(example) {
        if (!example || !example.scenario || !example.application) {
            throw new Error('Practical example must include scenario and application');
        }
        
        this.practicalExamples.push({
            scenario: example.scenario,
            application: example.application,
            outcome: example.outcome || '',
            dateAdded: new Date().toISOString()
        });
        
        this.updateModificationDate();
        this.calculateComplexityScore();
    }

    /**
     * Add a frequently asked question
     * @param {FAQ} faq - FAQ to add
     */
    addFAQ(faq) {
        if (!faq || !faq.question || !faq.answer) {
            throw new Error('FAQ must include question and answer');
        }
        
        this.frequentlyAskedQuestions.push({
            question: faq.question,
            answer: faq.answer,
            keywords: faq.keywords || [],
            popularity: 0
        });
        
        this.updateModificationDate();
        this.generateSearchText();
        this.calculateComplexityScore();
    }

    /**
     * Add a related case study
     * @param {CaseStudy} caseStudy - Case study to add
     */
    addCaseStudy(caseStudy) {
        if (!caseStudy || !caseStudy.caseId || !caseStudy.title) {
            throw new Error('Case study must include caseId and title');
        }
        
        // Check for duplicates
        const exists = this.relatedCaseStudies.some(cs => cs.caseId === caseStudy.caseId);
        
        if (!exists) {
            this.relatedCaseStudies.push({
                caseId: caseStudy.caseId,
                title: caseStudy.title,
                summary: caseStudy.summary || '',
                ruling: caseStudy.ruling || '',
                date: caseStudy.date || '',
                court: caseStudy.court || '',
                relevance: caseStudy.relevance || ''
            });
            
            this.updateModificationDate();
            this.calculateComplexityScore();
        }
    }

    /**
     * Mark article as accessed for analytics
     */
    markAsAccessed() {
        this.accessCount++;
        this.lastAccessed = new Date().toISOString();
    }

    /**
     * Update the last modified date
     * @private
     */
    updateModificationDate() {
        this.lastModified = new Date().toISOString();
    }

    /**
     * Check if article matches search criteria
     * @param {string} searchTerm - Term to search for
     * @param {Object} [options] - Search options
     * @param {boolean} [options.caseSensitive=false] - Case sensitive search
     * @param {boolean} [options.wholeWords=false] - Match whole words only
     * @param {string} [options.language] - Search in specific language
     * @returns {boolean} True if article matches search criteria
     */
    matches(searchTerm, options = {}) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return true;
        }
        
        let searchText = this.searchText;
        let term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
        
        // Search in specific language if specified
        if (options.language && this.translations[options.language]) {
            const translation = this.translations[options.language];
            searchText = `${translation.title} ${translation.content} ${translation.keywords?.join(' ') || ''}`.toLowerCase();
        }
        
        if (options.wholeWords) {
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            return regex.test(searchText);
        }
        
        return searchText.includes(term);
    }

    /**
     * Calculate search relevance score for given term
     * @param {string} searchTerm - Search term
     * @param {Object} [options] - Search options
     * @returns {number} Relevance score (0-100)
     */
    calculateRelevanceScore(searchTerm, options = {}) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return 0;
        }
        
        const term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
        let score = 0;
        
        // Title match (highest weight)
        if (this.title.toLowerCase().includes(term)) {
            score += 50;
            if (this.title.toLowerCase() === term) {
                score += 30; // Exact title match bonus
            }
        }
        
        // Keywords match
        const keywordMatches = this.keywords.filter(keyword => 
            keyword.toLowerCase().includes(term)
        ).length;
        score += keywordMatches * 15;
        
        // Content match
        const contentLower = this.content.toLowerCase();
        const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(contentMatches * 2, 20);
        
        // Category match
        if (this.category.toLowerCase().includes(term)) {
            score += 10;
        }
        
        // FAQ matches
        const faqMatches = this.frequentlyAskedQuestions.filter(faq =>
            faq.question.toLowerCase().includes(term) || 
            faq.answer.toLowerCase().includes(term)
        ).length;
        score += faqMatches * 5;
        
        // Normalize score and apply popularity boost
        score = Math.min(score, 100);
        if (this.accessCount > 0) {
            score += Math.min(this.accessCount * 0.1, 5);
        }
        
        this.searchRelevanceScore = Math.round(score * 10) / 10;
        return this.searchRelevanceScore;
    }

    /**
     * Export article to JSON with optional data filtering
     * @param {Object} [options] - Export options
     * @param {boolean} [options.includeAnalytics=false] - Include access statistics
     * @param {boolean} [options.includeMetadata=true] - Include metadata
     * @param {string[]} [options.languages] - Specific languages to export
     * @returns {Object} JSON representation of the article
     */
    toJSON(options = {}) {
        const {
            includeAnalytics = false,
            includeMetadata = true,
            languages = null
        } = options;
        
        const result = {
            id: this.id,
            title: this.title,
            content: this.content,
            category: this.category,
            keywords: [...this.keywords]
        };
        
        // Filter translations by language if specified
        if (languages && Array.isArray(languages)) {
            result.translations = {};
            languages.forEach(lang => {
                if (this.translations[lang]) {
                    result.translations[lang] = this.translations[lang];
                }
            });
        } else {
            result.translations = { ...this.translations };
        }
        
        if (includeMetadata) {
            result.lastModified = this.lastModified;
            result.precedingArticles = [...this.precedingArticles];
            result.followingArticles = [...this.followingArticles];
            result.legalReferences = [...this.legalReferences];
            result.practicalExamples = [...this.practicalExamples];
            result.frequentlyAskedQuestions = [...this.frequentlyAskedQuestions];
            result.relatedCaseStudies = [...this.relatedCaseStudies];
            result.complexityScore = this.complexityScore;
        }
        
        if (includeAnalytics) {
            result.accessCount = this.accessCount;
            result.lastAccessed = this.lastAccessed;
            result.searchRelevanceScore = this.searchRelevanceScore;
        }
        
        return result;
    }

    /**
     * Create Article instance from JSON data
     * @param {Object} json - JSON data
     * @returns {Article} New Article instance
     */
    static fromJSON(json) {
        return new Article(json);
    }

    /**
     * Validate article data against schema
     * @param {Object} data - Data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    static validateSchema(data) {
        const errors = [];
        
        try {
            // This would normally use a proper JSON schema validator
            // For now, we'll do basic validation
            if (!data.id) errors.push('Missing required field: id');
            if (!data.title) errors.push('Missing required field: title');
            if (!data.content) errors.push('Missing required field: content');
            if (!data.category) errors.push('Missing required field: category');
            
            return {
                isValid: errors.length === 0,
                errors
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [error.message]
            };
        }
    }
}

export default Article;
