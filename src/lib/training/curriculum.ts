import type { Level } from '@/types';

export const CURRICULUM: Level[] = [
  {
    id: 1,
    title: 'Fundamentos',
    subtitle: 'Respiración & Postura',
    description: 'Construye los cimientos de tu voz. Aprende a respirar con el diafragma, mantener una postura correcta y relajar la tensión corporal que bloquea tu potencial vocal.',
    icon: '🫁',
    color: 'emerald',
    unlockRequires: null,
    minPassScore: 70,
    lessons: [
      {
        id: 'l1-breathing-basics',
        levelId: 1,
        title: 'Respiración Diafragmática',
        subtitle: 'El motor de la voz',
        duration: 12,
        type: 'breathing',
        icon: '🫧',
        content: {
          introduction: 'La respiración diafragmática es la base de toda técnica vocal profesional. El diafragma es el músculo principal de la respiración y su correcto uso te permitirá sostener notas más tiempo, tener más potencia y proteger tu voz del daño.',
          keyPoints: [
            'El diafragma se encuentra debajo de los pulmones, separando el tórax del abdomen',
            'Al inhalar correctamente, el abdomen se expande hacia afuera (no el pecho)',
            'La exhalación controlada es lo que produce el sonido vocal',
            'Una buena respiración reduce la tensión en las cuerdas vocales',
          ],
          tips: [
            'Acuesta una mano sobre tu ombligo: debe moverse hacia afuera al inhalar',
            'Practica primero sin cantar, solo con la respiración',
            'Inhala en 4 tiempos, sostén 2, exhala en 8',
          ],
          warnings: [
            'No levantes los hombros al respirar — eso es respiración clavicular (incorrecta)',
            'No infles el pecho — la expansión debe ser abdominal',
          ],
        },
        exercises: [
          {
            id: 'ex-breath-4-4-8',
            name: 'Patrón 4-4-8',
            description: 'Inhala 4 tiempos, sostén 4, exhala 8. Desarrolla el control del flujo de aire.',
            type: 'breathing-inhale',
            duration: 60,
            instructions: [
              'Siéntate o párate con la espalda recta',
              'Coloca una mano sobre el abdomen',
              'Inhala lentamente por 4 tiempos sintiendo el abdomen expandirse',
              'Sostén el aire 4 tiempos sin tensión',
              'Exhala lentamente en 8 tiempos con un suave "ssss"',
            ],
            successCriteria: { minDuration: 45 },
          },
          {
            id: 'ex-breath-sss',
            name: 'Serpiente (sss sostenido)',
            description: 'Exhala en un "sss" continuo lo más largo posible. Entrena el apoyo vocal.',
            type: 'breathing-exhale',
            duration: 45,
            instructions: [
              'Inhala profundamente (diafragmática)',
              'Exhala en "sss" continuo sin parar',
              'Mantén la presión constante — ni muy fuerte ni muy débil',
              'Objetivo: llegar a 20 segundos sostenidos',
            ],
            successCriteria: { minDuration: 15 },
          },
          {
            id: 'ex-hum-a3',
            name: 'Nota sostenida en A3',
            description: 'Canta la nota La3 con apoyo diafragmático. Primera nota con el micrófono.',
            type: 'sustained-note',
            duration: 30,
            targetNotes: ['A3'],
            instructions: [
              'Después de inhalar, canta la nota "La" (A3)',
              'Mantén la nota estable sin vibrato forzado',
              'Siente el apoyo desde el abdomen',
              'Sostén 5-8 segundos',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 30, minDuration: 5 },
          },
        ],
        completionCriteria: {
          minScore: 70,
          requiredExercises: ['ex-breath-sss', 'ex-hum-a3'],
        },
      },

      {
        id: 'l1-posture',
        levelId: 1,
        title: 'Postura & Alineación',
        subtitle: 'El instrumento que eres tú',
        duration: 10,
        type: 'theory',
        icon: '🧘',
        content: {
          introduction: 'Tu cuerpo entero es el instrumento. La postura afecta directamente la calidad de tu voz: una columna vertebral alineada abre las vías respiratorias, relaja la laringe y permite que el sonido resuene libremente.',
          keyPoints: [
            'Pies separados al ancho de los hombros, ligeramente abiertos',
            'Rodillas sin bloquear — suave flexión',
            'Cadera neutra, abdomen relajado (no contraído)',
            'Pecho abierto, hombros hacia atrás y abajo',
            'Cuello largo, mentón paralelo al suelo',
            'Corona de la cabeza "suspendida" hacia el techo',
          ],
          tips: [
            'Imagina un hilo que te jala desde la coronilla hacia arriba',
            'Grábate de perfil para identificar tensiones posturales',
            'La postura de pie siempre supera a la sentada para cantar',
          ],
          warnings: [
            'El mentón NO debe levantarse ni bajarse en exceso para las notas agudas o graves',
            'Evita cruzar los brazos — bloquea la respiración',
          ],
        },
        exercises: [
          {
            id: 'ex-posture-check',
            name: 'Check de Postura',
            description: 'Usa la cámara para verificar tu postura. La IA analizará tu alineación.',
            type: 'free-singing',
            duration: 30,
            instructions: [
              'Párate frente a la cámara',
              'Adopta la postura correcta descrita',
              'Canta las vocales A-E-I-O-U en cualquier nota cómoda',
              'La IA verificará tu alineación y apertura bucal',
            ],
            successCriteria: { minDuration: 20 },
          },
        ],
        completionCriteria: {
          minScore: 70,
          requiredExercises: ['ex-posture-check'],
        },
      },

      {
        id: 'l1-jaw-relax',
        levelId: 1,
        title: 'Relajación Mandibular',
        subtitle: 'Libera la tensión que bloquea tu voz',
        duration: 10,
        type: 'breathing',
        icon: '😮',
        content: {
          introduction: 'La tensión en la mandíbula es uno de los problemas más comunes en cantantes. Bloquea la resonancia, afecta la afinación y puede causar dolor. Aprender a soltar la mandíbula es transformador.',
          keyPoints: [
            'La mandíbula debe caer libremente, no empujarse hacia abajo',
            'Los molares no deben tocarse al cantar',
            'La boca abierta correctamente = espacio de dos dedos entre dientes',
            'La lengua descansa en la base de la boca, punta detrás de los dientes inferiores',
          ],
          tips: [
            'Masajea los músculos de la mandíbula (maseteros) con los dedos antes de practicar',
            'Prueba el ejercicio de masticar imaginario para soltar tensión',
            'El bostezo incontrolado es el mejor ejercicio de apertura',
          ],
          warnings: [
            'No fuerces la mandíbula hacia abajo — debe caer por gravedad',
          ],
        },
        exercises: [
          {
            id: 'ex-jaw-sirens',
            name: 'Sirenas Relajadas',
            description: 'Sirenas vocales de grave a agudo con mandíbula relajada.',
            type: 'siren',
            duration: 60,
            instructions: [
              'Deja que la mandíbula caiga naturalmente',
              'Canta "uu" o "wu" comenzando desde tu nota más grave',
              'Sube lentamente hacia las notas más agudas como una sirena',
              'Baja nuevamente sin cambiar la posición de la mandíbula',
            ],
            successCriteria: { minDuration: 40 },
          },
        ],
        completionCriteria: {
          minScore: 70,
          requiredExercises: ['ex-jaw-sirens'],
        },
      },
    ],
  },

  {
    id: 2,
    title: 'Vocalización',
    subtitle: 'Escalas & Resonancia Básica',
    description: 'Activa y calienta todas las partes de tu instrumento vocal. Aprende escalas básicas, vocalizaciones y comienza a sentir los resonadores naturales de tu cuerpo.',
    icon: '🎵',
    color: 'sky',
    unlockRequires: 1,
    minPassScore: 75,
    lessons: [
      {
        id: 'l2-scales-basics',
        levelId: 2,
        title: 'Escalas Básicas',
        subtitle: 'Do Re Mi Fa Sol La Si',
        duration: 15,
        type: 'vocalization',
        icon: '🎼',
        content: {
          introduction: 'Las escalas son el gimnasio de la voz. Al cantarlas correctamente, ejercitas la conexión entre tu oído y tu voz, desarrollas agilidad y aprendes a moverse suavemente entre notas.',
          keyPoints: [
            'Una escala mayor tiene 8 notas: Do Re Mi Fa Sol La Si Do',
            'Los intervalos son: T T S T T T S (T=tono, S=semitono)',
            'Practica primero hablando, luego cantando',
            'La regularidad diaria es más valiosa que sesiones largas ocasionales',
          ],
          tips: [
            'Empieza en C4 (Do central) si no sabes tu tesitura',
            'Sube la escala medio tono cada repetición',
            'Usa "la la la" o "mi mi mi" como vocalizaciones',
          ],
          warnings: [
            'Si sientes tensión o dolor, detente inmediatamente',
            'No fuerces las notas extremas de tu rango',
          ],
        },
        exercises: [
          {
            id: 'ex-scale-c-major-up',
            name: 'Escala Do Mayor Ascendente',
            description: 'Canta la escala Do Mayor de C4 a C5 con la vocal "la".',
            type: 'scale-up',
            duration: 120,
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            instructions: [
              'Respira antes de comenzar (diafragmática)',
              'Canta "la" en cada nota de la escala',
              'Mantén cada nota 1 segundo antes de pasar a la siguiente',
              'Repite subiendo medio tono: C#4, D#4...',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 25 },
          },
          {
            id: 'ex-arpeggio-basic',
            name: 'Arpegio Básico 1-3-5',
            description: 'Canta Do-Mi-Sol (tónica, tercera y quinta de la escala).',
            type: 'arpeggio',
            duration: 90,
            targetNotes: ['C4', 'E4', 'G4', 'C5'],
            instructions: [
              'Inhala, luego canta Do-Mi-Sol-Do en "mi mi mi mi"',
              'Baja: Do-Sol-Mi-Do',
              'Mantén la laringe baja y relajada',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 30 },
          },
        ],
        completionCriteria: {
          minScore: 75,
          requiredExercises: ['ex-scale-c-major-up'],
        },
      },

      {
        id: 'l2-resonance-intro',
        levelId: 2,
        title: 'Resonadores Naturales',
        subtitle: 'Amplifica tu voz desde adentro',
        duration: 14,
        type: 'resonance',
        icon: '🔊',
        content: {
          introduction: 'Los resonadores son las cavidades de tu cuerpo (pecho, garganta, boca, senos paranasales, cráneo) que amplifican y colorean el sonido. Aprender a usarlos transforma una voz pequeña en una voz poderosa.',
          keyPoints: [
            'Resonancia de pecho: da profundidad y calidez a las notas graves',
            'Resonancia de máscara (frente/nariz): brillantez y proyección',
            'Resonancia de cabeza: notas agudas ligeras y limpias',
            'La voz "colocada" hacia adelante viaja más y cansa menos',
          ],
          tips: [
            'Para sentir la resonancia de pecho: pon la mano en el pecho y canta "rum rum rum" grave',
            'Para la resonancia de máscara: canta "mmmm" y siente la vibración en la frente',
            'El zumbido (humming) es el mejor ejercicio para despertar resonadores',
          ],
          warnings: [
            'No "empujes" el sonido — debe fluir, no forzarse',
            'La resonancia nasal excesiva suena gangosa — busca el equilibrio',
          ],
        },
        exercises: [
          {
            id: 'ex-humming-resonance',
            name: 'Zumbido Resonante (Hmm)',
            description: 'Canta "mmm" sostenido y siente las vibraciones en diferentes partes del cuerpo.',
            type: 'sustained-note',
            duration: 90,
            instructions: [
              'Cierra la boca suavemente',
              'Canta "mmmm" en una nota cómoda (A3 ó C4)',
              'Siente dónde vibra: labios, nariz, frente, pecho',
              'Intenta mover la vibración de abajo hacia arriba',
            ],
            successCriteria: { minDuration: 60 },
          },
        ],
        completionCriteria: {
          minScore: 75,
          requiredExercises: ['ex-humming-resonance'],
        },
      },
    ],
  },

  {
    id: 3,
    title: 'Afinación',
    subtitle: 'Intervalos & Notas Exactas',
    description: 'Desarrolla el oído musical y el control preciso de la afinación. Aprende intervalos, corrección de desviaciones y la técnica de "encontrar la nota".',
    icon: '🎯',
    color: 'amber',
    unlockRequires: 2,
    minPassScore: 80,
    lessons: [
      {
        id: 'l3-tuning-basic',
        levelId: 3,
        title: 'Afinación Precisa',
        subtitle: 'Cada nota en su lugar',
        duration: 20,
        type: 'pitch-training',
        icon: '🎯',
        content: {
          introduction: 'La afinación es la habilidad de producir exactamente la frecuencia que deseas. Se desarrolla con práctica constante y el uso del oído crítico.',
          keyPoints: [
            'Una nota está "afinada" cuando se desvía menos de ±10 cents del tono ideal',
            'El oído se educa escuchando antes de cantar',
            'La tensión es enemiga de la afinación — relájate',
            'La afinación mejora dramáticamente con la práctica del "play-back"',
          ],
          tips: [
            'Grábate siempre — tu percepción interna no coincide con la realidad externa',
            'Usa el afinador visual para ver exactamente tu desviación',
            'La "internalización" de notas es clave: canta en tu mente antes de vocalizarla',
          ],
          warnings: [
            'No corrijas la nota "empujando" — ajusta la resonancia, no la fuerza',
          ],
        },
        exercises: [
          {
            id: 'ex-match-pitch',
            name: 'Emparejamiento de Nota',
            description: 'Escucha una nota de referencia y cántala exactamente.',
            type: 'sustained-note',
            duration: 120,
            targetNotes: ['C4', 'E4', 'G4', 'A4', 'C5'],
            instructions: [
              'Escucha la nota de referencia que emite la app',
              'Interiorízala antes de cantar',
              'Canta la misma nota y mantén < 15 cents de desviación',
              'La pantalla te mostrará tu precisión en tiempo real',
            ],
            successCriteria: { minPitchAccuracy: 80, maxCents: 20 },
          },
        ],
        completionCriteria: {
          minScore: 80,
          requiredExercises: ['ex-match-pitch'],
        },
      },

      {
        id: 'l3-intervals',
        levelId: 3,
        title: 'Intervalos Melódicos',
        subtitle: 'El vocabulario de la música',
        duration: 18,
        type: 'pitch-training',
        icon: '🎻',
        content: {
          introduction: 'Los intervalos son las distancias entre dos notas. Son el vocabulario de la música: aprender a cantarlos con precisión transforma tu capacidad de afinar en cualquier canción y de leer música de forma intuitiva.',
          keyPoints: [
            'Una segunda mayor es la distancia de un tono entero (Do→Re)',
            'Una tercera mayor salta dos tonos (Do→Mi) — base del acorde mayor',
            'La quinta justa (Do→Sol) tiene sonido abierto y estable — la más fácil',
            'La octava es la misma nota 12 semitonos arriba — misma "letra", diferente altura',
          ],
          tips: [
            'Asocia cada intervalo con una canción: Segunda = "Cumpleaños Feliz", Quinta = primer intervalo de "Star Wars"',
            'Canta el intervalo primero en tu mente, luego con voz',
            'Los intervalos descendentes son más difíciles — practícalos por separado',
          ],
          warnings: [
            'No saltes al intervalo por fuerza — llega con relajación y control',
            'Si fallas repetidamente el mismo intervalo, reduce la velocidad y escucha más',
          ],
        },
        exercises: [
          {
            id: 'ex-int-second',
            name: 'Segunda Mayor (Do→Re)',
            description: 'El intervalo más pequeño de la escala mayor. Do a Re, solo un tono de distancia.',
            type: 'arpeggio',
            duration: 60,
            targetNotes: ['C4', 'D4'],
            instructions: [
              'Escucha Do4 y luego Re4 con los botones de referencia',
              'Canta Do→Re→Do en "mi mi mi"',
              'Mantén cada nota 1-2 segundos antes de saltar',
              'Repite 5 veces subiendo medio tono cada vez',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 25 },
          },
          {
            id: 'ex-int-fifth',
            name: 'Quinta Justa (Do→Sol)',
            description: 'El intervalo más estable y fácil de reconocer. Base de toda armonía.',
            type: 'arpeggio',
            duration: 90,
            targetNotes: ['C4', 'G4'],
            instructions: [
              'Escucha Do4 y Sol4 — la quinta suena "abierta" y consonante',
              'Canta Do→Sol→Do en "aah aah aah"',
              'Siente cómo el salto es más grande que en la segunda',
              'Repite el patrón 6-8 veces',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 25 },
          },
          {
            id: 'ex-int-octave',
            name: 'Octava (Do→Do superior)',
            description: 'El salto de 12 semitonos. La misma nota, un registro arriba.',
            type: 'arpeggio',
            duration: 90,
            targetNotes: ['C4', 'C5'],
            instructions: [
              'Escucha Do4 y Do5 — misma nota, diferente altura',
              'Canta Do4→Do5 en "la la"',
              'Si Do5 está fuera de tu rango, sube hasta donde puedas sin tensión',
              'Baja: Do5→Do4. Este es el patrón clásico de octava',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 30 },
          },
        ],
        completionCriteria: {
          minScore: 80,
          requiredExercises: ['ex-int-fifth'],
        },
      },

      {
        id: 'l3-chromatic',
        levelId: 3,
        title: 'Escala Cromática',
        subtitle: 'Los 12 semitonos de la música',
        duration: 20,
        type: 'pitch-training',
        icon: '🎹',
        content: {
          introduction: 'La escala cromática incluye todos los 12 semitonos de la música occidental. Es el mapa completo de las notas. Dominarla te permite moverte por cualquier tonalidad y afinar con precisión quirúrgica.',
          keyPoints: [
            'Un semitono es la distancia más pequeña entre dos notas',
            'La escala cromática: Do Do# Re Re# Mi Fa Fa# Sol Sol# La La# Si Do',
            'Las teclas negras del piano son los semitonos (sostenidos/bemoles)',
            'Mi→Fa y Si→Do son semitonos naturales — no existe Mi# ni Si# en la escala',
          ],
          tips: [
            'Practica con una app de teclado virtual para verificar cada semitono',
            'El glissando (deslizamiento) entre notas cromáticas es un buen calentamiento',
            'Las notas enarmónicas son equivalentes: C# = Db, D# = Eb, F# = Gb',
          ],
          warnings: [
            'No des saltos bruscos a los semitonos — desliza suavemente hacia la nota',
            'No confundas la escala cromática con desafinar — cada semitono tiene un lugar exacto',
          ],
        },
        exercises: [
          {
            id: 'ex-chromatic-half-steps',
            name: 'Pasos de Semitono Do→Mi',
            description: 'Cinco semitonos ascendentes. El primer tramo de la escala cromática.',
            type: 'scale-up',
            duration: 90,
            targetNotes: ['C4', 'C#4', 'D4', 'D#4', 'E4'],
            instructions: [
              'Escucha los 5 semitonos con el botón de secuencia',
              'Canta cada semitono con "mi" — mantén 1 segundo por nota',
              'La distancia entre cada nota es muy pequeña — escucha con atención',
              'Repite subiendo: C#4, D4, D#4, E4, F4',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 20 },
          },
          {
            id: 'ex-chromatic-full',
            name: 'Cromática Completa Do→Sol',
            description: 'Siete semitonos ascendentes cubriendo la primera mitad de la octava.',
            type: 'scale-up',
            duration: 120,
            targetNotes: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'],
            instructions: [
              'Escucha la secuencia completa primero con el botón "▶ Secuencia"',
              'Canta cada semitono con "mi" sin apresurarte',
              'Si alguna nota falla, regresa y cántala sola antes de continuar',
              'Al dominar la ascendente, intenta la descendente: Sol→Do',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 25 },
          },
        ],
        completionCriteria: {
          minScore: 80,
          requiredExercises: ['ex-chromatic-half-steps'],
        },
      },
    ],
  },

  {
    id: 4,
    title: 'Dinámica',
    subtitle: 'Potencia & Control',
    description: 'Domina la dinámica vocal: desde el pianissimo más delicado hasta el fortissimo más poderoso. Aprende vibrato, trinos y el arte del crescendo.',
    icon: '⚡',
    color: 'purple',
    unlockRequires: 3,
    minPassScore: 80,
    lessons: [
      {
        id: 'l4-dynamics-intro',
        levelId: 4,
        title: 'Piano & Forte',
        subtitle: 'El arte del volumen vocal',
        duration: 18,
        type: 'vocalization',
        icon: '🔇',
        content: {
          introduction: 'La dinámica vocal es tu control de volumen. Desde el susurro más delicado (pianissimo) hasta el poder sin tensión del fortissimo. Dominar la dinámica transforma una voz técnica en una voz expresiva y musical.',
          keyPoints: [
            'pp = pianissimo (muy suave), p = piano (suave), mf = mezzo forte, f = forte (fuerte), ff = fortissimo',
            'El crescendo es el aumento gradual de volumen; el diminuendo la disminución',
            'La dinámica NO debe cambiar la afinación — mantener el pitch con el volumen es el reto',
            'El apoyo diafragmático aumenta con el volumen, no la tensión de la garganta',
          ],
          tips: [
            'Imagina el volumen como un dial de 1 a 10 — practica llegar exactamente al 3, al 5 y al 8',
            'El messa di voce (pp→ff→pp en una sola nota) es el ejercicio clásico de dinámica',
            'Grábate para verificar que tu pianissimo realmente suena suave al reproducirlo',
          ],
          warnings: [
            'Forte NO es grito — el forte tiene soporte y resonancia, nunca tensión laríngea',
            'No pierdas la afinación al subir el volumen — el apoyo debe ser proporcional',
          ],
        },
        exercises: [
          {
            id: 'ex-messa-voce',
            name: 'Messa di Voce',
            description: 'Nota sostenida que sube de pp a ff y regresa a pp. El ejercicio clásico de dinámica.',
            type: 'sustained-note',
            duration: 90,
            targetNotes: ['A3'],
            instructions: [
              'Canta La3 comenzando en pianissimo (apenas audible)',
              'Aumenta el volumen muy gradualmente durante 5 segundos hasta forte',
              'Baja de regreso a pianissimo en otros 5 segundos',
              'Todo en una sola exhalación, sin cambiar la nota',
              'La afinación debe permanecer estable en todo el crescendo/diminuendo',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 20, minDuration: 10 },
          },
          {
            id: 'ex-dynamics-scale',
            name: 'Escala con Contrastes Dinámicos',
            description: 'Escala Do Mayor alternando piano y forte en cada nota.',
            type: 'scale-up',
            duration: 120,
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            instructions: [
              'Canta la escala Do Mayor en "la la la"',
              'Alterna: nota 1 suave, nota 2 fuerte, nota 3 suave, etc.',
              'El contraste debe ser claramente audible',
              'Repite bajando: C5→C4 con el mismo patrón dinámico',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 25 },
          },
          {
            id: 'ex-crescendo-arpeggio',
            name: 'Arpegio en Crescendo',
            description: 'Arpegio Do-Mi-Sol-Do con crescendo natural hacia la cima.',
            type: 'arpeggio',
            duration: 90,
            targetNotes: ['C4', 'E4', 'G4', 'C5'],
            instructions: [
              'Canta Do-Mi-Sol-Do en "mi mi mi mi" con crescendo natural',
              'Cada nota debe ser un poco más fuerte que la anterior',
              'Al llegar a Do5 (la cima), baja el volumen para el descenso',
              'Baja: Do5-Sol4-Mi4-Do4 en diminuendo',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 25 },
          },
        ],
        completionCriteria: {
          minScore: 80,
          requiredExercises: ['ex-messa-voce'],
        },
      },

      {
        id: 'l4-vibrato-intro',
        levelId: 4,
        title: 'El Vibrato Natural',
        subtitle: 'La firma de una voz libre',
        duration: 20,
        type: 'vocalization',
        icon: '🌊',
        content: {
          introduction: 'El vibrato es la oscilación natural de la frecuencia vocal. Un vibrato saludable tiene una velocidad de 5-7 oscilaciones por segundo y variación de ±50 cents. Es el resultado de una laringe libre, no un efecto forzado.',
          keyPoints: [
            'El vibrato natural surge de una voz relajada y bien apoyada diafragmáticamente',
            'Velocidad ideal: 5-7 Hz (ciclos por segundo) — más lento suena trémolo, más rápido suena tembloroso',
            'El vibrato forzado suena artificial y cansa la voz',
            'Primero: domina el tono puro (straight tone). El vibrato natural viene después',
          ],
          tips: [
            'Masajea suavemente la laringe mientras cantas para sentir si hay tensión que bloquea el vibrato',
            'El ejercicio de "pulsaciones" (interrumpir el tono rítmicamente en "a-a-a-a") puede desbloquear el vibrato',
            'Practica en la zona media de tu voz donde estás más cómodo y relajado',
          ],
          warnings: [
            'No imites el vibrato de otros cantantes artificialmente — el vibrato forzado daña la voz',
            'Si sientes dolor, tensión excesiva o fatiga, para inmediatamente',
          ],
        },
        exercises: [
          {
            id: 'ex-straight-tone',
            name: 'Tono Puro Estable',
            description: 'Nota sostenida completamente lisa, sin vibrato. Prerequisito del vibrato sano.',
            type: 'sustained-note',
            duration: 120,
            targetNotes: ['A3', 'C4', 'E4'],
            instructions: [
              'Canta La3 en "aah" con tono completamente liso, sin ninguna oscilación',
              'La estabilidad perfecta es el requisito para un vibrato sano',
              'Sostén cada nota 8-10 segundos con la máxima uniformidad',
              'Repite en C4 y E4 con la misma estabilidad',
            ],
            successCriteria: { minPitchAccuracy: 80, maxCents: 15, minDuration: 8 },
          },
          {
            id: 'ex-pulse-vibrato',
            name: 'Pulsaciones para Desbloquear',
            description: 'Interrupciones rítmicas del tono que entrenan la oscilación natural del vibrato.',
            type: 'sustained-note',
            duration: 90,
            targetNotes: ['A3'],
            instructions: [
              'Canta La3 y pulsa el diafragma rítmicamente: "a-a-a-a-a" (4-5 por segundo)',
              'Gradualmente acelera las pulsaciones hasta que se fusionen en un vibrato',
              'No controles el tono — deja que la oscilación ocurra naturalmente',
              'Repite 5-6 veces. Con práctica, el vibrato aparece espontáneamente',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 20, minDuration: 10 },
          },
          {
            id: 'ex-vibrato-siren',
            name: 'Sirena para Liberar el Vibrato',
            description: 'Sirenas lentas que crean las condiciones para que el vibrato emerja solo.',
            type: 'siren',
            duration: 120,
            instructions: [
              'Haz una sirena lenta y continua en "uu" (como en "luna")',
              'En la parte alta de la sirena, deja que la voz "vibre" naturalmente',
              'No intentes controlar el vibrato — solo relaja la laringe y el cuello',
              'El vibrato aparecerá cuando la voz esté suficientemente libre',
            ],
            successCriteria: { minDuration: 80 },
          },
        ],
        completionCriteria: {
          minScore: 80,
          requiredExercises: ['ex-straight-tone'],
        },
      },

      {
        id: 'l4-passaggio',
        levelId: 4,
        title: 'El Passaggio',
        subtitle: 'Unifica los registros de tu voz',
        duration: 25,
        type: 'vocalization',
        icon: '🌉',
        content: {
          introduction: 'El passaggio (italiano: "pasaje") es la transición entre los registros de pecho y cabeza. Muchos cantantes sienten un "quiebre" o "break" en esa zona. Dominar el passaggio es uno de los mayores avances en el desarrollo vocal.',
          keyPoints: [
            'Voz de pecho: resonancia profunda, grave (C3-E4 hombres / C4-E5 mujeres)',
            'Voz de cabeza: resonancia alta y ligera, el llamado "falsete mejorado"',
            'El passaggio masculino suele ocurrir en E4-G4; el femenino en E5-G5',
            'La "voz mixta" mezcla ambos registros para un sonido unificado y sin quiebres',
          ],
          tips: [
            'Las sirenas son el mejor ejercicio para cruzar el passaggio sin brecha',
            'Imagina que las notas agudas "caen hacia adelante" — eso abre la laringe',
            'El "cry" (sensación de llanto suave) es la sensación correcta al cruzar el passaggio',
          ],
          warnings: [
            'NUNCA empujes la voz de pecho hacia las notas agudas — es la causa más común de daño vocal',
            'Si hay un "flip" o "crack" suave, está bien — es parte del proceso de aprendizaje',
          ],
        },
        exercises: [
          {
            id: 'ex-siren-passaggio',
            name: 'Sirena por el Passaggio',
            description: 'Sirenas completas que cruzan el passaggio naturalmente de grave a agudo.',
            type: 'siren',
            duration: 120,
            instructions: [
              'Haz una sirena continua desde tu nota más grave hasta la más aguda y de vuelta',
              'Pasa por el passaggio sin intentar sostener el registro de pecho',
              'La voz puede "romperse" suavemente — es normal y es avance',
              'Repite 5-6 veces. Cada vez debe haber menos brecha en la transición',
            ],
            successCriteria: { minDuration: 80 },
          },
          {
            id: 'ex-arpeggio-passaggio',
            name: 'Arpegio por el Passaggio',
            description: 'Arpegio que requiere cruzar el passaggio para llegar a Do5.',
            type: 'arpeggio',
            duration: 120,
            targetNotes: ['C4', 'E4', 'G4', 'C5'],
            instructions: [
              'Canta Do-Mi-Sol-Do en "mi mi mi mi"',
              'El Do5 requiere cruzar el passaggio — permite que la voz cambie naturalmente',
              'No fuerces el registro de pecho en Sol4 o Do5',
              'La vocal "mi" (con la "i" cerrada) facilita la transición de registro',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 30 },
          },
          {
            id: 'ex-scale-passaggio',
            name: 'Escala Cruzando el Passaggio',
            description: 'Escala Do Mayor ascendente con cambio de registro en la zona del passaggio.',
            type: 'scale-up',
            duration: 120,
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            instructions: [
              'Canta la escala Do Mayor en "oo" (labios redondeados, como en "food")',
              'Al llegar a F4-G4, deja que la voz cambie al registro superior sin forzar',
              'La vocal "oo" es la que mejor suaviza la transición de registro',
              'Repite descendente: C5→C4, cruzando el passaggio de regreso',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 30 },
          },
        ],
        completionCriteria: {
          minScore: 80,
          requiredExercises: ['ex-siren-passaggio', 'ex-arpeggio-passaggio'],
        },
      },

      {
        id: 'l4-range-extension',
        levelId: 4,
        title: 'Extensión del Rango',
        subtitle: 'Amplía tu tesitura con seguridad',
        duration: 22,
        type: 'vocalization',
        icon: '📏',
        content: {
          introduction: 'La extensión del rango vocal es el resultado de meses de entrenamiento correcto, no de forzar notas extremas. Con la técnica adecuada, la mayoría de cantantes puede extender su rango 4-8 semitonos en ambas direcciones sin riesgo de daño.',
          keyPoints: [
            'El rango se extiende gradualmente — medio tono por semana es un ritmo saludable',
            'Las notas extremas requieren más apoyo diafragmático, no más tensión laríngea',
            'Calentar siempre antes de intentar notas extremas (grave o agudo)',
            'El enfriamiento vocal es tan importante como el calentamiento',
          ],
          tips: [
            'El "lip trill" (vibración de labios con aire) es el mejor ejercicio de extensión — reduce tensión laríngea al máximo',
            'Para los graves: relaja la laringe, no la "jales" hacia abajo',
            'Para los agudos: imagina que cantas hacia adelante y arriba, no solo hacia arriba',
          ],
          warnings: [
            'NUNCA fuerces notas más allá de tu rango — el riesgo de daño es real',
            'Si una nota produce dolor, ardor o raspa, es señal de parar inmediatamente',
          ],
        },
        exercises: [
          {
            id: 'ex-lip-trill-range',
            name: 'Lip Trill Extensor de Rango',
            description: 'Sirenas con vibración de labios para explorar el rango sin tensión laríngea.',
            type: 'siren',
            duration: 120,
            instructions: [
              'Cierra los labios suavemente y vibra con aire (sonido "prrrr" o "brrrr")',
              'Haz una sirena completa subiendo lo más alto posible, luego lo más grave posible',
              'El lip trill protege la voz mientras exploras el rango',
              'Repite 4-5 veces. Cada vez intenta llegar un poco más arriba o abajo',
            ],
            successCriteria: { minDuration: 80 },
          },
          {
            id: 'ex-scale-extension-up',
            name: 'Extensión Hacia los Agudos',
            description: 'Escala ascendente que va subiendo progresivamente hacia los agudos.',
            type: 'scale-up',
            duration: 120,
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            instructions: [
              'Canta la escala Do Mayor en "ah"',
              'Repite subiendo un semitono: C#4, D4, E4... hasta donde puedas sin tensión',
              'Para cuando sientas incomodidad — no fuerces',
              'Anota tu nota más aguda cómoda — ese es tu límite actual',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 30 },
          },
          {
            id: 'ex-scale-extension-down',
            name: 'Extensión Hacia los Graves',
            description: 'Escala descendente explorando el registro grave con relajación total.',
            type: 'scale-down',
            duration: 120,
            targetNotes: ['C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3'],
            instructions: [
              'Baja la escala desde C4 hacia los graves en "um" o "oh"',
              'Relaja completamente la laringe — no la jales hacia abajo',
              'En las notas graves, el sonido será más tenue y profundo',
              'Para cuando el sonido se vuelva "roto" o forzado',
            ],
            successCriteria: { minPitchAccuracy: 65, maxCents: 35 },
          },
        ],
        completionCriteria: {
          minScore: 80,
          requiredExercises: ['ex-lip-trill-range'],
        },
      },
    ],
  },

  {
    id: 5,
    title: 'Interpretación',
    subtitle: 'Expresión & Emoción',
    description: 'La técnica al servicio de la emoción. Aprende a contar historias con tu voz, conectar con el texto y mover a tu audiencia.',
    icon: '🎭',
    color: 'rose',
    unlockRequires: 4,
    minPassScore: 85,
    lessons: [
      {
        id: 'l5-articulation',
        levelId: 5,
        title: 'Articulación y Dicción',
        subtitle: 'Que cada palabra llegue clara',
        duration: 18,
        type: 'interpretation',
        icon: '👄',
        content: {
          introduction: 'La dicción es el arte de comunicar el texto con claridad mientras cantas. Una técnica perfecta pierde su valor si nadie entiende las palabras. La articulación es la diferencia entre un instrumentista y un comunicador.',
          keyPoints: [
            'Las vocales llevan el sonido (afinación y duración), las consonantes articulan el texto',
            'Las consonantes explosivas (P, B, T, D, K, G) deben ser rápidas y limpias — no sostenidas',
            'Las consonantes fricativas (S, F, Z) deben ser suaves para no dominar el sonido',
            'Las vocales modificadas en el agudo son normales y necesarias para preservar el sonido',
          ],
          tips: [
            'Exagera la articulación al practicar — al actuar se suavizará naturalmente',
            'Grábate y escucha si se entiende cada palabra reproducida',
            'Practica el texto hablado con exageración antes de cantarlo',
          ],
          warnings: [
            'No sacrifiques el sonido por la dicción — primero el sonido, luego las palabras',
            'Las consonantes finales de frase deben llegar DESPUÉS de la nota, no durante',
          ],
        },
        exercises: [
          {
            id: 'ex-vowel-shaping',
            name: 'Vocales Puras en Arpegio',
            description: 'Cinco vocales puras en el arpegio básico. Cada vocal con posición de boca consistente.',
            type: 'arpeggio',
            duration: 90,
            targetNotes: ['C4', 'E4', 'G4', 'C5'],
            instructions: [
              'Canta el arpegio Do-Mi-Sol-Do con la vocal "A" (boca abierta)',
              'Repite con "E" (labios extendidos), "I" (dientes casi juntos), "O" (labios redondeados), "U" (labios muy redondeados)',
              'Las 5 vocales deben sonar claramente diferentes entre sí',
              'La posición de boca NO debe cambiar dentro de cada repetición',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 25 },
          },
          {
            id: 'ex-consonant-clarity',
            name: 'Trabajo de Consonantes',
            description: 'Escala con sílabas variables para entrenar claridad consonántica.',
            type: 'scale-up',
            duration: 90,
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
            instructions: [
              'Canta la escala con "mi-ma-me-mo-mu" (una sílaba por nota)',
              'Articula cada "m" inicial claramente — debe ser audible',
              'Repite con "ba-be-bi-bo-bu" (consonante explosiva)',
              'Repite con "la-le-li-lo-lu" (consonante lateral)',
            ],
            successCriteria: { minPitchAccuracy: 70, maxCents: 30 },
          },
          {
            id: 'ex-legato-vowels',
            name: 'Legato en Vocales Descendente',
            description: 'Escala descendente en "aaa" continuo sin interrupciones entre notas.',
            type: 'scale-down',
            duration: 120,
            targetNotes: ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
            instructions: [
              'Canta la escala descendente en "aaaa" continuo, sin separar las notas',
              'Imagina que las notas fluyen como agua — sin interrupciones ni saltos de calidad',
              'El legato perfecto es difícil — la vocal "a" debe sonar uniforme en todas las notas',
              'Si hay un "quiebre" de calidad vocal, trabaja esa zona con zoom',
            ],
            successCriteria: { minPitchAccuracy: 75, maxCents: 25 },
          },
        ],
        completionCriteria: {
          minScore: 85,
          requiredExercises: ['ex-vowel-shaping', 'ex-legato-vowels'],
        },
      },

      {
        id: 'l5-phrasing',
        levelId: 5,
        title: 'Fraseo y Expresión Musical',
        subtitle: 'Cuenta una historia con cada frase',
        duration: 20,
        type: 'interpretation',
        icon: '🌊',
        content: {
          introduction: 'El fraseo musical es cómo das forma a las melodías para contar una historia. Las mismas notas con diferente fraseo pueden sonar mundanas o emocionantes. El fraseo es la diferencia entre tocar las notas correctas y hacer música verdadera.',
          keyPoints: [
            'Una frase musical tiene una "cima" — la nota de mayor tensión emocional hacia la que todo apunta',
            'El crescendo hacia la cima y diminuendo después es el patrón básico del fraseo expresivo',
            'La respiración debe respetar el fraseo — nunca interrumpir en mitad de una idea musical',
            'El rubato (libertad temporal) permite enfatizar momentos emocionales clave',
          ],
          tips: [
            'Habla el texto en voz alta como un discurso emotivo antes de cantarlo',
            'Identifica la palabra más importante de cada frase y hazla la cima dinámica',
            'El espacio (silencios) es tan importante como las notas',
          ],
          warnings: [
            'Demasiado rubato sin estructura suena caótico — la libertad necesita disciplina',
            'La expresión no justifica perder la afinación — ambas deben coexistir siempre',
          ],
        },
        exercises: [
          {
            id: 'ex-phrase-arch',
            name: 'El Arco de la Frase',
            description: 'Melodía ascendente-descendente con crescendo hacia la cima y diminuendo al regresar.',
            type: 'scale-up',
            duration: 120,
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
            instructions: [
              'Canta esta frase ascendente-descendente en "aah"',
              'Aumenta el volumen gradualmente hasta La4 (la cima de la frase)',
              'Disminuye el volumen al bajar de regreso a Do4',
              'Repite 3 veces — cada vez con más intención expresiva',
            ],
            successCriteria: { minPitchAccuracy: 80, maxCents: 20 },
          },
          {
            id: 'ex-legato-phrase',
            name: 'Arpegio Legato Expresivo',
            description: 'Arpegio con máximo legato como un instrumento de cuerda.',
            type: 'arpeggio',
            duration: 120,
            targetNotes: ['C4', 'E4', 'G4', 'B4', 'C5'],
            instructions: [
              'Canta el arpegio en "ooh" (oo como en "moon")',
              'Conecta cada nota sin interrupciones — como un arco de violonchelo continuo',
              'En el Do5 (cima), haz una ligera intensificación expresiva',
              'Baja: Do5-Si4-Sol4-Mi4-Do4 con diminuendo natural',
            ],
            successCriteria: { minPitchAccuracy: 80, maxCents: 20 },
          },
          {
            id: 'ex-staccato-contrast',
            name: 'Staccato vs Legato',
            description: 'El mismo arpegio con articulación contrastante para desarrollar control expresivo.',
            type: 'arpeggio',
            duration: 90,
            targetNotes: ['C4', 'E4', 'G4', 'C5'],
            instructions: [
              'Canta Do-Mi-Sol-Do en staccato (notas cortas y separadas, como pizzicato)',
              'Luego repite el mismo arpegio en legato perfecto',
              'Alterna 3 veces: staccato, legato, staccato',
              'La afinación debe ser idéntica en ambos estilos',
            ],
            successCriteria: { minPitchAccuracy: 80, maxCents: 20 },
          },
        ],
        completionCriteria: {
          minScore: 85,
          requiredExercises: ['ex-phrase-arch', 'ex-legato-phrase'],
        },
      },

      {
        id: 'l5-performance',
        levelId: 5,
        title: 'La Actuación',
        subtitle: 'Síntesis de técnica y emoción',
        duration: 25,
        type: 'interpretation',
        icon: '🎭',
        content: {
          introduction: 'La actuación vocal es la síntesis de todo lo aprendido: técnica, musicalidad y presencia. El escenario no es donde aprendes a cantar — es donde muestras que ya sabes. Esta lección prepara mente y cuerpo para presentarte con confianza.',
          keyPoints: [
            'La ansiedad escénica es energía — aprendes a canalizarla, no a eliminarla',
            'La conexión con el texto es más importante que la perfección técnica para el público',
            'El cantante que "siente" siempre supera al que solo "ejecuta" correctamente',
            'La preparación reduce la ansiedad: practica hasta que la técnica sea automática',
          ],
          tips: [
            'Practica en condiciones similares a la actuación: de pie, sin leer, frente a alguien',
            'Las grabaciones de ensayo son más valiosas que 10 ensayos sin grabar',
            'El día de la actuación: calienta bien, hidratate y evita lácteos antes',
          ],
          warnings: [
            'No cambies tu técnica en el escenario — confía en lo que practicaste',
            'El nerviosismo hace que la voz tienda a subir de altura — compénsalo conscientemente',
          ],
        },
        exercises: [
          {
            id: 'ex-performance-warmup',
            name: 'Calentamiento Pre-actuación',
            description: 'Rutina completa de calentamiento para antes de cualquier presentación.',
            type: 'siren',
            duration: 120,
            instructions: [
              'Paso 1: Lip trill en sirenas completas durante 1 minuto',
              'Paso 2: Escala C4-C5 en "ya ya ya" (consonante activa + vocal abierta)',
              'Paso 3: Arpegios C4-G4-C5 en "ni ni ni" (agudiza el enfoque del sonido)',
              'Paso 4: Nota más larga posible en "naah" con todo el apoyo que tienes',
              'Este calentamiento es la rutina definitiva antes de cualquier presentación',
            ],
            successCriteria: { minDuration: 90 },
          },
          {
            id: 'ex-performance-phrase',
            name: 'Frase con Intención Real',
            description: 'Canta una frase conocida tres veces con enfoques diferentes para descubrir tu voz auténtica.',
            type: 'free-singing',
            duration: 120,
            instructions: [
              'Elige una frase de una canción que conozcas bien',
              'Primera vez: técnica pura (afinación, resonancia, soporte — sin emoción)',
              'Segunda vez: emoción pura (sin preocuparte por técnica — solo siente)',
              'Tercera vez: combina técnica y emoción conscientemente',
              'Escucha y nota cuál versión te parece más auténtica',
            ],
            successCriteria: { minDuration: 60 },
          },
          {
            id: 'ex-full-performance',
            name: 'Simulacro de Actuación',
            description: 'Actuación continua sin pausas, simulando condiciones reales de presentación.',
            type: 'free-singing',
            duration: 180,
            instructions: [
              'Canta 2-3 minutos sin parar: una canción completa o varias frases concatenadas',
              'De pie, sin leer notas, imaginando una audiencia frente a ti',
              'Si cometes un error, continúa — un cantante profesional nunca se detiene',
              'Al terminar, respira y nota cómo te sientes: eso es presencia escénica',
            ],
            successCriteria: { minDuration: 120 },
          },
        ],
        completionCriteria: {
          minScore: 85,
          requiredExercises: ['ex-performance-warmup', 'ex-performance-phrase'],
        },
      },
    ],
  },
];

export function getLevelById(id: number): Level | undefined {
  return CURRICULUM.find(l => l.id === id);
}

export function getLessonById(id: string) {
  for (const level of CURRICULUM) {
    const lesson = level.lessons.find(l => l.id === id);
    if (lesson) return { lesson, level };
  }
  return null;
}

export function getNextLesson(currentLessonId: string): string | null {
  for (const level of CURRICULUM) {
    const idx = level.lessons.findIndex(l => l.id === currentLessonId);
    if (idx !== -1) {
      if (idx + 1 < level.lessons.length) return level.lessons[idx + 1].id;
      const nextLevel = CURRICULUM.find(l => l.id === level.id + 1);
      if (nextLevel && nextLevel.lessons.length > 0) return nextLevel.lessons[0].id;
      return null;
    }
  }
  return null;
}
