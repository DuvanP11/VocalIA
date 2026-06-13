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
    lessons: [],
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
    lessons: [],
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
