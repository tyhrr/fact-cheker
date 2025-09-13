/**
 * Debug script for vacation search issue
 * Test "vacaciones" vs "odmor" search behavior
 */

console.log('🔍 VACATION SEARCH DEBUG STARTED');
console.log('================================');

// Function to wait for SearchManager to be available
function waitForSearchManager(maxAttempts = 20, interval = 500) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const checkSearchManager = () => {
            attempts++;
            console.log(`� Attempt ${attempts}: Checking for SearchManager...`);
            
            if (window.searchManager) {
                console.log('✅ SearchManager found!');
                resolve(window.searchManager);
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.error('❌ SearchManager not found after', maxAttempts, 'attempts');
                reject(new Error('SearchManager not available'));
                return;
            }
            
            setTimeout(checkSearchManager, interval);
        };
        
        checkSearchManager();
    });
}

// Wait for the app to initialize with extended timeout
setTimeout(async () => {
    console.log('🚀 Starting vacation search debug tests...');
    
    try {
        // Wait for SearchManager to be available
        const searchManager = await waitForSearchManager();
        
        // Test 1: Search for "vacaciones" (Spanish)
        console.log('\n📋 TEST 1: Spanish term "vacaciones"');
        console.log('-----------------------------------');
        
        // Test translation system
        console.log('🔤 Testing translation of "vacaciones"');
        const translatedVacaciones = await searchManager.translateQuery('vacaciones');
        console.log('Translated "vacaciones":', translatedVacaciones);
        
        // Test SearchEngine directly
        if (searchManager.searchEngine) {
            console.log('🔍 Testing SearchEngine directly with "vacaciones"');
            const directResults = await searchManager.searchEngine.search('vacaciones', {
                maxResults: 50,
                minRelevance: 0.001
            });
            console.log('Direct search results for "vacaciones":', directResults.length);
            
            console.log('🔍 Testing SearchEngine directly with "odmor"');
            const directResults2 = await searchManager.searchEngine.search('odmor', {
                maxResults: 50,
                minRelevance: 0.001
            });
            console.log('Direct search results for "odmor":', directResults2.length);
            
            // Check database articles directly
            console.log('🗄️ Checking database articles directly...');
            const factChecker = window.factChecker;
            if (factChecker && factChecker.database && factChecker.database.articles) {
                const articles = factChecker.database.articles;
                console.log('Total articles in database:', articles.size || articles.length);
                
                // Search for vacation-related terms manually
                let vacationCount = 0;
                let odmorCount = 0;
                
                const searchIn = articles instanceof Map ? articles.values() : articles;
                
                for (const article of searchIn) {
                    if (!article) continue;
                    
                    const content = (article.content || '').toLowerCase();
                    const title = (article.title || '').toLowerCase();
                    const keywords = (article.keywords || []).join(' ').toLowerCase();
                    
                    const fullText = `${title} ${content} ${keywords}`;
                    
                    if (fullText.includes('vacation') || fullText.includes('vacaciones')) {
                        vacationCount++;
                    }
                    
                    if (fullText.includes('odmor') || fullText.includes('godišnji')) {
                        odmorCount++;
                        console.log(`📄 Article ${article.id}: "${article.title}"`);
                        console.log(`   Contains: ${fullText.includes('odmor') ? 'odmor' : ''} ${fullText.includes('godišnji') ? 'godišnji' : ''}`);
                    }
                }
                
                console.log(`📊 Manual count - Vacation-related: ${vacationCount}, Odmor-related: ${odmorCount}`);
            }
        } else {
            console.warn('⚠️ SearchEngine not initialized yet, waiting...');
            
            // Wait for database ready event and try again
            window.addEventListener('enhancedDatabaseReady', () => {
                console.log('🔄 Database ready, retrying SearchEngine tests...');
                setTimeout(async () => {
                    if (searchManager.searchEngine) {
                        console.log('✅ SearchEngine now available!');
                        // Retry the tests
                        window.debugSearchResults('vacaciones');
                        window.debugSearchResults('odmor');
                    }
                }, 1000);
            });
        }
        
        // Test complete search flow
        console.log('\n🔄 Testing complete search flow...');
        
        // Simulate search input
        if (searchManager.searchInput) {
            console.log('🔍 Simulating "vacaciones" search...');
            searchManager.searchInput.value = 'vacaciones';
            await searchManager.performSearch();
            
            setTimeout(() => {
                console.log('🔍 Simulating "odmor" search...');
                searchManager.searchInput.value = 'odmor';
                searchManager.performSearch();
            }, 2000);
        } else {
            console.warn('⚠️ Search input not found, will retry after DOM load');
        }
        
    } catch (error) {
        console.error('❌ Debug test failed:', error);
        
        // Fallback: show what's available in window
        console.log('🔍 Available window objects:');
        console.log('- window.factChecker:', typeof window.factChecker);
        console.log('- window.legalDatabase:', typeof window.legalDatabase);
        console.log('- window.enhancedDatabase:', typeof window.enhancedDatabase);
        console.log('- window.searchManager:', typeof window.searchManager);
    }
    
}, 5000); // Increased timeout to 5 seconds

// Helper function to inspect search results
window.debugSearchResults = function(query) {
    console.log(`🔍 Debug searching for: "${query}"`);
    
    if (window.searchManager && window.searchManager.searchEngine) {
        return window.searchManager.searchEngine.search(query, {
            maxResults: 100,
            minRelevance: 0
        }).then(results => {
            console.log(`Found ${results.length} results for "${query}"`);
            results.slice(0, 5).forEach((result, index) => {
                console.log(`${index + 1}. ${result.title} (Score: ${result.relevanceScore})`);
            });
            return results;
        }).catch(error => {
            console.error(`Search failed for "${query}":`, error);
            return [];
        });
    } else {
        console.error('SearchManager or SearchEngine not available');
        console.log('Available:', {
            searchManager: !!window.searchManager,
            searchEngine: !!(window.searchManager && window.searchManager.searchEngine)
        });
        return Promise.resolve([]);
    }
};

// Helper to check system status
window.debugSystemStatus = function() {
    console.log('� SYSTEM STATUS DEBUG');
    console.log('=====================');
    
    const status = {
        searchManager: !!window.searchManager,
        searchEngine: !!(window.searchManager && window.searchManager.searchEngine),
        database: !!window.legalDatabase,
        factChecker: !!window.factChecker,
        enhancedDatabase: !!window.enhancedDatabase
    };
    
    console.table(status);
    
    if (window.searchManager) {
        console.log('SearchManager details:');
        console.log('- Constructor name:', window.searchManager.constructor.name);
        console.log('- Has searchEngine:', !!window.searchManager.searchEngine);
        console.log('- Enhanced mode:', window.searchManager.enhancedMode);
    }
    
    return status;
};

console.log('�🛠️ Debug functions available:');
console.log('• debugSearchResults("query") - Test any search term');
console.log('• debugSystemStatus() - Check system status');
console.log('• Check console for automated test results in 5 seconds');
