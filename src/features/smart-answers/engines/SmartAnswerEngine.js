/**
 * @fileoverview Smart Answer Engine for Enhanced User Responses
 * Processes user queries and generates structured, helpful answers
 * @version 2.3.0
 */

import { TextProcessor } from '../../../utils/TextProcessor.js';

/**
 * @typedef {Object} QueryIntent
 * @property {string} type - Type of query (definition, howto, calculation, etc.)
 * @property {string[]} entities - Extracted entities (vacation, salary, hours, etc.)
 * @property {string} context - User context (employee, employer, general)
 * @property {number} complexity - Query complexity level (1-5)
 */

/**
 * @typedef {Object} StructuredAnswer
 * @property {string} quickAnswer - Immediate, concise response
 * @property {string} detailedExplanation - Comprehensive explanation
 * @property {Array} practicalExamples - Real-world scenarios
 * @property {Array} frequentlyAskedQuestions - Related Q&A
 * @property {Array} sourceArticles - Legal article references
 * @property {Array} relatedTopics - Cross-references
 * @property {number} confidenceScore - Answer confidence (0-1)
 */

/**
 * Smart Answer Engine that transforms legal articles into user-friendly responses
 */
export class SmartAnswerEngine {
    constructor() {
        this.textProcessor = new TextProcessor();
        this.intentPatterns = this.initializeIntentPatterns();
        this.entityPatterns = this.initializeEntityPatterns();
        this.responseTemplates = this.initializeResponseTemplates();
    }

    /**
     * Process user query and generate structured answer
     * @param {string} query - User query
     * @param {Array} relevantArticles - Articles matching the query
     * @returns {StructuredAnswer} Structured answer object
     */
    generateAnswer(query, relevantArticles) {
        try {
            // Analyze user intent
            const intent = this.analyzeIntent(query);
            
            // Extract key entities
            const entities = this.extractEntities(query);
            
            // Find best matching articles with user content
            const enhancedArticles = this.selectBestArticles(relevantArticles, intent, entities);
            
            // Generate structured response
            const structuredAnswer = this.buildStructuredResponse(query, intent, entities, enhancedArticles);
            
            return structuredAnswer;
        } catch (error) {
            console.error('Error generating smart answer:', error);
            return this.generateFallbackAnswer(query, relevantArticles);
        }
    }

    /**
     * Analyze user query to determine intent
     * @param {string} query - User query
     * @returns {QueryIntent} Intent analysis
     */
    analyzeIntent(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Detect question type
        let type = 'general';
        if (normalizedQuery.includes('cuánto') || normalizedQuery.includes('how many')) {
            type = 'calculation';
        } else if (normalizedQuery.includes('cómo') || normalizedQuery.includes('how to')) {
            type = 'howto';
        } else if (normalizedQuery.includes('qué es') || normalizedQuery.includes('what is')) {
            type = 'definition';
        } else if (normalizedQuery.includes('puedo') || normalizedQuery.includes('can i')) {
            type = 'permission';
        } else if (normalizedQuery.includes('debo') || normalizedQuery.includes('must i')) {
            type = 'obligation';
        }

        // Detect context
        let context = 'general';
        if (normalizedQuery.includes('empleador') || normalizedQuery.includes('employer')) {
            context = 'employer';
        } else if (normalizedQuery.includes('trabajador') || normalizedQuery.includes('employee')) {
            context = 'employee';
        }

        // Calculate complexity
        const complexity = this.calculateComplexity(normalizedQuery);

        return { type, context, complexity };
    }

    /**
     * Extract entities from user query
     * @param {string} query - User query
     * @returns {string[]} Array of extracted entities
     */
    extractEntities(query) {
        const entities = [];
        const normalizedQuery = query.toLowerCase();

        // Legal entity patterns
        const entityMaps = {
            vacation: ['vacaciones', 'vacation', 'annual leave', 'godišnji odmor', 'odmor'],
            salary: ['salario', 'salary', 'plaća', 'sueldo', 'pay'],
            hours: ['horas', 'hours', 'sati', 'tiempo', 'time'],
            contract: ['contrato', 'contract', 'ugovor'],
            termination: ['despido', 'termination', 'otkaz'],
            overtime: ['horas extra', 'overtime', 'prekovremeni'],
            maternity: ['maternidad', 'maternity', 'rodiljski'],
            sick_leave: ['baja médica', 'sick leave', 'bolovanje'],
            notice: ['aviso', 'notice', 'obavijest'],
            benefits: ['beneficios', 'benefits', 'naknade']
        };

        Object.entries(entityMaps).forEach(([entity, patterns]) => {
            if (patterns.some(pattern => normalizedQuery.includes(pattern))) {
                entities.push(entity);
            }
        });

        return entities;
    }

    /**
     * Select best articles based on intent and entities
     * @param {Array} articles - Available articles
     * @param {QueryIntent} intent - User intent
     * @param {string[]} entities - Extracted entities
     * @returns {Array} Best matching articles with user content
     */
    selectBestArticles(articles, intent, entities) {
        return articles
            .filter(article => {
                // Prefer articles with userContent
                if (article.userContent) return true;
                
                // Fallback to articles with relevant keywords
                return entities.some(entity => 
                    article.keywords?.some(keyword => 
                        keyword.toLowerCase().includes(entity)
                    )
                );
            })
            .slice(0, 3); // Limit to top 3 articles
    }

    /**
     * Build structured response from articles and intent
     * @param {string} query - Original query
     * @param {QueryIntent} intent - User intent
     * @param {string[]} entities - Extracted entities
     * @param {Array} articles - Selected articles
     * @returns {StructuredAnswer} Structured answer
     */
    buildStructuredResponse(query, intent, entities, articles) {
        if (articles.length === 0) {
            return this.generateFallbackAnswer(query, []);
        }

        const primaryArticle = articles[0];
        const userContent = primaryArticle.userContent;

        // Build response based on available user content
        const response = {
            quickAnswer: userContent?.quickAnswer || this.generateQuickAnswerFallback(primaryArticle),
            detailedExplanation: userContent?.detailedExplanation || this.generateDetailedExplanationFallback(articles),
            practicalExamples: userContent?.practicalExamples || [],
            frequentlyAskedQuestions: userContent?.frequentlyAskedQuestions || [],
            keyTakeaways: userContent?.keyTakeaways || this.generateKeyTakeaways(articles),
            sourceArticles: articles.map(article => ({
                id: article.id,
                title: article.userContent?.userFriendlyTitle || article.title,
                number: article.number
            })),
            relatedTopics: userContent?.relatedTopics || [],
            confidenceScore: this.calculateConfidenceScore(query, intent, articles)
        };

        return response;
    }

    /**
     * Generate quick answer fallback when userContent is not available
     * @param {Object} article - Article object
     * @returns {string} Quick answer
     */
    generateQuickAnswerFallback(article) {
        const content = article.content || '';
        
        // Extract first meaningful sentence
        const sentences = content.split('.').filter(s => s.trim().length > 20);
        if (sentences.length > 0) {
            return sentences[0].trim() + '.';
        }
        
        return 'Información encontrada en el artículo legal correspondiente.';
    }

    /**
     * Generate detailed explanation fallback
     * @param {Array} articles - Articles array
     * @returns {string} Detailed explanation
     */
    generateDetailedExplanationFallback(articles) {
        const explanations = articles.map(article => {
            const title = article.title || `Artículo ${article.number}`;
            const content = article.content || '';
            return `**${title}:**\n${content.substring(0, 300)}...`;
        });
        
        return explanations.join('\n\n');
    }

    /**
     * Generate key takeaways from articles
     * @param {Array} articles - Articles array
     * @returns {string[]} Key takeaways
     */
    generateKeyTakeaways(articles) {
        const takeaways = [];
        
        articles.forEach(article => {
            if (article.keywords) {
                takeaways.push(`Artículo ${article.number}: ${article.keywords.join(', ')}`);
            }
        });
        
        return takeaways.slice(0, 5); // Limit to 5 takeaways
    }

    /**
     * Calculate confidence score for the answer
     * @param {string} query - Original query
     * @param {QueryIntent} intent - User intent
     * @param {Array} articles - Selected articles
     * @returns {number} Confidence score (0-1)
     */
    calculateConfidenceScore(query, intent, articles) {
        let score = 0.5; // Base score
        
        // Boost if articles have userContent
        if (articles.some(article => article.userContent)) {
            score += 0.3;
        }
        
        // Boost if multiple relevant articles
        if (articles.length >= 2) {
            score += 0.1;
        }
        
        // Boost if intent is clear
        if (intent.type !== 'general') {
            score += 0.1;
        }
        
        return Math.min(score, 1.0);
    }

    /**
     * Generate fallback answer when processing fails
     * @param {string} query - Original query
     * @param {Array} articles - Available articles
     * @returns {StructuredAnswer} Fallback answer
     */
    generateFallbackAnswer(query, articles) {
        return {
            quickAnswer: 'Se encontró información relevante en la legislación laboral croata.',
            detailedExplanation: articles.length > 0 
                ? `Basado en ${articles.length} artículo(s) de la ley laboral, se requiere revisión de los textos legales específicos.`
                : 'No se encontró información específica para esta consulta.',
            practicalExamples: [],
            frequentlyAskedQuestions: [],
            keyTakeaways: ['Consulta requiere revisión de legislación específica'],
            sourceArticles: articles.map(article => ({
                id: article.id,
                title: article.title,
                number: article.number
            })),
            relatedTopics: [],
            confidenceScore: 0.3
        };
    }

    /**
     * Calculate query complexity
     * @param {string} query - Normalized query
     * @returns {number} Complexity level (1-5)
     */
    calculateComplexity(query) {
        let complexity = 1;
        
        // Length factor
        if (query.length > 50) complexity++;
        if (query.length > 100) complexity++;
        
        // Multiple questions
        if (query.includes('?') && query.split('?').length > 2) complexity++;
        
        // Legal terms
        const legalTerms = ['contrato', 'despido', 'indemnización', 'tribunal'];
        if (legalTerms.some(term => query.includes(term))) complexity++;
        
        return Math.min(complexity, 5);
    }

    /**
     * Initialize intent detection patterns
     * @returns {Object} Intent patterns
     */
    initializeIntentPatterns() {
        return {
            calculation: /cuánto|how many|how much|cantidad|número/i,
            howto: /cómo|how to|proceso|pasos/i,
            definition: /qué es|what is|definición|significa/i,
            permission: /puedo|can i|está permitido|allowed/i,
            obligation: /debo|must|tengo que|obligación/i
        };
    }

    /**
     * Initialize entity extraction patterns
     * @returns {Object} Entity patterns
     */
    initializeEntityPatterns() {
        return {
            vacation: /vacaciones|vacation|annual leave|godišnji odmor/i,
            salary: /salario|salary|plaća|sueldo/i,
            hours: /horas|hours|sati|tiempo/i
        };
    }

    /**
     * Initialize response templates
     * @returns {Object} Response templates
     */
    initializeResponseTemplates() {
        return {
            vacation: {
                quickAnswer: "En Croacia, los trabajadores tienen derecho a {DAYS} días de vacaciones anuales.",
                explanation: "El derecho a vacaciones está regulado por el artículo {ARTICLE}..."
            }
        };
    }
}

export default SmartAnswerEngine;
