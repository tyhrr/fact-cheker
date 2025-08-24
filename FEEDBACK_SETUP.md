# 📧 CONFIGURACIÓN DEL SISTEMA DE FEEDBACK

## 🔧 **CONFIGURACIÓN REQUERIDA:**

### **1. Crear cuenta en Formspree (GRATIS)**
1. Ve a https://formspree.io
2. Crea una cuenta gratuita
3. Crear un nuevo formulario
4. Copia el endpoint de tu formulario (ej: `https://formspree.io/f/xabcdefg`)

### **2. Configurar el endpoint en el código**

**Archivo: `js/feedback.js`**
```javascript
// Línea ~147 - Reemplazar YOUR_FORM_ID con tu ID real de Formspree
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

**Cambiar por:**
```javascript
const response = await fetch('https://formspree.io/f/TU_ID_REAL_AQUI', {
```

### **3. Alternativa: EmailJS (Más control)**

Si prefieres más control, puedes usar EmailJS:

1. Crear cuenta en https://emailjs.com
2. Configurar servicio de email
3. Crear template
4. Reemplazar la función `submitFeedback()` en `feedback.js`

```javascript
// Ejemplo con EmailJS
emailjs.send('tu_service_id', 'tu_template_id', {
    feedback_type: feedbackData.type,
    message: feedbackData.message,
    timestamp: feedbackData.timestamp,
    url: feedbackData.url
});
```

### **4. Método directo con mailto (Fallback)**

Si no quieres usar servicios externos, puedes usar mailto:

```javascript
// En submitFeedback(), reemplazar el fetch con:
const mailtoLink = `mailto:tu-email@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.formatMessage(feedbackData))}`;
window.open(mailtoLink);
```

## 🎯 **CONFIGURACIÓN RECOMENDADA (Formspree):**

### **Paso a paso:**

1. **Crear formulario en Formspree:**
   - Ve a https://formspree.io/forms
   - Click "New Form"
   - Nombre: "Croatian Labor Law Feedback"
   - Email destino: tu-email@gmail.com

2. **Configurar formulario:**
   - Activar reCAPTCHA (opcional)
   - Configurar auto-respuesta
   - Añadir campos personalizados

3. **Copiar Form ID:**
   - Ejemplo: Si tu endpoint es `https://formspree.io/f/xabcdefg`
   - Tu Form ID es: `xabcdefg`

4. **Actualizar código:**
   ```javascript
   // En js/feedback.js línea ~147
   const response = await fetch('https://formspree.io/f/xabcdefg', {
   ```

5. **Verificar funcionamiento:**
   - Abrir la aplicación
   - Click en botón "📧 Feedback"
   - Enviar mensaje de prueba
   - Verificar que llegue a tu email

## 📨 **FORMATO DEL EMAIL QUE RECIBIRÁS:**

```
FEEDBACK - Croatian Labor Law Fact Checker
==========================================

Tipo: Reporte de Error
Fecha: 24/8/2025, 14:30:00
URL: https://tu-usuario.github.io/croatian-labor-law-checker/
Idioma: es

MENSAJE:
El botón de búsqueda no funciona en la versión móvil cuando uso Safari en iPhone.

INFORMACIÓN TÉCNICA:
User Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)...
Timestamp: 2025-08-24T12:30:00.000Z

==========================================
Enviado desde: Croatian Labor Law Fact Checker v1.0
```

## 🔒 **PRIVACIDAD Y SEGURIDAD:**

### **Datos recopilados:**
- ✅ Tipo de feedback (error, sugerencia, etc.)
- ✅ Mensaje del usuario (máximo 500 caracteres)
- ✅ URL actual (para contexto)
- ✅ Timestamp (fecha/hora)
- ✅ User Agent (información del navegador)
- ✅ Idioma actual de la aplicación

### **Datos NO recopilados:**
- ❌ Información personal identificable
- ❌ Direcciones IP (solo si usas Formspree Pro)
- ❌ Cookies de seguimiento
- ❌ Historial de navegación
- ❌ Datos de formularios previos

### **Cumplimiento GDPR:**
- El sistema está diseñado para ser compatible con GDPR
- Datos mínimos necesarios
- Propósito específico (mejorar la aplicación)
- Fácil eliminación si se solicita

## 🎨 **PERSONALIZACIÓN:**

### **Modificar tipos de feedback:**
En `js/feedback.js`, línea ~60:
```javascript
<option value="new_type">🆕 Nuevo Tipo</option>
```

### **Cambiar límite de caracteres:**
En `js/feedback.js`, línea ~12:
```javascript
this.maxCharacters = 750; // Cambiar de 500 a 750
```

### **Modificar estilos del modal:**
En `css/style.css`, buscar "FEEDBACK MODAL STYLES"

### **Cambiar posición del botón:**
```css
.feedback-btn-main {
    bottom: 2rem;
    left: 2rem; /* Cambiar de right a left */
}
```

## 🧪 **TESTING:**

### **Verificar que funciona:**
1. Abrir aplicación
2. Click en "📧 Feedback"
3. Completar formulario
4. Enviar
5. Verificar email recibido
6. Responder para confirmar comunicación

### **Probar casos edge:**
- Mensaje vacío
- Mensaje muy largo (>500 caracteres)
- Sin seleccionar tipo
- Conexión sin internet
- En diferentes dispositivos/navegadores

## 📈 **ANALYTICS (Opcional):**

Si tienes Google Analytics configurado:
```javascript
// Se enviará automáticamente el evento
gtag('event', 'feedback_sent', {
    feedback_type: feedbackData.type
});
```

## 🚀 **¡LISTO PARA PRODUCCIÓN!**

Una vez configurado Formspree:
1. ✅ Sistema de feedback funcional
2. ✅ Emails directos a tu casilla
3. ✅ Información técnica incluida
4. ✅ Límite de 500 caracteres
5. ✅ Compatible con móviles
6. ✅ Diseño neumórfico integrado
7. ✅ Privacidad respetada

**¡Tu aplicación estará lista para recibir feedback de usuarios reales!** 🎉
