/* =========================================
   Main Application Controller
   Croatian Labor Law Fact Checker - Enhanced v2.2.0
   ========================================= */

// Import enhanced system
import { initializeFactChecker, getFactChecker } from '../integration.js';
import { injectEnhancedArticles } from '../features/smart-answers/data/enhancedArticlesSample.js';

// Global variable for enhanced database
let enhancedDatabase = null;

class App {
    constructor() {
        this.isInitialized = false;
        this.theme = 'light';
        this.version = '2.2.0';
        this.enhancedMode = true;
        
        this.init();
    }

    async init() {
        try {
            console.log('Starting application initialization...');
            
            // Phase 1: Essential setup (non-blocking)
            await this.initPhase1();
            
            // Phase 2: Database initialization (potentially blocking)
            await this.initPhase2();
            
            // Phase 3: Feature initialization (non-blocking)
            await this.initPhase3();
            
            this.isInitialized = true;
            console.log(`Croatian Labor Law Fact Checker v${this.version} initialized successfully`);
            
            // Dispatch app ready event
            window.dispatchEvent(new CustomEvent('appReady'));
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showCriticalError('Failed to initialize application. Please refresh the page.');
        }
    }

    async initPhase1() {
        // Essential, fast setup
        this.setupTheme();
        this.setupEventListeners();
        await this.delayExecution(10); // Allow browser to breathe
    }

    async initPhase2() {
        // Enhanced database initialization
        await this.initializeEnhancedDatabase();
        await this.delayExecution(10);
    }

    async initializeEnhancedDatabase() {
        try {
            console.log('Initializing Enhanced Croatian Labor Law Database...');
            
            enhancedDatabase = await initializeFactChecker({
                dataUrl: './src/search-engine/data/croatian-labor-law.json',
                enableCache: true,
                enableSearch: true,
                enableValidation: true,
                cacheSize: 200,
                language: 'hr'
            });
            
            // Inject enhanced sample articles for testing smart answers
            console.log('Injecting enhanced sample articles...');
            injectEnhancedArticles(enhancedDatabase);
            
            // Show statistics
            const stats = enhancedDatabase.getStatistics();
            console.log('Enhanced Database Stats:', stats);
            
            // Dispatch database ready event
            window.dispatchEvent(new CustomEvent('enhancedDatabaseReady', {
                detail: { stats, version: this.version }
            }));
            
            // Make available globally for backward compatibility
            window.enhancedDatabase = enhancedDatabase;
            window.legalDatabase = enhancedDatabase; // For compatibility with SearchEngine
            
        } catch (error) {
            console.error('Failed to initialize enhanced database:', error);
            
            // Fallback to original system if needed
            console.log('Falling back to original database system...');
            await this.waitForDatabase();
        }
    }

    async initPhase3() {
        // Additional features
        this.setupKeyboardNavigation();
        await this.delayExecution(10);
        
        this.setupAccessibility();
        await this.delayExecution(10);
        
        this.setupPerformanceOptimizations();
        await this.delayExecution(10);
        
        this.setupNotificationSystem();
        this.setupBookmarkSystem();
        this.handleUrlParameters();
    }

    async delayExecution(ms = 10) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitForDatabase() {
        if (window.legalDatabase && window.legalDatabase.isLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const checkDatabase = () => {
                if (window.legalDatabase && window.legalDatabase.isLoaded) {
                    resolve();
                } else {
                    setTimeout(checkDatabase, 100);
                }
            };
            checkDatabase();
        });
    }

    setupTheme() {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('preferred-theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            this.theme = savedTheme;
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.theme = 'dark';
            }
        }

        this.applyTheme(this.theme);
        this.setupThemeToggle();
        this.watchSystemThemeChanges();
    }

    applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/, '');
        document.body.classList.add(`theme-${theme}`);
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        }
        
        this.theme = theme;
        localStorage.setItem('preferred-theme', theme);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = this.theme === 'light' ? 'dark' : 'light';
                this.applyTheme(newTheme);
                this.announceThemeChange(newTheme);
            });
        }
    }

    watchSystemThemeChanges() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't set a preference
                if (!localStorage.getItem('preferred-theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    announceThemeChange(theme) {
        const message = theme === 'dark' ? 
            (window.i18n?.translate('dark-mode-enabled') || 'Dark mode enabled') :
            (window.i18n?.translate('light-mode-enabled') || 'Light mode enabled');
        
        this.announceToScreenReader(message);
    }

    setupEventListeners() {
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });

        // Online/offline status
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });

        // Print handling
        window.addEventListener('beforeprint', () => {
            this.preparePrintView();
        });

        window.addEventListener('afterprint', () => {
            this.restoreNormalView();
        });

        // Resize handling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Visibility change (for performance optimization)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Form validation
        this.setupFormValidation();
    }

    setupKeyboardNavigation() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case '/':
                    e.preventDefault();
                    this.focusSearchInput();
                    break;
                case 'Escape':
                    this.handleEscapeKey();
                    break;
                case 'k':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.focusSearchInput();
                    }
                    break;
                case 't':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const themeToggle = document.getElementById('theme-toggle');
                        if (themeToggle) themeToggle.click();
                    }
                    break;
            }
        });

        // Tab trapping for modals
        this.setupModalTabTrapping();
    }

    focusSearchInput() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    handleEscapeKey() {
        // Close any open modals or suggestions
        const modal = document.querySelector('.modal.visible');
        if (modal) {
            this.closeModal(modal);
            return;
        }

        const suggestions = document.querySelector('.search-suggestions.visible');
        if (suggestions && window.searchEngine) {
            window.searchEngine.hideSuggestions();
            return;
        }
    }

    setupAccessibility() {
        // Add skip links functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Enhance focus management
        this.setupFocusManagement();
        
        // Add ARIA live regions for dynamic content
        this.setupAriaLiveRegions();
        
        // Set up reduced motion preferences
        this.respectReducedMotion();
    }

    setupFocusManagement() {
        // Ensure focus is visible
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('button, input, select, textarea, a, [tabindex]')) {
                e.target.setAttribute('data-focus-visible', 'true');
            }
        });

        document.addEventListener('focusout', (e) => {
            e.target.removeAttribute('data-focus-visible');
        });

        // Handle mouse vs keyboard focus
        let usingMouse = false;

        document.addEventListener('mousedown', () => {
            usingMouse = true;
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                usingMouse = false;
            }
        });

        document.addEventListener('focusin', (e) => {
            if (usingMouse) {
                e.target.classList.add('mouse-focus');
            } else {
                e.target.classList.remove('mouse-focus');
            }
        });
    }

    setupAriaLiveRegions() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    respectReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduce-motion');
        }
    }

    setupPerformanceOptimizations() {
        // Lazy load non-critical components
        this.setupIntersectionObserver();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Set up performance monitoring
        this.monitorPerformance();
    }

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        
                        // Lazy load images if any
                        const lazyImages = entry.target.querySelectorAll('img[data-src]');
                        lazyImages.forEach(img => {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        });
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe sections that might benefit from lazy loading
            document.querySelectorAll('.search-results, .quick-access, .search-history').forEach(section => {
                observer.observe(section);
            });
        }
    }

    preloadCriticalResources() {
        // Preload important fonts if using web fonts
        // This is handled in CSS with font-display: swap
        
        // Preload critical images (if any)
        // Not applicable for this text-based application
    }

    monitorPerformance() {
        if ('performance' in window) {
            // Log initial page load time
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }, 0);
            });

            // Disable long task monitoring during development to reduce console noise
            // Enable only in production or when specifically debugging performance
            const MONITOR_LONG_TASKS = false;
            
            if (MONITOR_LONG_TASKS && 'PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        list.getEntries().forEach(entry => {
                            // Only warn for very long tasks (>200ms) after app is fully loaded
                            if (entry.duration > 200 && this.isInitialized) {
                                console.warn('Long task detected:', entry.duration, 'ms');
                            }
                        });
                    });
                    observer.observe({ entryTypes: ['longtask'] });
                } catch (e) {
                    // longtask not supported in all browsers
                    console.log('Performance monitoring not available in this browser');
                }
            }
        }
    }

    setupNotificationSystem() {
        // Create notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        notificationContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Create elements safely to prevent XSS
        const notificationContent = document.createElement('div');
        notificationContent.className = 'notification-content';
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'notification-message';
        messageSpan.textContent = message; // Use textContent instead of innerHTML
        
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.innerHTML = '&times;';
        
        // Set up close button event listener
        closeButton.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        notificationContent.appendChild(messageSpan);
        notificationContent.appendChild(closeButton);
        notification.appendChild(notificationContent);

        // Add to container
        container.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('visible'), 100);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    removeNotification(notification) {
        notification.classList.remove('visible');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    setupBookmarkSystem() {
        this.loadBookmarks();
        this.setupBookmarkUI();
    }

    loadBookmarks() {
        try {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarked-articles') || '[]');
            this.bookmarks = bookmarks;
        } catch (error) {
            console.warn('Error loading bookmarks:', error);
            this.bookmarks = [];
        }
    }

    setupBookmarkUI() {
        // Add bookmarks section to UI if needed
        // This would be implemented based on specific UI requirements
    }

    setupFormValidation() {
        // Real-time form validation
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = window.i18n?.translate('field-required') || 'This field is required';
        }

        // Specific validation based on field type/name
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = window.i18n?.translate('invalid-email') || 'Please enter a valid email address';
            }
        }

        // Update field state
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid && value);

        // Show/hide error message
        this.updateFieldErrorMessage(field, message);

        return isValid;
    }

    updateFieldErrorMessage(field, message) {
        const errorId = `${field.id || field.name}-error`;
        let errorElement = document.getElementById(errorId);

        if (message) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'field-error';
                errorElement.setAttribute('role', 'alert');
                field.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
            field.setAttribute('aria-describedby', errorId);
        } else if (errorElement) {
            errorElement.remove();
            field.removeAttribute('aria-describedby');
        }
    }

    setupModalTabTrapping() {
        document.addEventListener('keydown', (e) => {
            const modal = document.querySelector('.modal.visible');
            if (!modal || e.key !== 'Tab') return;

            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    closeModal(modal) {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        
        // Return focus to trigger element if available
        const triggerElement = modal.getAttribute('data-trigger');
        if (triggerElement) {
            const trigger = document.querySelector(triggerElement);
            if (trigger) trigger.focus();
        }
    }

    handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Handle search query from URL
        const query = urlParams.get('q');
        if (query) {
            const searchInput = document.getElementById('search-input');
            if (searchInput && window.searchEngine) {
                searchInput.value = decodeURIComponent(query);
                window.searchEngine.performSearch();
            }
        }

        // Handle article ID from hash
        const hash = window.location.hash;
        if (hash.startsWith('#article-')) {
            const articleId = hash.substring(9);
            this.scrollToArticle(articleId);
        }
    }

    scrollToArticle(articleId) {
        // If article is not visible, this would trigger a search for it
        const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
        if (articleElement) {
            articleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            articleElement.focus();
        }
    }

    handleGlobalError(error) {
        console.error('Application error:', error);
        
        // Don't show error notifications for non-critical errors
        if (!this.isCriticalError(error)) {
            return;
        }

        this.showNotification(
            window.i18n?.translate('unexpected-error') || 'An unexpected error occurred',
            'error',
            8000
        );
    }

    isCriticalError(error) {
        // Define what constitutes a critical error
        const criticalErrors = [
            'ChunkLoadError',
            'TypeError: Cannot read property',
            'ReferenceError'
        ];

        return criticalErrors.some(criticalError => 
            error.message && error.message.includes(criticalError)
        );
    }

    showCriticalError(message) {
        // Show persistent error message for critical errors
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'critical-error-overlay';
        
        // Create elements safely to prevent XSS
        const errorContent = document.createElement('div');
        errorContent.className = 'critical-error-content';
        
        const heading = document.createElement('h2');
        heading.textContent = 'Application Error';
        
        const messagePara = document.createElement('p');
        messagePara.textContent = message; // Use textContent instead of innerHTML
        
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Reload Page';
        reloadButton.onclick = () => window.location.reload();
        
        errorContent.appendChild(heading);
        errorContent.appendChild(messagePara);
        errorContent.appendChild(reloadButton);
        errorOverlay.appendChild(errorContent);
        
        document.body.appendChild(errorOverlay);
    }

    handleOnlineStatus(isOnline) {
        const message = isOnline ?
            (window.i18n?.translate('back-online') || 'Connection restored') :
            (window.i18n?.translate('offline') || 'You are currently offline');
        
        this.showNotification(message, isOnline ? 'success' : 'warning');
        
        // Update UI based on online status
        document.body.classList.toggle('offline', !isOnline);
    }

    preparePrintView() {
        // Hide non-essential elements for printing
        document.body.classList.add('printing');
    }

    restoreNormalView() {
        // Restore normal view after printing
        document.body.classList.remove('printing');
    }

    handleResize() {
        // Handle responsive layout changes
        this.updateViewportHeight();
    }

    updateViewportHeight() {
        // Fix for mobile viewport height issues
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause non-essential operations when page is hidden
            this.pauseOperations();
        } else {
            // Resume operations when page becomes visible
            this.resumeOperations();
        }
    }

    pauseOperations() {
        // Pause animations, timers, etc.
        document.body.classList.add('paused');
    }

    resumeOperations() {
        // Resume normal operations
        document.body.classList.remove('paused');
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Public API methods
    getVersion() {
        return this.version;
    }

    isReady() {
        return this.isInitialized;
    }

    getStats() {
        return {
            version: this.version,
            theme: this.theme,
            language: window.i18n?.getLanguage() || 'unknown',
            database: window.legalDatabase?.getStatistics() || {},
            bookmarks: this.bookmarks?.length || 0
        };
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
