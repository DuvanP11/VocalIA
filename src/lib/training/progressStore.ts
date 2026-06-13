import type { UserProgress, UserProfile, PracticeSession, VocalAssessmentResult } from '@/types';

const STORAGE_KEY_PROFILE = 'vocalIA:profile';
const STORAGE_KEY_PROGRESS = 'vocalIA:progress';

// ─── Perfil de usuario ────────────────────────────────────────

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Progreso ─────────────────────────────────────────────────

export function createInitialProgress(userId: string): UserProgress {
  return {
    userId,
    currentLevel: 1,
    completedLessons: [],
    completedExercises: [],
    lessonScores: {},
    totalPracticeMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    achievements: [],
    vocalAssessment: null,
    sessionHistory: [],
  };
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
}

export function loadProgress(userId: string): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.userId === userId) return parsed;
    }
  } catch { /* ignore */ }
  return createInitialProgress(userId);
}

// ─── Operaciones de progreso ──────────────────────────────────

export function completeExercise(
  progress: UserProgress,
  exerciseId: string,
): UserProgress {
  if (progress.completedExercises.includes(exerciseId)) return progress;
  return { ...progress, completedExercises: [...progress.completedExercises, exerciseId] };
}

export function completeLesson(
  progress: UserProgress,
  lessonId: string,
  score: number,
): UserProgress {
  const updated = {
    ...progress,
    completedLessons: progress.completedLessons.includes(lessonId)
      ? progress.completedLessons
      : [...progress.completedLessons, lessonId],
    lessonScores: { ...progress.lessonScores, [lessonId]: score },
  };
  return checkAndUnlockAchievements(updated);
}

export function addPracticeSession(
  progress: UserProgress,
  session: Omit<PracticeSession, 'id'>,
): UserProgress {
  const newSession: PracticeSession = {
    ...session,
    id: `session-${Date.now()}`,
  };

  const today = new Date().toISOString().split('T')[0];
  const lastDate = progress.lastPracticeDate;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = progress.currentStreak;
  if (lastDate === today) {
    // misma sesión de hoy, no cambia streak
  } else if (lastDate === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  return {
    ...progress,
    totalPracticeMinutes: progress.totalPracticeMinutes + session.durationMinutes,
    currentStreak: streak,
    longestStreak: Math.max(progress.longestStreak, streak),
    lastPracticeDate: today,
    sessionHistory: [...progress.sessionHistory, newSession].slice(-100), // mantener últimas 100
  };
}

export function saveAssessment(
  progress: UserProgress,
  assessment: VocalAssessmentResult,
): UserProgress {
  return { ...progress, vocalAssessment: assessment };
}

// ─── Logros ───────────────────────────────────────────────────

const ACHIEVEMENTS = [
  {
    id: 'first-breath',
    condition: (p: UserProgress) => p.completedExercises.includes('ex-breath-sss'),
  },
  {
    id: 'first-note',
    condition: (p: UserProgress) => p.completedExercises.includes('ex-hum-a3'),
  },
  {
    id: 'level-1-complete',
    condition: (p: UserProgress) =>
      p.completedLessons.includes('l1-breathing-basics') &&
      p.completedLessons.includes('l1-posture') &&
      p.completedLessons.includes('l1-jaw-relax'),
  },
  {
    id: 'streak-7',
    condition: (p: UserProgress) => p.currentStreak >= 7,
  },
  {
    id: 'streak-30',
    condition: (p: UserProgress) => p.currentStreak >= 30,
  },
  {
    id: 'first-hour',
    condition: (p: UserProgress) => p.totalPracticeMinutes >= 60,
  },
  {
    id: 'diagnosed',
    condition: (p: UserProgress) => p.vocalAssessment !== null,
  },
];

function checkAndUnlockAchievements(progress: UserProgress): UserProgress {
  const newAchievements = ACHIEVEMENTS.filter(
    a => !progress.achievements.includes(a.id) && a.condition(progress),
  ).map(a => a.id);

  if (newAchievements.length === 0) return progress;
  return { ...progress, achievements: [...progress.achievements, ...newAchievements] };
}

// ─── Estadísticas de display ──────────────────────────────────

export function getWeeklyData(progress: UserProgress): { day: string; minutes: number }[] {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const result = days.map(day => ({ day, minutes: 0 }));

  const now = new Date();
  progress.sessionHistory
    .filter(s => {
      const d = new Date(s.date);
      return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
    })
    .forEach(s => {
      const d = new Date(s.date);
      result[d.getDay()].minutes += s.durationMinutes;
    });

  return result;
}

export function getLevelProgress(progress: UserProgress, levelId: number): number {
  const { CURRICULUM } = require('./curriculum') as { CURRICULUM: import('@/types').Level[] };
  const level = CURRICULUM.find(l => l.id === levelId);
  if (!level || level.lessons.length === 0) return 0;

  const completed = level.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
  return Math.round((completed / level.lessons.length) * 100);
}
