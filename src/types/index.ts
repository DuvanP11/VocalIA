// ============================================================
// VocalIA — Tipos globales del sistema
// ============================================================

// ─── Audio / Pitch ──────────────────────────────────────────

export interface PitchResult {
  frequency: number;      // Hz (−1 si no detectado)
  note: string;           // "A4", "C#3", etc.
  noteName: string;       // "La", "Do#"...
  octave: number;
  cents: number;          // desviación ±100 del semitono
  clarity: number;        // 0-1 confianza de detección
  timestamp: number;      // ms
}

export interface VocalRange {
  lowestNote: string;
  highestNote: string;
  lowestFreq: number;
  highestFreq: number;
  semitones: number;
  classification: VoiceType;
}

export type VoiceType =
  | 'bass'
  | 'baritone'
  | 'tenor'
  | 'countertenor'
  | 'contralto'
  | 'mezzo-soprano'
  | 'soprano'
  | 'unknown';

export interface VocalAssessmentResult {
  range: VocalRange;
  voiceType: VoiceType;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  fatigueRisk: 'low' | 'medium' | 'high';
  developmentPotential: 'low' | 'medium' | 'high' | 'exceptional';
  sessionId: string;
  createdAt: string;
}

// ─── Análisis facial ────────────────────────────────────────

export interface FacialAnalysis {
  jawOpenness: number;           // 0-1
  lipTension: number;            // 0-1
  chinPosition: 'up' | 'down' | 'neutral';
  facialSymmetry: number;        // 0-1
  visibleTension: 'none' | 'mild' | 'moderate' | 'high';
  suggestions: FacialSuggestion[];
}

export interface FacialSuggestion {
  type: 'jaw' | 'lips' | 'chin' | 'tension' | 'symmetry';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

// ─── Entrenamiento ──────────────────────────────────────────

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface Level {
  id: LevelId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  minPassScore: number;  // 0-100
  unlockRequires: LevelId | null;
}

export interface Lesson {
  id: string;
  levelId: LevelId;
  title: string;
  subtitle: string;
  duration: number;     // minutos estimados
  type: LessonType;
  icon: string;
  content: LessonContent;
  exercises: Exercise[];
  completionCriteria: CompletionCriteria;
}

export type LessonType =
  | 'theory'
  | 'breathing'
  | 'vocalization'
  | 'pitch-training'
  | 'rhythm'
  | 'resonance'
  | 'interpretation';

export interface LessonContent {
  introduction: string;
  keyPoints: string[];
  demonstration?: string;   // URL o descripción
  tips: string[];
  warnings: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: ExerciseType;
  duration: number;     // segundos
  targetNotes?: string[];
  targetBPM?: number;
  instructions: string[];
  successCriteria: SuccessCriteria;
}

export type ExerciseType =
  | 'breathing-inhale'
  | 'breathing-exhale'
  | 'sustained-note'
  | 'scale-up'
  | 'scale-down'
  | 'arpeggio'
  | 'siren'
  | 'rhythm-clapping'
  | 'free-singing';

export interface SuccessCriteria {
  minPitchAccuracy?: number;    // % mínimo de afinación
  minDuration?: number;         // segundos sostenidos
  minClarity?: number;          // claridad de señal 0-1
  maxCents?: number;            // desviación máxima permitida
}

export interface CompletionCriteria {
  minScore: number;             // 0-100
  requiredExercises: string[];  // IDs de ejercicios obligatorios
}

// ─── Progreso del usuario ────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  goals: VocalGoal[];
  experience: ExperienceLevel;
  dailyGoalMinutes: number;
  createdAt: string;
}

export type VocalGoal =
  | 'sing-in-tune'
  | 'improve-power'
  | 'higher-notes'
  | 'lower-notes'
  | 'audition-prep'
  | 'hobby'
  | 'improve-expression';

export type ExperienceLevel = 'absolute-beginner' | 'beginner' | 'intermediate' | 'advanced';

export interface UserProgress {
  userId: string;
  currentLevel: LevelId;
  completedLessons: string[];
  completedExercises: string[];
  lessonScores: Record<string, number>;
  totalPracticeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  achievements: string[];
  vocalAssessment: VocalAssessmentResult | null;
  sessionHistory: PracticeSession[];
}

export interface PracticeSession {
  id: string;
  date: string;
  durationMinutes: number;
  exercisesCompleted: number;
  avgPitchAccuracy: number;
  notesReached: string[];
  lessonId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
  condition: (progress: UserProgress) => boolean;
}

// ─── Análisis de canción ─────────────────────────────────────

export interface SongAnalysis {
  title: string;
  artist?: string;
  key: string;
  tempo: number;          // BPM
  dominantNotes: string[];
  rangeMin: string;
  rangeMax: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number;       // segundos
}

export interface SongPerformance {
  songId: string;
  date: string;
  scores: {
    pitch: number;
    rhythm: number;
    breathing: number;
    expression: number;
    overall: number;
  };
  highlights: PerformanceHighlight[];
}

export interface PerformanceHighlight {
  timestamp: number;
  type: 'great' | 'good' | 'needs-work';
  note: string;
}
