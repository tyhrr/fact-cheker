/**
 * Feedback System
 * User feedback and error reporting system
 */

class FeedbackSystem {
    constructor() {
        this.modal = null;
        this.isInitialized = false;
        this.maxCharacters = 500;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Create modal on page load
        this.createModal();
        this.bindEvents();
        this.isInitialized = true;
        
        console.log('Feedback system initialized');
    }

    createModal() {
        // Create modal structure
        const modalHTML = `
            <div id="feedbackModal" class="feedback-modal">
                <div class="feedback-modal-content">
                    <button class="feedback-close" onclick="window.feedbackSystem.closeModal()">&times;</button>
                    
                    <form class="feedback-form" id="feedbackForm">
                        <h3>📧 Send Feedback</h3>
                        
                        <div id="feedbackStatus" class="feedback-status"></div>
                        
                        <div class="form-group">
                            <label for="feedbackType">Feedback type:</label>
                            <select id="feedbackType" name="feedbackType" required>
                                <option value="">Select an option</option>
                                <option value="error">🐛 Bug report</option>
                                <option value="suggestion">💡 Improvement suggestion</option>
                                <option value="content">📝 Content/translation error</option>
                                <option value="feature">✨ Feature request</option>
                                <option value="other">❓ Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="feedbackMessage">Message (max ${this.maxCharacters} characters):</label>
                            <textarea 
                                id="feedbackMessage" 
                                name="feedbackMessage" 
                                placeholder="Describe your suggestion or the problem you found. Be specific to help us improve the application."
                                maxlength="${this.maxCharacters}"
                                required
                            ></textarea>
                            <div class="char-counter">
                                <span id="charCount">0</span>/${this.maxCharacters}
                            </div>
                        </div>
                        
                        <div class="feedback-actions">
                            <button type="button" class="btn-feedback secondary" onclick="window.feedbackSystem.closeModal()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-feedback primary" id="submitFeedback">
                                📧 Send Feedback
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Create floating button
        const buttonHTML = `
            <button 
                class="feedback-btn-main" 
                onclick="window.feedbackSystem.openModal()"
                title="Send feedback or report errors"
            >
                📧 Feedback
            </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', buttonHTML);
        
        this.modal = document.getElementById('feedbackModal');
    }

    bindEvents() {
        const form = document.getElementById('feedbackForm');
        const messageTextarea = document.getElementById('feedbackMessage');
        const charCount = document.getElementById('charCount');

        // Character counter
        messageTextarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = count;
            
            // Change color based on limit
            const counter = charCount.parentElement;
            counter.classList.remove('warning', 'error');
            
            if (count >= this.maxCharacters * 0.9) {
                counter.classList.add('warning');
            }
            if (count >= this.maxCharacters) {
                counter.classList.add('error');
            }
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Close modal with ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });

        // Close modal by clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on first field
        setTimeout(() => {
            document.getElementById('feedbackType').focus();
        }, 300);
    }

    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById('feedbackForm');
        const status = document.getElementById('feedbackStatus');
        
        form.reset();
        status.style.display = 'none';
        status.className = 'feedback-status';
        
        // Reset counter
        document.getElementById('charCount').textContent = '0';
        document.querySelector('.char-counter').classList.remove('warning', 'error');
    }

    async submitFeedback() {
        const submitBtn = document.getElementById('submitFeedback');
        const status = document.getElementById('feedbackStatus');
        
        // Get form data
        const formData = new FormData(document.getElementById('feedbackForm'));
        const feedbackData = {
            type: formData.get('feedbackType'),
            message: formData.get('feedbackMessage'),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            language: document.documentElement.lang || 'en'
        };

        // Validate data
        if (!feedbackData.type || !feedbackData.message.trim()) {
            this.showStatus('error', 'Please complete all fields.');
            return;
        }

        if (feedbackData.message.length > this.maxCharacters) {
            this.showStatus('error', `Message cannot exceed ${this.maxCharacters} characters.`);
            return;
        }

        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = '📤 Sending...';

        try {
            // Send using Formspree (free form service)
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: `[Croatian Labor Law] ${this.getFeedbackTypeLabel(feedbackData.type)}`,
                    message: this.formatMessage(feedbackData),
                    _replyto: 'noreply@croatian-labor-law.app' // Generic reply email
                })
            });

            if (response.ok) {
                this.showStatus('success', '✅ Feedback sent successfully! Thank you for helping us improve.');
                
                // Close modal after 3 seconds
                setTimeout(() => {
                    this.closeModal();
                }, 3000);
                
                // Track event (if analytics available)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'feedback_sent', {
                        feedback_type: feedbackData.type
                    });
                }
                
            } else {
                throw new Error('Server error');
            }
            
        } catch (error) {
            console.error('Error sending feedback:', error);
            this.showStatus('error', '❌ Error sending feedback. Please try again later.');
        } finally {
            // Restore button
            submitBtn.disabled = false;
            submitBtn.textContent = '📧 Send Feedback';
        }
    }

    getFeedbackTypeLabel(type) {
        const labels = {
            'error': 'Bug Report',
            'suggestion': 'Improvement Suggestion',
            'content': 'Content Error',
            'feature': 'Feature Request',
            'other': 'Other Feedback'
        };
        return labels[type] || 'General Feedback';
    }

    formatMessage(data) {
        return `
FEEDBACK - Croatian Labor Law Fact Checker
==========================================

Type: ${this.getFeedbackTypeLabel(data.type)}
Date: ${new Date(data.timestamp).toLocaleString('en-US')}
URL: ${data.url}
Language: ${data.language}

MESSAGE:
${data.message}

TECHNICAL INFORMATION:
User Agent: ${data.userAgent}
Timestamp: ${data.timestamp}

==========================================
Sent from: Croatian Labor Law Fact Checker v1.0
        `.trim();
    }

    showStatus(type, message) {
        const status = document.getElementById('feedbackStatus');
        status.className = `feedback-status ${type}`;
        status.textContent = message;
        status.style.display = 'block';
        
        // Scroll to status if needed
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Method for integration with other systems
    sendFeedback(type, message) {
        this.openModal();
        
        // Pre-fill form if called programmatically
        setTimeout(() => {
            if (type) {
                document.getElementById('feedbackType').value = type;
            }
            if (message) {
                const textarea = document.getElementById('feedbackMessage');
                textarea.value = message;
                textarea.dispatchEvent(new Event('input')); // Trigger counter
            }
        }, 300);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystem = new FeedbackSystem();
});

// Also create global instance for use from other scripts
window.feedbackSystem = window.feedbackSystem || new FeedbackSystem();
