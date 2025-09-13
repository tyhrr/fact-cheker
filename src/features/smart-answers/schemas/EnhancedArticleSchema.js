/**
 * @fileoverview Enhanced Article Structure for Better User Responses
 * Schema for enriched articles with user-friendly content
 * @version 2.3.0
 */

/**
 * @typedef {Object} EnhancedArticle
 * @property {string} id - Unique article identifier
 * @property {string} content - Original Croatian legal text
 * @property {Object} userContent - User-friendly structured content
 * @property {string} userContent.quickAnswer - Concise answer (1-2 sentences)
 * @property {string} userContent.userFriendlyTitle - Simplified title
 * @property {string} userContent.summary - Executive summary
 * @property {string} userContent.detailedExplanation - Comprehensive explanation
 * @property {Array} userContent.practicalExamples - Real-world scenarios
 * @property {Array} userContent.frequentlyAskedQuestions - Common Q&A
 * @property {Array} userContent.keyTakeaways - Main points to remember
 * @property {Object} userContent.relatedTopics - Cross-references
 */

/**
 * Example of enhanced article structure
 */
const enhancedArticleExample = {
  // Existing structure (unchanged)
  id: "art_077",
  title: "Radnik ima za svaku kalendarsku godinu pravo na godišnji odmor od najmanje četiri tjedna",
  content: "Radnik ima za svaku kalendarsku godinu pravo na godišnji odmor od najmanje četiri tjedna, a maloljetnik i radnik koji radi na poslovima na kojima, uz primjenu mjera zaštite zdravlja i sigurnosti na radu, nije moguće zaštititi radnika od štetnih utjecaja u trajanju od najmanje pet tjedana.",
  category: "leave",
  
  // NEW: User-friendly content structure
  userContent: {
    quickAnswer: "En Croacia, todos los trabajadores tienen derecho a mínimo 20 días hábiles de vacaciones anuales pagadas.",
    
    userFriendlyTitle: "Días de vacaciones anuales",
    
    summary: "Todo trabajador en Croacia tiene derecho garantizado a vacaciones anuales pagadas. El mínimo legal es de 4 semanas (20 días hábiles), con beneficios adicionales para menores y trabajos peligrosos.",
    
    detailedExplanation: `
      **Derecho básico a vacaciones:**
      - Mínimo legal: 4 semanas (20 días hábiles) por año calendario
      - Para menores de edad: 5 semanas (25 días hábiles)
      - Para trabajos peligrosos: 5 semanas (25 días hábiles)
      
      **Cómo se calculan:**
      - Se cuentan solo días hábiles (lunes a viernes)
      - No se incluyen fines de semana ni días festivos
      - Proporcional si trabajas menos de un año completo
      
      **Derechos adicionales:**
      - Algunos convenios colectivos pueden otorgar más días
      - Días adicionales por años de experiencia (según empresa)
      - Posibilidad de acumular días no utilizados
    `,
    
    practicalExamples: [
      {
        scenario: "Empleado nuevo con 6 meses trabajados",
        calculation: "20 días ÷ 12 meses × 6 meses = 10 días de vacaciones",
        outcome: "Tiene derecho a 10 días de vacaciones proporcionales"
      },
      {
        scenario: "Trabajador en fábrica química (trabajo peligroso)",
        calculation: "25 días (5 semanas) por el tipo de trabajo",
        outcome: "25 días de vacaciones anuales por condiciones peligrosas"
      },
      {
        scenario: "Empleado con 5 años de experiencia",
        calculation: "20 días base + días adicionales según convenio",
        outcome: "Típicamente 22-25 días según políticas de empresa"
      }
    ],
    
    frequentlyAskedQuestions: [
      {
        question: "¿Puedo tomar vacaciones en mi primer año de trabajo?",
        answer: "Sí, tienes derecho proporcional desde el primer día. Si trabajas 6 meses, tienes derecho a 10 días de vacaciones."
      },
      {
        question: "¿Qué pasa si no uso todos mis días de vacaciones?",
        answer: "Puedes transferir algunos días al siguiente año hasta el 30 de junio, o recibir compensación económica si termina tu contrato."
      },
      {
        question: "¿El empleador puede negarme las vacaciones?",
        answer: "No puede negar el derecho, pero puede programar las fechas según las necesidades operativas de la empresa."
      },
      {
        question: "¿Cobro salario normal durante las vacaciones?",
        answer: "Sí, recibes tu salario promedio de los últimos 3 meses durante el período de vacaciones."
      }
    ],
    
    keyTakeaways: [
      "Mínimo 20 días hábiles de vacaciones anuales",
      "25 días para menores y trabajos peligrosos",
      "Derecho proporcional desde el primer día",
      "Salario completo durante vacaciones",
      "Posibilidad de transferir días no usados"
    ],
    
    relatedTopics: [
      {
        id: "art_081",
        title: "Pago durante vacaciones",
        description: "Cómo se calcula el salario durante el período vacacional"
      },
      {
        id: "art_082", 
        title: "Compensación por vacaciones no utilizadas",
        description: "Qué hacer con días de vacaciones acumulados"
      }
    ]
  },
  
  // Enhanced translations with user content
  translations: {
    english: {
      title: "Annual Vacation Days",
      content: "Every worker in Croatia is entitled to at least 4 weeks of paid annual leave...",
      userContent: {
        quickAnswer: "In Croatia, all workers are entitled to minimum 20 working days of paid annual vacation.",
        summary: "Every worker in Croatia has a guaranteed right to paid annual vacation...",
        // ... similar structure in English
      }
    },
    spanish: {
      title: "Días de vacaciones anuales", 
      content: "Todo trabajador en Croacia tiene derecho a mínimo 4 semanas de vacaciones anuales pagadas...",
      userContent: {
        quickAnswer: "En Croacia, todos los trabajadores tienen derecho a mínimo 20 días hábiles de vacaciones anuales pagadas.",
        summary: "Todo trabajador en Croacia tiene derecho garantizado a vacaciones anuales pagadas...",
        // ... complete structure as shown above
      }
    }
  }
};

export { enhancedArticleExample };
