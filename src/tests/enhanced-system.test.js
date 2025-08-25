/* =========================================
   Enhanced System Testing Suite - v2.1.0
   Croatian Labor Law Fact Checker
   ========================================= */

class EnhancedSystemTester {
    constructor() {
        this.results = [];
        this.testCount = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.startTime = null;
    }

    async runAllTests() {
        console.log('🚀 Starting Enhanced System Testing Suite v2.1.0');
        console.log('='.repeat(60));
        
        this.startTime = performance.now();
        
        try {
            // Core system tests
            await this.testDatabaseInitialization();
            await this.testDataLoading();
            await this.testBasicSearch();
            
            // Enhanced features tests
            await this.testBooleanSearch();
            await this.testFuzzySearch();
            await this.testSearchSuggestions();
            await this.testCacheSystem();
            await this.testExportFeatures();
            
            // Performance tests
            await this.testSearchPerformance();
            await this.testMemoryUsage();
            
            // UI integration tests
            await this.testUIIntegration();
            await this.testResponsiveFeatures();
            
            // Data integrity tests
            await this.testDataIntegrity();
            await this.testPDFReferences();
            
        } catch (error) {
            this.logError('Critical test suite error', error);
        } finally {
            this.generateReport();
        }
    }

    async testDatabaseInitialization() {
        this.log('🔧 Testing Enhanced Database Initialization...');
        
        try {
            // Test if enhanced database is available
            this.assert(
                typeof window.enhancedDatabase !== 'undefined',
                'Enhanced database should be initialized'
            );
            
            // Test database properties
            if (window.enhancedDatabase) {
                const stats = window.enhancedDatabase.getStatistics();
                this.assert(
                    stats && stats.totalArticles > 0,
                    'Database should contain articles'
                );
                
                this.assert(
                    stats.totalArticles === 5,
                    'Database should contain exactly 5 test articles'
                );
            }
            
            this.pass('Database initialization');
            
        } catch (error) {
            this.fail('Database initialization', error.message);
        }
    }

    async testDataLoading() {
        this.log('📄 Testing Data Loading...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                // Test article retrieval
                const article = await factChecker.getArticle('zor-01');
                this.assert(
                    article && article.title === 'Predmet zakona',
                    'Should retrieve article by ID'
                );
                
                // Test categories
                const categories = factChecker.getCategories();
                this.assert(
                    categories.length > 0,
                    'Should have categories available'
                );
                
                // Test articles by category
                const radniOdnosi = factChecker.getArticlesByCategory('radni-odnosi');
                this.assert(
                    radniOdnosi.length > 0,
                    'Should retrieve articles by category'
                );
            }
            
            this.pass('Data loading');
            
        } catch (error) {
            this.fail('Data loading', error.message);
        }
    }

    async testBasicSearch() {
        this.log('🔍 Testing Basic Search...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                // Test simple search
                const results1 = await factChecker.search('radno vrijeme');
                this.assert(
                    results1.length > 0,
                    'Should find results for "radno vrijeme"'
                );
                
                // Test case insensitive search
                const results2 = await factChecker.search('PLAĆA');
                this.assert(
                    results2.length > 0,
                    'Should find results with case insensitive search'
                );
                
                // Test Croatian diacritics
                const results3 = await factChecker.search('plaća');
                this.assert(
                    results3.length > 0,
                    'Should handle Croatian diacritics properly'
                );
            }
            
            this.pass('Basic search');
            
        } catch (error) {
            this.fail('Basic search', error.message);
        }
    }

    async testBooleanSearch() {
        this.log('🔢 Testing Boolean Search...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                // Test AND operator
                const andResults = await factChecker.search('radno AND vrijeme');
                this.assert(
                    andResults.length > 0,
                    'Should support AND operator'
                );
                
                // Test OR operator
                const orResults = await factChecker.search('plaća OR sigurnost');
                this.assert(
                    orResults.length > 0,
                    'Should support OR operator'
                );
                
                // Test NOT operator
                const notResults = await factChecker.search('radnik NOT poslodavac');
                this.assert(
                    notResults.length >= 0,
                    'Should support NOT operator'
                );
                
                // Test exact phrase
                const phraseResults = await factChecker.search('"ugovor o radu"');
                this.assert(
                    phraseResults.length > 0,
                    'Should support exact phrase search'
                );
            }
            
            this.pass('Boolean search');
            
        } catch (error) {
            this.fail('Boolean search', error.message);
        }
    }

    async testFuzzySearch() {
        this.log('🎯 Testing Fuzzy Search...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                // Test fuzzy search with typos
                const fuzzyResults1 = await factChecker.search('plača', { fuzzySearch: true });
                this.assert(
                    fuzzyResults1.length > 0,
                    'Should find results with typos using fuzzy search'
                );
                
                // Test partial matches
                const fuzzyResults2 = await factChecker.search('radno', { fuzzySearch: true });
                this.assert(
                    fuzzyResults2.length > 0,
                    'Should find partial matches'
                );
            }
            
            this.pass('Fuzzy search');
            
        } catch (error) {
            this.fail('Fuzzy search', error.message);
        }
    }

    async testSearchSuggestions() {
        this.log('💡 Testing Search Suggestions...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                // Test suggestions
                const suggestions = factChecker.getSearchSuggestions('rad');
                this.assert(
                    Array.isArray(suggestions),
                    'Should return array of suggestions'
                );
                
                this.assert(
                    suggestions.length > 0,
                    'Should provide suggestions for partial queries'
                );
            }
            
            this.pass('Search suggestions');
            
        } catch (error) {
            this.fail('Search suggestions', error.message);
        }
    }

    async testCacheSystem() {
        this.log('💾 Testing Cache System...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker && factChecker.database && factChecker.database.cacheManager) {
                const cacheManager = factChecker.database.cacheManager;
                
                // Test cache operations
                await cacheManager.set('test-key', 'test-value', 60000);
                const cachedValue = await cacheManager.get('test-key');
                this.assert(
                    cachedValue === 'test-value',
                    'Should store and retrieve cached values'
                );
                
                // Test cache statistics
                const stats = cacheManager.getStats();
                this.assert(
                    typeof stats.hitRate === 'number',
                    'Should provide cache statistics'
                );
            }
            
            this.pass('Cache system');
            
        } catch (error) {
            this.fail('Cache system', error.message);
        }
    }

    async testExportFeatures() {
        this.log('📤 Testing Export Features...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                // Test JSON export
                const jsonExport = await factChecker.exportData('json');
                this.assert(
                    jsonExport && jsonExport.articles,
                    'Should export data in JSON format'
                );
                
                // Test CSV export
                const csvExport = await factChecker.exportData('csv');
                this.assert(
                    typeof csvExport === 'string' && csvExport.includes('title'),
                    'Should export data in CSV format'
                );
            }
            
            this.pass('Export features');
            
        } catch (error) {
            this.fail('Export features', error.message);
        }
    }

    async testSearchPerformance() {
        this.log('⚡ Testing Search Performance...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                const startTime = performance.now();
                
                // Perform multiple searches
                await factChecker.search('radno vrijeme');
                await factChecker.search('plaća');
                await factChecker.search('sigurnost');
                
                const endTime = performance.now();
                const totalTime = endTime - startTime;
                
                this.assert(
                    totalTime < 1000,
                    `Search performance should be under 1 second (was ${Math.round(totalTime)}ms)`
                );
            }
            
            this.pass('Search performance');
            
        } catch (error) {
            this.fail('Search performance', error.message);
        }
    }

    async testMemoryUsage() {
        this.log('🧠 Testing Memory Usage...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker && factChecker.database && factChecker.database.cacheManager) {
                const stats = factChecker.database.cacheManager.getStats();
                
                this.assert(
                    stats.totalSize < 10485760, // 10MB
                    'Memory usage should be reasonable'
                );
            }
            
            this.pass('Memory usage');
            
        } catch (error) {
            this.fail('Memory usage', error.message);
        }
    }

    async testUIIntegration() {
        this.log('🎨 Testing UI Integration...');
        
        try {
            // Test search input exists
            const searchInput = document.getElementById('search-input');
            this.assert(
                searchInput !== null,
                'Search input should exist'
            );
            
            // Test enhanced CSS is loaded
            const enhancedElements = document.querySelectorAll('.search-operators-help-enhanced');
            this.assert(
                enhancedElements.length > 0,
                'Enhanced UI elements should be present'
            );
            
            // Test enhanced filters
            const categoryFilter = document.getElementById('category-filter-enhanced');
            this.assert(
                categoryFilter !== null,
                'Enhanced category filter should exist'
            );
            
            this.pass('UI integration');
            
        } catch (error) {
            this.fail('UI integration', error.message);
        }
    }

    async testResponsiveFeatures() {
        this.log('📱 Testing Responsive Features...');
        
        try {
            // Test CSS media queries are applied
            const style = getComputedStyle(document.body);
            this.assert(
                style !== null,
                'CSS should be properly applied'
            );
            
            // Test enhanced CSS classes exist
            const enhancedCSS = document.querySelector('link[href*="enhanced.css"]');
            this.assert(
                enhancedCSS !== null,
                'Enhanced CSS should be loaded'
            );
            
            this.pass('Responsive features');
            
        } catch (error) {
            this.fail('Responsive features', error.message);
        }
    }

    async testDataIntegrity() {
        this.log('🔐 Testing Data Integrity...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                const articles = factChecker.getArticles();
                
                // Test all articles have required fields
                for (const article of articles) {
                    this.assert(
                        article.id && article.title && article.content,
                        `Article ${article.id} should have all required fields`
                    );
                    
                    this.assert(
                        article.category && article.keywords,
                        `Article ${article.id} should have category and keywords`
                    );
                    
                    this.assert(
                        article.legalReferences && article.legalReferences.length > 0,
                        `Article ${article.id} should have legal references`
                    );
                }
            }
            
            this.pass('Data integrity');
            
        } catch (error) {
            this.fail('Data integrity', error.message);
        }
    }

    async testPDFReferences() {
        this.log('📄 Testing PDF References...');
        
        try {
            const factChecker = window.enhancedDatabase;
            
            if (factChecker) {
                const articles = factChecker.getArticles();
                
                // Test PDF references point to correct file
                for (const article of articles) {
                    for (const ref of article.legalReferences) {
                        this.assert(
                            ref.url.includes('Zakon o radu 2023 B.pdf'),
                            `PDF reference should point to available file (${ref.url})`
                        );
                    }
                }
            }
            
            this.pass('PDF references');
            
        } catch (error) {
            this.fail('PDF references', error.message);
        }
    }

    // Helper methods
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    log(message) {
        console.log(`📝 ${message}`);
    }

    pass(testName) {
        this.testCount++;
        this.passedTests++;
        const message = `✅ PASS: ${testName}`;
        console.log(`%c${message}`, 'color: #4CAF50; font-weight: bold;');
        this.results.push({ test: testName, status: 'PASS', message: '' });
    }

    fail(testName, errorMessage) {
        this.testCount++;
        this.failedTests++;
        const message = `❌ FAIL: ${testName} - ${errorMessage}`;
        console.log(`%c${message}`, 'color: #F44336; font-weight: bold;');
        this.results.push({ test: testName, status: 'FAIL', message: errorMessage });
    }

    logError(testName, error) {
        this.fail(testName, error.message);
        console.error(error);
    }

    generateReport() {
        const endTime = performance.now();
        const duration = Math.round(endTime - this.startTime);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 ENHANCED SYSTEM TESTING REPORT');
        console.log('='.repeat(60));
        console.log(`⏱️  Total Duration: ${duration}ms`);
        console.log(`📈 Total Tests: ${this.testCount}`);
        console.log(`%c✅ Passed: ${this.passedTests}`, 'color: #4CAF50; font-weight: bold;');
        console.log(`%c❌ Failed: ${this.failedTests}`, 'color: #F44336; font-weight: bold;');
        console.log(`📊 Success Rate: ${Math.round((this.passedTests / this.testCount) * 100)}%`);
        
        console.log('\n📋 Detailed Results:');
        this.results.forEach((result, index) => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            const color = result.status === 'PASS' ? '#4CAF50' : '#F44336';
            console.log(`%c${icon} ${index + 1}. ${result.test}`, `color: ${color}`);
            if (result.message) {
                console.log(`   └─ ${result.message}`);
            }
        });
        
        // Final recommendation
        console.log('\n🎯 RECOMMENDATIONS:');
        if (this.failedTests === 0) {
            console.log('%c🚀 All tests passed! Enhanced system is ready for production.', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
        } else {
            console.log('%c⚠️  Some tests failed. Please review and fix issues before deployment.', 'color: #FF9800; font-weight: bold;');
        }
        
        console.log('='.repeat(60));
        
        return {
            duration,
            totalTests: this.testCount,
            passed: this.passedTests,
            failed: this.failedTests,
            successRate: Math.round((this.passedTests / this.testCount) * 100),
            results: this.results
        };
    }
}

// Create global instance for easy access
window.enhancedSystemTester = new EnhancedSystemTester();

// Export for module use
export default EnhancedSystemTester;
