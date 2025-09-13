// Search Configuration for Croatian Labor Law Fact Checker
// Optimized for better search results

export const SEARCH_CONFIG = {
    // Result limits
    DEFAULT_MAX_RESULTS: 25,           // Increased from 10 to show more results
    MINIMUM_DESIRED_RESULTS: 8,        // Minimum results we want to show
    FALLBACK_MAX_RESULTS: 15,          // Results for fallback searches
    
    // Language-specific limits
    CROATIAN_SEARCH_LIMIT: 20,         // More results for Croatian terms
    ENGLISH_SEARCH_LIMIT: 15,          // More results for English terms
    SPANISH_SEARCH_LIMIT: 10,          // Results for Spanish terms
    
    // Relevance thresholds (lowered for more inclusive results)
    DEFAULT_MIN_RELEVANCE: 0.001,      // Very low threshold
    STRICT_MIN_RELEVANCE: 0.1,         // For strict searches
    RELAXED_MIN_RELEVANCE: 0.0001,     // For relaxed searches
    
    // UI and behavior
    DEBOUNCE_DELAY: 300,
    MIN_QUERY_LENGTH: 2,               // Lowered from 3 to 2
    MAX_SUGGESTIONS: 8,
    MAX_HISTORY_ITEMS: 10,
    
    // Search features
    ENABLE_FUZZY_SEARCH: true,
    ENABLE_PHRASE_SEARCH: true,
    ENABLE_BOOLEAN_SEARCH: true,
    ENABLE_SYNONYMS: true,
    
    // Scoring weights (adjusted for better maternity leave results)
    TITLE_WEIGHT: 3.0,                // Higher weight for title matches
    CONTENT_WEIGHT: 1.0,
    SECTION_WEIGHT: 2.0,
    KEYWORD_WEIGHT: 2.5,               // Higher weight for keyword matches
    TRANSLATION_WEIGHT: 1.5,           // Weight for translated terms
    EXACT_MATCH_BONUS: 5.0,            // Bonus for exact matches
    PARTIAL_MATCH_BONUS: 2.0           // Bonus for partial matches
};

// Search option presets
export const getSearchOptions = {
    // Standard search - balanced approach
    standard: () => ({
        maxResults: SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
        minRelevance: SEARCH_CONFIG.DEFAULT_MIN_RELEVANCE,
        enableFuzzy: true,
        enableBoolean: true,
        enableSynonyms: true,
        scoringWeights: {
            title: SEARCH_CONFIG.TITLE_WEIGHT,
            content: SEARCH_CONFIG.CONTENT_WEIGHT,
            section: SEARCH_CONFIG.SECTION_WEIGHT,
            keywords: SEARCH_CONFIG.KEYWORD_WEIGHT
        }
    }),
    
    // Strict search - higher quality results
    strict: () => ({
        maxResults: Math.floor(SEARCH_CONFIG.DEFAULT_MAX_RESULTS * 0.6),
        minRelevance: SEARCH_CONFIG.STRICT_MIN_RELEVANCE,
        enableFuzzy: false,
        enableBoolean: true,
        enableSynonyms: false,
        scoringWeights: {
            title: SEARCH_CONFIG.TITLE_WEIGHT * 1.5,
            content: SEARCH_CONFIG.CONTENT_WEIGHT,
            section: SEARCH_CONFIG.SECTION_WEIGHT,
            keywords: SEARCH_CONFIG.KEYWORD_WEIGHT * 1.2
        }
    }),
    
    // Relaxed search - more inclusive results
    relaxed: () => ({
        maxResults: SEARCH_CONFIG.DEFAULT_MAX_RESULTS * 1.5,
        minRelevance: SEARCH_CONFIG.RELAXED_MIN_RELEVANCE,
        enableFuzzy: true,
        enableBoolean: true,
        enableSynonyms: true,
        enablePartialMatches: true,
        scoringWeights: {
            title: SEARCH_CONFIG.TITLE_WEIGHT,
            content: SEARCH_CONFIG.CONTENT_WEIGHT * 1.2,
            section: SEARCH_CONFIG.SECTION_WEIGHT,
            keywords: SEARCH_CONFIG.KEYWORD_WEIGHT
        }
    }),
    
    // Comprehensive search - for terms like "maternity leave"
    comprehensive: () => ({
        maxResults: 40,                // Even more results
        minRelevance: 0.0001,          // Very low threshold
        enableFuzzy: true,
        enableBoolean: true,
        enableSynonyms: true,
        enablePartialMatches: true,
        enableTranslations: true,
        scoringWeights: {
            title: SEARCH_CONFIG.TITLE_WEIGHT,
            content: SEARCH_CONFIG.CONTENT_WEIGHT,
            section: SEARCH_CONFIG.SECTION_WEIGHT,
            keywords: SEARCH_CONFIG.KEYWORD_WEIGHT,
            translation: SEARCH_CONFIG.TRANSLATION_WEIGHT
        }
    })
};

// Special terms that should use comprehensive search
export const COMPREHENSIVE_SEARCH_TERMS = [
    // English terms
    'maternity leave',
    'maternal leave',
    'paternity leave',
    'vacation',
    'holiday',
    'annual leave',
    'sick leave',
    'overtime',
    'working hours',
    'contract',
    'employment contract',
    'pregnancy',
    'baby',
    'maternity benefit',
    'leave',
    'working time',
    'hours',
    'days',
    'months',
    'years',
    'worker',
    'employee',
    'female worker',
    
    // Croatian terms
    'rodiljski dopust',
    'majčinski',
    'materinski',
    'godišnji odmor',
    'bolovanje',
    'prekovremeni rad',
    'radno vrijeme',
    'radna vremena',
    'ugovor',
    'ugovor o radu',
    'trudnoća',
    'dijete',
    'porodiljna',
    'odmor',
    'godišnji',
    'radnik',
    'radnica',
    'zaposlenik',
    'zaposlenica',
    'sati',
    'dana',
    'mjeseci',
    'godina',
    
    // Spanish terms
    'licencia maternidad',
    'licencia maternal',
    'licencia paternidad',
    'vacaciones',
    'vacaciones anuales',
    'días de vacaciones',
    'baja por enfermedad',
    'horas extra',
    'horas trabajo',
    'tiempo trabajo',
    'contrato',
    'contrato trabajo',
    'embarazo',
    'bebé',
    'prestación maternidad',
    'trabajador',
    'trabajadora',
    'empleado',
    'empleada',
    'horas',
    'días',
    'meses',
    'años'
];

export default SEARCH_CONFIG;
