# Croatian Labor Law Fact Checker - Search Engine Documentation

## 🔍 Enhanced Search Engine v2.2.0

### Nueva Arquitectura Organizada

El motor de búsqueda ahora está completamente reorganizado en una estructura modular:

```
src/search-engine/
├── SearchManager.js           # Motor principal de búsqueda mejorado
├── SearchEngine.js           # Core del motor de búsqueda original
├── components/
│   └── FeedbackRanking.js   # Sistema de ranking con feedback
└── data/
    └── croatian-labor-law.json  # Base de datos legal
```

### 🎯 Funcionalidades Principales

#### 1. **Búsqueda Inteligente con Palabras Clave**
- Encuentra todos los artículos que contienen las palabras buscadas
- Resalta las palabras clave en ambos idiomas
- Muestra el artículo completo, no fragmentos

#### 2. **Visualización Dual (Lado a Lado)**
- **Izquierda**: Traducción en idioma seleccionado (🇪🇸 Español / 🇺🇸 English)
- **Derecha**: Texto original en croata (🇭🇷 Hrvatski)
- Diseño responsivo que se adapta a móviles

#### 3. **Sistema de Ranking con Feedback de Usuario**
- Botón "👍 Es lo que buscaba" en cada resultado
- El sistema aprende de las preferencias del usuario
- Artículos más útiles aparecen primero en búsquedas futuras
- Badge "⭐ Recomendado" para resultados altamente valorados

#### 4. **Algoritmo de Ranking Inteligente**
- **Puntuación base**: Relevancia por palabras clave
- **Boost por feedback**: +10 puntos por cada feedback positivo
- **Decaimiento temporal**: Rankings se actualizan con el tiempo
- **Múltiples keywords**: Bonus por coincidencias múltiples

### 🛠️ Implementación Técnica

#### Clase `FeedbackRanking`
```javascript
// Registrar feedback positivo
feedbackRanking.recordPositiveFeedback(query, articleId);

// Obtener resultados rankeados
const rankedResults = feedbackRanking.rankResults(results, query);
```

#### Clase `EnhancedSearchManager`
```javascript
// Aplicar ranking con feedback
const rankedResults = this.applyFeedbackRanking(results, query);

// Manejar click de feedback
handleFeedbackClick(articleId, query, button) {
    this.feedbackRanking.recordPositiveFeedback(query, articleId);
    // Actualizar interfaz...
}
```

### 📊 Almacenamiento de Datos

El sistema utiliza `localStorage` para persistir las puntuaciones:

```javascript
{
  keywords: {
    "vacaciones": {
      "42": { score: 25, count: 3, lastUpdated: 1693401234567 }
    }
  },
  articles: {
    "42": { totalScore: 45, keywordHits: { "vacaciones": 3 } }
  }
}
```

### 🎨 Interfaz de Usuario

#### Resultados con Feedback
```html
<div class="simple-result-item recommended">
  <div class="simple-result-header">
    <div class="header-left">
      <h3>Članak 42</h3>
      <div class="recommended-badge">⭐ Recomendado</div>
    </div>
    <div class="feedback-section">
      <button class="feedback-btn helpful-btn">
        👍 Es lo que buscaba
      </button>
    </div>
  </div>
  
  <div class="simple-content-grid">
    <!-- Contenido dual aquí -->
  </div>
</div>
```

### 🚀 Mejoras Implementadas

1. **Organización modular**: Todo el motor de búsqueda en carpeta dedicada
2. **Ranking inteligente**: Sistema de aprendizaje basado en feedback
3. **Interfaz mejorada**: Design neumórfico con feedback visual
4. **Persistencia**: Los rankings se mantienen entre sesiones
5. **Decaimiento temporal**: Rankings se actualizan automáticamente
6. **Responsivo**: Perfecto en desktop y móvil

### 🔧 Configuración

#### Parámetros del Sistema de Ranking:
- `maxRankingScore`: 1000 (puntuación máxima)
- `decayFactor`: 0.95 (factor de decaimiento semanal)
- `boostAmount`: 10 (puntos por feedback positivo)
- `cleanupInterval`: 7 días

#### Filtros de Keywords:
- Mínimo 3 caracteres
- Excluye stop words (the, and, od, za, etc.)
- Normalización automática

### 📈 Estadísticas

El sistema proporciona estadísticas de uso:

```javascript
const stats = feedbackRanking.getStatistics();
// {
//   keywordCount: 15,
//   articleCount: 8,
//   totalFeedback: 23,
//   avgFeedbackPerArticle: 2.87
// }
```

### 🛡️ Características de Seguridad

- Validación de entrada para prevenir XSS
- Límites en longitud de keywords (50 caracteres)
- Sanitización de HTML en resaltado
- Almacenamiento local seguro

### 📱 Experiencia de Usuario

1. **Búsqueda rápida**: Resultados instantáneos
2. **Feedback simple**: Un click para marcar como útil
3. **Aprendizaje continuo**: Mejora con el uso
4. **Visual claro**: Indicadores de calidad evidentes
5. **Multiidioma**: Soporte completo EN/ES/HR

### 🔄 Flujo de Trabajo

1. Usuario busca una palabra clave
2. Sistema encuentra artículos relevantes
3. Aplica ranking basado en feedback previo
4. Muestra resultados ordenados con badges
5. Usuario puede marcar resultados útiles
6. Sistema actualiza rankings para futuras búsquedas

Este sistema convierte a Croatian Labor Law Fact Checker en una herramienta de aprendizaje que mejora continuamente la experiencia del usuario.
