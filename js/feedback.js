/**
 * Feedback System
 * Sistema de envío de sugerencias y reporte de errores
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
        
        // Crear el modal al cargar la página
        this.createModal();
        this.bindEvents();
        this.isInitialized = true;
        
        console.log('Feedback system initialized');
    }

    createModal() {
        // Crear la estructura del modal
        const modalHTML = `
            <div id="feedbackModal" class="feedback-modal">
                <div class="feedback-modal-content">
                    <button class="feedback-close" onclick="window.feedbackSystem.closeModal()">&times;</button>
                    
                    <form class="feedback-form" id="feedbackForm">
                        <h3>📧 Enviar Feedback</h3>
                        
                        <div id="feedbackStatus" class="feedback-status"></div>
                        
                        <div class="form-group">
                            <label for="feedbackType">Tipo de feedback:</label>
                            <select id="feedbackType" name="feedbackType" required>
                                <option value="">Seleccione una opción</option>
                                <option value="error">🐛 Reporte de error</option>
                                <option value="suggestion">💡 Sugerencia de mejora</option>
                                <option value="content">📝 Error en contenido/traducción</option>
                                <option value="feature">✨ Solicitud de nueva función</option>
                                <option value="other">❓ Otro</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="feedbackMessage">Mensaje (máximo ${this.maxCharacters} caracteres):</label>
                            <textarea 
                                id="feedbackMessage" 
                                name="feedbackMessage" 
                                placeholder="Describe tu sugerencia o el problema que encontraste. Sé específico para ayudarnos a mejorar la aplicación."
                                maxlength="${this.maxCharacters}"
                                required
                            ></textarea>
                            <div class="char-counter">
                                <span id="charCount">0</span>/${this.maxCharacters}
                            </div>
                        </div>
                        
                        <div class="feedback-actions">
                            <button type="button" class="btn-feedback secondary" onclick="window.feedbackSystem.closeModal()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-feedback primary" id="submitFeedback">
                                📧 Enviar Feedback
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Añadir al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Crear el botón flotante
        const buttonHTML = `
            <button 
                class="feedback-btn-main" 
                onclick="window.feedbackSystem.openModal()"
                title="Enviar feedback o reportar errores"
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

        // Contador de caracteres
        messageTextarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = count;
            
            // Cambiar color según límite
            const counter = charCount.parentElement;
            counter.classList.remove('warning', 'error');
            
            if (count >= this.maxCharacters * 0.9) {
                counter.classList.add('warning');
            }
            if (count >= this.maxCharacters) {
                counter.classList.add('error');
            }
        });

        // Submit del formulario
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });

        // Cerrar modal clickeando fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus en el primer campo
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
        
        // Resetear contador
        document.getElementById('charCount').textContent = '0';
        document.querySelector('.char-counter').classList.remove('warning', 'error');
    }

    async submitFeedback() {
        const submitBtn = document.getElementById('submitFeedback');
        const status = document.getElementById('feedbackStatus');
        
        // Obtener datos del formulario
        const formData = new FormData(document.getElementById('feedbackForm'));
        const feedbackData = {
            type: formData.get('feedbackType'),
            message: formData.get('feedbackMessage'),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            language: document.documentElement.lang || 'es'
        };

        // Validar datos
        if (!feedbackData.type || !feedbackData.message.trim()) {
            this.showStatus('error', 'Por favor completa todos los campos.');
            return;
        }

        if (feedbackData.message.length > this.maxCharacters) {
            this.showStatus('error', `El mensaje no puede exceder ${this.maxCharacters} caracteres.`);
            return;
        }

        // Deshabilitar botón durante envío
        submitBtn.disabled = true;
        submitBtn.textContent = '📤 Enviando...';

        try {
            // Enviar usando Formspree (servicio gratuito de formularios)
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: `[Croatian Labor Law] ${this.getFeedbackTypeLabel(feedbackData.type)}`,
                    message: this.formatMessage(feedbackData),
                    _replyto: 'noreply@croatian-labor-law.app' // Email de respuesta genérico
                })
            });

            if (response.ok) {
                this.showStatus('success', '✅ ¡Feedback enviado correctamente! Gracias por ayudarnos a mejorar.');
                
                // Cerrar modal después de 3 segundos
                setTimeout(() => {
                    this.closeModal();
                }, 3000);
                
                // Track evento (si hay analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'feedback_sent', {
                        feedback_type: feedbackData.type
                    });
                }
                
            } else {
                throw new Error('Error en el servidor');
            }
            
        } catch (error) {
            console.error('Error sending feedback:', error);
            this.showStatus('error', '❌ Error al enviar el feedback. Por favor intenta más tarde.');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = '📧 Enviar Feedback';
        }
    }

    getFeedbackTypeLabel(type) {
        const labels = {
            'error': 'Reporte de Error',
            'suggestion': 'Sugerencia de Mejora',
            'content': 'Error en Contenido',
            'feature': 'Solicitud de Función',
            'other': 'Otro Feedback'
        };
        return labels[type] || 'Feedback General';
    }

    formatMessage(data) {
        return `
FEEDBACK - Croatian Labor Law Fact Checker
==========================================

Tipo: ${this.getFeedbackTypeLabel(data.type)}
Fecha: ${new Date(data.timestamp).toLocaleString('es-ES')}
URL: ${data.url}
Idioma: ${data.language}

MENSAJE:
${data.message}

INFORMACIÓN TÉCNICA:
User Agent: ${data.userAgent}
Timestamp: ${data.timestamp}

==========================================
Enviado desde: Croatian Labor Law Fact Checker v1.0
        `.trim();
    }

    showStatus(type, message) {
        const status = document.getElementById('feedbackStatus');
        status.className = `feedback-status ${type}`;
        status.textContent = message;
        status.style.display = 'block';
        
        // Scroll al status si es necesario
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Método para integración con otros sistemas
    sendFeedback(type, message) {
        this.openModal();
        
        // Pre-llenar formulario si se llama programáticamente
        setTimeout(() => {
            if (type) {
                document.getElementById('feedbackType').value = type;
            }
            if (message) {
                const textarea = document.getElementById('feedbackMessage');
                textarea.value = message;
                textarea.dispatchEvent(new Event('input')); // Trigger contador
            }
        }, 300);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystem = new FeedbackSystem();
});

// También crear instancia global para uso desde otros scripts
window.feedbackSystem = window.feedbackSystem || new FeedbackSystem();
