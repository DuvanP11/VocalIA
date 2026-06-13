'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { api, setToken } from '@/lib/api';
import type { UserProfile, UserProgress, LevelId } from '@/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const store  = useAppStore();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const hash   = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const token  = params.get('token');

    if (!token) { router.replace('/'); return; }

    setToken(token);

    (async () => {
      try {
        const user = await api.auth.me();

        // Mapear usuario de la API al perfil local
        const profile: UserProfile = {
          id:              user.id,
          name:            user.name,
          avatarUrl:       user.avatarUrl,
          goals:           user.goals as UserProfile['goals'],
          experience:      user.experience as UserProfile['experience'],
          dailyGoalMinutes: user.dailyGoalMinutes,
          createdAt:       user.createdAt,
        };

        // Si ya hay un perfil local, usarlo como base (preservar progreso local)
        const currentProgress = store.progress;

        // Cargar progreso de la API
        const { progress: apiProgress, sessions } = await api.progress.get();

        let progress: UserProgress | null = null;

        if (apiProgress) {
          progress = {
            userId:              user.id,
            currentLevel:        apiProgress.currentLevel as LevelId,
            completedLessons:    apiProgress.completedLessons,
            completedExercises:  apiProgress.completedExercises,
            lessonScores:        apiProgress.lessonScores,
            totalPracticeMinutes: apiProgress.totalPracticeMinutes,
            currentStreak:       apiProgress.currentStreak,
            longestStreak:       apiProgress.longestStreak,
            lastPracticeDate:    apiProgress.lastPracticeDate,
            achievements:        apiProgress.achievements,
            vocalAssessment:     apiProgress.vocalAssessment as any,
            sessionHistory:      sessions.map(s => ({
              id: s.id,
              date: s.date,
              durationMinutes: s.durationMinutes,
              exercisesCompleted: s.exercisesCompleted,
              avgPitchAccuracy: s.avgPitchAccuracy,
              notesReached: s.notesReached,
              lessonId: s.lessonId,
            })),
          };
        } else if (currentProgress) {
          // Primera vez con Google pero ya tenía progreso local → sincronizar a la nube
          await api.progress.sync({
            currentLevel:        currentProgress.currentLevel,
            completedLessons:    currentProgress.completedLessons,
            completedExercises:  currentProgress.completedExercises,
            lessonScores:        currentProgress.lessonScores,
            totalPracticeMinutes: currentProgress.totalPracticeMinutes,
            currentStreak:       currentProgress.currentStreak,
            longestStreak:       currentProgress.longestStreak,
            lastPracticeDate:    currentProgress.lastPracticeDate,
            achievements:        currentProgress.achievements,
            vocalAssessment:     currentProgress.vocalAssessment,
          });
          progress = { ...currentProgress, userId: user.id };
        }

        store.setProfile(profile);
        if (progress) store.setProgress(progress);

        // Si el perfil no tiene goals (usuario nuevo en Google), ir al onboarding
        if (!user.goals?.length) {
          router.replace('/onboarding');
        } else {
          router.replace('/dashboard');
        }
      } catch {
        setStatus('error');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'error') {
    return (
      <div className="min-h-dvh bg-[#080a12] flex flex-col items-center justify-center gap-4 text-center px-6">
        <span className="text-4xl">⚠️</span>
        <p className="text-white font-semibold">Error al iniciar sesión</p>
        <button
          onClick={() => router.replace('/')}
          className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#080a12] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-white/50">Conectando con tu cuenta…</p>
    </div>
  );
}
