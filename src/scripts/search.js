/* =========================================
   Search Engine Module - Enhanced v2.2.0
   Croatian Labor Law Fact Checker
   ========================================= */

// Import enhanced system functions
import { getFactChecker } from '../integration.js';

class SearchEngine {
    constructor() {
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
        
        // Search configuration
        this.searchConfig = {
            debounceDelay: 300,
            minQueryLength: 2,
            maxSuggestions: 8,
            maxHistoryItems: 10,
            maxResults: 50
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
        });
    }

    onDatabaseReady() {
        console.log('Database ready, search engine initialized');
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
            'godišnji odmor': { english: 'annual leave', spanish: 'vacaciones anuales' },
            'annual leave': { croatian: 'godišnji odmor', spanish: 'vacaciones anuales' },
            'vacaciones anuales': { croatian: 'godišnji odmor', english: 'annual leave' },
            'rodiljski dopust': { english: 'maternity leave', spanish: 'licencia maternidad' },
            'maternity leave': { croatian: 'rodiljski dopust', spanish: 'licencia maternidad' },
            'licencia maternidad': { croatian: 'rodiljski dopust', english: 'maternity leave' },
            
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
            'años': { croatian: 'godina', english: 'years' }
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

        // Remove duplicates
        queryTerms.croatian = [...new Set(queryTerms.croatian)];
        queryTerms.english = [...new Set(queryTerms.english)];
        queryTerms.spanish = [...new Set(queryTerms.spanish)];

        return queryTerms;
    }

    async executeMultiLanguageSearch(translatedQueries, filters) {
        if (!window.legalDatabase || !window.legalDatabase.isInitialized) {
            throw new Error('Database not available');
        }

        // Simulate async operation for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Perform searches in all languages and combine results
        const allResults = new Map();
        
        // Search with original query
        const originalResults = await window.legalDatabase.search(translatedQueries.original, filters);
        originalResults.forEach(result => {
            if (!allResults.has(result.id)) {
                allResults.set(result.id, result);
                allResults.get(result.id).relevanceScore = (allResults.get(result.id).relevanceScore || 0) + 10;
            }
        });
        
        // Search with translated Croatian terms
        for (const query of translatedQueries.croatian) {
            const results = await window.legalDatabase.search(query, filters);
            results.forEach(result => {
                if (!allResults.has(result.id)) {
                    allResults.set(result.id, result);
                    allResults.get(result.id).relevanceScore = 0;
                }
                allResults.get(result.id).relevanceScore = (allResults.get(result.id).relevanceScore || 0) + 5;
            });
        }
        
        // Search with translated English terms
        for (const query of translatedQueries.english) {
            const results = await window.legalDatabase.search(query, filters);
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
            const results = await window.legalDatabase.search(query, filters);
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
        
        return finalResults;
    }

    async executeSearch(query, filters) {
        if (!window.legalDatabase || !window.legalDatabase.isInitialized) {
            throw new Error('Database not available');
        }

        // Simulate async operation for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return await window.legalDatabase.search(query, filters);
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
        this.updateResultsInfo(results.length, query);
        
        if (results.length === 0) {
            this.showNoResults();
            return;
        }
        
        this.hideNoResults();
        this.renderResults(results);
        
        // Scroll to results
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        if (articleNumber) articleNumber.textContent = article.number;
        
        const articleTitle = clone.querySelector('.article-title');
        if (articleTitle) articleTitle.textContent = this.getArticleTitle(article);
        
        const resultSection = clone.querySelector('.result-section');
        if (resultSection) resultSection.textContent = this.getSectionName(article.section);
        
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
        // Set up Croatian content column - ALWAYS show Croatian text
        const croatianContent = clone.querySelector('.croatian-column .text-content.croatian-text');
        
        if (croatianContent) {
            // FORCE Croatian text - simple version for debugging
            let croatianText = article.content || article.title || '';
            
            // Don't apply highlighting for now to debug the basic functionality
            // if (article.highlightedText) {
            //     croatianText = this.highlightTextInCroatian(article.content, article.highlightedText);
            // }
            
            // Use secure HTML insertion to prevent XSS
            if (window.SecurityUtils) {
                croatianContent.innerHTML = window.SecurityUtils.escapeHTML(croatianText);
            } else {
                croatianContent.textContent = croatianText;
            }
            
            console.log('Croatian content set successfully');
            console.log('Element found:', !!croatianContent);
            console.log('Text length:', croatianText.length);
        } else {
            console.error('Croatian content element not found with selector: .croatian-column .text-content.croatian-text');
        }
        
        // Set up translation content column
        const translationContent = clone.querySelector('.translation-column .text-content.translation-text');
        const translationFlag = clone.querySelector('.translation-column .translation-flag');
        
        if (translationContent) {
            const currentLang = window.i18n?.getLanguage() || 'english';
            let translationText, flagEmoji;
            
            // Determine translation text and flag based on current language
            if (currentLang === 'hr' || currentLang === 'croatian') {
                translationText = article.content || article.title || '';
                flagEmoji = '🇭🇷';
            } else if (currentLang === 'es' || currentLang === 'spanish') {
                translationText = article.translations?.spanish || article.content || article.title || '';
                flagEmoji = '🇪🇸';
            } else {
                translationText = article.translations?.english || article.content || article.title || '';
                flagEmoji = '🇺🇸';
            }
            
            // Use secure HTML insertion to prevent XSS
            if (window.SecurityUtils) {
                translationContent.innerHTML = window.SecurityUtils.escapeHTML(translationText);
            } else {
                translationContent.textContent = translationText;
            }
            
            console.log('Translation content set successfully');
            
            // Update translation flag
            if (translationFlag) {
                translationFlag.textContent = flagEmoji;
            }
        } else {
            console.error('Translation content element not found with selector: .translation-column .text-content.translation-text');
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

    getSectionName(sectionKey) {
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
                maxResults: options.maxResults || 50,
                categories: options.category ? [options.category] : undefined,
                sortBy: options.sortBy || 'relevance',
                sortOrder: options.sortOrder || 'desc',
                minRelevance: options.minRelevance || 0.1
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

// Initialize search engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchEngine = new SearchEngine();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEngine;
}
