/* =========================================
   GDPR Compliance Module
   Croatian Labor Law Fact Checker
   ========================================= */

class GDPRCompliance {
    constructor() {
        this.cookieConsent = localStorage.getItem('cookie-consent');
        this.initGDPR();
    }

    initGDPR() {
        if (!this.cookieConsent) {
            this.showCookieBanner();
        }
        this.setupDataProtection();
    }

    showCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'gdpr-banner';
        banner.innerHTML = `
            <div class="gdpr-content">
                <h3>${window.i18n?.translate('cookie-consent-title') || 'Cookie Consent'}</h3>
                <p>${window.i18n?.translate('cookie-consent-text') || 'We use essential cookies to ensure the website functions properly. No tracking cookies are used.'}</p>
                <div class="gdpr-actions">
                    <button id="accept-cookies" class="btn-primary">${window.i18n?.translate('accept') || 'Accept'}</button>
                    <button id="decline-cookies" class="btn-secondary">${window.i18n?.translate('decline') || 'Decline'}</button>
                    <a href="#privacy-policy">${window.i18n?.translate('privacy-policy') || 'Privacy Policy'}</a>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        document.getElementById('accept-cookies').addEventListener('click', () => {
            this.acceptCookies();
            banner.remove();
        });

        document.getElementById('decline-cookies').addEventListener('click', () => {
            this.declineCookies();
            banner.remove();
        });
    }

    acceptCookies() {
        localStorage.setItem('cookie-consent', 'accepted');
        this.cookieConsent = 'accepted';
        
        // Enable analytics only if user consents
        this.enableAnalytics();
    }

    declineCookies() {
        localStorage.setItem('cookie-consent', 'declined');
        this.cookieConsent = 'declined';
        
        // Clear any existing analytics
        this.disableAnalytics();
    }

    setupDataProtection() {
        // Implement right to be forgotten
        window.addEventListener('unload', () => {
            if (this.cookieConsent === 'declined') {
                // Clear any potential tracking data
                this.clearUserData();
            }
        });
    }

    enableAnalytics() {
        // Only enable if user explicitly consented
        if (this.cookieConsent === 'accepted') {
            // Add privacy-friendly analytics here
            console.log('Analytics enabled with user consent');
        }
    }

    disableAnalytics() {
        // Remove any analytics tracking
        console.log('Analytics disabled per user preference');
    }

    clearUserData() {
        // Clear search history if user hasn't consented
        if (this.cookieConsent !== 'accepted') {
            localStorage.removeItem('search-history');
        }
    }

    exportUserData() {
        // GDPR Article 20 - Right to data portability
        const userData = {
            cookieConsent: this.cookieConsent,
            searchHistory: JSON.parse(localStorage.getItem('search-history') || '[]'),
            preferredLanguage: localStorage.getItem('preferred-language'),
            theme: localStorage.getItem('theme')
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-data.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    deleteAllUserData() {
        // GDPR Article 17 - Right to erasure
        localStorage.removeItem('cookie-consent');
        localStorage.removeItem('search-history');
        localStorage.removeItem('preferred-language');
        localStorage.removeItem('theme');
        
        alert(window.i18n?.translate('data-deleted') || 'All your data has been deleted.');
    }
}

// Initialize GDPR compliance
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.gdprCompliance = new GDPRCompliance();
    });
}
