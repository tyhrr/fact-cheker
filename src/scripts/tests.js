/* =========================================
   Test Suite - Croatian Labor Law Fact Checker
   Basic Unit Tests Framework
   ========================================= */

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async runAll() {
        console.log('🧪 Running Test Suite...');
        
        for (const test of this.tests) {
            try {
                await test.testFn();
                this.results.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.error(`❌ ${test.name}:`, error.message);
            }
            this.results.total++;
        }

        this.printSummary();
    }

    printSummary() {
        const { passed, failed, total } = this.results;
        const passRate = ((passed / total) * 100).toFixed(1);
        
        console.log(`\n📊 Test Results: ${passed}/${total} passed (${passRate}%)`);
        
        if (failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.warn(`⚠️ ${failed} tests failed`);
        }
    }

    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }
}

// Example tests
const testSuite = new TestSuite();

// Database tests
testSuite.test('Database should initialize', async () => {
    const db = new LegalDatabase();
    await db.initializeDatabase();
    testSuite.assert(db.isLoaded, 'Database should be loaded');
    testSuite.assert(db.articles.length > 0, 'Should have articles');
});

// Search tests
testSuite.test('Search should sanitize input', () => {
    if (typeof SecurityUtils !== 'undefined') {
        const maliciousInput = '<script>alert("xss")</script>';
        const sanitized = SecurityUtils.sanitizeSearchQuery(maliciousInput);
        testSuite.assert(!sanitized.includes('<script>'), 'Should remove script tags');
    }
});

// I18n tests
testSuite.test('I18n should translate keys', () => {
    if (typeof I18n !== 'undefined') {
        const i18n = new I18n();
        const translation = i18n.translate('site-title');
        testSuite.assert(translation !== 'site-title', 'Should return translation');
    }
});

// Export test suite
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestSuite;
} else {
    window.TestSuite = TestSuite;
    window.testSuite = testSuite;
}
