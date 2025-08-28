/* =========================================
   Internationalization (i18n) Module
   Croatian Labor Law Fact Checker
   ========================================= */

class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                // Header and Navigation
                'site-title': 'Croatian Labor Law Fact Checker',
                'select-language': 'Select Language',
                'toggle-theme': 'Toggle dark mode',
                'skip-to-content': 'Skip to main content',

                // Hero Section
                'hero-title': 'Search Croatian Labor Laws & Workers\' Rights',
                'hero-description': 'Find accurate information about Croatian employment law, workers\' rights, and labor regulations. Search through comprehensive legal database with multilingual support.',

                // Search
                'search-heading': 'Search Legal Database',
                'search-label': 'Enter your question about Croatian labor law',
                'search-placeholder': 'Ask about workers\' rights, employment contracts, vacation days...',
                'search-help': 'Try searching for: "vacation days", "overtime pay", "termination notice", "maternity leave"',
                'advanced-search': 'Advanced Search Options',
                'searching': 'Searching legal database...',

                // Filters
                'filter-by': 'Filter by:',
                'section': 'Section:',
                'all-sections': 'All Sections',
                'general-provisions': 'General Provisions',
                'employment-contracts': 'Employment Contracts',
                'working-time': 'Working Time',
                'leave-vacation': 'Leave & Vacation',
                'termination': 'Termination',
                'workplace-safety': 'Workplace Safety',
                'article-type': 'Article Type:',
                'all-types': 'All Types',
                'rights': 'Rights',
                'obligations': 'Obligations',
                'procedures': 'Procedures',
                'penalties': 'Penalties',

                // Results
                'search-results': 'Search Results',
                'results-found': 'results found',
                'no-results-title': 'No results found',
                'no-results-description': 'Try different keywords or check the spelling of your search terms.',
                'suggestions': 'Suggestions:',
                'no-results-tips': [
                    'Use simpler terms (e.g., "vacation" instead of "annual leave entitlement")',
                    'Try searching in Croatian: "godišnji odmor", "radno vrijeme"',
                    'Check our advanced search options'
                ],

                // Article Display
                'croatian': 'Croatian (Original)',
                'translation': 'Translation',
                'bookmark': 'Bookmark',
                'share': 'Share',
                'read-more': 'Read More',
                'updated': 'Updated:',

                // Quick Access
                'popular-topics': 'Popular Topics',
                'vacation-days': 'Vacation Days',
                'overtime-pay': 'Overtime Pay',
                'maternity-leave': 'Maternity Leave',
                'termination-notice': 'Termination Notice',
                'workplace-safety': 'Workplace Safety',
                'employment-contract': 'Employment Contract',

                // Quick Access Queries (for data-query attributes)
                'vacation-days-query': 'vacation days',
                'overtime-pay-query': 'overtime pay',
                'maternity-leave-query': 'maternity leave',
                'termination-notice-query': 'termination notice',
                'workplace-safety-query': 'workplace safety',
                'employment-contract-query': 'employment contract',

                // Search History
                'recent-searches': 'Recent Searches',
                'clear-history': 'Clear History',

                // Footer
                'about': 'About',
                'footer-description': 'This tool provides information about Croatian labor laws for educational purposes. Always consult with legal professionals for specific legal advice.',
                'legal': 'Legal',
                'privacy-policy': 'Privacy Policy',
                'terms-of-use': 'Terms of Use',
                'disclaimer': 'Disclaimer',
                'sources': 'Sources',
                'official-gazette': 'Official Gazette of Croatia',
                'government-portal': 'Government Portal',
                'all-rights-reserved': 'All rights reserved.',
                'last-updated': 'Last updated:',

                // Error Messages
                'error-title': 'Something went wrong',
                'error-message': 'An error occurred while searching. Please try again.',
                'try-again': 'Try Again',

                // GDPR and Privacy
                'cookie-consent-title': 'Cookie Consent',
                'cookie-consent-text': 'We use essential cookies to ensure the website functions properly. No tracking cookies are used.',
                'accept': 'Accept',
                'decline': 'Decline',
                'data-deleted': 'All your data has been deleted.'
            },

            es: {
                // Header and Navigation
                'site-title': 'Verificador de Leyes Laborales de Croacia',
                'select-language': 'Seleccionar Idioma',
                'toggle-theme': 'Alternar modo oscuro',
                'skip-to-content': 'Saltar al contenido principal',

                // Hero Section
                'hero-title': 'Buscar Leyes Laborales y Derechos de los Trabajadores de Croacia',
                'hero-description': 'Encuentra información precisa sobre la ley laboral croata, derechos de los trabajadores y regulaciones laborales. Busca en una base de datos legal completa con soporte multilingüe.',

                // Search
                'search-heading': 'Buscar Base de Datos Legal',
                'search-label': 'Ingresa tu pregunta sobre la ley laboral croata',
                'search-placeholder': 'Pregunta sobre derechos de trabajadores, contratos de empleo, días de vacaciones...',
                'search-help': 'Intenta buscar: "días de vacaciones", "pago de horas extra", "aviso de terminación", "licencia de maternidad"',
                'advanced-search': 'Opciones de Búsqueda Avanzada',
                'searching': 'Buscando en la base de datos legal...',

                // Filters
                'filter-by': 'Filtrar por:',
                'section': 'Sección:',
                'all-sections': 'Todas las Secciones',
                'general-provisions': 'Disposiciones Generales',
                'employment-contracts': 'Contratos de Empleo',
                'working-time': 'Tiempo de Trabajo',
                'leave-vacation': 'Licencias y Vacaciones',
                'termination': 'Terminación',
                'workplace-safety': 'Seguridad en el Trabajo',
                'article-type': 'Tipo de Artículo:',
                'all-types': 'Todos los Tipos',
                'rights': 'Derechos',
                'obligations': 'Obligaciones',
                'procedures': 'Procedimientos',
                'penalties': 'Sanciones',

                // Results
                'search-results': 'Resultados de Búsqueda',
                'results-found': 'resultados encontrados',
                'no-results-title': 'No se encontraron resultados',
                'no-results-description': 'Intenta con diferentes palabras clave o verifica la ortografía de tus términos de búsqueda.',
                'suggestions': 'Sugerencias:',
                'no-results-tips': [
                    'Usa términos más simples (ej., "vacaciones" en lugar de "derecho a vacaciones anuales")',
                    'Intenta buscar en croata: "godišnji odmor", "radno vrijeme"',
                    'Revisa nuestras opciones de búsqueda avanzada'
                ],

                // Article Display
                'croatian': 'Croata (Original)',
                'translation': 'Traducción',
                'bookmark': 'Guardar',
                'share': 'Compartir',
                'read-more': 'Leer Más',
                'updated': 'Actualizado:',

                // Quick Access
                'popular-topics': 'Temas Populares',
                'vacation-days': 'Días de Vacaciones',
                'overtime-pay': 'Pago de Horas Extra',
                'maternity-leave': 'Licencia de Maternidad',
                'termination-notice': 'Aviso de Terminación',
                'workplace-safety': 'Seguridad Laboral',
                'employment-contract': 'Contrato de Empleo',

                // Quick Access Queries (for data-query attributes)
                'vacation-days-query': 'días de vacaciones',
                'overtime-pay-query': 'pago de horas extra',
                'maternity-leave-query': 'licencia de maternidad',
                'termination-notice-query': 'aviso de terminación',
                'workplace-safety-query': 'seguridad laboral',
                'employment-contract-query': 'contrato de empleo',

                // Search History
                'recent-searches': 'Búsquedas Recientes',
                'clear-history': 'Limpiar Historial',

                // Footer
                'about': 'Acerca de',
                'footer-description': 'Esta herramienta proporciona información sobre las leyes laborales croatas con fines educativos. Siempre consulta con profesionales legales para asesoramiento legal específico.',
                'legal': 'Legal',
                'privacy-policy': 'Política de Privacidad',
                'terms-of-use': 'Términos de Uso',
                'disclaimer': 'Descargo de Responsabilidad',
                'sources': 'Fuentes',
                'official-gazette': 'Gaceta Oficial de Croacia',
                'government-portal': 'Portal del Gobierno',
                'all-rights-reserved': 'Todos los derechos reservados.',
                'last-updated': 'Última actualización:',

                // Error Messages
                'error-title': 'Algo salió mal',
                'error-message': 'Ocurrió un error durante la búsqueda. Por favor intenta de nuevo.',
                'try-again': 'Intentar de Nuevo',

                // GDPR and Privacy
                'cookie-consent-title': 'Consentimiento de Cookies',
                'cookie-consent-text': 'Utilizamos cookies esenciales para asegurar que el sitio web funcione correctamente. No se usan cookies de seguimiento.',
                'accept': 'Aceptar',
                'decline': 'Rechazar',
                'data-deleted': 'Todos tus datos han sido eliminados.'
            },

            hr: {
                // Header and Navigation
                'site-title': 'Hrvatski Provjera Zakona o Radu',
                'select-language': 'Odaberite Jezik',
                'toggle-theme': 'Prebaci tamni način rada',
                'skip-to-content': 'Preskoči na glavni sadržaj',

                // Hero Section
                'hero-title': 'Pretražite Hrvatske Zakone o Radu i Prava Radnika',
                'hero-description': 'Pronađite točne informacije o hrvatskom radnom zakonodavstvu, pravima radnika i radnim propisima. Pretražujte kroz sveobuhvatnu pravnu bazu podataka s višejezičnom podrškom.',

                // Search
                'search-heading': 'Pretražite Pravnu Bazu Podataka',
                'search-label': 'Unesite svoje pitanje o hrvatskom radnom zakonu',
                'search-placeholder': 'Pitajte o pravima radnika, ugovorima o radu, danima godišnjeg odmora...',
                'search-help': 'Pokušajte pretražiti: "godišnji odmor", "prekovremeni rad", "otkaz", "rodiljski dopust"',
                'advanced-search': 'Napredne Opcije Pretrage',
                'searching': 'Pretražujem pravnu bazu podataka...',

                // Filters
                'filter-by': 'Filtriraj po:',
                'section': 'Odjeljak:',
                'all-sections': 'Svi Odjeljci',
                'general-provisions': 'Opće Odredbe',
                'employment-contracts': 'Ugovori o Radu',
                'working-time': 'Radno Vrijeme',
                'leave-vacation': 'Dopusti i Godišnji Odmor',
                'termination': 'Prestanak Rada',
                'workplace-safety': 'Sigurnost na Radu',
                'article-type': 'Tip Članka:',
                'all-types': 'Svi Tipovi',
                'rights': 'Prava',
                'obligations': 'Obveze',
                'procedures': 'Postupci',
                'penalties': 'Kazne',

                // Results
                'search-results': 'Rezultati Pretrage',
                'results-found': 'pronađenih rezultata',
                'no-results-title': 'Nema pronađenih rezultata',
                'no-results-description': 'Pokušajte s različitim ključnim riječima ili provjerite pravopis vaših pojmova za pretraživanje.',
                'suggestions': 'Prijedlozi:',
                'no-results-tips': [
                    'Koristite jednostavnije pojmove (npr. "godišnji odmor" umjesto "pravo na godišnji odmor")',
                    'Pokušajte pretražiti na hrvatskom: "godišnji odmor", "radno vrijeme"',
                    'Provjerite naše napredne opcije pretrage'
                ],

                // Article Display
                'croatian': 'Hrvatski (Izvornik)',
                'translation': 'Prijevod',
                'bookmark': 'Označi',
                'share': 'Podijeli',
                'read-more': 'Pročitaj Više',
                'updated': 'Ažurirano:',

                // Quick Access
                'popular-topics': 'Popularne Tema',
                'vacation-days': 'Dani Godišnjeg Odmora',
                'overtime-pay': 'Plaća za Prekovremeni Rad',
                'maternity-leave': 'Rodiljski Dopust',
                'termination-notice': 'Otkaz',
                'workplace-safety': 'Sigurnost na Radu',
                'employment-contract': 'Ugovor o Radu',

                // Quick Access Queries (for data-query attributes)
                'vacation-days-query': 'godišnji odmor',
                'overtime-pay-query': 'prekovremeni rad',
                'maternity-leave-query': 'rodiljski dopust',
                'termination-notice-query': 'otkaz',
                'workplace-safety-query': 'sigurnost na radu',
                'employment-contract-query': 'ugovor o radu',

                // Search History
                'recent-searches': 'Nedavne Pretrage',
                'clear-history': 'Obriši Povijes',

                // Footer
                'about': 'O nama',
                'footer-description': 'Ovaj alat pruža informacije o hrvatskim zakonima o radu u obrazovne svrhe. Uvijek se savjetujte s pravnim stručnjacima za specifične pravne savjete.',
                'legal': 'Pravno',
                'privacy-policy': 'Politika Privatnosti',
                'terms-of-use': 'Uvjeti Korištenja',
                'disclaimer': 'Odricanje od Odgovornosti',
                'sources': 'Izvori',
                'official-gazette': 'Narodne Novine Republike Hrvatske',
                'government-portal': 'Vladni Portal',
                'all-rights-reserved': 'Sva prava pridržana.',
                'last-updated': 'Zadnje ažuriranje:',

                // Error Messages
                'error-title': 'Nešto je pošlo po zlu',
                'error-message': 'Došlo je do greške tijekom pretrage. Molimo pokušajte ponovno.',
                'try-again': 'Pokušaj Ponovno',

                // GDPR and Privacy
                'cookie-consent-title': 'Suglasnost za Kolačiće',
                'cookie-consent-text': 'Koristimo osnovne kolačiće kako bismo osigurali da web stranica funkcionira ispravno. Ne koriste se kolačići za praćenje.',
                'accept': 'Prihvati',
                'decline': 'Odbaci',
                'data-deleted': 'Svi vaši podaci su obrisani.'
            }
        };

        this.dateFormats = {
            en: { locale: 'en-US', options: { year: 'numeric', month: 'long', day: 'numeric' } },
            es: { locale: 'es-ES', options: { year: 'numeric', month: 'long', day: 'numeric' } },
            hr: { locale: 'hr-HR', options: { year: 'numeric', month: 'long', day: 'numeric' } }
        };

        this.numberFormats = {
            en: { locale: 'en-US' },
            es: { locale: 'es-ES' },
            hr: { locale: 'hr-HR' }
        };

        // Initialize
        this.init();
    }

    init() {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        } else {
            // Detect browser language
            const browserLang = navigator.language.substring(0, 2);
            if (this.translations[browserLang]) {
                this.currentLanguage = browserLang;
            }
        }

        // Set up language selector
        this.setupLanguageSelector();
        
        // Apply initial translation
        this.translatePage();
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    setupLanguageSelector() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
            languageSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language '${language}' not supported`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('preferred-language', language);
        document.documentElement.lang = language;
        
        // Update language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = language;
        }
        
        this.translatePage();
        
        // Emit language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: language }
        }));
    }

    translatePage() {
        // Translate all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation !== key) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Translate placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);
            if (translation !== key) {
                element.placeholder = translation;
            }
        });

        // Translate aria-labels
        const ariaElements = document.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translation = this.translate(key);
            if (translation !== key) {
                element.setAttribute('aria-label', translation);
            }
        });

        // Translate title attributes
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.translate(key);
            if (translation !== key) {
                element.title = translation;
            }
        });

        // Update quick-access-item data-query attributes based on language
        this.updateQuickAccessQueries();
    }

    updateQuickAccessQueries() {
        const quickAccessItems = document.querySelectorAll('.quick-access-item[data-i18n]');
        quickAccessItems.forEach(item => {
            const i18nKey = item.getAttribute('data-i18n');
            const queryKey = i18nKey + '-query';
            const translatedQuery = this.translate(queryKey);
            
            if (translatedQuery !== queryKey) {
                item.setAttribute('data-query', translatedQuery);
            }
        });
    }

    translate(key, params = {}) {
        if (!key) return '';
        
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['en']?.[key] || 
                          key;

        // Handle array translations (like tips)
        if (Array.isArray(translation)) {
            return translation;
        }

        // Simple parameter replacement
        let result = translation;
        Object.keys(params).forEach(paramKey => {
            const regex = new RegExp(`{{${paramKey}}}`, 'g');
            result = result.replace(regex, params[paramKey]);
        });

        return result;
    }

    formatDate(date, locale = null) {
        const targetLocale = locale || this.currentLanguage;
        const format = this.dateFormats[targetLocale] || this.dateFormats['en'];
        
        try {
            // Validate the date input
            if (!date) return '';
            
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                console.warn('Invalid date value:', date);
                return date || '';
            }
            
            return new Intl.DateTimeFormat(format.locale, format.options).format(dateObj);
        } catch (error) {
            console.error('Error formatting date:', error);
            return date || '';
        }
    }

    formatNumber(number, locale = null) {
        const targetLocale = locale || this.currentLanguage;
        const format = this.numberFormats[targetLocale] || this.numberFormats['en'];
        
        try {
            return new Intl.NumberFormat(format.locale).format(number);
        } catch (error) {
            console.warn('Error formatting number:', error);
            return number;
        }
    }

    getLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return Object.keys(this.translations);
    }

    isRTL() {
        // Croatian, English, and Spanish are LTR languages
        return false;
    }

    getLanguageName(code) {
        const languageNames = {
            en: 'English',
            es: 'Español', 
            hr: 'Hrvatski'
        };
        return languageNames[code] || code;
    }

    // Method to add new translations dynamically
    addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        Object.assign(this.translations[language], translations);
    }

    // Method to get all translations for a specific language
    getAllTranslations(language = null) {
        const targetLanguage = language || this.currentLanguage;
        return this.translations[targetLanguage] || {};
    }

    // Method to check if a translation exists
    hasTranslation(key, language = null) {
        const targetLanguage = language || this.currentLanguage;
        return !!(this.translations[targetLanguage]?.[key]);
    }

    // Method to get missing translations for debugging
    getMissingTranslations() {
        const missingTranslations = {};
        const allKeys = new Set();
        
        // Collect all translation keys
        Object.values(this.translations).forEach(languageTranslations => {
            Object.keys(languageTranslations).forEach(key => allKeys.add(key));
        });

        // Check which keys are missing in each language
        Object.keys(this.translations).forEach(language => {
            const missing = [];
            allKeys.forEach(key => {
                if (!this.translations[language][key]) {
                    missing.push(key);
                }
            });
            if (missing.length > 0) {
                missingTranslations[language] = missing;
            }
        });

        return missingTranslations;
    }

    // Method to export translations for external editing
    exportTranslations() {
        return JSON.stringify(this.translations, null, 2);
    }

    // Method to import translations from external source
    importTranslations(translationsJson) {
        try {
            const imported = JSON.parse(translationsJson);
            Object.keys(imported).forEach(language => {
                if (typeof imported[language] === 'object') {
                    this.addTranslations(language, imported[language]);
                }
            });
            this.translatePage();
            return true;
        } catch (error) {
            console.error('Error importing translations:', error);
            return false;
        }
    }
}

// Create global instance
window.i18n = new I18n();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
