/* =========================================
   Security Utils - XSS Protection
   Croatian Labor Law Fact Checker
   ========================================= */

class SecurityUtils {
    static sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static escapeHTML(str) {
        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
    }

    static sanitizeSearchQuery(query) {
        // Remove potentially dangerous characters
        return query.replace(/[<>\"'&]/g, '').trim();
    }

    static validateInput(input, type = 'text') {
        switch (type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
            case 'search':
                return input.length <= 200 && !/[<>\"'&]/g.test(input);
            default:
                return input.length <= 1000;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
} else {
    window.SecurityUtils = SecurityUtils;
}
