/**
 * @fileoverview Data validation utilities for Croatian Labor Law database
 * Provides comprehensive validation for articles, search results, and user data
 * @version 2.1.0
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the data is valid
 * @property {ValidationError[]} errors - Array of validation errors
 * @property {string[]} warnings - Array of validation warnings
 * @property {Object} metadata - Additional validation metadata
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field that failed validation
 * @property {string} code - Error code
 * @property {string} message - Human-readable error message
 * @property {any} value - The invalid value
 * @property {Object} [context] - Additional context about the error
 */

/**
 * @typedef {Object} ValidationWarning
 * @property {string} field - Field with warning
 * @property {string} code - Warning code
 * @property {string} message - Human-readable warning message
 * @property {any} value - The value that triggered the warning
 */

/**
 * Validator class for comprehensive data validation
 * Handles article schema validation, data consistency checks, and user input validation
 */
export class Validator {
    constructor() {
        // Article schema definition
        this.articleSchema = {
            id: { type: 'string', required: true, minLength: 1, maxLength: 100 },
            title: { type: 'string', required: true, minLength: 1, maxLength: 500 },
            content: { type: 'string', required: true, minLength: 10, maxLength: 50000 },
            category: { type: 'string', required: true, minLength: 1, maxLength: 100 },
            keywords: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 50 }, maxItems: 20 },
            translations: { type: 'object', properties: this.getTranslationSchema() },
            lastModified: { type: 'string', format: 'date-time' },
            precedingArticles: { type: 'array', items: { type: 'string' }, maxItems: 10 },
            followingArticles: { type: 'array', items: { type: 'string' }, maxItems: 10 },
            legalReferences: { type: 'array', items: this.getLegalReferenceSchema(), maxItems: 20 },
            practicalExamples: { type: 'array', items: this.getPracticalExampleSchema(), maxItems: 10 },
            frequentlyAskedQuestions: { type: 'array', items: this.getFAQSchema(), maxItems: 15 },
            relatedCaseStudies: { type: 'array', items: this.getCaseStudySchema(), maxItems: 10 }
        };
        
        // Validation rules
        this.validationRules = {
            maxContentLength: 50000,
            maxTitleLength: 500,
            maxKeywords: 20,
            maxReferences: 20,
            maxExamples: 10,
            maxFAQs: 15,
            maxCaseStudies: 10,
            allowedLanguages: ['hr', 'en', 'de', 'fr', 'it'],
            allowedCategories: [
                'radni-odnosi',
                'radno-vrijeme',
                'place-i-naknade',
                'sigurnost-i-zdravlje',
                'sindikati',
                'kolektivni-ugovori',
                'ostalo'
            ]
        };
        
        // Error codes and messages
        this.errorMessages = {
            REQUIRED_FIELD: 'Field is required',
            INVALID_TYPE: 'Invalid data type',
            TOO_SHORT: 'Value is too short',
            TOO_LONG: 'Value is too long',
            INVALID_FORMAT: 'Invalid format',
            INVALID_LANGUAGE: 'Invalid language code',
            INVALID_CATEGORY: 'Invalid category',
            DUPLICATE_VALUE: 'Duplicate value found',
            INVALID_REFERENCE: 'Invalid reference',
            MISSING_TRANSLATION: 'Missing required translation',
            INCONSISTENT_DATA: 'Inconsistent data detected',
            INVALID_DATE: 'Invalid date format',
            INVALID_URL: 'Invalid URL format',
            CIRCULAR_REFERENCE: 'Circular reference detected'
        };
    }

    /**
     * Get translation schema definition
     * @returns {Object} Translation schema
     * @private
     */
    getTranslationSchema() {
        return {
            type: 'object',
            patternProperties: {
                '^[a-z]{2}$': {
                    type: 'object',
                    properties: {
                        title: { type: 'string', required: true, minLength: 1, maxLength: 500 },
                        content: { type: 'string', required: true, minLength: 10, maxLength: 50000 },
                        keywords: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['title', 'content']
                }
            }
        };
    }

    /**
     * Get legal reference schema definition
     * @returns {Object} Legal reference schema
     * @private
     */
    getLegalReferenceSchema() {
        return {
            type: 'object',
            properties: {
                law: { type: 'string', required: true, minLength: 1, maxLength: 200 },
                article: { type: 'string', required: true, minLength: 1, maxLength: 50 },
                description: { type: 'string', maxLength: 1000 },
                url: { type: 'string', format: 'url', maxLength: 500 }
            },
            required: ['law', 'article']
        };
    }

    /**
     * Get practical example schema definition
     * @returns {Object} Practical example schema
     * @private
     */
    getPracticalExampleSchema() {
        return {
            type: 'object',
            properties: {
                scenario: { type: 'string', required: true, minLength: 10, maxLength: 1000 },
                application: { type: 'string', required: true, minLength: 10, maxLength: 1000 },
                outcome: { type: 'string', maxLength: 1000 },
                dateAdded: { type: 'string', format: 'date-time' }
            },
            required: ['scenario', 'application']
        };
    }

    /**
     * Get FAQ schema definition
     * @returns {Object} FAQ schema
     * @private
     */
    getFAQSchema() {
        return {
            type: 'object',
            properties: {
                question: { type: 'string', required: true, minLength: 5, maxLength: 500 },
                answer: { type: 'string', required: true, minLength: 10, maxLength: 2000 },
                keywords: { type: 'array', items: { type: 'string' }, maxItems: 10 },
                popularity: { type: 'number', minimum: 0 }
            },
            required: ['question', 'answer']
        };
    }

    /**
     * Get case study schema definition
     * @returns {Object} Case study schema
     * @private
     */
    getCaseStudySchema() {
        return {
            type: 'object',
            properties: {
                caseId: { type: 'string', required: true, minLength: 1, maxLength: 100 },
                title: { type: 'string', required: true, minLength: 1, maxLength: 300 },
                summary: { type: 'string', maxLength: 2000 },
                ruling: { type: 'string', maxLength: 2000 },
                date: { type: 'string', format: 'date' },
                court: { type: 'string', maxLength: 200 },
                relevance: { type: 'string', maxLength: 1000 }
            },
            required: ['caseId', 'title']
        };
    }

    /**
     * Validate article data against schema
     * @param {Object} articleData - Article data to validate
     * @param {Object} [options] - Validation options
     * @param {boolean} [options.strict=false] - Strict validation mode
     * @param {boolean} [options.checkReferences=true] - Check reference validity
     * @param {string[]} [options.requiredLanguages] - Required translation languages
     * @returns {ValidationResult} Validation result
     */
    validateArticle(articleData, options = {}) {
        const {
            strict = false,
            checkReferences = true,
            requiredLanguages = []
        } = options;
        
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            metadata: {
                validatedAt: new Date().toISOString(),
                strictMode: strict,
                checkedReferences: checkReferences
            }
        };
        
        try {
            // Basic schema validation
            this.validateSchema(articleData, this.articleSchema, result, 'article');
            
            // Content-specific validations
            this.validateArticleContent(articleData, result, strict);
            
            // Translation validations
            this.validateTranslations(articleData, result, requiredLanguages);
            
            // Reference validations
            if (checkReferences) {
                this.validateReferences(articleData, result);
            }
            
            // Consistency checks
            this.validateConsistency(articleData, result);
            
            // Set overall validity
            result.isValid = result.errors.length === 0;
            
        } catch (error) {
            result.errors.push({
                field: 'general',
                code: 'VALIDATION_ERROR',
                message: `Validation failed: ${error.message}`,
                value: null,
                context: { error: error.message }
            });
            result.isValid = false;
        }
        
        return result;
    }

    /**
     * Validate data against schema
     * @param {any} data - Data to validate
     * @param {Object} schema - Schema definition
     * @param {ValidationResult} result - Result object to populate
     * @param {string} fieldPath - Current field path
     * @private
     */
    validateSchema(data, schema, result, fieldPath = '') {
        if (!schema || typeof schema !== 'object') {
            return;
        }
        
        // Type validation
        if (schema.type && !this.validateType(data, schema.type)) {
            result.errors.push({
                field: fieldPath,
                code: 'INVALID_TYPE',
                message: `Expected ${schema.type}, got ${typeof data}`,
                value: data
            });
            return;
        }
        
        // Required validation
        if (schema.required && (data === undefined || data === null || data === '')) {
            result.errors.push({
                field: fieldPath,
                code: 'REQUIRED_FIELD',
                message: this.errorMessages.REQUIRED_FIELD,
                value: data
            });
            return;
        }
        
        // Skip further validation if data is null/undefined and not required
        if (data === null || data === undefined) {
            return;
        }
        
        // String validations
        if (schema.type === 'string' && typeof data === 'string') {
            this.validateString(data, schema, result, fieldPath);
        }
        
        // Array validations
        if (schema.type === 'array' && Array.isArray(data)) {
            this.validateArray(data, schema, result, fieldPath);
        }
        
        // Object validations
        if (schema.type === 'object' && typeof data === 'object') {
            this.validateObject(data, schema, result, fieldPath);
        }
        
        // Number validations
        if (schema.type === 'number' && typeof data === 'number') {
            this.validateNumber(data, schema, result, fieldPath);
        }
    }

    /**
     * Validate data type
     * @param {any} data - Data to validate
     * @param {string} expectedType - Expected type
     * @returns {boolean} True if type is valid
     * @private
     */
    validateType(data, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof data === 'string';
            case 'number':
                return typeof data === 'number' && !isNaN(data);
            case 'boolean':
                return typeof data === 'boolean';
            case 'array':
                return Array.isArray(data);
            case 'object':
                return data !== null && typeof data === 'object' && !Array.isArray(data);
            default:
                return true;
        }
    }

    /**
     * Validate string data
     * @param {string} data - String to validate
     * @param {Object} schema - Schema definition
     * @param {ValidationResult} result - Result object
     * @param {string} fieldPath - Field path
     * @private
     */
    validateString(data, schema, result, fieldPath) {
        // Length validations
        if (schema.minLength !== undefined && data.length < schema.minLength) {
            result.errors.push({
                field: fieldPath,
                code: 'TOO_SHORT',
                message: `Minimum length is ${schema.minLength}, got ${data.length}`,
                value: data
            });
        }
        
        if (schema.maxLength !== undefined && data.length > schema.maxLength) {
            result.errors.push({
                field: fieldPath,
                code: 'TOO_LONG',
                message: `Maximum length is ${schema.maxLength}, got ${data.length}`,
                value: data
            });
        }
        
        // Format validations
        if (schema.format) {
            this.validateFormat(data, schema.format, result, fieldPath);
        }
    }

    /**
     * Validate array data
     * @param {Array} data - Array to validate
     * @param {Object} schema - Schema definition
     * @param {ValidationResult} result - Result object
     * @param {string} fieldPath - Field path
     * @private
     */
    validateArray(data, schema, result, fieldPath) {
        // Length validations
        if (schema.minItems !== undefined && data.length < schema.minItems) {
            result.errors.push({
                field: fieldPath,
                code: 'TOO_SHORT',
                message: `Minimum items is ${schema.minItems}, got ${data.length}`,
                value: data
            });
        }
        
        if (schema.maxItems !== undefined && data.length > schema.maxItems) {
            result.errors.push({
                field: fieldPath,
                code: 'TOO_LONG',
                message: `Maximum items is ${schema.maxItems}, got ${data.length}`,
                value: data
            });
        }
        
        // Item validations
        if (schema.items) {
            data.forEach((item, index) => {
                this.validateSchema(item, schema.items, result, `${fieldPath}[${index}]`);
            });
        }
        
        // Uniqueness check
        if (schema.uniqueItems) {
            const seen = new Set();
            data.forEach((item, index) => {
                const key = typeof item === 'object' ? JSON.stringify(item) : item;
                if (seen.has(key)) {
                    result.errors.push({
                        field: `${fieldPath}[${index}]`,
                        code: 'DUPLICATE_VALUE',
                        message: 'Duplicate item found in array',
                        value: item
                    });
                }
                seen.add(key);
            });
        }
    }

    /**
     * Validate object data
     * @param {Object} data - Object to validate
     * @param {Object} schema - Schema definition
     * @param {ValidationResult} result - Result object
     * @param {string} fieldPath - Field path
     * @private
     */
    validateObject(data, schema, result, fieldPath) {
        // Properties validation
        if (schema.properties) {
            Object.keys(schema.properties).forEach(key => {
                const propertyPath = fieldPath ? `${fieldPath}.${key}` : key;
                this.validateSchema(data[key], schema.properties[key], result, propertyPath);
            });
        }
        
        // Pattern properties validation
        if (schema.patternProperties) {
            Object.keys(data).forEach(key => {
                Object.keys(schema.patternProperties).forEach(pattern => {
                    const regex = new RegExp(pattern);
                    if (regex.test(key)) {
                        const propertyPath = fieldPath ? `${fieldPath}.${key}` : key;
                        this.validateSchema(data[key], schema.patternProperties[pattern], result, propertyPath);
                    }
                });
            });
        }
        
        // Required properties
        if (schema.required && Array.isArray(schema.required)) {
            schema.required.forEach(requiredField => {
                if (!(requiredField in data) || data[requiredField] === undefined) {
                    result.errors.push({
                        field: fieldPath ? `${fieldPath}.${requiredField}` : requiredField,
                        code: 'REQUIRED_FIELD',
                        message: this.errorMessages.REQUIRED_FIELD,
                        value: undefined
                    });
                }
            });
        }
    }

    /**
     * Validate number data
     * @param {number} data - Number to validate
     * @param {Object} schema - Schema definition
     * @param {ValidationResult} result - Result object
     * @param {string} fieldPath - Field path
     * @private
     */
    validateNumber(data, schema, result, fieldPath) {
        if (schema.minimum !== undefined && data < schema.minimum) {
            result.errors.push({
                field: fieldPath,
                code: 'TOO_SMALL',
                message: `Minimum value is ${schema.minimum}, got ${data}`,
                value: data
            });
        }
        
        if (schema.maximum !== undefined && data > schema.maximum) {
            result.errors.push({
                field: fieldPath,
                code: 'TOO_LARGE',
                message: `Maximum value is ${schema.maximum}, got ${data}`,
                value: data
            });
        }
    }

    /**
     * Validate format patterns
     * @param {string} data - Data to validate
     * @param {string} format - Format type
     * @param {ValidationResult} result - Result object
     * @param {string} fieldPath - Field path
     * @private
     */
    validateFormat(data, format, result, fieldPath) {
        switch (format) {
            case 'date-time':
                if (!this.isValidDateTime(data)) {
                    result.errors.push({
                        field: fieldPath,
                        code: 'INVALID_DATE',
                        message: 'Invalid date-time format',
                        value: data
                    });
                }
                break;
            
            case 'date':
                if (!this.isValidDate(data)) {
                    result.errors.push({
                        field: fieldPath,
                        code: 'INVALID_DATE',
                        message: 'Invalid date format',
                        value: data
                    });
                }
                break;
            
            case 'url':
                if (!this.isValidURL(data)) {
                    result.errors.push({
                        field: fieldPath,
                        code: 'INVALID_URL',
                        message: 'Invalid URL format',
                        value: data
                    });
                }
                break;
        }
    }

    /**
     * Validate article-specific content
     * @param {Object} articleData - Article data
     * @param {ValidationResult} result - Result object
     * @param {boolean} strict - Strict mode
     * @private
     */
    validateArticleContent(articleData, result, strict) {
        // Category validation
        if (articleData.category && !this.validationRules.allowedCategories.includes(articleData.category)) {
            if (strict) {
                result.errors.push({
                    field: 'category',
                    code: 'INVALID_CATEGORY',
                    message: `Invalid category: ${articleData.category}`,
                    value: articleData.category
                });
            } else {
                result.warnings.push({
                    field: 'category',
                    code: 'INVALID_CATEGORY',
                    message: `Unknown category: ${articleData.category}`,
                    value: articleData.category
                });
            }
        }
        
        // Content quality checks
        if (articleData.content) {
            const wordCount = articleData.content.split(/\s+/).length;
            if (wordCount < 10) {
                result.warnings.push({
                    field: 'content',
                    code: 'SHORT_CONTENT',
                    message: 'Content appears to be very short',
                    value: wordCount
                });
            }
        }
        
        // Keywords validation
        if (articleData.keywords && Array.isArray(articleData.keywords)) {
            const duplicateKeywords = this.findDuplicates(articleData.keywords);
            if (duplicateKeywords.length > 0) {
                result.warnings.push({
                    field: 'keywords',
                    code: 'DUPLICATE_KEYWORDS',
                    message: 'Duplicate keywords found',
                    value: duplicateKeywords
                });
            }
        }
    }

    /**
     * Validate translations
     * @param {Object} articleData - Article data
     * @param {ValidationResult} result - Result object
     * @param {string[]} requiredLanguages - Required languages
     * @private
     */
    validateTranslations(articleData, result, requiredLanguages) {
        if (!articleData.translations) {
            return;
        }
        
        // Check required languages
        requiredLanguages.forEach(lang => {
            if (!articleData.translations[lang]) {
                result.errors.push({
                    field: `translations.${lang}`,
                    code: 'MISSING_TRANSLATION',
                    message: `Missing required translation for language: ${lang}`,
                    value: null
                });
            }
        });
        
        // Validate language codes
        Object.keys(articleData.translations).forEach(lang => {
            if (!this.validationRules.allowedLanguages.includes(lang)) {
                result.warnings.push({
                    field: `translations.${lang}`,
                    code: 'INVALID_LANGUAGE',
                    message: `Unknown language code: ${lang}`,
                    value: lang
                });
            }
        });
    }

    /**
     * Validate references
     * @param {Object} articleData - Article data
     * @param {ValidationResult} result - Result object
     * @private
     */
    validateReferences(articleData, result) {
        // Check for circular references in preceding/following articles
        if (articleData.precedingArticles && articleData.followingArticles) {
            const preceding = new Set(articleData.precedingArticles);
            const following = new Set(articleData.followingArticles);
            
            // Check for articles that appear in both lists
            const intersection = [...preceding].filter(id => following.has(id));
            if (intersection.length > 0) {
                result.warnings.push({
                    field: 'articleReferences',
                    code: 'CIRCULAR_REFERENCE',
                    message: 'Articles appear in both preceding and following lists',
                    value: intersection
                });
            }
        }
        
        // Validate legal reference URLs
        if (articleData.legalReferences) {
            articleData.legalReferences.forEach((ref, index) => {
                if (ref.url && !this.isValidURL(ref.url)) {
                    result.errors.push({
                        field: `legalReferences[${index}].url`,
                        code: 'INVALID_URL',
                        message: 'Invalid URL in legal reference',
                        value: ref.url
                    });
                }
            });
        }
    }

    /**
     * Validate data consistency
     * @param {Object} articleData - Article data
     * @param {ValidationResult} result - Result object
     * @private
     */
    validateConsistency(articleData, result) {
        // Check if title appears in content (good practice)
        if (articleData.title && articleData.content) {
            const titleWords = articleData.title.toLowerCase().split(/\s+/);
            const contentLower = articleData.content.toLowerCase();
            
            const titleWordsInContent = titleWords.filter(word => 
                word.length > 3 && contentLower.includes(word)
            ).length;
            
            if (titleWordsInContent === 0) {
                result.warnings.push({
                    field: 'consistency',
                    code: 'TITLE_CONTENT_MISMATCH',
                    message: 'Title words do not appear in content',
                    value: null
                });
            }
        }
        
        // Check keyword consistency
        if (articleData.keywords && articleData.content) {
            const contentLower = articleData.content.toLowerCase();
            const missingKeywords = articleData.keywords.filter(keyword =>
                !contentLower.includes(keyword.toLowerCase())
            );
            
            if (missingKeywords.length > 0) {
                result.warnings.push({
                    field: 'keywords',
                    code: 'KEYWORD_NOT_IN_CONTENT',
                    message: 'Some keywords do not appear in content',
                    value: missingKeywords
                });
            }
        }
    }

    /**
     * Check if string is valid date-time
     * @param {string} dateString - Date string to validate
     * @returns {boolean} True if valid
     * @private
     */
    isValidDateTime(dateString) {
        if (typeof dateString !== 'string') return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime()) && dateString.includes('T');
    }

    /**
     * Check if string is valid date
     * @param {string} dateString - Date string to validate
     * @returns {boolean} True if valid
     * @private
     */
    isValidDate(dateString) {
        if (typeof dateString !== 'string') return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    /**
     * Check if string is valid URL
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     * @private
     */
    isValidURL(url) {
        if (typeof url !== 'string') return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Find duplicate items in array
     * @param {Array} array - Array to check
     * @returns {Array} Duplicate items
     * @private
     */
    findDuplicates(array) {
        const seen = new Set();
        const duplicates = new Set();
        
        array.forEach(item => {
            if (seen.has(item)) {
                duplicates.add(item);
            } else {
                seen.add(item);
            }
        });
        
        return Array.from(duplicates);
    }

    /**
     * Validate search query
     * @param {string} query - Search query to validate
     * @returns {ValidationResult} Validation result
     */
    validateSearchQuery(query) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            metadata: { queryLength: query ? query.length : 0 }
        };
        
        if (!query || typeof query !== 'string') {
            result.errors.push({
                field: 'query',
                code: 'INVALID_TYPE',
                message: 'Search query must be a string',
                value: query
            });
            result.isValid = false;
            return result;
        }
        
        if (query.trim().length === 0) {
            result.errors.push({
                field: 'query',
                code: 'EMPTY_QUERY',
                message: 'Search query cannot be empty',
                value: query
            });
            result.isValid = false;
            return result;
        }
        
        if (query.length > 1000) {
            result.errors.push({
                field: 'query',
                code: 'TOO_LONG',
                message: 'Search query is too long',
                value: query
            });
            result.isValid = false;
        }
        
        // Check for potentially problematic patterns
        if (query.includes('*'.repeat(5))) {
            result.warnings.push({
                field: 'query',
                code: 'EXCESSIVE_WILDCARDS',
                message: 'Query contains excessive wildcards',
                value: query
            });
        }
        
        return result;
    }

    /**
     * Get validation statistics
     * @returns {Object} Validation statistics
     */
    getValidationStats() {
        return {
            supportedTypes: ['string', 'number', 'boolean', 'array', 'object'],
            supportedFormats: ['date-time', 'date', 'url'],
            allowedLanguages: this.validationRules.allowedLanguages,
            allowedCategories: this.validationRules.allowedCategories,
            maxLimits: {
                contentLength: this.validationRules.maxContentLength,
                titleLength: this.validationRules.maxTitleLength,
                keywords: this.validationRules.maxKeywords,
                references: this.validationRules.maxReferences
            }
        };
    }
}

export default Validator;
