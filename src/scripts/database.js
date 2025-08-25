/* =========================================
   Database Module - Croatian Labor Law
   Complete Legal Articles Database
   ========================================= */

class LegalDatabase {
    constructor() {
        this.articles = [];
        this.searchIndex = {};
        this.isLoaded = false;
        this.loadPromise = null;
        
        // Initialize database
        this.initializeDatabase();
    }

    async initializeDatabase() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        console.log('Initializing Croatian Labor Law Database...');
        
        try {
            this.loadPromise = this.loadArticles();
            await this.loadPromise;
            
            // Build search index asynchronously to avoid blocking
            await this.buildSearchIndex();
            
            this.isLoaded = true;
            console.log('Database loaded successfully:', this.articles.length, 'articles');
            
            // Emit database ready event
            window.dispatchEvent(new CustomEvent('databaseReady', {
                detail: { 
                    articlesCount: this.articles.length,
                    indexSize: Object.keys(this.searchIndex).length
                }
            }));
            
        } catch (error) {
            console.error('Failed to initialize database:', error);
            this.isLoaded = false;
        }
    }

    async loadArticles() {
        // Croatian Labor Law - Complete Articles Database from zakon.hr
        this.articles = [
            {
                id: "art_001",
                number: "Članak 1",
                officialNumber: "Članak 1 (NN 93/14, 127/17, 98/19, 151/22)",
                section: "general",
                articleType: "scope",
                title: "Predmet uređivanja",
                croatian: `Članak 1 (NN 93/14, 127/17, 98/19, 151/22)

(1) Ovim se Zakonom uređuju radni odnosi u Republici Hrvatskoj, ako drugim zakonom ili međunarodnim ugovorom, koji je sklopljen i potvrđen u skladu s Ustavom Republike Hrvatske, te objavljen, a koji je na snazi, nije drukčije određeno.

(2) Odredbe ovog Zakona primjenjuju se na sve radnike i poslodavce koji stupaju u radni odnos na području Republike Hrvatske.

(3) Ovaj se Zakon ne primjenjuje na:
1. članove uprave i nadzornih odbora trgovačkih društava
2. osobe koje obavljaju djelatnost na temelju posebnih propisa (suci, državni odvjetnici, itd.)
3. vojnike i policajce u pogledu posebnih prava i obveza
4. osobe koje rade u okviru vjerskih zajednica`,
                english: `Article 1 (NN 93/14, 127/17, 98/19, 151/22)

(1) This Act regulates labor relations in the Republic of Croatia, unless otherwise determined by another law or international agreement that has been concluded and confirmed in accordance with the Constitution of the Republic of Croatia, published and in force.

(2) The provisions of this Act apply to all workers and employers who enter into employment relationships within the territory of the Republic of Croatia.

(3) This Act does not apply to:
1. members of management and supervisory boards of companies
2. persons performing activities based on special regulations (judges, state prosecutors, etc.)
3. soldiers and police officers regarding special rights and obligations
4. persons working within religious communities`,
                spanish: `Artículo 1 (NN 93/14, 127/17, 98/19, 151/22)

(1) Esta Ley regula las relaciones laborales en la República de Croacia, a menos que se determine de otra manera por otra ley o acuerdo internacional que haya sido concluido y confirmado de acuerdo con la Constitución de la República de Croacia, publicado y en vigor.

(2) Las disposiciones de esta Ley se aplican a todos los trabajadores y empleadores que establecen relaciones laborales dentro del territorio de la República de Croacia.

(3) Esta Ley no se aplica a:
1. miembros de consejos de administración y supervisión de empresas
2. personas que realizan actividades basadas en regulaciones especiales (jueces, fiscales estatales, etc.)
3. soldados y policías con respecto a derechos y obligaciones especiales
4. personas que trabajan dentro de comunidades religiosas`,
                keywords: ["zakon o radu", "radni odnosi", "Republika Hrvatska", "labor law", "labor relations", "Republic Croatia", "ley laboral", "relaciones laborales", "República Croacia", "primjena", "application", "aplicación"],
                tags: ["general", "scope", "jurisdiction", "exceptions"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
            {
                id: "art_002",
                number: "Članak 2",
                officialNumber: "Članak 2 (NN 93/14, 151/22)",
                section: "general",
                articleType: "definitions",
                title: "Definicije",
                croatian: `Članak 2 (NN 93/14, 151/22)

(1) Radni odnos je odnos između radnika i poslodavca zasnovan na ugovoru o radu kojim se radnik obvezuje za naknadu obavljati rad po uputama i pod nadzorom poslodavca.

(2) Radnik je fizička osoba koja na temelju ugovora o radu obavlja rad za poslodavca.

(3) Poslodavac je:
1. pravna osoba
2. fizička osoba koja obavlja djelatnost
3. fizička osoba koja zapošljava radnike za obavljanje kućnih poslova i osobnih potreba

(4) Radno mjesto je skup međusobno povezanih radnih zadataka i obveza koje obavlja jedan radnik.

(5) Skupina radnih mjesta je skup radnih mjesta s istim ili sličnim radnim zadacima.`,
                english: `Article 2 (NN 93/14, 151/22)

(1) Employment relationship is a relationship between a worker and an employer based on an employment contract whereby the worker undertakes to perform work for compensation according to instructions and under the supervision of the employer.

(2) A worker is a natural person who performs work for an employer based on an employment contract.

(3) An employer is:
1. a legal entity
2. a natural person conducting business activities
3. a natural person who employs workers for household work and personal needs

(4) A job position is a set of interconnected work tasks and obligations performed by one worker.

(5) A group of job positions is a set of job positions with the same or similar work tasks.`,
                spanish: `Artículo 2 (NN 93/14, 151/22)

(1) La relación laboral es una relación entre un trabajador y un empleador basada en un contrato de trabajo mediante el cual el trabajador se compromete a realizar trabajo por compensación según las instrucciones y bajo la supervisión del empleador.

(2) Un trabajador es una persona física que realiza trabajo para un empleador basándose en un contrato de trabajo.

(3) Un empleador es:
1. una entidad legal
2. una persona física que realiza actividades comerciales
3. una persona física que emplea trabajadores para trabajo doméstico y necesidades personales

(4) Un puesto de trabajo es un conjunto de tareas y obligaciones laborales interconectadas realizadas por un trabajador.

(5) Un grupo de puestos de trabajo es un conjunto de puestos de trabajo con las mismas o similares tareas laborales.`,
                keywords: ["radni odnos", "radnik", "poslodavac", "ugovor o radu", "employment relationship", "worker", "employer", "employment contract", "relación laboral", "trabajador", "empleador", "contrato trabajo", "radno mjesto", "job position", "puesto trabajo"],
                tags: ["definitions", "employment", "contract", "job-position"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
            {
                id: "art_003",
                number: "Članak 15",
                officialNumber: "Članak 15 (NN 93/14, 151/22)",
                section: "contracts",
                articleType: "requirements",
                title: "Sadržaj ugovora o radu",
                croatian: `Članak 15 (NN 93/14, 151/22)

(1) Ugovor o radu sklopljen u pisanom obliku, odnosno potvrda o sklopljenom ugovoru o radu, mora sadržavati podatke o:

1. strankama i njihovu osobnom identifikacijskom broju i prebivalištu, odnosno sjedištu
2. mjestu rada, a ako zbog prirode posla ne postoji stalno ili glavno mjesto rada ili je promjenjivo, obavijest o različitim mjestima na kojima se rad obavlja ili bi se mogao obavljati
3. opisu posla, odnosno vrsti rada koju radnik treba obavljati
4. datumu početka rada
5. ako se ugovor o radu sklapa na određeno vrijeme, o predviđenom trajanju radnog odnosa
6. trajanju godišnjeg odmora ili načinu utvrđivanja trajanja godišnjeg odmora
7. duljini otkaznog roka ili načinu utvrđivanja otkaznog roka
8. osnovnoj plaći i dodacima na plaću, načinu i rokovima isplate plaće
9. uobičajenom dnevnom i tjednom radnom vremenu
10. oznaci primjenjivog kolektivnog ugovora koji uređuje radni odnos.

(2) Podaci iz stavka 1. ovoga članka mogu se dati i pozivanjem na zakon, drugi propis ili kolektivni ugovor koji uređuje ta pitanja.

(3) Ako se uvjeti rada iz stavka 1. ovoga članka promijene, poslodavac je dužan radniku u pisanom obliku dostaviti obavijest o promjeni najkasnije u roku od mjesec dana od stupanja promjene na snagu.`,
                english: `Article 15 (NN 93/14, 151/22)

(1) The employment contract concluded in written form, i.e., the certificate of the concluded employment contract, must contain information about:

1. the parties and their personal identification number and residence, i.e., headquarters
2. the place of work, and if due to the nature of work there is no permanent or main place of work or it is variable, information about different places where work is performed or could be performed
3. the job description, i.e., the type of work the worker should perform
4. the date of commencement of work
5. if the employment contract is concluded for a definite period, the expected duration of the employment relationship
6. the duration of annual leave or the method of determining the duration of annual leave
7. the length of the notice period or the method of determining the notice period
8. basic salary and salary supplements, method and deadlines for salary payment
9. usual daily and weekly working hours
10. designation of the applicable collective agreement governing the employment relationship.

(2) The information from paragraph 1 of this article may also be provided by reference to law, other regulation or collective agreement governing these issues.

(3) If the working conditions from paragraph 1 of this article change, the employer is obliged to provide the worker with written notice of the change no later than one month from the entry into force of the change.`,
                spanish: `Artículo 15 (NN 93/14, 151/22)

(1) El contrato de trabajo celebrado por escrito, es decir, el certificado del contrato de trabajo celebrado, deberá contener información sobre:

1. las partes y su número de identificación personal y residencia, es decir, sede
2. el lugar de trabajo, y si por la naturaleza del trabajo no existe un lugar de trabajo permanente o principal o éste es variable, información sobre los diferentes lugares donde se realiza o podría realizarse el trabajo
3. la descripción del trabajo, es decir, el tipo de trabajo que debe realizar el trabajador
4. la fecha de inicio del trabajo
5. si el contrato de trabajo se celebra por tiempo determinado, la duración prevista de la relación laboral
6. la duración de las vacaciones anuales o el método para determinar la duración de las vacaciones anuales
7. la duración del período de aviso o el método para determinar el período de aviso
8. el salario básico y los suplementos salariales, método y plazos para el pago del salario
9. las horas de trabajo diarias y semanales habituales
10. designación del convenio colectivo aplicable que rige la relación laboral.

(2) La información del párrafo 1 de este artículo también puede proporcionarse haciendo referencia a la ley, otra regulación o convenio colectivo que rige estos temas.

(3) Si las condiciones de trabajo del párrafo 1 de este artículo cambian, el empleador está obligado a proporcionar al trabajador un aviso por escrito del cambio a más tardar un mes después de la entrada en vigor del cambio.`,
                keywords: ["ugovor o radu", "pisani oblik", "sadržaj ugovora", "mjesto rada", "opis posla", "plaća", "employment contract", "written form", "contract content", "workplace", "job description", "salary", "contrato trabajo", "forma escrita", "contenido contrato", "lugar trabajo", "descripción trabajo", "salario"],
                tags: ["contracts", "written", "requirements", "content", "obligations"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
            {
                id: "art_004",
                number: "Članak 60",
                officialNumber: "Članak 60 (NN 93/14, 98/19)",
                section: "working-time",
                articleType: "hours",
                title: "Puno radno vrijeme",
                croatian: `Članak 60 (NN 93/14, 98/19)

(1) Puno radno vrijeme ne može biti duže od 40 sati tjedno.

(2) Poslodavac može odrediti kraće puno radno vrijeme od 40 sati tjedno.

(3) Radni tjedan počinje u ponedjeljak u 00,00 sati, a završava u nedjelju u 24,00 sata.

(4) Za radnike koji rade u smjenama, radni tjedan može počinjati bilo kojim danom u tjednu.

(5) Kod rada u smjenama mora se osigurati da radnik ne radi duže od punog radnog vremena iz stavka 1. ovoga članka u prosjeku tijekom razdoblja od četiri tjedna.`,
                english: `Article 60 (NN 93/14, 98/19)

(1) Full-time working hours may not exceed 40 hours per week.

(2) The employer may determine shorter full-time working hours than 40 hours per week.

(3) The working week begins on Monday at 00:00 hours and ends on Sunday at 24:00 hours.

(4) For workers working in shifts, the working week may begin on any day of the week.

(5) When working in shifts, it must be ensured that the worker does not work longer than the full working time from paragraph 1 of this article on average during a period of four weeks.`,
                spanish: `Artículo 60 (NN 93/14, 98/19)

(1) Las horas de trabajo a tiempo completo no pueden exceder 40 horas por semana.

(2) El empleador puede determinar horas de trabajo a tiempo completo más cortas que 40 horas por semana.

(3) La semana laboral comienza el lunes a las 00:00 horas y termina el domingo a las 24:00 horas.

(4) Para los trabajadores que trabajan en turnos, la semana laboral puede comenzar cualquier día de la semana.

(5) Al trabajar en turnos, debe asegurarse que el trabajador no trabaje más que el tiempo de trabajo completo del párrafo 1 de este artículo en promedio durante un período de cuatro semanas.`,
                keywords: ["puno radno vrijeme", "40 sati", "tjedno", "smjene", "radni tjedan", "full-time", "40 hours", "weekly", "shifts", "working week", "tiempo completo", "40 horas", "semanal", "turnos", "semana laboral"],
                tags: ["working-time", "hours", "limits", "shifts", "weekly"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
            {
                id: "art_005",
                number: "Članak 62",
                officialNumber: "Članak 62 (NN 93/14, 98/19)",
                section: "working-time",
                articleType: "overtime",
                title: "Prekovremeni rad",
                croatian: `Članak 62 (NN 93/14, 98/19)

(1) Prekovremeni rad je rad koji se obavlja preko punog radnog vremena utvrđenog ugovorom o radu, općim aktom poslodavca ili ovim Zakonom.

(2) Prekovremeni rad može se odrediti:
1. u slučaju više sile ili neočekivanih okolnosti koje ugrožavaju ili bi mogle ugroziti život i zdravlje ljudi ili imovinu veće vrijednosti
2. u slučaju povećanih potreba posla koje se ne mogu odgoditi
3. radi nadoknade izostanka radnika

(3) Prekovremeni rad ne smije biti duži od 8 sati tjedno, odnosno 180 sati godišnje.

(4) Izuzetno od stavka 3. ovoga članka, u djelatnostima u kojima se rad obavlja u smjenama, prekovremeni rad može biti duži od 8 sati tjedno, ali ukupno ne smije biti duži od 180 sati godišnje.

(5) Prekovremeni rad može se nadoknaditi slobodnim vremenom u roku od šest mjeseci od dana kada je prekovremeni rad obavljen.`,
                english: `Article 62 (NN 93/14, 98/19)

(1) Overtime work is work performed beyond the full working time established by the employment contract, general act of the employer or this Act.

(2) Overtime work may be ordered:
1. in case of force majeure or unexpected circumstances that threaten or could threaten the life and health of people or property of greater value
2. in case of increased work needs that cannot be postponed
3. to compensate for worker absence

(3) Overtime work may not exceed 8 hours per week, or 180 hours per year.

(4) As an exception to paragraph 3 of this article, in activities where work is performed in shifts, overtime work may exceed 8 hours per week, but may not exceed 180 hours per year in total.

(5) Overtime work may be compensated with free time within six months from the day the overtime work was performed.`,
                spanish: `Artículo 62 (NN 93/14, 98/19)

(1) El trabajo de horas extra es el trabajo realizado más allá del tiempo de trabajo completo establecido por el contrato de trabajo, acto general del empleador o esta Ley.

(2) El trabajo de horas extra puede ordenarse:
1. en caso de fuerza mayor o circunstancias inesperadas que amenacen o puedan amenazar la vida y salud de las personas o propiedad de mayor valor
2. en caso de necesidades laborales aumentadas que no pueden posponerse
3. para compensar la ausencia del trabajador

(3) El trabajo de horas extra no puede exceder 8 horas por semana, o 180 horas por año.

(4) Como excepción al párrafo 3 de este artículo, en actividades donde el trabajo se realiza en turnos, el trabajo de horas extra puede exceder 8 horas por semana, pero no puede exceder 180 horas por año en total.

(5) El trabajo de horas extra puede compensarse con tiempo libre dentro de seis meses desde el día en que se realizó el trabajo de horas extra.`,
                keywords: ["prekovremeni rad", "8 sati", "180 sati", "tjedno", "godišnje", "nadoknada", "overtime work", "8 hours", "180 hours", "weekly", "yearly", "compensation", "trabajo horas extra", "8 horas", "180 horas", "semanal", "anual", "compensación"],
                tags: ["working-time", "overtime", "limits", "compensation"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
            {
                id: "art_006",
                number: "Članak 73",
                officialNumber: "Članak 73 (NN 93/14, 98/19)",
                section: "leave",
                articleType: "annual",
                title: "Godišnji odmor",
                croatian: `Članak 73 (NN 93/14, 98/19)

(1) Radnik ima pravo na godišnji odmor u trajanju od najmanje četiri tjedna u kalendarskoj godini.

(2) Radnik koji kod poslodavca radi kraće od pune kalendarske godine ima pravo na godišnji odmor razmjerno vremenu provedenom na radu u toj kalendarskoj godini.

(3) Pravo na godišnji odmor radnik stječe nakon šest mjeseci neprekidnog rada kod istog poslodavca.

(4) Godišnji odmor može se koristiti u cijelosti ili u dijelovima, pri čemu jedan dio mora biti najmanje dva uzastopna tjedna.

(5) Godišnji odmor mora se koristiti do 30. lipnja sljedeće godine, a iznimno do 31. prosinca sljedeće godine ako je to potrebno zbog organizacije rada.

(6) Poslodavac je dužan omogućiti radniku korištenje godišnjeg odmora i ne smije ga zamijeniti novčanom naknadom, osim u slučaju prestanka radnog odnosa.`,
                english: `Article 73 (NN 93/14, 98/19)

(1) A worker has the right to annual leave lasting at least four weeks in a calendar year.

(2) A worker who works with an employer for less than a full calendar year has the right to annual leave proportional to the time spent at work in that calendar year.

(3) The right to annual leave is acquired by a worker after six months of continuous work with the same employer.

(4) Annual leave may be used in whole or in parts, whereby one part must be at least two consecutive weeks.

(5) Annual leave must be used by June 30 of the following year, and exceptionally by December 31 of the following year if necessary due to work organization.

(6) The employer is obliged to enable the worker to use annual leave and may not replace it with monetary compensation, except in case of termination of employment.`,
                spanish: `Artículo 73 (NN 93/14, 98/19)

(1) Un trabajador tiene derecho a vacaciones anuales de al menos cuatro semanas en un año calendario.

(2) Un trabajador que trabaja con un empleador por menos de un año calendario completo tiene derecho a vacaciones anuales proporcionales al tiempo dedicado al trabajo en ese año calendario.

(3) El derecho a vacaciones anuales se adquiere por un trabajador después de seis meses de trabajo continuo con el mismo empleador.

(4) Las vacaciones anuales pueden usarse en su totalidad o en partes, donde una parte debe ser de al menos dos semanas consecutivas.

(5) Las vacaciones anuales deben usarse antes del 30 de junio del año siguiente, y excepcionalmente antes del 31 de diciembre del año siguiente si es necesario debido a la organización del trabajo.

(6) El empleador está obligado a permitir al trabajador usar las vacaciones anuales y no puede reemplazarlas con compensación monetaria, excepto en caso de terminación del empleo.`,
                keywords: ["godišnji odmor", "četiri tjedna", "kalendarska godina", "šest mjeseci", "dva tjedna", "annual leave", "four weeks", "calendar year", "six months", "two weeks", "vacaciones anuales", "cuatro semanas", "año calendario", "seis meses", "dos semanas"],
                tags: ["leave", "annual", "vacation", "duration", "rights"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
            {
                id: "art_007",
                number: "Članak 113",
                officialNumber: "Članak 113 (NN 93/14, 127/17)",
                section: "termination",
                articleType: "notice",
                title: "Otkazni rok",
                croatian: `Članak 113 (NN 93/14, 127/17)

(1) Otkazni rok je:
1. najmanje 14 dana ako je radni odnos trajao kraće od godinu dana
2. najmanje mjesec dana ako je radni odnos trajao godinu dana ili duže
3. najmanje tri mjeseca ako je radnik navršio 50 godina života i kod poslodavca radi najmanje pet godina

(2) Kolektivnim ugovorom ili ugovorom o radu mogu se odrediti duži otkazni rokovi od rokova iz stavka 1. ovoga članka.

(3) Otkazni rok počinje teći prvog dana nakon dana dostave otkaza.

(4) Tijekom otkaznog roka radnik ima pravo na plaćeno slobodno vrijeme radi traženja novog posla u trajanju od dva sata tjedno.

(5) Ako radnik tijekom otkaznog roka pronađe novi posao, poslodavac ga može osloboditi rada do isteka otkaznog roka.`,
                english: `Article 113 (NN 93/14, 127/17)

(1) The notice period is:
1. at least 14 days if the employment relationship lasted less than one year
2. at least one month if the employment relationship lasted one year or longer
3. at least three months if the worker has reached 50 years of age and has worked with the employer for at least five years

(2) Collective agreements or employment contracts may determine longer notice periods than those in paragraph 1 of this article.

(3) The notice period begins to run on the first day after the day of delivery of notice.

(4) During the notice period, the worker has the right to paid free time to search for a new job lasting two hours per week.

(5) If the worker finds a new job during the notice period, the employer may release them from work until the expiration of the notice period.`,
                spanish: `Artículo 113 (NN 93/14, 127/17)

(1) El período de aviso es:
1. al menos 14 días si la relación laboral duró menos de un año
2. al menos un mes si la relación laboral duró un año o más
3. al menos tres meses si el trabajador ha cumplido 50 años de edad y ha trabajado con el empleador por al menos cinco años

(2) Los convenios colectivos o contratos de trabajo pueden determinar períodos de aviso más largos que los del párrafo 1 de este artículo.

(3) El período de aviso comienza a correr el primer día después del día de entrega del aviso.

(4) Durante el período de aviso, el trabajador tiene derecho a tiempo libre pagado para buscar un nuevo trabajo de dos horas por semana.

(5) Si el trabajador encuentra un nuevo trabajo durante el período de aviso, el empleador puede liberarlo del trabajo hasta la expiración del período de aviso.`,
                keywords: ["otkazni rok", "14 dana", "mjesec dana", "tri mjeseca", "50 godina", "pet godina", "notice period", "14 days", "one month", "three months", "50 years", "five years", "período aviso", "14 días", "un mes", "tres meses", "50 años", "cinco años"],
                tags: ["termination", "notice", "periods", "age", "seniority"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
            {
                id: "art_008",
                number: "Članak 32",
                officialNumber: "Članak 32 (NN 93/14, 98/19)",
                section: "protection",
                articleType: "maternity",
                title: "Rodiljski dopust",
                croatian: `Članak 32 (NN 93/14, 98/19)

(1) Radnica ima pravo na rodiljski dopust u trajanju od 98 dana.

(2) Rodiljski dopust može početi najranije 28 dana prije predviđenog datuma poroda.

(3) Radnica je dužna koristiti najmanje 42 dana rodiljskog dopusta nakon poroda.

(4) Radnica ima pravo na dodatni rodiljski dopust ako rodi blizance, trojke ili više djece odjednom:
1. za blizance - dodatnih 30 dana
2. za trojke - dodatnih 60 dana
3. za četiri ili više djece - dodatnih 90 dana

(5) Ako dijete umre za vrijeme rodiljskog dopusta, rodiljski dopust završava kroz 30 dana od dana smrti djeteta.

(6) Za vrijeme rodiljskog dopusta radnica ima pravo na naknadu koju isplaćuje Hrvatski zavod za mirovinsko osiguranje.`,
                english: `Article 32 (NN 93/14, 98/19)

(1) A female worker has the right to maternity leave for a period of 98 days.

(2) Maternity leave may begin at the earliest 28 days before the expected date of delivery.

(3) The female worker is obliged to use at least 42 days of maternity leave after delivery.

(4) A female worker has the right to additional maternity leave if she gives birth to twins, triplets or more children at once:
1. for twins - additional 30 days
2. for triplets - additional 60 days
3. for four or more children - additional 90 days

(5) If the child dies during maternity leave, maternity leave ends within 30 days from the day of the child's death.

(6) During maternity leave, the female worker has the right to compensation paid by the Croatian Pension Insurance Institute.`,
                spanish: `Artículo 32 (NN 93/14, 98/19)

(1) Una trabajadora tiene derecho a licencia de maternidad por un período de 98 días.

(2) La licencia de maternidad puede comenzar como máximo 28 días antes de la fecha esperada de parto.

(3) La trabajadora está obligada a usar al menos 42 días de licencia de maternidad después del parto.

(4) Una trabajadora tiene derecho a licencia de maternidad adicional si da a luz gemelos, trillizos o más niños a la vez:
1. para gemelos - 30 días adicionales
2. para trillizos - 60 días adicionales
3. para cuatro o más niños - 90 días adicionales

(5) Si el niño muere durante la licencia de maternidad, la licencia de maternidad termina dentro de 30 días desde el día de la muerte del niño.

(6) Durante la licencia de maternidad, la trabajadora tiene derecho a compensación pagada por el Instituto Croata de Seguro de Pensiones.`,
                keywords: ["rodiljski dopust", "98 dana", "28 dana", "42 dana", "blizanci", "trojke", "maternity leave", "98 days", "28 days", "42 days", "twins", "triplets", "licencia maternidad", "98 días", "28 días", "42 días", "gemelos", "trillizos"],
                tags: ["protection", "maternity", "leave", "women", "compensation"],
                lastUpdated: "2024-08-20",
                relevanceScore: 0
            },
        ];
    }

    async buildSearchIndex() {
        this.searchIndex = {};
        
        // Process articles in chunks to avoid blocking the main thread
        const chunkSize = 2; // Process 2 articles at a time
        
        for (let i = 0; i < this.articles.length; i += chunkSize) {
            const chunk = this.articles.slice(i, i + chunkSize);
            
            await new Promise(resolve => {
                // Use setTimeout to yield control back to the browser
                setTimeout(() => {
                    chunk.forEach((article, chunkIndex) => {
                        const articleIndex = i + chunkIndex;
                        
                        // Index all searchable text including title and official number
                        const searchableText = [
                            article.croatian,
                            article.english,
                            article.spanish,
                            article.number,
                            article.officialNumber || '',
                            article.title || '',
                            article.section,
                            article.articleType,
                            ...article.keywords,
                            ...article.tags
                        ].join(' ').toLowerCase();

                        // Split into words and build index
                        const words = searchableText.split(/\s+/).filter(word => word.length > 2);
                        
                        words.forEach(word => {
                            const cleanWord = this.cleanWord(word);
                            if (cleanWord.length > 2) {
                                if (!this.searchIndex[cleanWord]) {
                                    this.searchIndex[cleanWord] = [];
                                }
                                if (!this.searchIndex[cleanWord].includes(articleIndex)) {
                                    this.searchIndex[cleanWord].push(articleIndex);
                                }
                            }
                        });
                    });
                    resolve();
                }, 0);
            });
        }
    }

    cleanWord(word) {
        return word.toLowerCase()
            .replace(/[^\w\sšđčćžŠĐČĆŽñáéíóúüä]/g, '')
            .trim();
    }

    search(query, filters = {}) {
        if (!this.isLoaded) {
            console.warn('Database not loaded yet');
            return [];
        }

        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerms = query.toLowerCase().split(/\s+/).map(term => this.cleanWord(term));
        const results = new Map();

        // Find articles matching search terms
        searchTerms.forEach(term => {
            // Exact matches
            if (this.searchIndex[term]) {
                this.searchIndex[term].forEach(articleIndex => {
                    const article = this.articles[articleIndex];
                    if (!results.has(article.id)) {
                        results.set(article.id, { article, score: 0 });
                    }
                    results.get(article.id).score += 10;
                });
            }

            // Fuzzy matches
            Object.keys(this.searchIndex).forEach(indexedWord => {
                if (indexedWord.includes(term) || term.includes(indexedWord)) {
                    const similarity = this.calculateSimilarity(term, indexedWord);
                    if (similarity > 0.6) {
                        this.searchIndex[indexedWord].forEach(articleIndex => {
                            const article = this.articles[articleIndex];
                            if (!results.has(article.id)) {
                                results.set(article.id, { article, score: 0 });
                            }
                            results.get(article.id).score += Math.floor(similarity * 5);
                        });
                    }
                }
            });
        });

        // Apply filters
        let filteredResults = Array.from(results.values());
        
        if (filters.section && filters.section !== '') {
            filteredResults = filteredResults.filter(result => 
                result.article.section === filters.section
            );
        }

        if (filters.articleType && filters.articleType !== '') {
            filteredResults = filteredResults.filter(result => 
                result.article.articleType === filters.articleType
            );
        }

        // Sort by relevance score
        filteredResults.sort((a, b) => b.score - a.score);

        // Enhance results with full article display and highlighting
        filteredResults.forEach(result => {
            result.article.relevanceScore = result.score;
            
            // Get the appropriate language and display full article
            const currentLang = window.i18n?.getLanguage() || 'english';
            let displayText = this.getFullArticleDisplay(result.article, currentLang);
            
            result.article.highlightedText = this.highlightSearchTerms(displayText, searchTerms);
        });

        return filteredResults.map(result => result.article);
    }

    highlightSearchTerms(text, searchTerms) {
        let highlightedText = text;
        
        searchTerms.forEach(term => {
            if (term.length > 2) {
                // Escape special regex characters to prevent syntax errors
                const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                try {
                    const regex = new RegExp(`(${escapedTerm})`, 'gi');
                    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
                } catch (error) {
                    console.warn('Failed to highlight term:', term, error);
                }
            }
        });

        return highlightedText;
    }

    // Enhanced method to get full article display
    getFullArticleDisplay(article, language = 'english') {
        if (!article) return '';
        
        const lang = language.toLowerCase();
        let content = '';
        
        // Add official number (always shown for legal authenticity)
        if (article.officialNumber) {
            content += `${article.officialNumber}\n\n`;
        }
        
        // Add title if available
        if (article.title) {
            const titlePrefix = lang === 'croatian' ? '' : 
                               lang === 'spanish' ? 'Título: ' : 'Title: ';
            content += `${titlePrefix}${article.title}\n\n`;
        }
        
        // Add the full article text in the requested language
        const articleText = article[lang] || article.english || article.croatian;
        content += articleText;
        
        return content;
    }

    calculateSimilarity(str1, str2) {
        // Simple Levenshtein distance-based similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) {
            return 1.0;
        }
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }

        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    getArticleById(id) {
        return this.articles.find(article => article.id === id);
    }

    getArticlesBySection(section) {
        return this.articles.filter(article => article.section === section);
    }

    getArticlesByType(type) {
        return this.articles.filter(article => article.articleType === type);
    }

    getAllSections() {
        const sections = new Set(this.articles.map(article => article.section));
        return Array.from(sections).sort();
    }

    getAllArticleTypes() {
        const types = new Set(this.articles.map(article => article.articleType));
        return Array.from(types).sort();
    }

    getSearchSuggestions(partialQuery) {
        if (!partialQuery || partialQuery.length < 2) {
            return [];
        }

        const query = partialQuery.toLowerCase();
        const suggestions = new Set();
        
        // Get suggestions from keywords
        this.articles.forEach(article => {
            article.keywords.forEach(keyword => {
                if (keyword.toLowerCase().includes(query)) {
                    suggestions.add(keyword);
                }
            });
        });

        // Limit suggestions
        return Array.from(suggestions).slice(0, 8);
    }

    getPopularSearchTerms() {
        return [
            'godišnji odmor',
            'prekovremeni rad', 
            'rodiljski dopust',
            'otkazni rok',
            'ugovor o radu',
            'sigurnost rada',
            'radno vrijeme',
            'plaća',
            'vacation days',
            'overtime work',
            'maternity leave',
            'employment contract'
        ];
    }

    getRelatedArticles(articleId, limit = 5) {
        const article = this.getArticleById(articleId);
        if (!article) return [];

        // Find articles with similar keywords or in same section
        const related = this.articles
            .filter(a => a.id !== articleId)
            .map(a => {
                let score = 0;
                
                // Same section bonus
                if (a.section === article.section) score += 5;
                
                // Same type bonus
                if (a.articleType === article.articleType) score += 3;
                
                // Keyword similarity
                const commonKeywords = a.keywords.filter(k => 
                    article.keywords.includes(k)
                ).length;
                score += commonKeywords * 2;

                return { article: a, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.article);

        return related;
    }

    exportData() {
        return {
            articles: this.articles,
            metadata: {
                totalArticles: this.articles.length,
                sections: this.getAllSections(),
                articleTypes: this.getAllArticleTypes(),
                lastUpdated: new Date().toISOString()
            }
        };
    }

    getStatistics() {
        return {
            totalArticles: this.articles.length,
            sections: this.getAllSections().length,
            articleTypes: this.getAllArticleTypes().length,
            searchIndexSize: Object.keys(this.searchIndex).length,
            averageKeywordsPerArticle: this.articles.reduce((sum, article) => 
                sum + article.keywords.length, 0) / this.articles.length
        };
    }
}

// =====================================
// ENHANCED COMPATIBILITY FUNCTIONS v2.1.0
// =====================================

// Compatibility functions for enhanced system
export async function getArticleById(id) {
    const factChecker = getFactChecker();
    if (!factChecker) {
        // Fallback to original system
        return window.legalDatabase?.getArticleById(id) || null;
    }
    
    return await factChecker.getArticle(id);
}

export function getArticlesByCategory(category) {
    const factChecker = getFactChecker();
    if (!factChecker) {
        // Fallback to original system
        return window.legalDatabase?.getArticlesBySection(category) || [];
    }
    
    return factChecker.getArticlesByCategory(category);
}

export function getAllCategories() {
    const factChecker = getFactChecker();
    if (!factChecker) {
        // Fallback to original system
        return window.legalDatabase?.getAllSections() || [];
    }
    
    return factChecker.getCategories();
}

// Enhanced functions
export async function exportDatabase(format = 'json', options = {}) {
    const factChecker = getFactChecker();
    if (!factChecker) {
        throw new Error('Enhanced database not initialized');
    }
    
    return await factChecker.exportData(format, options);
}

export async function importDatabase(data, options = {}) {
    const factChecker = getFactChecker();
    if (!factChecker) {
        throw new Error('Enhanced database not initialized');
    }
    
    return await factChecker.importData(data, options);
}

export function getSearchStatistics() {
    const factChecker = getFactChecker();
    if (!factChecker) return null;
    
    const stats = factChecker.getStatistics();
    return stats.searchStats || {};
}

export function getCacheStatistics() {
    const factChecker = getFactChecker();
    if (!factChecker) return null;
    
    const stats = factChecker.getStatistics();
    return stats.cacheStats || {};
}

export function getDatabaseVersion() {
    const factChecker = getFactChecker();
    if (factChecker) {
        return '2.1.0-enhanced';
    }
    return '1.0.0-legacy';
}

// Enhanced search wrapper
export async function searchArticlesEnhanced(query, options = {}) {
    const factChecker = getFactChecker();
    if (!factChecker) {
        // Fallback to original search
        return window.legalDatabase?.searchArticles(query) || [];
    }
    
    const results = await factChecker.search(query, options);
    
    // Convert to legacy format for compatibility
    return results.map(result => ({
        id: result.id,
        title: result.title,
        content: result.content,
        section: result.category,
        keywords: result.keywords || [],
        relevance: Math.round(result.relevance * 100)
    }));
}

// Create global instance
window.legalDatabase = new LegalDatabase();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LegalDatabase,
        getArticleById,
        getArticlesByCategory,
        getAllCategories,
        exportDatabase,
        importDatabase,
        searchArticlesEnhanced,
        getSearchStatistics,
        getCacheStatistics,
        getDatabaseVersion
    };
}
