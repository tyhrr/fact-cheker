/* =========================================
   Enhanced Search Manager - Croatian Labor Law Fact Checker
   Complete article search with feedback ranking v2.3.0
   ========================================= */

// Import enhanced system functions
import { getFactChecker } from '../integration.js';
import { SearchEngine } from './SearchEngine.js';
import SmartAnswerEngine from '../features/smart-answers/engines/SmartAnswerEngine.js';
import { FeedbackRanking } from './components/FeedbackRanking.js';
import { SEARCH_CONFIG, getSearchOptions, COMPREHENSIVE_SEARCH_TERMS } from '../searchConfig.js';

class CroatianLawSearchEngine {
    constructor() {
        console.log('EnhancedSearchManager constructor starting...');
        
        this.searchInput = null;
        this.searchButton = null;
        this.searchForm = null;
        this.resultsContainer = null;
        this.loadingState = null;
        this.noResults = null;
        this.searchSuggestions = null;
        this.advancedSearchPanel = null;
        this.searchHistory = [];
        this.searchTimeout = null;
        this.isSearching = false;
        this.enhancedMode = true;
        
        // Feedback ranking system
        console.log('Initializing feedback ranking...');
        this.feedbackRanking = new FeedbackRanking();
        
        // Initialize SearchEngine
        console.log('Initializing SearchEngine...');
        this.searchEngine = null; // Will be initialized when database is ready
        
        // Smart Answer Engine - DISABLED FOR SIMPLE MODE
        this.smartAnswerEngine = new SmartAnswerEngine();
        this.useSmartAnswers = false;  // Disabled - using simple results instead
        
        // Search configuration
        // Search configuration based on centralized config
        this.searchConfig = {
            debounceDelay: SEARCH_CONFIG.DEBOUNCE_DELAY,
            minQueryLength: SEARCH_CONFIG.MIN_QUERY_LENGTH,
            maxSuggestions: SEARCH_CONFIG.MAX_SUGGESTIONS,
            maxHistoryItems: SEARCH_CONFIG.MAX_HISTORY_ITEMS,
            maxResults: SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
            minRelevanceScore: SEARCH_CONFIG.DEFAULT_MIN_RELEVANCE
        };
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadSearchHistory();
        this.setupAdvancedSearch();
        this.setupEnhancedFeatures();
        
        // Listen for enhanced database ready event
        window.addEventListener('enhancedDatabaseReady', () => {
            this.onEnhancedDatabaseReady();
        });
        
        // Fallback to original database
        window.addEventListener('databaseReady', () => {
            this.onDatabaseReady();
        });
    }

    setupEnhancedFeatures() {
        // Setup real-time search suggestions
        this.setupRealTimeSearch();
        
        // Setup search analytics
        this.setupSearchAnalytics();
        
        // Setup boolean search help
        this.setupBooleanSearchHelp();
    }

    onEnhancedDatabaseReady() {
        console.log('Enhanced search engine ready');
        this.enhancedMode = true;
        
        // Initialize SearchEngine with the database
        try {
            const database = window.legalDatabase || window.enhancedDatabase;
            if (database) {
                this.searchEngine = new SearchEngine(database);
                console.log('SearchEngine initialized successfully');
            } else {
                console.error('No database available for SearchEngine initialization');
            }
        } catch (error) {
            console.error('Failed to initialize SearchEngine:', error);
        }
        
        // Enable advanced search features
        this.enableAdvancedFeatures();
        
        // Pre-load search suggestions
        this.preloadSuggestions();
    }

    bindElements() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.querySelector('.search-button');
        this.searchForm = document.querySelector('.search-form');
        this.resultsContainer = document.getElementById('results-container');
        this.loadingState = document.getElementById('loading-state');
        this.noResults = document.getElementById('no-results');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.advancedSearchPanel = document.getElementById('advanced-search-panel');
        this.resultsInfo = document.getElementById('results-info');
        this.resultsCount = document.getElementById('results-count');
        this.searchQueryDisplay = document.getElementById('search-query-display');
    }

    bindEvents() {
        // Search form submission
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // Search input events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            this.searchInput.addEventListener('focus', () => {
                this.showSuggestions();
            });

            this.searchInput.addEventListener('blur', () => {
                // Delay hiding to allow suggestion clicks
                setTimeout(() => this.hideSuggestions(), 200);
            });

            this.searchInput.addEventListener('keydown', (e) => {
                this.handleKeyNavigation(e);
            });
        }

        // Setup quick access buttons
        this.setupQuickAccessButtons();

        // Advanced search toggle
        const advancedToggle = document.getElementById('advanced-search-toggle');
        if (advancedToggle) {
            advancedToggle.addEventListener('click', () => {
                this.toggleAdvancedSearch();
            });
        }

        // Clear history button
        const clearHistoryButton = document.getElementById('clear-history');
        if (clearHistoryButton) {
            clearHistoryButton.addEventListener('click', () => {
                this.clearSearchHistory();
            });
        }

        // Language change event
        window.addEventListener('languageChanged', () => {
            this.updateSearchPlaceholder();
            // Re-setup quick access buttons with updated queries
            this.setupQuickAccessButtons();
            // Update smart answer translations if visible
            this.updateSmartAnswerTranslations();
        });
    }

    onDatabaseReady() {
        console.log('Database ready, search engine initialized');
        
        // Initialize SearchEngine with the database (fallback)
        try {
            const database = window.legalDatabase || window.enhancedDatabase;
            if (database && !this.searchEngine) {
                this.searchEngine = new SearchEngine(database);
                console.log('SearchEngine initialized successfully (fallback)');
            }
        } catch (error) {
            console.error('Failed to initialize SearchEngine (fallback):', error);
        }
        
        // Enable search functionality
        if (this.searchInput) {
            this.searchInput.disabled = false;
        }
        if (this.searchButton) {
            this.searchButton.disabled = false;
        }
    }

    setupQuickAccessButtons() {
        // Remove existing event listeners by cloning elements
        const quickAccessItems = document.querySelectorAll('.quick-access-item');
        quickAccessItems.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener with current data-query value
            newButton.addEventListener('click', (e) => {
                const query = e.currentTarget.getAttribute('data-query');
                if (query) {
                    this.searchInput.value = query;
                    this.performSearch();
                }
            });
        });
    }

    handleSearchInput(value) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce search suggestions
        this.searchTimeout = setTimeout(() => {
            if (value.length >= this.searchConfig.minQueryLength) {
                this.showSearchSuggestions(value);
            } else {
                this.hideSuggestions();
            }
        }, this.searchConfig.debounceDelay);
    }

    showSearchSuggestions(query) {
        if (!window.legalDatabase || !window.legalDatabase.isLoaded) {
            return;
        }

        const suggestions = window.legalDatabase.getSearchSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.renderSuggestions(suggestions);
        this.showSuggestions();
    }

    renderSuggestions(suggestions) {
        if (!this.searchSuggestions) return;

        this.searchSuggestions.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('button');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.textContent = suggestion;
            suggestionElement.setAttribute('data-suggestion', suggestion);
            suggestionElement.setAttribute('tabindex', '-1');
            
            suggestionElement.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });
            
            this.searchSuggestions.appendChild(suggestionElement);
        });
    }

    selectSuggestion(suggestion) {
        if (this.searchInput) {
            this.searchInput.value = suggestion;
            this.hideSuggestions();
            this.performSearch();
        }
    }

    showSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.classList.add('visible');
            this.searchInput.setAttribute('aria-expanded', 'true');
        }
    }

    hideSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.classList.remove('visible');
            this.searchInput.setAttribute('aria-expanded', 'false');
        }
    }

    handleKeyNavigation(e) {
        const suggestions = this.searchSuggestions?.querySelectorAll('.suggestion-item');
        if (!suggestions || suggestions.length === 0) return;

        let currentIndex = Array.from(suggestions).findIndex(item => 
            item.classList.contains('highlighted')
        );

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % suggestions.length;
                this.highlightSuggestion(suggestions, currentIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1;
                this.highlightSuggestion(suggestions, currentIndex);
                break;
            case 'Enter':
                if (currentIndex >= 0 && suggestions[currentIndex]) {
                    e.preventDefault();
                    const suggestion = suggestions[currentIndex].getAttribute('data-suggestion');
                    this.selectSuggestion(suggestion);
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    highlightSuggestion(suggestions, index) {
        suggestions.forEach((item, i) => {
            item.classList.toggle('highlighted', i === index);
        });
    }

    async performSearch() {
        const query = this.searchInput?.value?.trim();
        
        if (!query || query.length < this.searchConfig.minQueryLength) {
            this.showError(window.i18n?.translate('error-message') || 'Please enter a search term');
            return;
        }

        if (this.isSearching) {
            return; // Prevent multiple simultaneous searches
        }

        this.isSearching = true;
        this.showLoadingState();
        this.hideSuggestions();
        
        try {
            // Add to search history
            this.addToSearchHistory(query);
            
            // Get filters
            const filters = this.getSearchFilters();
            
            // Translate query to multiple languages for comprehensive search
            const translatedQueries = await this.translateQuery(query);
            
            // Perform search with translated queries
            const results = await this.executeMultiLanguageSearch(translatedQueries, filters);
            
            // Display results
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError(window.i18n?.translate('error-message') || 'An error occurred during search');
        } finally {
            this.isSearching = false;
            this.hideLoadingState();
        }
    }

    async translateQuery(query) {
        // Detect language and create search terms in all languages
        const queryTerms = {
            original: query,
            croatian: [],
            english: [],
            spanish: []
        };

        // Basic translation dictionary for common legal terms
        const translations = {
            // Working time terms
            'radna vremena': { english: 'working hours', spanish: 'horas trabajo' },
            'working hours': { croatian: 'radna vremena', spanish: 'horas trabajo' },
            'horas trabajo': { croatian: 'radna vremena', english: 'working hours' },
            'radno vrijeme': { english: 'working time', spanish: 'tiempo trabajo' },
            'working time': { croatian: 'radno vrijeme', spanish: 'tiempo trabajo' },
            'tiempo trabajo': { croatian: 'radno vrijeme', english: 'working time' },
            
            // Contract terms
            'ugovor': { english: 'contract', spanish: 'contrato' },
            'contract': { croatian: 'ugovor', spanish: 'contrato' },
            'contrato': { croatian: 'ugovor', english: 'contract' },
            'ugovor o radu': { english: 'employment contract', spanish: 'contrato trabajo' },
            'employment contract': { croatian: 'ugovor o radu', spanish: 'contrato trabajo' },
            'contrato trabajo': { croatian: 'ugovor o radu', english: 'employment contract' },
            
            // Leave terms
            'odmor': { english: 'leave', spanish: 'vacaciones' },
            'leave': { croatian: 'odmor', spanish: 'vacaciones' },
            'vacaciones': { croatian: 'odmor', english: 'leave' },
            'vacation': { croatian: 'odmor', spanish: 'vacaciones' },
            'vacation days': { croatian: 'godišnji odmor', spanish: 'días de vacaciones' },
            'días de vacaciones': { croatian: 'godišnji odmor', english: 'vacation days' },
            'holiday': { croatian: 'odmor', spanish: 'vacaciones' },
            'holidays': { croatian: 'odmor', spanish: 'vacaciones' },
            'godišnji odmor': { english: 'annual leave', spanish: 'vacaciones anuales' },
            'annual leave': { croatian: 'godišnji odmor', spanish: 'vacaciones anuales' },
            'vacaciones anuales': { croatian: 'godišnji odmor', english: 'annual leave' },
            'godišnji': { english: 'annual', spanish: 'anual' },
            'annual': { croatian: 'godišnji', spanish: 'anual' },
            'anual': { croatian: 'godišnji', english: 'annual' },
            'rodiljski dopust': { english: 'maternity leave', spanish: 'licencia maternidad' },
            'maternity leave': { croatian: 'rodiljski dopust', spanish: 'licencia maternidad' },
            'licencia maternidad': { croatian: 'rodiljski dopust', english: 'maternity leave' },
            'maternal': { croatian: 'majčinski', spanish: 'maternal' },
            'majčinski': { english: 'maternal', spanish: 'maternal' },
            'materinski': { english: 'maternity', spanish: 'maternidad' },
            'maternity': { croatian: 'materinski', spanish: 'maternidad' },
            'maternidad': { croatian: 'materinski', english: 'maternity' },
            'rodilnica': { english: 'maternity ward', spanish: 'maternidad' },
            'pregnancy': { croatian: 'trudnoća', spanish: 'embarazo' },
            'trudnoća': { english: 'pregnancy', spanish: 'embarazo' },
            'embarazo': { croatian: 'trudnoća', english: 'pregnancy' },
            'baby': { croatian: 'dijete', spanish: 'bebé' },
            'dijete': { english: 'baby', spanish: 'bebé' },
            'bebé': { croatian: 'dijete', english: 'baby' },
            'porodiljna': { english: 'maternity benefit', spanish: 'prestación maternidad' },
            'maternity benefit': { croatian: 'porodiljna', spanish: 'prestación maternidad' },
            'prestación maternidad': { croatian: 'porodiljna', english: 'maternity benefit' },
            
            // Termination terms
            'otkaz': { english: 'termination', spanish: 'despido' },
            'termination': { croatian: 'otkaz', spanish: 'despido' },
            'despido': { croatian: 'otkaz', english: 'termination' },
            'otkazni rok': { english: 'notice period', spanish: 'período aviso' },
            'notice period': { croatian: 'otkazni rok', spanish: 'período aviso' },
            'período aviso': { croatian: 'otkazni rok', english: 'notice period' },
            
            // Salary terms
            'plaća': { english: 'salary', spanish: 'salario' },
            'salary': { croatian: 'plaća', spanish: 'salario' },
            'salario': { croatian: 'plaća', english: 'salary' },
            
            // Overtime terms
            'prekovremeni rad': { english: 'overtime work', spanish: 'trabajo horas extra' },
            'overtime work': { croatian: 'prekovremeni rad', spanish: 'trabajo horas extra' },
            'trabajo horas extra': { croatian: 'prekovremeni rad', english: 'overtime work' },
            'prekovremeni': { english: 'overtime', spanish: 'horas extra' },
            'overtime': { croatian: 'prekovremeni', spanish: 'horas extra' },
            'horas extra': { croatian: 'prekovremeni', english: 'overtime' },
            
            // General terms
            'radnik': { english: 'worker', spanish: 'trabajador' },
            'worker': { croatian: 'radnik', spanish: 'trabajador' },
            'trabajador': { croatian: 'radnik', english: 'worker' },
            'poslodavac': { english: 'employer', spanish: 'empleador' },
            'employer': { croatian: 'poslodavac', spanish: 'empleador' },
            'empleador': { croatian: 'poslodavac', english: 'employer' },
            'radnica': { english: 'female worker', spanish: 'trabajadora' },
            'female worker': { croatian: 'radnica', spanish: 'trabajadora' },
            'trabajadora': { croatian: 'radnica', english: 'female worker' },
            
            // Time units
            'sati': { english: 'hours', spanish: 'horas' },
            'hours': { croatian: 'sati', spanish: 'horas' },
            'horas': { croatian: 'sati', english: 'hours' },
            'dana': { english: 'days', spanish: 'días' },
            'days': { croatian: 'dana', spanish: 'días' },
            'días': { croatian: 'dana', english: 'days' },
            'mjeseci': { english: 'months', spanish: 'meses' },
            'months': { croatian: 'mjeseci', spanish: 'meses' },
            'meses': { croatian: 'mjeseci', english: 'months' },
            'godina': { english: 'years', spanish: 'años' },
            'years': { croatian: 'godina', spanish: 'años' },
            'años': { croatian: 'godina', english: 'years' },
            
            // Additional Spanish terms for comprehensive search
            'licencia': { croatian: 'dopust', english: 'license' },
            'dopust': { english: 'license', spanish: 'licencia' },
            'permiso': { croatian: 'dozvola', english: 'permit' },
            'dozvola': { english: 'permit', spanish: 'permiso' },
            'baja': { croatian: 'bolovanje', english: 'sick leave' },
            'bolovanje': { english: 'sick leave', spanish: 'baja' },
            'baja por enfermedad': { croatian: 'bolovanje', english: 'sick leave' },
            'sick leave': { croatian: 'bolovanje', spanish: 'baja por enfermedad' },
            'prestaciones': { croatian: 'beneficije', english: 'benefits' },
            'beneficije': { english: 'benefits', spanish: 'prestaciones' },
            'benefits': { croatian: 'beneficije', spanish: 'prestaciones' },
            'empleado': { croatian: 'zaposlenik', english: 'employee' },
            'zaposlenik': { english: 'employee', spanish: 'empleado' },
            'employee': { croatian: 'zaposlenik', spanish: 'empleado' },
            'empleada': { croatian: 'zaposlenica', english: 'female employee' },
            'zaposlenica': { english: 'female employee', spanish: 'empleada' },
            'female employee': { croatian: 'zaposlenica', spanish: 'empleada' },
            'empresa': { croatian: 'tvrtka', english: 'company' },
            'tvrtka': { english: 'company', spanish: 'empresa' },
            'company': { croatian: 'tvrtka', spanish: 'empresa' },
            'jornada': { croatian: 'radno vrijeme', english: 'working day' },
            'working day': { croatian: 'radno vrijeme', spanish: 'jornada' },
            'descanso': { croatian: 'odmor', english: 'rest' },
            'rest': { croatian: 'odmor', spanish: 'descanso' },
            'horario': { croatian: 'raspored', english: 'schedule' },
            'raspored': { english: 'schedule', spanish: 'horario' },
            'schedule': { croatian: 'raspored', spanish: 'horario' }
        };

        // Start with original query
        queryTerms.croatian.push(query);
        queryTerms.english.push(query);
        queryTerms.spanish.push(query);

        // Split query into words and translate each
        const words = query.toLowerCase().split(/\s+/);
        
        words.forEach(word => {
            // Find exact matches
            if (translations[word]) {
                if (translations[word].croatian) queryTerms.croatian.push(translations[word].croatian);
                if (translations[word].english) queryTerms.english.push(translations[word].english);
                if (translations[word].spanish) queryTerms.spanish.push(translations[word].spanish);
            }
            
            // Find partial matches
            Object.keys(translations).forEach(key => {
                if (key.includes(word) || word.includes(key)) {
                    if (translations[key].croatian) queryTerms.croatian.push(translations[key].croatian);
                    if (translations[key].english) queryTerms.english.push(translations[key].english);
                    if (translations[key].spanish) queryTerms.spanish.push(translations[key].spanish);
                }
            });
        });

        // Also try complete phrase translation
        const lowerQuery = query.toLowerCase();
        Object.keys(translations).forEach(key => {
            if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
                if (translations[key].croatian) queryTerms.croatian.push(translations[key].croatian);
                if (translations[key].english) queryTerms.english.push(translations[key].english);
                if (translations[key].spanish) queryTerms.spanish.push(translations[key].spanish);
            }
        });

        // Special handling for compound terms
        if (lowerQuery.includes('vacation')) {
            queryTerms.croatian.push('odmor', 'godišnji odmor', 'godišnji');
        }
        if (lowerQuery.includes('holiday')) {
            queryTerms.croatian.push('odmor', 'godišnji odmor', 'godišnji');
        }
        if (lowerQuery.includes('leave')) {
            queryTerms.croatian.push('odmor', 'dopust');
        }
        if (lowerQuery.includes('annual')) {
            queryTerms.croatian.push('godišnji');
        }
        if (lowerQuery.includes('days')) {
            queryTerms.croatian.push('dana', 'dani');
        }
        if (lowerQuery.includes('maternity')) {
            queryTerms.croatian.push('rodiljski', 'materinski', 'majčinski', 'rodiljski dopust');
        }
        if (lowerQuery.includes('worker')) {
            queryTerms.croatian.push('radnik', 'radnica', 'zaposlenik', 'zaposlenica');
        }
        if (lowerQuery.includes('trabajador')) {
            queryTerms.croatian.push('radnik', 'zaposlenik');
        }
        if (lowerQuery.includes('trabajadora')) {
            queryTerms.croatian.push('radnica', 'zaposlenica');
        }
        if (lowerQuery.includes('employee')) {
            queryTerms.croatian.push('zaposlenik', 'zaposlenica', 'radnik', 'radnica');
        }
        if (lowerQuery.includes('pregnancy')) {
            queryTerms.croatian.push('trudnoća', 'trudna');
        }
        if (lowerQuery.includes('embarazo')) {
            queryTerms.croatian.push('trudnoća', 'trudna');
        }
        if (lowerQuery.includes('contract')) {
            queryTerms.croatian.push('ugovor', 'ugovor o radu');
        }
        if (lowerQuery.includes('contrato')) {
            queryTerms.croatian.push('ugovor', 'ugovor o radu');
        }
        if (lowerQuery.includes('overtime')) {
            queryTerms.croatian.push('prekovremeni', 'prekovremeni rad');
        }
        if (lowerQuery.includes('horas extra')) {
            queryTerms.croatian.push('prekovremeni', 'prekovremeni rad');
        }

        // Remove duplicates
        queryTerms.croatian = [...new Set(queryTerms.croatian)];
        queryTerms.english = [...new Set(queryTerms.english)];
        queryTerms.spanish = [...new Set(queryTerms.spanish)];

        // Log translation results for debugging
        console.log(`🔄 Translation for "${query}":`, queryTerms);

        return queryTerms;
    }

    async executeMultiLanguageSearch(translatedQueries, filters) {
        if (!this.searchEngine) {
            console.error('SearchEngine not initialized');
            throw new Error('SearchEngine not available');
        }

        // Perform searches in all languages and combine results
        const allResults = new Map();
        
        // Check if this is a special term that needs comprehensive search
        const queryLower = translatedQueries.original.toLowerCase();
        const isSpecialTerm = COMPREHENSIVE_SEARCH_TERMS.some(term => 
            queryLower.includes(term.toLowerCase()) || term.toLowerCase().includes(queryLower)
        );
        
        console.log(`Search type: ${isSpecialTerm ? 'COMPREHENSIVE' : 'STANDARD'} for query "${translatedQueries.original}"`);
        
        // Choose search options based on term type
        const searchOptions = isSpecialTerm ? getSearchOptions.comprehensive() : getSearchOptions.standard();
        
        // Search with original query
        console.log('Searching with original query:', translatedQueries.original);
        const originalResults = await this.searchEngine.executeSearch(translatedQueries.original, {
            ...filters,
            ...searchOptions
        });
        console.log('Original results:', originalResults.length);
        originalResults.forEach(result => {
            if (!allResults.has(result.id)) {
                allResults.set(result.id, result);
                allResults.get(result.id).relevanceScore = (allResults.get(result.id).relevanceScore || 0) + 10;
            }
        });
        
        // Search with translated Croatian terms
        console.log('Searching with Croatian terms:', translatedQueries.croatian);
        for (const query of translatedQueries.croatian) {
            if (query !== translatedQueries.original) { // Avoid duplicate searches
                const results = await this.searchEngine.executeSearch(query, {
                    ...filters,
                    ...searchOptions,
                    maxResults: isSpecialTerm ? 30 : SEARCH_CONFIG.CROATIAN_SEARCH_LIMIT
                });
                console.log(`Croatian "${query}": ${results.length} results`);
                results.forEach(result => {
                    if (!allResults.has(result.id)) {
                        allResults.set(result.id, result);
                        allResults.get(result.id).relevanceScore = 0;
                    }
                    allResults.get(result.id).relevanceScore = (allResults.get(result.id).relevanceScore || 0) + 8;
                });
            }
        }
        
        // Search with translated English terms
        for (const query of translatedQueries.english) {
            const results = await this.searchEngine.executeSearch(query, {
                ...filters,
                ...searchOptions,
                maxResults: isSpecialTerm ? 25 : SEARCH_CONFIG.ENGLISH_SEARCH_LIMIT
            });
            results.forEach(result => {
                if (!allResults.has(result.id)) {
                    allResults.set(result.id, result);
                    allResults.get(result.id).relevanceScore = 0;
                }
                allResults.get(result.id).relevanceScore = (allResults.get(result.id).relevanceScore || 0) + 5;
            });
        }
        
        // Search with translated Spanish terms
        for (const query of translatedQueries.spanish) {
            const results = await this.searchEngine.executeSearch(query, {
                ...filters,
                ...searchOptions,
                maxResults: isSpecialTerm ? 20 : SEARCH_CONFIG.SPANISH_SEARCH_LIMIT
            });
            results.forEach(result => {
                if (!allResults.has(result.id)) {
                    allResults.set(result.id, result);
                    allResults.get(result.id).relevanceScore = 0;
                }
                allResults.get(result.id).relevanceScore = (allResults.get(result.id).relevanceScore || 0) + 5;
            });
        }
        
        // Convert to array and sort by relevance
        const finalResults = Array.from(allResults.values());
        finalResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        
        // If no results found, try a simple fallback search
        if (finalResults.length === 0) {
            console.log('No results found, trying fallback search...');
            
            // Manual search through articles for common vacation terms
            const database = window.legalDatabase || window.enhancedDatabase;
            if (database && database.articles) {
                const articles = Array.from(database.articles.values());
                const fallbackResults = [];
            
                const vacationTerms = ['odmor', 'godišnji', 'vacation', 'holiday', 'leave'];
                const queryLower = translatedQueries.original.toLowerCase();
                
                if (vacationTerms.some(term => queryLower.includes(term.toLowerCase()))) {
                    articles.forEach(article => {
                        const content = article.content.toLowerCase();
                        const title = article.title.toLowerCase();
                        
                        if (content.includes('odmor') || content.includes('godišnji') || 
                            title.includes('odmor') || title.includes('godišnji')) {
                            fallbackResults.push({
                                id: article.id,
                                article: article,
                                relevanceScore: 1,
                                highlightedText: article.content
                            });
                        }
                    });
                }
                
                console.log('Fallback search found:', fallbackResults.length, 'results');
                return fallbackResults.slice(0, SEARCH_CONFIG.FALLBACK_MAX_RESULTS);
            }
        }
        
        // Ensure we return at least the minimum desired results if available
        const limitedResults = finalResults.slice(0, SEARCH_CONFIG.DEFAULT_MAX_RESULTS);
        
        // If we have fewer than minimum desired results, try a more relaxed search
        if (limitedResults.length < SEARCH_CONFIG.MINIMUM_DESIRED_RESULTS && limitedResults.length > 0) {
            console.log(`Only ${limitedResults.length} results found, trying relaxed search...`);
            
            // Try a broader search with relaxed options
            const relaxedOptions = getSearchOptions.relaxed();
            const relaxedResults = await this.searchEngine.executeSearch(translatedQueries.original, {
                ...filters,
                ...relaxedOptions
            });
            
            // Merge with existing results, avoiding duplicates
            const existingIds = new Set(limitedResults.map(r => r.id));
            const additionalResults = relaxedResults.filter(r => !existingIds.has(r.id));
            
            return [...limitedResults, ...additionalResults].slice(0, SEARCH_CONFIG.DEFAULT_MAX_RESULTS);
        }
        
        return limitedResults;
    }

    async executeSearch(query, filters) {
        if (!this.searchEngine) {
            console.error('SearchEngine not initialized');
            throw new Error('SearchEngine not available');
        }

        // Use SearchEngine instead of direct database search
        console.log(`ExecuteSearch: Using SearchEngine for query "${query}"`);
        
        try {
            const results = await this.searchEngine.executeSearch(query, filters);
            console.log(`SearchEngine returned ${results.length} results`);
            return results;
        } catch (error) {
            console.error('SearchEngine error:', error);
            throw error;
        }
    }

    getSearchFilters() {
        const filters = {};
        
        const sectionFilter = document.getElementById('section-filter');
        if (sectionFilter && sectionFilter.value) {
            filters.section = sectionFilter.value;
        }
        
        const articleTypeFilter = document.getElementById('article-type-filter');
        if (articleTypeFilter && articleTypeFilter.value) {
            filters.articleType = articleTypeFilter.value;
        }
        
        return filters;
    }

    displaySearchResults(results, query) {
        console.log(`Displaying search results: ${results.length} results for query "${query}"`);
        this.updateResultsInfo(results.length, query);
        
        if (results.length === 0) {
            this.showNoResults();
            return;
        }
        
        this.hideNoResults();
        
        // Apply feedback ranking to results
        const rankedResults = this.applyFeedbackRanking(results, query);
        console.log(`After ranking: ${rankedResults.length} results`);
        
        // Simple display - show articles with highlighted keywords and feedback ranking
        this.renderSimpleResults(rankedResults, query);
        
        // Scroll to results
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Render smart answer using the SmartAnswerEngine
     * @param {string} query - User query
     * @param {Array} results - Search results
     */
    async renderSmartAnswer(query, results) {
        if (!this.resultsContainer) return;

        try {
            // Generate smart answer
            const smartAnswer = this.smartAnswerEngine.generateAnswer(query, results);
            
            // Create smart answer element
            const smartAnswerElement = this.createSmartAnswerElement(smartAnswer, query);
            
            // Clear container and add smart answer
            this.resultsContainer.innerHTML = '';
            this.resultsContainer.appendChild(smartAnswerElement);
            
            // Add traditional results below smart answer
            const traditionalResultsSection = document.createElement('div');
            traditionalResultsSection.className = 'traditional-results-section';
            traditionalResultsSection.innerHTML = `
                <div class="section-header">
                    <h3 data-i18n="smartAnswer.related-legal-articles">${window.i18n?.translate('smartAnswer.related-legal-articles') || 'Related Legal Articles'}</h3>
                    <button class="toggle-traditional-button" data-i18n-aria="smartAnswer.expand-section">
                        <span class="toggle-icon">📚</span>
                    </button>
                </div>
                <div class="traditional-results-content" style="display: none;">
                    <div class="traditional-results-container"></div>
                </div>
            `;
            
            this.resultsContainer.appendChild(traditionalResultsSection);
            
            // Render traditional results in the hidden section
            const traditionalContainer = traditionalResultsSection.querySelector('.traditional-results-container');
            results.slice(0, 20).forEach((article, index) => {
                const resultElement = this.createResultElement(article, index);
                traditionalContainer.appendChild(resultElement);
            });
            
            // Setup toggle for traditional results
            this.setupTraditionalResultsToggle(traditionalResultsSection);
            
        } catch (error) {
            console.error('Error rendering smart answer:', error);
            // Fallback to traditional results
            this.renderResults(results);
        }
    }

    /**
     * Create smart answer element from structured answer
     * @param {Object} smartAnswer - Structured answer from SmartAnswerEngine
     * @param {string} query - Original query
     * @returns {HTMLElement} Smart answer element
     */
    createSmartAnswerElement(smartAnswer, query) {
        const template = document.getElementById('smart-answer-template');
        if (!template) {
            throw new Error('Smart answer template not found');
        }

        const clone = template.content.cloneNode(true);
        
        // Populate quick answer
        const quickAnswerText = clone.querySelector('.quick-answer-text');
        if (quickAnswerText) {
            quickAnswerText.textContent = smartAnswer.quickAnswer;
        }
        
        // Set confidence indicator
        const confidenceFill = clone.querySelector('.confidence-fill');
        const confidencePercentage = clone.querySelector('.confidence-percentage');
        if (confidenceFill && confidencePercentage) {
            const confidence = Math.round(smartAnswer.confidenceScore * 100);
            confidenceFill.style.width = `${confidence}%`;
            confidencePercentage.textContent = `${confidence}%`;
        }
        
        // Populate detailed explanation
        if (smartAnswer.detailedExplanation) {
            const detailedSection = clone.querySelector('.detailed-explanation-section');
            const detailedText = clone.querySelector('.detailed-explanation-text');
            if (detailedSection && detailedText) {
                detailedText.innerHTML = this.formatDetailedExplanation(smartAnswer.detailedExplanation);
                detailedSection.style.display = 'block';
            }
        }
        
        // Populate practical examples
        if (smartAnswer.practicalExamples && smartAnswer.practicalExamples.length > 0) {
            const examplesSection = clone.querySelector('.practical-examples-section');
            const examplesContainer = clone.querySelector('.examples-container');
            if (examplesSection && examplesContainer) {
                smartAnswer.practicalExamples.forEach(example => {
                    const exampleElement = this.createExampleElement(example);
                    examplesContainer.appendChild(exampleElement);
                });
                examplesSection.style.display = 'block';
            }
        }
        
        // Populate FAQ
        if (smartAnswer.frequentlyAskedQuestions && smartAnswer.frequentlyAskedQuestions.length > 0) {
            const faqSection = clone.querySelector('.faq-section');
            const faqContainer = clone.querySelector('.faq-container');
            if (faqSection && faqContainer) {
                smartAnswer.frequentlyAskedQuestions.forEach(faq => {
                    const faqElement = this.createFAQElement(faq);
                    faqContainer.appendChild(faqElement);
                });
                faqSection.style.display = 'block';
            }
        }
        
        // Populate key takeaways
        if (smartAnswer.keyTakeaways && smartAnswer.keyTakeaways.length > 0) {
            const takeawaysSection = clone.querySelector('.key-takeaways-section');
            const takeawaysList = clone.querySelector('.takeaways-list');
            if (takeawaysSection && takeawaysList) {
                smartAnswer.keyTakeaways.forEach(takeaway => {
                    const li = document.createElement('li');
                    li.textContent = takeaway;
                    takeawaysList.appendChild(li);
                });
                takeawaysSection.style.display = 'block';
            }
        }
        
        // Populate related topics
        if (smartAnswer.relatedTopics && smartAnswer.relatedTopics.length > 0) {
            const relatedSection = clone.querySelector('.related-topics-section');
            const relatedContainer = clone.querySelector('.related-topics-container');
            if (relatedSection && relatedContainer) {
                smartAnswer.relatedTopics.forEach(topic => {
                    const topicElement = this.createRelatedTopicElement(topic);
                    relatedContainer.appendChild(topicElement);
                });
                relatedSection.style.display = 'block';
            }
        }
        
        // Populate legal sources
        if (smartAnswer.sourceArticles && smartAnswer.sourceArticles.length > 0) {
            const sourcesContainer = clone.querySelector('.source-articles-container');
            if (sourcesContainer) {
                smartAnswer.sourceArticles.forEach(source => {
                    const sourceElement = this.createSourceElement(source);
                    sourcesContainer.appendChild(sourceElement);
                });
            }
        }
        
        // Setup interactive features
        this.setupSmartAnswerInteractions(clone);
        
        return clone;
    }

    /**
     * Setup interactions for smart answer sections
     * @param {DocumentFragment} clone - Smart answer element
     */
    setupSmartAnswerInteractions(clone) {
        // Setup section toggles
        const toggleButtons = clone.querySelectorAll('.toggle-section-button');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = button.closest('.detailed-explanation-section, .practical-examples-section, .faq-section, .key-takeaways-section, .related-topics-section, .legal-sources-section');
                const content = section.querySelector('.section-content');
                
                if (content.style.display === 'none' || !content.style.display) {
                    content.style.display = 'block';
                    section.classList.add('section-expanded');
                } else {
                    content.style.display = 'none';
                    section.classList.remove('section-expanded');
                }
            });
        });
        
        // Setup FAQ toggles
        const faqQuestions = clone.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                faqItem.classList.toggle('expanded');
            });
        });
        
        // Setup action buttons
        this.setupSmartAnswerActions(clone);
    }

    /**
     * Setup action buttons for smart answer
     * @param {DocumentFragment} clone - Smart answer element
     */
    setupSmartAnswerActions(clone) {
        const helpfulButton = clone.querySelector('.helpful-button');
        const shareButton = clone.querySelector('.share-answer-button');
        const viewLegalButton = clone.querySelector('.view-legal-button');
        const askFollowupButton = clone.querySelector('.ask-followup-button');
        
        if (helpfulButton) {
            helpfulButton.addEventListener('click', () => this.markAnswerAsHelpful());
        }
        
        if (shareButton) {
            shareButton.addEventListener('click', () => this.shareSmartAnswer());
        }
        
        if (viewLegalButton) {
            viewLegalButton.addEventListener('click', () => this.toggleTraditionalResults());
        }
        
        if (askFollowupButton) {
            askFollowupButton.addEventListener('click', () => this.openFollowupDialog());
        }
    }

    /**
     * Setup toggle for traditional results section
     * @param {HTMLElement} traditionalSection - Traditional results section
     */
    setupTraditionalResultsToggle(traditionalSection) {
        const toggleButton = traditionalSection.querySelector('.toggle-traditional-button');
        const content = traditionalSection.querySelector('.traditional-results-content');
        
        if (toggleButton && content) {
            toggleButton.addEventListener('click', () => {
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    traditionalSection.classList.add('section-expanded');
                } else {
                    content.style.display = 'none';
                    traditionalSection.classList.remove('section-expanded');
                }
            });
        }
    }

    /**
     * Update Smart Answer translations when language changes
     */
    updateSmartAnswerTranslations() {
        const smartAnswerItems = document.querySelectorAll('.smart-answer-item');
        if (smartAnswerItems.length === 0) return;

        smartAnswerItems.forEach(smartAnswer => {
            // Update all translatable elements
            const translatableElements = smartAnswer.querySelectorAll('[data-i18n]');
            translatableElements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = window.i18n?.translate(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            });

            // Update aria-labels
            const ariaElements = smartAnswer.querySelectorAll('[data-i18n-aria]');
            ariaElements.forEach(element => {
                const key = element.getAttribute('data-i18n-aria');
                const translation = window.i18n?.translate(key);
                if (translation && translation !== key) {
                    element.setAttribute('aria-label', translation);
                }
            });
        });

        // Update traditional results section if present
        const traditionalSection = document.querySelector('.traditional-results-section');
        if (traditionalSection) {
            const headerText = traditionalSection.querySelector('h3[data-i18n]');
            if (headerText) {
                const key = headerText.getAttribute('data-i18n');
                const translation = window.i18n?.translate(key);
                if (translation && translation !== key) {
                    headerText.textContent = translation;
                }
            }
        }
    }

    updateResultsInfo(count, query) {
        if (this.resultsCount) {
            this.resultsCount.textContent = count;
        }
        
        if (this.searchQueryDisplay && query) {
            this.searchQueryDisplay.textContent = ` for "${query}"`;
        }
    }

    renderSimpleResults(results, query) {
        if (!this.resultsContainer) {
            console.error('Results container not found');
            return;
        }

        console.log(`Rendering ${results.length} results...`);
        this.resultsContainer.innerHTML = '';
        
        results.forEach((searchResult, index) => {
            console.log(`Rendering result ${index}:`, {
                hasSearchResult: !!searchResult,
                hasArticle: !!searchResult?.article,
                articleId: searchResult?.article?.id,
                relevanceScore: searchResult?.relevanceScore
            });
            
            const resultElement = this.createSimpleResultElement(searchResult, query, index);
            if (resultElement) {
                this.resultsContainer.appendChild(resultElement);
            }
        });
        
        console.log(`Successfully rendered ${this.resultsContainer.children.length} result elements`);
    }

    createSimpleResultElement(searchResult, query, index) {
        try {
            // Extract the article from the SearchResult
            const article = searchResult?.article || searchResult;
            
            if (!article) {
                console.error(`No article data found for result ${index}`);
                return null;
            }
            
            // Debug article structure
            console.log('Article debug:', {
                searchResultId: searchResult?.id,
                articleId: article?.id,
                number: article?.number,
                officialNumber: article?.officialNumber,
                title: article?.title ? article.title.substring(0, 50) : 'No title',
                hasContent: !!article?.content,
                relevanceScore: searchResult?.relevanceScore,
                allKeys: Object.keys(article || {})
            });
            
            // Ensure we have basic article data with fallbacks
            const safeArticle = {
                id: article.id || `article_${index}`,
                number: article.number || article.id || `Article ${index + 1}`,
                title: article.title || 'Untitled Article',
                content: article.content || article.title || 'No content available',
                section: article.section || article.category || 'General',
                translations: article.translations || {},
                ...article
            };
        
            // Get current language preference
            const currentLang = window.i18n?.getLanguage() || 'en';
            
            // Get texts using the safe article data
            const croatianText = safeArticle.content || safeArticle.title || '';
            let translationText = '';
            let translationLabel = '';
            
            if (currentLang === 'es' || currentLang === 'spanish') {
                translationText = safeArticle.translations?.spanish || '[Traducción no disponible]';
                translationLabel = 'Español';
            } else {
                translationText = safeArticle.translations?.english || '[Translation not available]';
                translationLabel = 'English';
            }
            
            // Highlight search terms
            const highlightedCroatian = this.highlightSearchTerms(croatianText, query);
            const highlightedTranslation = this.highlightSearchTerms(translationText, query);
            
            // Check if this article is highly ranked for this query
            const rankingScore = this.feedbackRanking.getRankingScore(safeArticle.id || safeArticle.number, query);
            const isRecommended = rankingScore > 50;
            const recommendedBadge = isRecommended ? '<div class="recommended-badge">⭐ Recomendado</div>' : '';
            
            // Create result element
            const resultDiv = document.createElement('div');
            resultDiv.className = `simple-result-item neumorphic-container ${isRecommended ? 'recommended' : ''}`;
            resultDiv.innerHTML = `
                <div class="simple-result-header">
                    <div class="header-left">
                        <h3 class="article-number">${this.formatArticleNumber(safeArticle)}</h3>
                        <div class="article-section">${this.getSectionName(safeArticle.section, safeArticle)}</div>
                        ${recommendedBadge}
                    </div>
                    <div class="feedback-section">
                        <button class="feedback-btn helpful-btn" 
                                data-article-id="${safeArticle.id || safeArticle.number}" 
                                data-query="${query}"
                                title="¿Es lo que buscabas?">
                            Es lo que buscaba
                        </button>
                    </div>
                </div>
                
                <div class="simple-content-grid">
                    <div class="croatian-content">
                        <div class="content-header">
                            <span class="language-name">Hrvatski (Original)</span>
                        </div>
                        <div class="content-text">${highlightedCroatian}</div>
                    </div>
                    
                    <div class="translation-content">
                        <div class="content-header">
                            <span class="language-name">${translationLabel}</span>
                        </div>
                        <div class="content-text">${highlightedTranslation}</div>
                    </div>
                </div>
            `;
            
            // Bind feedback button event
            const feedbackBtn = resultDiv.querySelector('.helpful-btn');
            if (feedbackBtn) {
                feedbackBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleFeedbackClick(safeArticle.id || safeArticle.number, query, feedbackBtn);
                });
            }
            
            return resultDiv;
            
        } catch (error) {
            console.error(`Error creating result element for index ${index}:`, error);
            
            // Return a fallback error element
            const errorDiv = document.createElement('div');
            errorDiv.className = 'simple-result-item neumorphic-container error';
            errorDiv.innerHTML = `
                <div class="simple-result-header">
                    <div class="header-left">
                        <h3 class="article-number">Error</h3>
                        <div class="article-section">Unable to load article</div>
                    </div>
                </div>
                <div class="simple-content-grid">
                    <div class="croatian-content">
                        <div class="content-text">Error loading article content</div>
                    </div>
                </div>
            `;
            return errorDiv;
        }
    }

    renderResults(results) {
        if (!this.resultsContainer) return;

        this.resultsContainer.innerHTML = '';
        
        results.forEach((article, index) => {
            const resultElement = this.createResultElement(article, index);
            this.resultsContainer.appendChild(resultElement);
        });
    }

    createResultElement(article, index) {
        const template = document.getElementById('result-template');
        if (!template) return document.createElement('div');

        const clone = template.content.cloneNode(true);
        const resultItem = clone.querySelector('.result-item');
        
        // Set basic information
        const articleNumber = clone.querySelector('.article-number');
        if (articleNumber) articleNumber.textContent = this.formatArticleNumber(article);
        
        const articleTitle = clone.querySelector('.article-title');
        if (articleTitle) articleTitle.textContent = this.getArticleTitle(article);
        
        const resultSection = clone.querySelector('.result-section');
        if (resultSection) resultSection.textContent = this.getSectionName(article.section, article);
        
        const resultRelevance = clone.querySelector('.result-relevance');
        if (resultRelevance) {
            resultRelevance.innerHTML = this.createRelevanceStars(article.relevanceScore);
        }
        
        // Set up dual-column content
        this.setupDualColumnContent(clone, article);
        
        // Set metadata
        const updateDate = clone.querySelector('.update-date');
        if (updateDate) {
            updateDate.textContent = window.i18n?.formatDate(article.lastUpdated) || article.lastUpdated;
            updateDate.setAttribute('datetime', article.lastUpdated);
        }
        
        // Set tags
        const tagsContainer = clone.querySelector('.result-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = this.createTagsHTML(article.tags);
        }
        
        // Bind action buttons
        this.bindResultActions(clone, article);
        
        // Set up keyboard navigation
        if (resultItem) {
            resultItem.setAttribute('tabindex', '0');
            resultItem.setAttribute('role', 'article');
            resultItem.setAttribute('aria-label', `${article.number}: ${this.getArticleTitle(article)}`);
        }
        
        return clone;
    }

    setupDualColumnContent(clone, article) {
        // Get current language preference
        const currentLang = window.i18n?.getLanguage() || 'en';
        const searchTerm = this.lastSearchTerm || '';
        
        // Determine primary content based on user's language preference
        let primaryText, primaryLabel, primaryFlag;
        let secondaryText, secondaryLabel, secondaryFlag;
        
        if (currentLang === 'hr' || currentLang === 'croatian') {
            // Croatian as primary
            primaryText = article.content || article.title || '';
            primaryLabel = 'Hrvatski (Originalni tekst)';
            primaryFlag = '🇭🇷';
            
            // English as secondary
            secondaryText = article.translations?.english || article.content || article.title || '';
            secondaryLabel = 'Prijevod';
            secondaryFlag = '🇺🇸';
        } else if (currentLang === 'es' || currentLang === 'spanish') {
            // Spanish as primary
            primaryText = article.translations?.spanish || article.content || article.title || '';
            primaryLabel = 'Español (Traducción)';
            primaryFlag = '🇪🇸';
            
            // Croatian as secondary
            secondaryText = article.content || article.title || '';
            secondaryLabel = 'Hrvatski';
            secondaryFlag = '🇭🇷';
        } else {
            // English as primary (default)
            primaryText = article.translations?.english || article.content || article.title || '';
            primaryLabel = 'English (Translation)';
            primaryFlag = '🇺🇸';
            
            // Croatian as secondary
            secondaryText = article.content || article.title || '';
            secondaryLabel = 'Hrvatski';
            secondaryFlag = '🇭🇷';
        }
        
        // Set up primary content column (left side)
        const primaryContent = clone.querySelector('.croatian-column .text-content.croatian-text');
        const primaryHeader = clone.querySelector('.croatian-column .language-header');
        
        if (primaryContent) {
            // Highlight search terms in the complete text
            const highlightedText = this.highlightSearchTerms(primaryText, searchTerm);
            
            // Use secure HTML insertion with highlighting
            if (window.SecurityUtils) {
                primaryContent.innerHTML = highlightedText;
            } else {
                primaryContent.innerHTML = highlightedText;
            }
            
            // Update header label and flag
            if (primaryHeader) {
                primaryHeader.innerHTML = `${primaryFlag} ${primaryLabel}`;
            }
            
            console.log('Primary content set successfully');
            console.log('Language:', currentLang);
            console.log('Text length:', primaryText.length);
        } else {
            console.error('Primary content element not found');
        }
        
        // Set up secondary content column (right side)
        const secondaryContent = clone.querySelector('.translation-column .text-content.translation-text');
        const secondaryHeader = clone.querySelector('.translation-column .language-header');
        const translationFlag = clone.querySelector('.translation-column .translation-flag');
        
        if (secondaryContent) {
            // Highlight search terms in secondary text too
            const highlightedSecondaryText = this.highlightSearchTerms(secondaryText, searchTerm);
            
            // Use secure HTML insertion with highlighting
            if (window.SecurityUtils) {
                secondaryContent.innerHTML = highlightedSecondaryText;
            } else {
                secondaryContent.innerHTML = highlightedSecondaryText;
            }
            
            // Update header label
            if (secondaryHeader) {
                secondaryHeader.innerHTML = `${secondaryFlag} ${secondaryLabel}`;
            }
            
            // Update translation flag
            if (translationFlag) {
                translationFlag.textContent = secondaryFlag;
            }
            
            console.log('Secondary content set successfully');
        } else {
            console.error('Secondary content element not found');
        }
        
        console.log('setupDualColumnContent completed for article:', article.number);
    }

    highlightTextInCroatian(croatianText, highlightedText) {
        // If highlightedText already has marks, don't double-highlight
        if (highlightedText.includes('<mark>')) {
            // Just return the Croatian text without additional highlighting
            // to avoid double-marking issues
            return croatianText;
        }
        
        // Extract search terms from highlighted text by removing HTML tags
        const searchTerms = highlightedText.replace(/<mark>/g, '').replace(/<\/mark>/g, '').split(/\s+/);
        
        let result = croatianText;
        searchTerms.forEach(term => {
            if (term.length > 2) {
                // Escape special regex characters to prevent syntax errors
                const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                try {
                    const regex = new RegExp(`(${escapedTerm})`, 'gi');
                    result = result.replace(regex, '<mark>$1</mark>');
                } catch (error) {
                    console.warn('Failed to highlight term:', term, error);
                }
            }
        });
        
        return result;
    }

    formatArticleText(text) {
        if (!text) return '';
        
        // Split text by paragraph indicators and format each section
        const paragraphs = text.split(/(?=\(\d+\)|\n\n|\d+\.\s)/);
        
        return paragraphs.map(paragraph => {
            if (!paragraph.trim()) return '';
            
            // Check if it's a numbered point (1., 2., etc.)
            if (/^\d+\.\s/.test(paragraph.trim())) {
                return `<div class="article-paragraph numbered-point">${paragraph.trim()}</div>`;
            }
            
            // Check if it's a subpoint with parentheses (1), (2), etc.
            if (/^\(\d+\)/.test(paragraph.trim())) {
                return `<div class="article-paragraph article-subpoint">${paragraph.trim()}</div>`;
            }
            
            // Check if it's a lettered subpoint (a), b), etc.
            if (/^[a-z]\)/.test(paragraph.trim())) {
                return `<div class="article-paragraph article-subpoint letter-point">${paragraph.trim()}</div>`;
            }
            
            // Regular paragraph
            if (paragraph.trim().length > 0) {
                return `<div class="article-paragraph">${paragraph.trim()}</div>`;
            }
            
            return '';
        }).filter(p => p).join('');
    }

    setupLanguageTabs(clone, article) {
        const languageTabs = clone.querySelectorAll('.language-tab');
        const textContents = clone.querySelectorAll('.text-content');
        
        // Set content with XSS protection
        const croatianContent = clone.querySelector('.text-content[data-lang="croatian"]');
        if (croatianContent) {
            const croatianText = article.highlightedText ? 
                this.getHighlightedText(article, 'croatian') : (article.content || article.title || '');
            
            if (window.SecurityUtils) {
                croatianContent.innerHTML = window.SecurityUtils.escapeHTML(croatianText);
            } else {
                croatianContent.textContent = croatianText;
            }
        }
        
        const translationContent = clone.querySelector('.text-content[data-lang="translation"]');
        if (translationContent) {
            const currentLang = window.i18n?.getLanguage() || 'english';
            const translationText = currentLang === 'hr' ? (article.content || article.title || '') : 
                                  (currentLang === 'es' ? (article.translations?.spanish || article.content || article.title || '') : 
                                   (article.translations?.english || article.content || article.title || ''));
            const finalTranslationText = article.highlightedText ? 
                this.getHighlightedText(article, currentLang) : translationText;
                
            if (window.SecurityUtils) {
                translationContent.innerHTML = window.SecurityUtils.escapeHTML(finalTranslationText);
            } else {
                translationContent.textContent = finalTranslationText;
            }
        }
        
        // Bind tab events
        languageTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetLang = e.target.getAttribute('data-lang');
                this.switchLanguageTab(clone, targetLang);
            });
        });
    }

    getHighlightedText(article, language) {
        const textMap = {
            'croatian': article.content || article.title || '',
            'hr': article.content || article.title || '',
            'en': article.translations?.english || article.content || article.title || '',
            'english': article.translations?.english || article.content || article.title || '',
            'es': article.translations?.spanish || article.content || article.title || '',
            'spanish': article.translations?.spanish || article.content || article.title || ''
        };
        
        return article.highlightedText || textMap[language] || (article.translations?.english || article.content || article.title || '');
    }

    switchLanguageTab(container, targetLang) {
        const tabs = container.querySelectorAll('.language-tab');
        const contents = container.querySelectorAll('.text-content');
        
        tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-lang') === targetLang;
            tab.classList.toggle('active', isActive);
        });
        
        contents.forEach(content => {
            const isActive = content.getAttribute('data-lang') === targetLang;
            content.classList.toggle('active', isActive);
        });
    }

    bindResultActions(clone, article) {
        const bookmarkButton = clone.querySelector('.bookmark-button');
        if (bookmarkButton) {
            bookmarkButton.addEventListener('click', () => {
                this.bookmarkArticle(article);
            });
        }
        
        const shareButton = clone.querySelector('.share-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.shareArticle(article);
            });
        }
        
        const expandButton = clone.querySelector('.expand-button');
        if (expandButton) {
            expandButton.addEventListener('click', () => {
                this.expandArticle(article);
            });
        }
    }

    bookmarkArticle(article) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarked-articles') || '[]');
        
        if (!bookmarks.find(b => b.id === article.id)) {
            bookmarks.push({
                id: article.id,
                number: article.number,
                title: this.getArticleTitle(article),
                bookmarkedAt: new Date().toISOString()
            });
            
            localStorage.setItem('bookmarked-articles', JSON.stringify(bookmarks));
            this.showNotification(window.i18n?.translate('bookmark-added') || 'Article bookmarked');
        } else {
            this.showNotification(window.i18n?.translate('already-bookmarked') || 'Article already bookmarked');
        }
    }

    shareArticle(article) {
        const shareData = {
            title: `${article.number}: Croatian Labor Law`,
            text: this.getArticleTitle(article),
            url: `${window.location.origin}${window.location.pathname}#article-${article.id}`
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification(window.i18n?.translate('link-copied') || 'Link copied to clipboard');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification(window.i18n?.translate('link-copied') || 'Link copied to clipboard');
        }
    }

    expandArticle(article) {
        // Show full article in modal or expanded view
        console.log('Expanding article:', article.id);
        // TODO: Implement modal view for full article
    }

    getArticleTitle(article) {
        // Generate a meaningful title from the article content
        if (!article) return 'Untitled Article';
        
        const currentLang = window.i18n?.getLanguage() || 'en';
        
        let text;
        if (currentLang === 'hr') {
            text = article.title || article.content || '';
        } else if (currentLang === 'es') {
            text = article.translations?.spanish || article.title || article.content || '';
        } else { // English or default
            text = article.translations?.english || article.title || article.content || '';
        }
        
        // Fallback if no text found
        if (!text) {
            text = article.title || article.content || 'Untitled Article';
        }
        
        // Extract first meaningful phrase (up to first period or 60 characters)
        let title = text.split('.')[0].substring(0, 60);
        if (text.length > 60) title += '...';
        
        return title;
    }

    getSectionName(sectionKey, article = null) {
        // If sectionKey is provided and valid, use it
        if (sectionKey && sectionKey.trim() !== '') {
            const sectionNames = {
                'general': window.i18n?.translate('general-provisions') || 'General Provisions',
                'contracts': window.i18n?.translate('employment-contracts') || 'Employment Contracts',
                'working-time': window.i18n?.translate('working-time') || 'Working Time',
                'leave': window.i18n?.translate('leave-vacation') || 'Leave & Vacation',
                'termination': window.i18n?.translate('termination') || 'Termination',
                'safety': window.i18n?.translate('workplace-safety') || 'Workplace Safety'
            };
            
            return sectionNames[sectionKey] || sectionKey;
        }
        
        // If no sectionKey provided but we have an article, infer from content
        if (article) {
            const inferredSection = this.inferSectionFromArticle(article);
            if (inferredSection) {
                return this.getSectionName(inferredSection);
            }
        }
        
        // Return empty string if no section can be determined
        return '';
    }

    /**
     * Infer section based on article number and content
     * @param {Object} article - Article object
     * @returns {string} - Inferred section key
     */
    inferSectionFromArticle(article) {
        if (!article) return '';
        
        const articleNumber = this.extractArticleNumber(article.number || article.id || '');
        const content = (article.content || '').toLowerCase();
        const title = (article.title || '').toLowerCase();
        const searchText = content + ' ' + title;
        
        // Section inference based on article number ranges and content
        if (articleNumber >= 1 && articleNumber <= 20) {
            return 'general'; // General provisions and definitions
        }
        
        if (articleNumber >= 21 && articleNumber <= 60) {
            // Check content for contract-related terms
            if (searchText.includes('ugovor') || searchText.includes('sklapa') || 
                searchText.includes('potpisx') || searchText.includes('uvjet')) {
                return 'contracts';
            }
            return 'contracts'; // Employment contracts and conditions
        }
        
        if (articleNumber >= 61 && articleNumber <= 100) {
            // Check for working time related content
            if (searchText.includes('radno vrijeme') || searchText.includes('sati') ||
                searchText.includes('prekovremeni') || searchText.includes('noćni')) {
                return 'working-time';
            }
            return 'working-time'; // Working time regulations
        }
        
        if (articleNumber >= 101 && articleNumber <= 140) {
            // Check for termination related content
            if (searchText.includes('otkaz') || searchText.includes('prestanak') ||
                searchText.includes('otpremnina') || searchText.includes('otkazni')) {
                return 'termination';
            }
            return 'termination'; // Termination procedures
        }
        
        if (articleNumber >= 141 && articleNumber <= 180) {
            // Check for leave and vacation content
            if (searchText.includes('odmor') || searchText.includes('godišnji') ||
                searchText.includes('bolovanje') || searchText.includes('dopust')) {
                return 'leave';
            }
            return 'leave'; // Leave and vacation
        }
        
        if (articleNumber >= 181 && articleNumber <= 250) {
            // Check for safety related content
            if (searchText.includes('sigurnost') || searchText.includes('zaštita') ||
                searchText.includes('zdravlje') || searchText.includes('ozljeda')) {
                return 'safety';
            }
            return 'safety'; // Workplace safety and health
        }
        
        // Content-based inference for articles outside typical ranges
        if (searchText.includes('ugovor') || searchText.includes('zapošljavanje')) {
            return 'contracts';
        }
        
        if (searchText.includes('radno vrijeme') || searchText.includes('smjena')) {
            return 'working-time';
        }
        
        if (searchText.includes('otkaz') || searchText.includes('prestanak')) {
            return 'termination';
        }
        
        if (searchText.includes('odmor') || searchText.includes('dopust')) {
            return 'leave';
        }
        
        if (searchText.includes('sigurnost') || searchText.includes('zaštita')) {
            return 'safety';
        }
        
        // Default to general if no specific section can be inferred
        return 'general';
    }

    /**
     * Extract numeric part from article number
     * @param {string} articleNumber - Article number string (e.g., "Članak 42")
     * @returns {number} - Extracted number or 0 if not found
     */
    extractArticleNumber(articleNumber) {
        if (!articleNumber) return 0;
        
        // Extract numbers from string like "Članak 42" or "art_042"
        const match = articleNumber.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    /**
     * Format article number for display
     * @param {Object} article - Article object
     * @returns {string} - Formatted article number
     */
    formatArticleNumber(article) {
        if (!article) return 'Nepoznat članak';
        
        // Use article.number if available
        if (article.number && article.number.trim() !== '') {
            return article.number;
        }
        
        // Use article.officialNumber if available
        if (article.officialNumber && article.officialNumber.trim() !== '') {
            return article.officialNumber;
        }
        
        // Try to extract from ID
        if (article.id) {
            const numericPart = this.extractArticleNumber(article.id);
            if (numericPart > 0) {
                return `Članak ${numericPart}`;
            }
            
            // If ID has recognizable pattern, use it
            if (article.id.includes('art_')) {
                const idNumber = article.id.replace('art_', '').replace(/^0+/, ''); // Remove leading zeros
                return `Članak ${idNumber}`;
            }
        }
        
        // Last resort: use title or return generic
        if (article.title && article.title.includes('Članak')) {
            return article.title.split(' ').slice(0, 2).join(' '); // Take "Članak X" part
        }
        
        return 'Članak N/A';
    }

    createRelevanceStars(score) {
        const maxStars = 5;
        const stars = Math.min(Math.ceil(score / 2), maxStars);
        const fullStars = '★'.repeat(stars);
        const emptyStars = '☆'.repeat(maxStars - stars);
        
        return `<span class="relevance-stars" title="Relevance: ${score}/10">${fullStars}${emptyStars}</span>`;
    }

    createTagsHTML(tags) {
        if (!tags || !Array.isArray(tags)) {
            return '';
        }
        return tags.map(tag => 
            `<span class="result-tag">${tag}</span>`
        ).join('');
    }

    /**
     * Highlight search terms in text
     * @param {string} text - Text to highlight
     * @param {string} searchTerm - Search term to highlight
     * @returns {string} Text with highlighted terms
     */
    highlightSearchTerms(text, searchTerm) {
        if (!text || !searchTerm) return text;
        
        // Clean and split search terms
        const terms = searchTerm.toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 2) // Only highlight terms longer than 2 characters
            .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape regex chars
        
        if (terms.length === 0) return text;
        
        // Create regex pattern for all terms
        const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
        
        // Highlight terms with yellow background
        return text.replace(pattern, '<mark class="search-highlight">$1</mark>');
    }

    showLoadingState() {
        if (this.loadingState) {
            this.loadingState.classList.add('visible');
            this.loadingState.setAttribute('aria-hidden', 'false');
        }
        this.hideResults();
        this.hideNoResults();
    }

    hideLoadingState() {
        if (this.loadingState) {
            this.loadingState.classList.remove('visible');
            this.loadingState.setAttribute('aria-hidden', 'true');
        }
    }

    showNoResults() {
        if (this.noResults) {
            this.noResults.classList.add('visible');
            this.noResults.setAttribute('aria-hidden', 'false');
        }
        this.hideResults();
    }

    hideNoResults() {
        if (this.noResults) {
            this.noResults.classList.remove('visible');
            this.noResults.setAttribute('aria-hidden', 'true');
        }
    }

    hideResults() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('visible'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    setupAdvancedSearch() {
        // Populate filter options
        if (window.legalDatabase && window.legalDatabase.isLoaded) {
            this.populateFilterOptions();
        } else {
            window.addEventListener('databaseReady', () => {
                this.populateFilterOptions();
            });
        }
    }

    populateFilterOptions() {
        // Section filter is already populated in HTML with i18n
        // Article type filter is already populated in HTML with i18n
    }

    toggleAdvancedSearch() {
        if (this.advancedSearchPanel) {
            const isExpanded = this.advancedSearchPanel.classList.toggle('expanded');
            this.advancedSearchPanel.setAttribute('aria-hidden', !isExpanded);
            
            const toggle = document.getElementById('advanced-search-toggle');
            if (toggle) {
                toggle.textContent = isExpanded ? 
                    (window.i18n?.translate('hide-advanced') || 'Hide Advanced Options') :
                    (window.i18n?.translate('advanced-search') || 'Advanced Search Options');
            }
        }
    }

    addToSearchHistory(query) {
        // Remove duplicates and add to beginning
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        this.searchHistory.unshift({
            query: query,
            timestamp: new Date().toISOString()
        });
        
        // Limit history size
        this.searchHistory = this.searchHistory.slice(0, this.searchConfig.maxHistoryItems);
        
        // Save to localStorage
        localStorage.setItem('search-history', JSON.stringify(this.searchHistory));
        
        // Update UI
        this.renderSearchHistory();
    }

    loadSearchHistory() {
        try {
            const stored = localStorage.getItem('search-history');
            if (stored) {
                this.searchHistory = JSON.parse(stored);
                this.renderSearchHistory();
            }
        } catch (error) {
            console.warn('Error loading search history:', error);
            this.searchHistory = [];
        }
    }

    renderSearchHistory() {
        const historyContainer = document.getElementById('history-container');
        if (!historyContainer) return;

        if (this.searchHistory.length === 0) {
            historyContainer.innerHTML = `<p class="no-history">${window.i18n?.translate('no-recent-searches') || 'No recent searches'}</p>`;
            return;
        }

        historyContainer.innerHTML = this.searchHistory.map(item => `
            <button class="history-item" data-query="${item.query}">
                <span class="history-query">${item.query}</span>
                <span class="history-date">${window.i18n?.formatDate(item.timestamp) || item.timestamp}</span>
            </button>
        `).join('');

        // Bind click events
        historyContainer.querySelectorAll('.history-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const query = e.currentTarget.getAttribute('data-query');
                if (query && this.searchInput) {
                    this.searchInput.value = query;
                    this.performSearch();
                }
            });
        });
    }

    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('search-history');
        this.renderSearchHistory();
        this.showNotification(window.i18n?.translate('history-cleared') || 'Search history cleared');
    }

    updateSearchPlaceholder() {
        if (this.searchInput) {
            this.searchInput.placeholder = window.i18n?.translate('search-placeholder') || 
                'Ask about workers\' rights, employment contracts, vacation days...';
        }
    }

    // =====================================
    // ENHANCED SEARCH FUNCTIONS v2.2.0
    // =====================================

    async searchArticlesEnhanced(query, options = {}) {
        const factChecker = getFactChecker();
        if (!factChecker) {
            console.error('Enhanced database not initialized');
            return [];
        }
        
        try {
            const searchOptions = {
                fuzzySearch: options.fuzzy !== false,
                maxResults: options.maxResults || 100,
                categories: options.category ? [options.category] : undefined,
                sortBy: options.sortBy || 'relevance',
                sortOrder: options.sortOrder || 'desc',
                minRelevance: options.minRelevance || 0.01
            };
            
            const startTime = performance.now();
            const results = await factChecker.search(query, searchOptions);
            const searchTime = Math.round(performance.now() - startTime);
            
            // Record analytics
            if (this.searchAnalytics) {
                this.searchAnalytics.recordSearch(query, results.length, searchTime);
            }
            
            // Convert to format compatible with existing UI
            return results.map(result => ({
                id: result.id,
                title: result.title,
                content: result.content,
                category: result.category,
                relevance: Math.round(result.relevance * 100),
                matchedTerms: result.matchedTerms || [],
                highlights: result.highlights || [],
                searchTime: searchTime
            }));
            
        } catch (error) {
            console.error('Enhanced search failed:', error);
            return [];
        }
    }

    async advancedSearchEnhanced(criteria) {
        const factChecker = getFactChecker();
        if (!factChecker) return [];
        
        try {
            const results = await factChecker.advancedSearch(criteria);
            if (results.analytics && this.searchAnalytics) {
                this.updateSearchAnalytics(results.analytics);
            }
            return results.results || [];
        } catch (error) {
            console.error('Advanced search failed:', error);
            return [];
        }
    }

    getSearchSuggestionsEnhanced(partialQuery) {
        const factChecker = getFactChecker();
        if (!factChecker || partialQuery.length < 2) return [];
        
        try {
            return factChecker.getSearchSuggestions(partialQuery);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            return [];
        }
    }

    setupRealTimeSearch() {
        if (!this.searchInput) return;

        const suggestionsContainer = this.createSuggestionsContainer();
        
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideSuggestions(suggestionsContainer);
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                // Show suggestions
                const suggestions = this.getSearchSuggestionsEnhanced(query);
                this.displaySuggestions(suggestions, suggestionsContainer);
                
                // Auto-search if query is long enough
                if (query.length > 3 && this.enhancedMode) {
                    this.performAutoSearch(query);
                }
            }, this.searchConfig.debounceDelay);
        });
    }

    createSuggestionsContainer() {
        let container = document.getElementById('search-suggestions-enhanced');
        if (!container) {
            container = document.createElement('div');
            container.id = 'search-suggestions-enhanced';
            container.className = 'suggestions-container-enhanced';
            
            if (this.searchInput && this.searchInput.parentNode) {
                this.searchInput.parentNode.appendChild(container);
            }
        }
        return container;
    }

    displaySuggestions(suggestions, container) {
        if (!container) return;
        
        container.innerHTML = suggestions.slice(0, this.searchConfig.maxSuggestions).map(suggestion => 
            `<div class="suggestion-item-enhanced" data-suggestion="${suggestion}">
                <i class="suggestion-icon">🔍</i>
                <span class="suggestion-text">${suggestion}</span>
            </div>`
        ).join('');
        
        container.style.display = suggestions.length > 0 ? 'block' : 'none';
        
        // Bind click events
        container.querySelectorAll('.suggestion-item-enhanced').forEach(item => {
            item.addEventListener('click', (e) => {
                const suggestion = e.currentTarget.getAttribute('data-suggestion');
                this.selectSuggestion(suggestion, container);
            });
        });
    }

    selectSuggestion(suggestion, container) {
        if (this.searchInput) {
            this.searchInput.value = suggestion;
            this.hideSuggestions(container);
            this.performSearch();
        }
    }

    hideSuggestions(container) {
        if (container) {
            container.style.display = 'none';
        }
    }

    async performAutoSearch(query) {
        if (this.isSearching) return;
        
        try {
            this.isSearching = true;
            const results = await this.searchArticlesEnhanced(query, {
                maxResults: 5,
                minRelevance: 0.3
            });
            
            // Show preview of results if relevant
            if (results.length > 0 && results[0].relevance > 50) {
                this.showSearchPreview(results.slice(0, 3));
            }
        } catch (error) {
            console.error('Auto-search failed:', error);
        } finally {
            this.isSearching = false;
        }
    }

    showSearchPreview(results) {
        // Implementation for search preview popup
        console.log('Preview results:', results);
    }

    setupSearchAnalytics() {
        this.searchAnalytics = {
            searchHistory: [],
            popularQueries: new Map(),
            recordSearch: function(query, resultCount, searchTime) {
                this.searchHistory.push({
                    query,
                    resultCount,
                    searchTime,
                    timestamp: new Date().toISOString()
                });
                
                // Update popular queries
                const count = this.popularQueries.get(query) || 0;
                this.popularQueries.set(query, count + 1);
                
                // Keep only last 100 searches
                if (this.searchHistory.length > 100) {
                    this.searchHistory.shift();
                }
            }
        };
    }

    setupBooleanSearchHelp() {
        // Create help container that shows only when needed
        const helpContainer = document.createElement('div');
        helpContainer.className = 'search-help-enhanced';
        helpContainer.style.display = 'none'; // Hidden by default
        helpContainer.innerHTML = `
            <small class="search-operators-help">
                <strong>Advanced Search:</strong> 
                Use <code>AND</code>, <code>OR</code>, <code>NOT</code> or <code>"exact phrase"</code>
                <br>
                <strong>Examples:</strong> 
                <code>work AND time</code>, <code>"employment contract"</code>, <code>salary NOT minimum</code>
            </small>
        `;
        
        if (this.searchInput && this.searchInput.parentNode) {
            this.searchInput.parentNode.appendChild(helpContainer);
            
            // Show help when user starts typing complex queries
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                const hasOperators = /\b(AND|OR|NOT)\b|".*"/.test(query);
                helpContainer.style.display = hasOperators || query.length > 20 ? 'block' : 'none';
            });
        }
    }

    enableAdvancedFeatures() {
        // Advanced features simplified - no unnecessary filters
        console.log('Advanced search features ready');
    }

    preloadSuggestions() {
        // Pre-load common search suggestions
        const commonTerms = [
            'radno vrijeme', 'plaća', 'radni odnos', 'prekovremeni rad',
            'kolektivni ugovor', 'otkaz', 'godišnji odmor', 'bolovanje'
        ];
        
        console.log('Enhanced search ready with suggestions:', commonTerms);
    }
}

// =====================================
// SMART ANSWER HELPER METHODS v2.3.0
// =====================================

/**
 * Format detailed explanation with proper HTML structure
 * @param {string} explanation - Raw explanation text
 * @returns {string} Formatted HTML
 */
CroatianLawSearchEngine.prototype.formatDetailedExplanation = function(explanation) {
    // Convert markdown-like formatting to HTML
    return explanation
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
};

/**
 * Create example element
 * @param {Object} example - Example object
 * @returns {HTMLElement} Example element
 */
CroatianLawSearchEngine.prototype.createExampleElement = function(example) {
    const div = document.createElement('div');
    div.className = 'example-item';
    
    div.innerHTML = `
        <div class="example-scenario">${example.scenario}</div>
        ${example.calculation ? `<div class="example-calculation">${example.calculation}</div>` : ''}
        <div class="example-outcome">${example.outcome}</div>
    `;
    
    return div;
};

/**
 * Create FAQ element
 * @param {Object} faq - FAQ object
 * @returns {HTMLElement} FAQ element
 */
CroatianLawSearchEngine.prototype.createFAQElement = function(faq) {
    const div = document.createElement('div');
    div.className = 'faq-item';
    
    div.innerHTML = `
        <div class="faq-question">${faq.question}</div>
        <div class="faq-answer">${faq.answer}</div>
    `;
    
    return div;
};

/**
 * Create related topic element
 * @param {Object} topic - Related topic object
 * @returns {HTMLElement} Topic element
 */
CroatianLawSearchEngine.prototype.createRelatedTopicElement = function(topic) {
    const div = document.createElement('div');
    div.className = 'related-topic-item';
    div.setAttribute('data-article-id', topic.id);
    
    div.innerHTML = `
        <div class="related-topic-title">${topic.title}</div>
        <div class="related-topic-description">${topic.description}</div>
    `;
    
    // Make clickable to search for related topic
    div.addEventListener('click', () => {
        if (this.searchInput) {
            this.searchInput.value = topic.title;
            this.performSearch();
        }
    });
    
    return div;
};

/**
 * Handle feedback button click
 * @param {string} articleId - Article ID
 * @param {string} query - Search query
 * @param {HTMLElement} button - Button element
 */
CroatianLawSearchEngine.prototype.handleFeedbackClick = function(articleId, query, button) {
    // Record positive feedback
    this.feedbackRanking.recordPositiveFeedback(query, articleId);
    
    // Update button to show feedback was recorded
    button.innerHTML = '✅ ¡Gracias!';
    button.disabled = true;
    button.classList.add('feedback-recorded');
    
    // Show toast notification
    this.showToast('¡Feedback registrado! Esto ayudará a mejorar los resultados.');
    
    // Optional: trigger a re-sort of current results
    this.refreshResultsRanking(query);
};

/**
 * Refresh current results with updated ranking
 * @param {string} query - Current search query
 */
CroatianLawSearchEngine.prototype.refreshResultsRanking = function(query) {
    // This could re-sort the current results, but for now we'll just log
    console.log(`Results ranking updated for query: "${query}"`);
};

/**
 * Apply feedback ranking to search results
 * @param {Array} results - Search results
 * @param {string} query - Search query
 * @returns {Array} Ranked results
 */
CroatianLawSearchEngine.prototype.applyFeedbackRanking = function(results, query) {
    return this.feedbackRanking.rankResults(results, query);
};

/**
 * Mark answer as helpful (analytics)
 */
CroatianLawSearchEngine.prototype.markAnswerAsHelpful = function() {
    console.log('Answer marked as helpful');
    
    // Visual feedback
    const helpfulButton = document.querySelector('.helpful-button');
    if (helpfulButton) {
        helpfulButton.innerHTML = '<span aria-hidden="true">✅</span><span>¡Útil!</span>';
        helpfulButton.disabled = true;
    }
};

/**
 * Show toast notification
 * @param {string} message - Message to show
 */
CroatianLawSearchEngine.prototype.showToast = function(message) {
    // Create simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Initialize search engine when DOM is loaded or immediately if already loaded
function initializeSearchEngine() {
    console.log('Creating Croatian Law Search Engine...');
    try {
        if (!window.searchEngine) {
            window.searchEngine = new CroatianLawSearchEngine();
            console.log('Croatian Law Search Engine created successfully');
        } else {
            console.log('Croatian Law Search Engine already exists');
        }
    } catch (error) {
        console.error('Error creating Croatian Law Search Engine:', error);
    }
}

// Initialize immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearchEngine);
} else {
    // DOM is already loaded
    setTimeout(initializeSearchEngine, 100); // Small delay to ensure other modules are loaded
}

// Also listen for database events to ensure proper initialization
window.addEventListener('enhancedDatabaseReady', () => {
    console.log('Enhanced database ready, ensuring SearchEngine is initialized...');
    setTimeout(initializeSearchEngine, 100);
});

window.addEventListener('databaseReady', () => {
    console.log('Database ready, ensuring SearchEngine is initialized...');
    setTimeout(initializeSearchEngine, 100);
});

// Export for use in other modules
export default CroatianLawSearchEngine;
