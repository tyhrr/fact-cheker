/**
 * @fileoverview Sample Enhanced Articles for Testing Smart Answer System
 * Contains enriched articles with user-friendly content for demonstration
 * @version 2.3.0
 */

/**
 * Sample enhanced articles with complete userContent structure
 * These will be injected into the database for testing purposes
 */
export const sampleEnhancedArticles = [
    {
        id: "art_077_enhanced",
        title: "Radnik ima za svaku kalendarsku godinu pravo na godišnji odmor",
        content: "Radnik ima za svaku kalendarsku godinu pravo na godišnji odmor od najmanje četiri tjedna, a maloljetnik i radnik koji radi na poslovima na kojima, uz primjenu mjera zaštite zdravlja i sigurnosti na radu, nije moguće zaštititi radnika od štetnih utjecaja u trajanju od najmanje pet tjedana.",
        category: "leave",
        number: "Članak 77",
        keywords: ["godišnji odmor", "vacation", "annual leave", "četiri tjedna"],
        
        // Enhanced user-friendly content
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
                - Posibilidad de acumular días no utilizados hasta el 30 de junio del siguiente año
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
        
        translations: {
            english: {
                title: "Annual Vacation Days",
                content: "Every worker in Croatia is entitled to at least 4 weeks of paid annual leave...",
                userContent: {
                    quickAnswer: "In Croatia, all workers are entitled to minimum 20 working days of paid annual vacation.",
                    summary: "Every worker in Croatia has a guaranteed right to paid annual vacation...",
                    // Similar structure in English
                }
            },
            spanish: {
                title: "Días de vacaciones anuales", 
                content: "Todo trabajador en Croacia tiene derecho a mínimo 4 semanas de vacaciones anuales pagadas...",
                userContent: {
                    quickAnswer: "En Croacia, todos los trabajadores tienen derecho a mínimo 20 días hábiles de vacaciones anuales pagadas.",
                    summary: "Todo trabajador en Croacia tiene derecho garantizado a vacaciones anuales pagadas...",
                    // Complete structure as shown above
                }
            }
        }
    },
    
    {
        id: "art_working_hours_enhanced",
        title: "Radno vrijeme radnika",
        content: "Puno radno vrijeme radnika je 40 sati tjedno. Radnik može raditi najduže 50 sati tjedno, uključujući prekovremeni rad.",
        category: "working-time",
        number: "Članak 62",
        keywords: ["radno vrijeme", "working hours", "40 sati", "prekovremeni"],
        
        userContent: {
            quickAnswer: "En Croacia, la jornada laboral estándar es de 40 horas semanales, con máximo 50 horas incluyendo horas extra.",
            
            userFriendlyTitle: "Horas de trabajo semanales",
            
            summary: "La legislación croata establece una jornada laboral estándar de 40 horas semanales, con límites estrictos para las horas extra y descansos obligatorios.",
            
            detailedExplanation: `
                **Jornada laboral estándar:**
                - 40 horas semanales como tiempo completo
                - Máximo 8 horas diarias en distribución normal
                - Máximo 50 horas semanales incluyendo horas extra
                
                **Límites y excepciones:**
                - Las horas extra no pueden exceder 250 horas anuales
                - En trabajos peligrosos pueden aplicar límites menores
                - Los menores de edad tienen límites especiales
                
                **Descansos obligatorios:**
                - Mínimo 24 horas consecutivas de descanso semanal
                - 30 minutos de pausa para jornadas de 6+ horas
                - 11 horas de descanso entre jornadas laborales
            `,
            
            practicalExamples: [
                {
                    scenario: "Empleado en oficina con horario estándar",
                    calculation: "8 horas/día × 5 días = 40 horas semanales",
                    outcome: "Jornada completa sin horas extra"
                },
                {
                    scenario: "Trabajador con 10 horas extra semanales",
                    calculation: "40 horas base + 10 horas extra = 50 horas totales",
                    outcome: "Dentro del límite legal, con pago adicional por horas extra"
                },
                {
                    scenario: "Empleado que trabaja 60 horas en una semana",
                    calculation: "60 horas > 50 horas límite legal",
                    outcome: "Violación legal - empleador puede ser sancionado"
                }
            ],
            
            frequentlyAskedQuestions: [
                {
                    question: "¿Puedo trabajar más de 40 horas por semana?",
                    answer: "Sí, pero máximo 50 horas incluyendo horas extra, y el empleador debe pagar un recargo por las horas adicionales."
                },
                {
                    question: "¿Cuánto me pagan por las horas extra?",
                    answer: "Las horas extra se pagan con un recargo mínimo del 50% sobre el salario base por hora."
                },
                {
                    question: "¿Qué pasa si mi empleador me obliga a trabajar más de 50 horas?",
                    answer: "Es ilegal. Puedes reportarlo a la inspección laboral y el empleador puede ser multado."
                }
            ],
            
            keyTakeaways: [
                "40 horas semanales es la jornada estándar",
                "Máximo 50 horas semanales con horas extra",
                "Horas extra pagadas con recargo del 50%",
                "Descanso semanal mínimo de 24 horas",
                "Límite anual de 250 horas extra"
            ],
            
            relatedTopics: [
                {
                    id: "art_overtime",
                    title: "Pago de horas extra",
                    description: "Recargos y compensación por trabajo adicional"
                },
                {
                    id: "art_rest",
                    title: "Períodos de descanso",
                    description: "Descansos diarios y semanales obligatorios"
                }
            ]
        }
    },
    
    {
        id: "art_termination_enhanced",
        title: "Otkaz ugovora o radu",
        content: "U slučaju redovitog otkaza otkazni rok je najmanje dva tjedna do dva mjeseca, ovisno o duljini radnog odnosa.",
        category: "termination",
        number: "Članak 120",
        keywords: ["otkaz", "termination", "otkazni rok", "notice period"],
        
        userContent: {
            quickAnswer: "En Croacia, el período de preaviso de despido varía de 2 semanas a 2 meses según años de antigüedad.",
            
            userFriendlyTitle: "Período de preaviso para despido",
            
            summary: "La ley croata establece períodos específicos de preaviso para el despido que aumentan según la antigüedad del trabajador en la empresa.",
            
            detailedExplanation: `
                **Períodos de preaviso según antigüedad:**
                - Menos de 1 año: 2 semanas de preaviso
                - 1 año completo: 1 mes de preaviso
                - 2 años completos: 1 mes y 2 semanas
                - 5 años completos: 2 meses de preaviso
                - 10 años completos: 2 meses y 2 semanas
                - 20 años completos: 3 meses de preaviso
                
                **Durante el período de preaviso:**
                - El trabajador sigue recibiendo su salario completo
                - Puede buscar nuevo empleo durante horas laborales
                - La empresa puede liberar al empleado inmediatamente pagando el período completo
                
                **Excepciones importantes:**
                - Despido disciplinario: sin período de preaviso
                - Período de prueba: preaviso reducido o sin preaviso
                - Embarazo y baja maternal: protección especial
            `,
            
            practicalExamples: [
                {
                    scenario: "Empleado con 6 meses de antigüedad",
                    calculation: "Menos de 1 año = 2 semanas de preaviso",
                    outcome: "Empleador debe dar 2 semanas de preaviso o pago equivalente"
                },
                {
                    scenario: "Trabajadora con 3 años de antigüedad",
                    calculation: "Más de 2 años = 1 mes y 2 semanas de preaviso",
                    outcome: "6 semanas de preaviso o pago equivalente"
                },
                {
                    scenario: "Empleado veterano con 15 años de antigüedad",
                    calculation: "Más de 10 años = 2 meses y 2 semanas",
                    outcome: "10 semanas de preaviso o compensación económica"
                }
            ],
            
            frequentlyAskedQuestions: [
                {
                    question: "¿Pueden despedirme sin preaviso?",
                    answer: "Solo en casos de despido disciplinario por faltas graves o durante el período de prueba."
                },
                {
                    question: "¿Puedo buscar trabajo durante el período de preaviso?",
                    answer: "Sí, la ley te permite ausentarte durante horas laborales para buscar empleo."
                },
                {
                    question: "¿Qué pasa si me liberan inmediatamente?",
                    answer: "Deben pagarte el salario correspondiente a todo el período de preaviso."
                }
            ],
            
            keyTakeaways: [
                "Preaviso mínimo de 2 semanas, máximo 3 meses",
                "Aumenta según años de antigüedad",
                "Salario completo durante el preaviso",
                "Derecho a buscar empleo en horario laboral",
                "Pago inmediato si te liberan antes"
            ],
            
            relatedTopics: [
                {
                    id: "art_severance",
                    title: "Indemnización por despido",
                    description: "Compensaciones económicas adicionales"
                },
                {
                    id: "art_pregnancy_protection",
                    title: "Protección durante embarazo",
                    description: "Derechos especiales para mujeres embarazadas"
                }
            ]
        }
    }
];

/**
 * Function to inject enhanced articles into the database
 * @param {Object} database - Database instance
 */
export function injectEnhancedArticles(database) {
    if (!database || !database.articles) {
        console.warn('Cannot inject enhanced articles: invalid database');
        return;
    }
    
    sampleEnhancedArticles.forEach(enhancedArticle => {
        // Find existing article or add new one
        const existingIndex = database.articles.findIndex(article => 
            article.id === enhancedArticle.id || 
            article.number === enhancedArticle.number
        );
        
        if (existingIndex !== -1) {
            // Update existing article with enhanced content
            database.articles[existingIndex] = {
                ...database.articles[existingIndex],
                ...enhancedArticle
            };
            console.log(`Enhanced article ${enhancedArticle.id} updated`);
        } else {
            // Add as new article
            database.articles.push(enhancedArticle);
            console.log(`Enhanced article ${enhancedArticle.id} added`);
        }
    });
    
    console.log(`Injected ${sampleEnhancedArticles.length} enhanced articles into database`);
}

export default sampleEnhancedArticles;
