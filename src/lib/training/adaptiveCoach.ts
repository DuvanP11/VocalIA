import type { UserProfile, UserProgress, SongPerformance } from '@/types';

// ─── Tipos exportados ────────────────────────────────────────

export interface WeaknessArea {
  category: 'pitch' | 'rhythm' | 'breathing' | 'range' | 'consistency' | 'lesson-progress';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  metric: number; // 0-100
}

export interface WeaknessAnalysis {
  overallScore: number;
  weaknesses: WeaknessArea[];
  strengths: string[];
  recentAvgAccuracy: number;
  practiceStats: {
    totalSessions: number;
    avgMinutesPerSession: number;
    totalMinutes: number;
    streak: number;
  };
  userContext: {
    voiceType: string | null;
    voiceRange: string | null;
    experience: string;
    goals: string[];
    currentLevel: number;
    lessonScores: Record<string, number>;
    completedCount: number;
  };
  songContext: {
    totalPerformances: number;
    avgPitchScore: number;
    avgRhythmScore: number;
    avgBreathingScore: number;
  };
}

export interface CoachingExercise {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'pitch' | 'rhythm' | 'range' | 'warm-up';
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  whyThisHelps: string;
  successCriteria: string;
}

export interface CoachingPlan {
  intro: string;
  focusArea: string;
  weekGoal: string;
  exercises: CoachingExercise[];
  dailyRoutine: {
    morning: string[];
    evening: string[];
  };
  encouragement: string;
}

// ─── Motor de análisis ───────────────────────────────────────

export function analyzeWeaknesses(
  progress: UserProgress,
  profile: UserProfile,
  songPerformances: SongPerformance[],
): WeaknessAnalysis {
  const recentSessions = progress.sessionHistory.slice(-10);

  const recentAvgAccuracy =
    recentSessions.length > 0
      ? recentSessions.reduce((s, r) => s + (r.avgPitchAccuracy || 0), 0) / recentSessions.length
      : 0;

  const lessonScoreValues = Object.values(progress.lessonScores);
  const avgLessonScore =
    lessonScoreValues.length > 0
      ? lessonScoreValues.reduce((a, b) => a + b, 0) / lessonScoreValues.length
      : 0;

  const avgMinutesPerSession =
    recentSessions.length > 0
      ? recentSessions.reduce((s, r) => s + r.durationMinutes, 0) / recentSessions.length
      : 0;

  let avgSongPitch = 0;
  let avgSongRhythm = 0;
  let avgSongBreathing = 0;
  if (songPerformances.length > 0) {
    avgSongPitch = songPerformances.reduce((s, p) => s + p.scores.pitch, 0) / songPerformances.length;
    avgSongRhythm = songPerformances.reduce((s, p) => s + p.scores.rhythm, 0) / songPerformances.length;
    avgSongBreathing = songPerformances.reduce((s, p) => s + p.scores.breathing, 0) / songPerformances.length;
  }

  const weaknesses: WeaknessArea[] = [];
  const strengths: string[] = [];

  // Afinación
  if (recentSessions.length >= 3) {
    if (recentAvgAccuracy < 50) {
      weaknesses.push({
        category: 'pitch',
        severity: 'high',
        title: 'Afinación',
        description: `Precisión promedio de ${recentAvgAccuracy.toFixed(0)}%. Necesitas trabajar el oído interno.`,
        metric: recentAvgAccuracy,
      });
    } else if (recentAvgAccuracy < 75) {
      weaknesses.push({
        category: 'pitch',
        severity: 'medium',
        title: 'Afinación',
        description: `Precisión de ${recentAvgAccuracy.toFixed(0)}%. Hay margen de mejora notable.`,
        metric: recentAvgAccuracy,
      });
    } else {
      strengths.push(`Buena afinación (${recentAvgAccuracy.toFixed(0)}%)`);
    }
  }

  // Constancia
  if (progress.currentStreak === 0 && progress.sessionHistory.length > 0) {
    weaknesses.push({
      category: 'consistency',
      severity: 'medium',
      title: 'Constancia',
      description: 'No has practicado recientemente. La regularidad es clave.',
      metric: 0,
    });
  } else if (progress.currentStreak >= 7) {
    strengths.push(`Racha de ${progress.currentStreak} días 🔥`);
  } else if (progress.currentStreak >= 3) {
    strengths.push(`Racha activa de ${progress.currentStreak} días`);
  }

  // Lecciones
  if (avgLessonScore > 0 && avgLessonScore < 70) {
    weaknesses.push({
      category: 'lesson-progress',
      severity: 'medium',
      title: 'Rendimiento en lecciones',
      description: `Puntaje promedio de ${avgLessonScore.toFixed(0)}/100. Algunas lecciones necesitan repaso.`,
      metric: avgLessonScore,
    });
  } else if (avgLessonScore >= 85) {
    strengths.push(`Excelente puntaje en lecciones (${avgLessonScore.toFixed(0)}%)`);
  }

  // Respiración (canciones)
  if (songPerformances.length >= 2) {
    if (avgSongBreathing < 55) {
      weaknesses.push({
        category: 'breathing',
        severity: avgSongBreathing < 40 ? 'high' : 'medium',
        title: 'Soporte respiratorio',
        description: `Respiración promedio de ${avgSongBreathing.toFixed(0)}% en canciones. Trabaja el diafragma.`,
        metric: avgSongBreathing,
      });
    } else if (avgSongBreathing >= 80) {
      strengths.push(`Buen soporte respiratorio (${avgSongBreathing.toFixed(0)}%)`);
    }

    // Ritmo
    if (avgSongRhythm < 55) {
      weaknesses.push({
        category: 'rhythm',
        severity: 'medium',
        title: 'Ritmo',
        description: `Precisión rítmica de ${avgSongRhythm.toFixed(0)}% en canciones.`,
        metric: avgSongRhythm,
      });
    }
  }

  // Rango vocal
  if (
    progress.vocalAssessment &&
    progress.vocalAssessment.range.semitones < 15
  ) {
    weaknesses.push({
      category: 'range',
      severity: 'low',
      title: 'Rango vocal',
      description: `Rango de ${progress.vocalAssessment.range.semitones} semitonos. Puedes expandirlo con práctica.`,
      metric: (progress.vocalAssessment.range.semitones / 36) * 100,
    });
  }

  if (strengths.length === 0) {
    if (progress.totalPracticeMinutes >= 30) {
      strengths.push(`${progress.totalPracticeMinutes} minutos de práctica acumulados`);
    } else {
      strengths.push('¡Has iniciado tu viaje vocal!');
    }
  }

  // Puntaje global ponderado
  const factors: number[] = [];
  if (recentAvgAccuracy > 0) factors.push(recentAvgAccuracy);
  if (avgLessonScore > 0) factors.push(avgLessonScore);
  if (avgSongPitch > 0) factors.push(avgSongPitch);
  factors.push(Math.min(100, progress.currentStreak * 10 + 20));

  const overallScore =
    factors.length > 0
      ? Math.round(factors.reduce((a, b) => a + b, 0) / factors.length)
      : 35;

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    weaknesses,
    strengths,
    recentAvgAccuracy,
    practiceStats: {
      totalSessions: progress.sessionHistory.length,
      avgMinutesPerSession: Math.round(avgMinutesPerSession),
      totalMinutes: progress.totalPracticeMinutes,
      streak: progress.currentStreak,
    },
    userContext: {
      voiceType: progress.vocalAssessment?.voiceType ?? null,
      voiceRange: progress.vocalAssessment
        ? `${progress.vocalAssessment.range.lowestNote} - ${progress.vocalAssessment.range.highestNote}`
        : null,
      experience: profile.experience,
      goals: profile.goals,
      currentLevel: progress.currentLevel,
      lessonScores: progress.lessonScores,
      completedCount: progress.completedLessons.length,
    },
    songContext: {
      totalPerformances: songPerformances.length,
      avgPitchScore: Math.round(avgSongPitch),
      avgRhythmScore: Math.round(avgSongRhythm),
      avgBreathingScore: Math.round(avgSongBreathing),
    },
  };
}

// ─── Plan de respaldo (sin API) ──────────────────────────────

export function generateFallbackPlan(analysis: WeaknessAnalysis): CoachingPlan {
  const primary = analysis.weaknesses[0];
  const isAbsoluteBeginnerExp =
    analysis.userContext.experience === 'absolute-beginner' ||
    analysis.userContext.experience === 'beginner';

  const exercises: CoachingExercise[] = [
    {
      id: 'fb-warmup',
      title: 'Calentamiento vocal',
      description: 'Prepara la voz antes de cualquier práctica.',
      type: 'warm-up',
      durationMinutes: 5,
      difficulty: 'easy',
      instructions: [
        'Bosteza 3 veces abriendo bien la boca y relajando la mandíbula.',
        'Haz vibración de labios (motorboat) durante 20 segundos.',
        'Humm suavemente en La3 (A3) durante 30 segundos.',
        'Canta "mmm" subiendo media escala y bajando de vuelta.',
      ],
      whyThisHelps: 'Activa las cuerdas vocales sin forzarlas y evita lesiones.',
      successCriteria: 'Tu voz se siente cálida, libre de tensión y sin carraspeo.',
    },
  ];

  if (!primary || primary.category === 'pitch' || primary.category === 'lesson-progress') {
    exercises.push({
      id: 'fb-pitch-sustained',
      title: 'Notas sostenidas en "ah"',
      description: 'Mejora la afinación manteniendo notas individuales.',
      type: 'pitch',
      durationMinutes: 10,
      difficulty: isAbsoluteBeginnerExp ? 'easy' : 'medium',
      instructions: [
        'Abre el afinador en modo libre en VocalIA.',
        'Canta "aaa" en La3 (A3) y sostenlo 5 segundos.',
        'Observa el indicador de cents. El objetivo es ±20 cents.',
        'Repite con Do4 (C4), Mi4 (E4), y Sol4 (G4).',
        'Descansa 10 segundos entre cada nota.',
      ],
      whyThisHelps: 'Entrena el oído interno y la memoria muscular de las cuerdas vocales.',
      successCriteria: 'Consigues mantener cada nota con menos de 25 cents de desviación.',
    });

    exercises.push({
      id: 'fb-pitch-interval',
      title: 'Intervalos de tercera',
      description: 'Practica saltos melódicos comunes.',
      type: 'pitch',
      durationMinutes: 8,
      difficulty: 'medium',
      instructions: [
        'Canta Do4-Mi4-Do4 lentamente (intervalo de tercera mayor).',
        'Repite 5 veces en "la-la-la".',
        'Sube un semitono: Re4-Fa#4-Re4. Repite 5 veces.',
        'Grábate para comparar con el audio de referencia.',
      ],
      whyThisHelps: 'Los intervalos de tercera son los más frecuentes en canciones. Dominarlos mejora la musicalidad general.',
      successCriteria: 'Cada nota del intervalo suena afinada sin "buscar" la nota.',
    });
  }

  if (primary?.category === 'breathing' || exercises.length < 3) {
    exercises.push({
      id: 'fb-breath-diaphragm',
      title: 'Respiración diafragmática',
      description: 'Desarrolla el soporte de aire esencial para cantar.',
      type: 'breathing',
      durationMinutes: 8,
      difficulty: 'easy',
      instructions: [
        'Acuéstate boca arriba. Coloca un libro sobre el abdomen.',
        'Inhala 4 tiempos: el libro debe subir, el pecho no.',
        'Sostén el aire 2 tiempos.',
        'Exhala en "sss" constante durante 8 tiempos.',
        'Repite 10 veces. Luego hazlo de pie.',
      ],
      whyThisHelps: 'El diafragma es el motor de la voz. Más soporte de aire = más control y potencia.',
      successCriteria: 'El pecho no se mueve al respirar y el flujo de "sss" es parejo durante los 8 tiempos.',
    });
  }

  if (primary?.category === 'consistency' || exercises.length < 4) {
    exercises.push({
      id: 'fb-siren',
      title: 'Sirenas vocales',
      description: 'Conecta los registros y expande el rango.',
      type: 'range',
      durationMinutes: 7,
      difficulty: 'easy',
      instructions: [
        'Canta "wee" en la nota más grave cómoda.',
        'Desliza la voz hacia arriba (como sirena de bomberos) sin parar.',
        'Llega a tu nota más aguda cómoda y baja de nuevo.',
        'Hazlo 5 veces. Nunca forces la voz.',
      ],
      whyThisHelps: 'Las sirenas conectan el registro de pecho y el de cabeza, suavizando el passaggio.',
      successCriteria: 'El deslizamiento es fluido sin cortes ni breaks abruptos.',
    });
  }

  exercises.push({
    id: 'fb-resonance',
    title: 'Humming de resonancia',
    description: 'Proyecta la voz con más brillo natural.',
    type: 'pitch',
    durationMinutes: 6,
    difficulty: 'easy',
    instructions: [
      'Cierra la boca suavemente con los labios sueltos.',
      'Haz "mmm" sintiendo vibración en labios y cavidad nasal.',
      'Canta una melodía simple con "mmm" (ej. cumpleaños feliz).',
      'Observa que el sonido se proyecta hacia adelante, no hacia atrás.',
    ],
    whyThisHelps: 'La resonancia frontal da brillo y proyección sin esfuerzo. Reduce la fatiga vocal.',
    successCriteria: 'Sientes cosquilleo en los labios y frente mientras "mmmm".',
  });

  const focusTitle = primary?.title ?? 'Fundamentos vocales';
  const targetAccuracy =
    primary?.category === 'pitch'
      ? Math.min(100, Math.round((analysis.recentAvgAccuracy || 50) + 15))
      : null;

  return {
    intro: `He analizado tu progreso y preparé un plan para esta semana. ${
      analysis.weaknesses.length === 0
        ? 'Tu evolución es positiva — sigamos construyendo sobre tus bases sólidas.'
        : `El área que más atención necesita es: ${focusTitle}.`
    } ${
      isAbsoluteBeginnerExp
        ? 'Como estudiante en etapa inicial, cada sesión cuenta mucho.'
        : 'Con tu experiencia previa, este plan acelerará tu progreso.'
    }`,
    focusArea: focusTitle,
    weekGoal: targetAccuracy
      ? `Alcanzar ${targetAccuracy}% de precisión de afinación promedio`
      : 'Completar 5 sesiones de práctica esta semana',
    exercises,
    dailyRoutine: {
      morning: ['5min calentamiento vocal', '8min respiración diafragmática'],
      evening: ['10min práctica de afinación', '5min canciones o sirenas'],
    },
    encouragement:
      '¡Cada día de práctica te acerca a la voz que mereces! La constancia supera siempre al talento.',
  };
}
