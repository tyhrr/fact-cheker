# Croatian Labor Law Database v2.1.0 - Enhanced System

## 🚀 Overview

This enhanced Croatian Labor Law database system provides a complete, production-ready solution for managing and searching Croatian legal articles with advanced features including:

- **Advanced Search Engine** with boolean operators, fuzzy matching, and TF-IDF relevance scoring
- **Multi-layer Caching** with browser storage optimization and performance monitoring
- **Data Validation** with Croatian legal content support and integrity checking
- **Export/Import** functionality supporting PDF, CSV, JSON, and XML formats
- **Croatian Language Processing** with specialized text analysis and stemming
- **Event-driven Architecture** with comprehensive error handling and analytics

## 🏗️ Architecture

```
src/
├── core/
│   ├── LegalDatabase.js     # Main database class
│   └── SearchEngine.js      # Advanced search functionality
├── models/
│   ├── Article.js           # Article data model
│   └── SearchResult.js      # Search result model
├── utils/
│   ├── TextProcessor.js     # Croatian text processing
│   ├── CacheManager.js      # Multi-layer caching
│   ├── Validator.js         # Data validation
│   └── ExportManager.js     # Export/import functionality
├── tests/
│   └── database.test.js     # Comprehensive test suite
└── integration.js           # Integration layer for existing systems
```

## 📦 Core Components

### LegalDatabase
Main database class that integrates all components:
```javascript
import { LegalDatabase } from './core/LegalDatabase.js';

const db = new LegalDatabase({
    enableCache: true,
    enableSearch: true,
    enableValidation: true,
    language: 'hr'
});

await db.initialize('./data/croatian-labor-law.json');
```

### SearchEngine
Advanced search with Croatian language support:
```javascript
// Boolean search
const results = await db.search('radno AND vrijeme');

// Phrase search
const phrases = await db.search('"radni odnosi"');

// Category filtering
const filtered = await db.search('plaća', {
    categories: ['place-i-naknade']
});

// Fuzzy search for typos
const fuzzy = await db.search('ranik', { fuzzySearch: true });
```

### Article Model
Enhanced article structure with translations and metadata:
```javascript
import { Article } from './models/Article.js';

const article = new Article({
    id: 'rd-01',
    title: 'Osnovno o radnom vremenu',
    content: 'Detailed content...',
    category: 'radno-vrijeme',
    keywords: ['radno vrijeme', 'radni tjedan'],
    translations: {
        en: {
            title: 'Basics of Working Time',
            content: 'Translated content...'
        }
    },
    legalReferences: [{
        law: 'Zakon o radu',
        article: '60'
    }]
});
```

### TextProcessor
Croatian language processing utilities:
```javascript
import { TextProcessor } from './utils/TextProcessor.js';

const processor = new TextProcessor();

// Normalize Croatian text
const normalized = processor.normalizeText('Radni odnosi u Republici Hrvatskoj');

// Generate trigrams for fuzzy search
const trigrams = processor.generateTrigrams('radnik');

// Calculate text similarity
const similarity = processor.calculateSimilarity('radnik', 'radnica');

// Extract keywords
const keywords = processor.extractKeywords(content);
```

### CacheManager
Multi-layer caching with performance optimization:
```javascript
import { CacheManager } from './utils/CacheManager.js';

const cache = new CacheManager({
    maxSize: 100,
    defaultTTL: 3600000, // 1 hour
    useCompression: true
});

// Cache with automatic expiration
await cache.set('search-results', results, 1800000); // 30 minutes

// Retrieve with fallback to storage
const cached = await cache.get('search-results');

// Get performance statistics
const stats = cache.getStats();
```

## 🔍 Search Features

### Boolean Operators
```javascript
// AND operator
await db.search('radno AND vrijeme');

// OR operator  
await db.search('plaća OR naknada');

// NOT operator
await db.search('rad NOT prekovremeni');

// Required terms (+)
await db.search('+radno +vrijeme opcenito');

// Excluded terms (-)
await db.search('radno -prekovremeni');
```

### Phrase and Wildcard Search
```javascript
// Exact phrases
await db.search('"radni odnosi"');

// Wildcards
await db.search('rad*'); // radnik, raditi, etc.
await db.search('*rad'); // prekovremeni rad, etc.
```

### Advanced Filtering
```javascript
const results = await db.search('radno vrijeme', {
    categories: ['radno-vrijeme'],
    languages: ['hr', 'en'],
    sortBy: 'relevance',
    sortOrder: 'desc',
    maxResults: 20,
    minRelevance: 0.3
});
```

## 📊 Export/Import Capabilities

### Export Formats
```javascript
// PDF export with styling
const pdfResult = await db.export('pdf', {
    categories: ['radno-vrijeme'],
    language: 'hr',
    includeTranslations: false
});

// CSV export with custom fields
const csvResult = await db.export('csv', {
    fields: ['id', 'title', 'category', 'keywords'],
    filters: { category: 'place-i-naknade' }
});

// JSON export with metadata
const jsonResult = await db.export('json', {
    includeTranslations: true,
    includeMetadata: true
});

// XML export with schema
const xmlResult = await db.export('xml');
```

### Import Data
```javascript
// Import from JSON
const jsonData = `[{"id": "new-01", "title": "New Article", ...}]`;
const importResult = await db.import(jsonData, {
    format: 'json',
    validateData: true,
    mergeExisting: false
});

// Import from CSV with field mapping
const csvImport = await db.import(csvData, {
    format: 'csv',
    fieldMapping: { 'naslov': 'title', 'sadrzaj': 'content' }
});
```

## ✅ Data Validation

### Article Validation
```javascript
import { Validator } from './utils/Validator.js';

const validator = new Validator();

const validationResult = validator.validateArticle(articleData);
if (!validationResult.isValid) {
    console.log('Validation errors:', validationResult.errors);
    console.log('Warnings:', validationResult.warnings);
}
```

### Search Query Validation
```javascript
const queryValidation = validator.validateSearchQuery(searchQuery);
if (!queryValidation.isValid) {
    console.log('Invalid search query:', queryValidation.errors);
}
```

## 🧪 Testing

### Run Test Suite
```javascript
import { runTests } from './tests/database.test.js';

const testResults = await runTests();
console.log(`Tests completed: ${testResults.passed}/${testResults.total} passed`);
```

### Performance Testing
```javascript
// Test with large dataset
const performanceTest = async () => {
    const startTime = performance.now();
    
    // Add 1000 test articles
    for (let i = 0; i < 1000; i++) {
        await db.addArticle(generateTestArticle(i));
    }
    
    const endTime = performance.now();
    console.log(`Added 1000 articles in ${endTime - startTime}ms`);
    
    // Test search performance
    const searchStart = performance.now();
    const results = await db.search('radno vrijeme');
    const searchEnd = performance.now();
    
    console.log(`Search completed in ${searchEnd - searchStart}ms`);
};
```

## 🔄 Integration with Existing System

### Drop-in Replacement
```javascript
import { initializeFactChecker } from './integration.js';

// Initialize enhanced system
const factChecker = await initializeFactChecker({
    dataUrl: './data/croatian-labor-law.json',
    enableCache: true
});

// Use existing API methods
const results = await factChecker.search('radno vrijeme');
const article = await factChecker.getArticle('rd-01');
const categories = factChecker.getCategories();
```

### Advanced Integration
```javascript
import { EnhancedFactChecker } from './integration.js';

const enhancedChecker = new EnhancedFactChecker({
    enableCache: true,
    enableSearch: true,
    enableValidation: true,
    cacheSize: 200
});

await enhancedChecker.initialize();

// Advanced search with analytics
const searchResult = await enhancedChecker.advancedSearch({
    query: 'radno vrijeme',
    category: 'radno-vrijeme',
    sortBy: 'relevance',
    includeTranslations: true
});

// Get search suggestions
const suggestions = enhancedChecker.getSearchSuggestions('rad');

// Export data
const exportResult = await enhancedChecker.exportData('pdf', {
    categories: ['radno-vrijeme']
});
```

## 📈 Performance Monitoring

### Database Statistics
```javascript
const stats = db.getStats();
console.log('Database Statistics:', {
    totalArticles: stats.totalArticles,
    totalCategories: stats.totalCategories,
    searchStats: stats.searchStats,
    cacheStats: stats.cacheStats,
    performance: stats.performance
});
```

### Cache Performance
```javascript
const cacheStats = cache.getStats();
console.log('Cache Performance:', {
    hitRate: cacheStats.hitRate,
    missRate: cacheStats.missRate,
    totalSize: cacheStats.totalSize,
    entryCount: cacheStats.entryCount
});
```

## 🎯 Event System

### Listen for Database Events
```javascript
db.on('initialized', (data) => {
    console.log('Database initialized with', data.articleCount, 'articles');
});

db.on('articleAdded', (data) => {
    console.log('New article added:', data.article.title);
});

db.on('searchPerformed', (data) => {
    console.log(`Search "${data.query}" returned ${data.resultCount} results`);
});

db.on('indexBuilt', (data) => {
    console.log(`Search index built in ${data.buildTime}ms`);
});
```

## 🔧 Configuration Options

### Database Options
```javascript
const db = new LegalDatabase({
    enableCache: true,           // Enable caching system
    enableSearch: true,          // Enable search functionality  
    enableValidation: true,      // Enable data validation
    autoSave: false,            // Auto-save changes
    cacheSize: 100,             // Cache size limit
    language: 'hr',             // Default language
    dataUrl: './data/...',      // Default data URL
    searchOptions: {            // Search engine options
        fuzzyThreshold: 0.7,
        maxResults: 50,
        enableBooleanSearch: true
    },
    cacheOptions: {             // Cache manager options
        defaultTTL: 3600000,
        useCompression: true,
        maxStorageSize: 5242880
    }
});
```

### Search Engine Options
```javascript
const searchEngine = new SearchEngine({
    maxResults: 50,
    minRelevance: 0.1,
    fuzzyThreshold: 0.7,
    enableBooleanSearch: true,
    enablePhraseSearch: true,
    enableWildcardSearch: true,
    enableFuzzySearch: true,
    defaultOperator: 'AND'
});
```

## 🌍 Multi-language Support

### Croatian Language Processing
The system includes specialized processing for Croatian language features:

- **Diacritics handling** (ć, č, đ, š, ž)
- **Croatian stopwords** filtering
- **Legal terminology** recognition
- **Stemming** for Croatian words
- **Trigram-based** fuzzy matching

### Translation Support
```javascript
const article = new Article({
    title: 'Radno vrijeme',
    content: 'Croatian content...',
    translations: {
        en: {
            title: 'Working Time',
            content: 'English content...'
        },
        de: {
            title: 'Arbeitszeit',
            content: 'German content...'
        }
    }
});

// Search in specific language
const results = await db.search('working time', {
    languages: ['en']
});
```

## 🛡️ Security and Validation

### Data Integrity
- **Checksum validation** for cached data
- **Schema validation** for all articles
- **Reference validation** for legal citations
- **Consistency checks** between related fields

### Input Sanitization
- **XSS protection** for user inputs
- **SQL injection** prevention
- **File upload** validation
- **Size limits** enforcement

## 📝 Best Practices

### Performance Optimization
1. **Use caching** for frequently accessed data
2. **Batch operations** for multiple changes
3. **Limit search results** with appropriate maxResults
4. **Clean up expired cache** entries regularly

### Search Best Practices
1. **Use specific terms** for better results
2. **Combine operators** for complex queries
3. **Filter by category** when possible
4. **Set minimum relevance** to filter noise

### Data Management
1. **Validate data** before adding to database
2. **Use consistent IDs** for articles
3. **Include metadata** for better search
4. **Regular backups** of database state

## 🔗 API Reference

See individual component files for detailed API documentation:
- [LegalDatabase API](./core/LegalDatabase.js)
- [SearchEngine API](./core/SearchEngine.js)
- [Article Model API](./models/Article.js)
- [TextProcessor API](./utils/TextProcessor.js)
- [CacheManager API](./utils/CacheManager.js)
- [Validator API](./utils/Validator.js)
- [ExportManager API](./utils/ExportManager.js)

## 📄 License

This enhanced Croatian Labor Law database system is part of the Fact Checker 2.1 project.

---

**Version**: 2.1.0  
**Last Updated**: August 2025  
**Compatible**: Modern browsers with ES2020+ support
