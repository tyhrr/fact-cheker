/**
 * @fileoverview Unit tests for Croatian Labor Law database components
 * @version 2.1.0
 */

import { LegalDatabase } from '../core/LegalDatabase.js';
import { Article } from '../models/Article.js';
import { SearchResult } from '../models/SearchResult.js';
import { SearchEngine } from '../core/SearchEngine.js';
import { TextProcessor } from '../utils/TextProcessor.js';
import { Validator } from '../utils/Validator.js';
import { CacheManager } from '../utils/CacheManager.js';
import { ExportManager } from '../utils/ExportManager.js';

/**
 * Test data for Croatian Labor Law articles
 */
const testArticles = [
    {
        id: 'rd-01',
        title: 'Osnovno o radnom vremenu',
        content: 'Radno vrijeme je vrijeme u kojem radnik obavlja poslove za poslodavca. Puno radno vrijeme je 40 sati tjedno.',
        category: 'radno-vrijeme',
        keywords: ['radno vrijeme', 'radni tjedan', '40 sati'],
        translations: {
            en: {
                title: 'Basics of Working Time',
                content: 'Working time is the time during which an employee performs work for an employer. Full-time work is 40 hours per week.',
                keywords: ['working time', 'work week', '40 hours']
            }
        },
        legalReferences: [
            {
                law: 'Zakon o radu',
                article: '60',
                description: 'Osnovno o radnom vremenu'
            }
        ]
    },
    {
        id: 'rd-02',
        title: 'Prekovremeni rad',
        content: 'Prekovremeni rad je rad koji prelazi puno radno vrijeme. Ograničen je na 10 sati tjedno i 50 sati mjesečno.',
        category: 'radno-vrijeme',
        keywords: ['prekovremeni rad', 'ograničenje', '10 sati'],
        translations: {
            en: {
                title: 'Overtime Work',
                content: 'Overtime work is work that exceeds full working time. It is limited to 10 hours per week and 50 hours per month.',
                keywords: ['overtime work', 'limitation', '10 hours']
            }
        }
    },
    {
        id: 'pl-01',
        title: 'Osnovna plaća',
        content: 'Osnovna plaća je dio ukupne plaće radnika za uobičajeni rad u punom radnom vremenu.',
        category: 'place-i-naknade',
        keywords: ['osnovna plaća', 'ukupna plaća', 'puno radno vrijeme'],
        translations: {
            en: {
                title: 'Basic Salary',
                content: 'Basic salary is part of the total salary of an employee for regular work in full-time employment.',
                keywords: ['basic salary', 'total salary', 'full-time']
            }
        }
    }
];

/**
 * Test runner class
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.errors = [];
    }

    /**
     * Add a test
     * @param {string} name - Test name
     * @param {Function} testFunction - Test function
     */
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Run all tests
     * @returns {Promise<Object>} Test results
     */
    async run() {
        console.log('🧪 Running Croatian Labor Law Database Tests...\n');
        
        for (const test of this.tests) {
            try {
                console.log(`⚡ ${test.name}`);
                await test.testFunction();
                this.passed++;
                console.log(`✅ PASSED: ${test.name}\n`);
            } catch (error) {
                this.failed++;
                this.errors.push({ test: test.name, error: error.message });
                console.log(`❌ FAILED: ${test.name}`);
                console.log(`   Error: ${error.message}\n`);
            }
        }
        
        this.printResults();
        return this.getResults();
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('📊 Test Results:');
        console.log(`   Total: ${this.tests.length}`);
        console.log(`   Passed: ${this.passed}`);
        console.log(`   Failed: ${this.failed}`);
        console.log(`   Success Rate: ${Math.round((this.passed / this.tests.length) * 100)}%`);
        
        if (this.errors.length > 0) {
            console.log('\n💥 Failed Tests:');
            this.errors.forEach(({ test, error }) => {
                console.log(`   ${test}: ${error}`);
            });
        }
    }

    /**
     * Get test results
     * @returns {Object} Results object
     */
    getResults() {
        return {
            total: this.tests.length,
            passed: this.passed,
            failed: this.failed,
            successRate: Math.round((this.passed / this.tests.length) * 100),
            errors: this.errors
        };
    }
}

/**
 * Assertion helpers
 */
class Assert {
    static assertTrue(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    static assertFalse(condition, message = 'Assertion failed') {
        if (condition) {
            throw new Error(message);
        }
    }

    static assertEqual(actual, expected, message = 'Values are not equal') {
        if (actual !== expected) {
            throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
        }
    }

    static assertNotEqual(actual, expected, message = 'Values should not be equal') {
        if (actual === expected) {
            throw new Error(`${message}. Both values: ${actual}`);
        }
    }

    static assertNull(value, message = 'Value should be null') {
        if (value !== null) {
            throw new Error(`${message}. Actual: ${value}`);
        }
    }

    static assertNotNull(value, message = 'Value should not be null') {
        if (value === null || value === undefined) {
            throw new Error(`${message}. Value is ${value}`);
        }
    }

    static assertArrayLength(array, expectedLength, message = 'Array length mismatch') {
        if (!Array.isArray(array) || array.length !== expectedLength) {
            throw new Error(`${message}. Expected: ${expectedLength}, Actual: ${array ? array.length : 'not an array'}`);
        }
    }

    static assertContains(container, item, message = 'Item not found in container') {
        if (Array.isArray(container) && !container.includes(item)) {
            throw new Error(`${message}. Item: ${item}`);
        }
        if (typeof container === 'string' && !container.includes(item)) {
            throw new Error(`${message}. Item: ${item}`);
        }
        if (container instanceof Set && !container.has(item)) {
            throw new Error(`${message}. Item: ${item}`);
        }
        if (container instanceof Map && !container.has(item)) {
            throw new Error(`${message}. Item: ${item}`);
        }
    }

    static async assertThrows(asyncFunction, message = 'Function should throw an error') {
        try {
            await asyncFunction();
            throw new Error(message);
        } catch (error) {
            // Expected to throw
            if (error.message === message) {
                throw error;
            }
        }
    }
}

/**
 * Create test runner and define tests
 */
const runner = new TestRunner();

// Article Model Tests
runner.test('Article - Create with valid data', async () => {
    const article = new Article(testArticles[0]);
    Assert.assertEqual(article.id, 'rd-01');
    Assert.assertEqual(article.title, 'Osnovno o radnom vremenu');
    Assert.assertEqual(article.category, 'radno-vrijeme');
    Assert.assertArrayLength(article.keywords, 3);
});

runner.test('Article - Validation methods', async () => {
    const article = new Article(testArticles[0]);
    Assert.assertTrue(article.isValid());
    Assert.assertNotNull(article.getTranslation('en'));
    Assert.assertNull(article.getTranslation('de'));
});

runner.test('Article - JSON serialization', async () => {
    const article = new Article(testArticles[0]);
    const json = article.toJSON();
    Assert.assertEqual(json.id, 'rd-01');
    Assert.assertNotNull(json.translations);
});

// Text Processor Tests
runner.test('TextProcessor - Croatian text normalization', async () => {
    const processor = new TextProcessor();
    const normalized = processor.normalizeText('Radno vrijeme u Republici Hrvatskoj');
    Assert.assertTrue(normalized.includes('radno'));
    Assert.assertTrue(normalized.includes('vrijeme'));
});

runner.test('TextProcessor - Trigram generation', async () => {
    const processor = new TextProcessor();
    const trigrams = processor.generateTrigrams('radnik');
    Assert.assertTrue(trigrams.length > 0);
    Assert.assertContains(trigrams, 'rad');
});

runner.test('TextProcessor - Term extraction', async () => {
    const processor = new TextProcessor();
    const terms = processor.extractTerms('Radno vrijeme je 40 sati tjedno');
    Assert.assertTrue(terms.includes('radno'));
    Assert.assertTrue(terms.includes('vrijeme'));
    Assert.assertFalse(terms.includes('je')); // Should filter stopwords
});

runner.test('TextProcessor - Similarity calculation', async () => {
    const processor = new TextProcessor();
    const similarity = processor.calculateSimilarity('radnik', 'radnica');
    Assert.assertTrue(similarity > 0.5);
});

// Validator Tests
runner.test('Validator - Valid article validation', async () => {
    const validator = new Validator();
    const result = validator.validateArticle(testArticles[0]);
    Assert.assertTrue(result.isValid);
    Assert.assertEqual(result.errors.length, 0);
});

runner.test('Validator - Invalid article validation', async () => {
    const validator = new Validator();
    const invalidArticle = { id: '', title: '', content: 'short' };
    const result = validator.validateArticle(invalidArticle);
    Assert.assertFalse(result.isValid);
    Assert.assertTrue(result.errors.length > 0);
});

runner.test('Validator - Search query validation', async () => {
    const validator = new Validator();
    const validResult = validator.validateSearchQuery('radno vrijeme');
    Assert.assertTrue(validResult.isValid);
    
    const invalidResult = validator.validateSearchQuery('');
    Assert.assertFalse(invalidResult.isValid);
});

// Cache Manager Tests
runner.test('CacheManager - Basic operations', async () => {
    const cache = new CacheManager({ maxSize: 10 });
    
    await cache.set('test-key', { data: 'test value' });
    const retrieved = await cache.get('test-key');
    Assert.assertNotNull(retrieved);
    Assert.assertEqual(retrieved.data, 'test value');
});

runner.test('CacheManager - Expiration', async () => {
    const cache = new CacheManager();
    
    await cache.set('expire-key', 'value', 100); // 100ms TTL
    await new Promise(resolve => setTimeout(resolve, 150)); // Wait for expiration
    const expired = await cache.get('expire-key');
    Assert.assertNull(expired);
});

runner.test('CacheManager - Statistics', async () => {
    const cache = new CacheManager();
    await cache.set('stats-key', 'value');
    await cache.get('stats-key'); // Hit
    await cache.get('missing-key'); // Miss
    
    const stats = cache.getStats();
    Assert.assertTrue(stats.hits > 0);
    Assert.assertTrue(stats.misses > 0);
    Assert.assertTrue(stats.hitRate >= 0);
});

// Search Engine Tests
runner.test('SearchEngine - Index building', async () => {
    const searchEngine = new SearchEngine();
    const articles = testArticles.map(data => new Article(data));
    
    await searchEngine.buildIndex(articles);
    const stats = searchEngine.getStats();
    Assert.assertEqual(stats.indexStats.totalDocuments, 3);
    Assert.assertTrue(stats.indexStats.totalTerms > 0);
});

runner.test('SearchEngine - Basic search', async () => {
    const searchEngine = new SearchEngine();
    const articles = testArticles.map(data => new Article(data));
    await searchEngine.buildIndex(articles);
    
    const results = await searchEngine.search('radno vrijeme');
    Assert.assertTrue(results.length > 0);
    Assert.assertTrue(results[0].relevanceScore > 0);
});

runner.test('SearchEngine - Boolean search', async () => {
    const searchEngine = new SearchEngine();
    const articles = testArticles.map(data => new Article(data));
    await searchEngine.buildIndex(articles);
    
    const results = await searchEngine.search('radno AND vrijeme');
    Assert.assertTrue(results.length > 0);
    
    const excludeResults = await searchEngine.search('radno -prekovremeni');
    Assert.assertTrue(excludeResults.length > 0);
});

runner.test('SearchEngine - Phrase search', async () => {
    const searchEngine = new SearchEngine();
    const articles = testArticles.map(data => new Article(data));
    await searchEngine.buildIndex(articles);
    
    const results = await searchEngine.search('"radno vrijeme"');
    Assert.assertTrue(results.length > 0);
});

runner.test('SearchEngine - Category filtering', async () => {
    const searchEngine = new SearchEngine();
    const articles = testArticles.map(data => new Article(data));
    await searchEngine.buildIndex(articles);
    
    const results = await searchEngine.search('rad', {
        categories: ['radno-vrijeme']
    });
    
    results.forEach(result => {
        Assert.assertEqual(result.category, 'radno-vrijeme');
    });
});

// Export Manager Tests
runner.test('ExportManager - JSON export', async () => {
    const exportManager = new ExportManager();
    const articles = testArticles.map(data => new Article(data));
    
    const result = await exportManager.exportArticles(articles, {
        format: 'json'
    });
    
    Assert.assertTrue(result.success);
    Assert.assertEqual(result.recordCount, 3);
    Assert.assertEqual(result.mimeType, 'application/json');
});

runner.test('ExportManager - CSV export', async () => {
    const exportManager = new ExportManager();
    const articles = testArticles.map(data => new Article(data));
    
    const result = await exportManager.exportArticles(articles, {
        format: 'csv',
        fields: ['id', 'title', 'category']
    });
    
    Assert.assertTrue(result.success);
    Assert.assertEqual(result.mimeType, 'text/csv');
    Assert.assertTrue(result.data.includes('id,title,category'));
});

runner.test('ExportManager - Category filtering', async () => {
    const exportManager = new ExportManager();
    const articles = testArticles.map(data => new Article(data));
    
    const result = await exportManager.exportArticles(articles, {
        format: 'json',
        categories: ['radno-vrijeme']
    });
    
    Assert.assertTrue(result.success);
    Assert.assertEqual(result.recordCount, 2); // Only 2 articles in this category
});

// Legal Database Integration Tests
runner.test('LegalDatabase - Initialization', async () => {
    const db = new LegalDatabase({
        enableCache: false, // Disable cache for testing
        enableSearch: true,
        enableValidation: true
    });
    
    await db.initialize();
    Assert.assertTrue(db.isInitialized);
});

runner.test('LegalDatabase - Article management', async () => {
    const db = new LegalDatabase({
        enableCache: false,
        enableSearch: false,
        enableValidation: true
    });
    
    await db.initialize();
    
    // Add article
    const article = await db.addArticle(testArticles[0]);
    Assert.assertEqual(article.id, 'rd-01');
    
    // Get article
    const retrieved = await db.getArticle('rd-01');
    Assert.assertNotNull(retrieved);
    Assert.assertEqual(retrieved.title, testArticles[0].title);
    
    // Update article
    const updated = await db.updateArticle('rd-01', { title: 'Updated Title' });
    Assert.assertEqual(updated.title, 'Updated Title');
    
    // Remove article
    const removed = await db.removeArticle('rd-01');
    Assert.assertTrue(removed);
    
    const notFound = await db.getArticle('rd-01');
    Assert.assertNull(notFound);
});

runner.test('LegalDatabase - Search integration', async () => {
    const db = new LegalDatabase({
        enableCache: false,
        enableSearch: true,
        enableValidation: false
    });
    
    await db.initialize();
    
    // Add test articles
    for (const articleData of testArticles) {
        await db.addArticle(articleData);
    }
    
    // Perform search
    const results = await db.search('radno vrijeme');
    Assert.assertTrue(results.length > 0);
    Assert.assertTrue(results[0] instanceof SearchResult);
});

runner.test('LegalDatabase - Category operations', async () => {
    const db = new LegalDatabase({
        enableCache: false,
        enableSearch: false,
        enableValidation: false
    });
    
    await db.initialize();
    
    // Add test articles
    for (const articleData of testArticles) {
        await db.addArticle(articleData);
    }
    
    // Get categories
    const categories = db.getCategories();
    Assert.assertContains(categories, 'radno-vrijeme');
    Assert.assertContains(categories, 'place-i-naknade');
    
    // Get articles by category
    const workTimeArticles = db.getArticlesByCategory('radno-vrijeme');
    Assert.assertEqual(workTimeArticles.length, 2);
});

runner.test('LegalDatabase - Statistics', async () => {
    const db = new LegalDatabase({
        enableCache: false,
        enableSearch: true,
        enableValidation: false
    });
    
    await db.initialize();
    
    // Add test articles
    for (const articleData of testArticles) {
        await db.addArticle(articleData);
    }
    
    const stats = db.getStats();
    Assert.assertEqual(stats.totalArticles, 3);
    Assert.assertTrue(stats.totalCategories >= 2);
    Assert.assertNotNull(stats.categoryDistribution);
    Assert.assertNotNull(stats.lastUpdated);
});

runner.test('LegalDatabase - Export/Import', async () => {
    const db = new LegalDatabase({
        enableCache: false,
        enableSearch: false,
        enableValidation: false
    });
    
    await db.initialize();
    
    // Add test articles
    for (const articleData of testArticles) {
        await db.addArticle(articleData);
    }
    
    // Export
    const exportResult = await db.export('json');
    Assert.assertTrue(exportResult.success);
    Assert.assertEqual(exportResult.recordCount, 3);
    
    // Import (simplified test)
    const importData = JSON.stringify(testArticles.slice(0, 1));
    const importResult = await db.import(importData, { format: 'json' });
    Assert.assertTrue(importResult.success);
});

runner.test('LegalDatabase - Event system', async () => {
    const db = new LegalDatabase({
        enableCache: false,
        enableSearch: false,
        enableValidation: false
    });
    
    let eventFired = false;
    db.on('articleAdded', () => {
        eventFired = true;
    });
    
    await db.initialize();
    await db.addArticle(testArticles[0]);
    
    Assert.assertTrue(eventFired);
});

// Performance Tests
runner.test('Performance - Large dataset search', async () => {
    const db = new LegalDatabase({
        enableCache: false,
        enableSearch: true,
        enableValidation: false
    });
    
    await db.initialize();
    
    // Add multiple articles
    const startTime = performance.now();
    for (let i = 0; i < 100; i++) {
        const articleData = {
            ...testArticles[0],
            id: `test-${i}`,
            title: `Test Article ${i}`,
            content: `Content for test article ${i} about radno vrijeme and related topics.`
        };
        await db.addArticle(articleData);
    }
    const addTime = performance.now() - startTime;
    
    // Perform search
    const searchStart = performance.now();
    const results = await db.search('radno');
    const searchTime = performance.now() - searchStart;
    
    console.log(`   Performance: Added 100 articles in ${Math.round(addTime)}ms`);
    console.log(`   Performance: Search completed in ${Math.round(searchTime)}ms`);
    
    Assert.assertTrue(results.length > 0);
    Assert.assertTrue(addTime < 5000); // Should complete within 5 seconds
    Assert.assertTrue(searchTime < 1000); // Search should be under 1 second
});

// Memory and Resource Tests
runner.test('Resource Management - Memory cleanup', async () => {
    const db = new LegalDatabase({
        enableCache: true,
        enableSearch: true,
        enableValidation: true
    });
    
    await db.initialize();
    
    // Add articles
    for (const articleData of testArticles) {
        await db.addArticle(articleData);
    }
    
    const initialStats = db.getStats();
    
    // Clear database
    await db.clear();
    
    const clearedStats = db.getStats();
    Assert.assertEqual(clearedStats.totalArticles, 0);
    
    // Destroy database
    db.destroy();
    
    // Should not throw errors after destruction
    Assert.assertTrue(true);
});

/**
 * Run tests if this file is executed directly
 */
export async function runTests() {
    return await runner.run();
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
    window.runCroatianLaborLawTests = runTests;
    console.log('Croatian Labor Law Database tests loaded. Run with: runCroatianLaborLawTests()');
}

// Export for module usage
export { runner, Assert, testArticles };
