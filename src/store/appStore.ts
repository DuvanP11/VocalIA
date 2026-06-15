'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserProgress, PitchResult, VocalAssessmentResult } from '@/types';
import {
  createInitialProgress,
  completeExercise,
  completeLesson,
  addPracticeSession,
  saveAssessment,
} from '@/lib/training/progressStore';
import { generateId } from '@/lib/utils';

interface AppState {
  // Perfil
  profile: UserProfile | null;
  isOnboarded: boolean;

  // Progreso
  progress: UserProgress | null;

  // Hydration guard (Zustand persist + Next.js SSR)
  _hasHydrated: boolean;

  // Audio en tiempo real (no persistido)
  currentPitch: PitchResult | null;
  isListening: boolean;

  // Acciones — Perfil
  setupProfile: (data: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;

  // Acciones — Progreso
  setProgress: (progress: UserProgress) => void;
  initProgress: () => void;
  markExerciseDone: (exerciseId: string) => void;
  markLessonDone: (lessonId: string, score: number) => void;
  recordSession: (data: Parameters<typeof addPracticeSession>[1]) => void;
  setAssessment: (result: VocalAssessmentResult) => void;

  // Acciones — Audio UI
  setPitch: (pitch: PitchResult | null) => void;
  setListening: (listening: boolean) => void;

  // Sesión
  logout: () => void;

  // Hydration
  setHasHydrated: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      isOnboarded: false,
      progress: null,
      _hasHydrated: false,
      currentPitch: null,
      isListening: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setupProfile: (data) => {
        const profile: UserProfile = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({ profile });
      },

      setProfile: (profile) => set({ profile, isOnboarded: true }),

      setProgress: (progress) => set({ progress }),

      completeOnboarding: () => {
        set({ isOnboarded: true });
        get().initProgress();
      },

      initProgress: () => {
        const { profile, progress } = get();
        if (progress || !profile) return;
        set({ progress: createInitialProgress(profile.id) });
      },

      markExerciseDone: (exerciseId) => {
        const { progress } = get();
        if (!progress) return;
        set({ progress: completeExercise(progress, exerciseId) });
      },

      markLessonDone: (lessonId, score) => {
        const { progress } = get();
        if (!progress) return;
        set({ progress: completeLesson(progress, lessonId, score) });
      },

      recordSession: (data) => {
        const { progress } = get();
        if (!progress) return;
        set({ progress: addPracticeSession(progress, data) });
      },

      setAssessment: (result) => {
        const { progress } = get();
        if (!progress) return;
        set({ progress: saveAssessment(progress, result) });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vocalIA:token');
          localStorage.removeItem('vocalIA:coachingPlan');
        }
        set({ profile: null, isOnboarded: false, progress: null, currentPitch: null });
      },

      setPitch: (pitch) => set({ currentPitch: pitch }),
      setListening: (listening) => set({ isListening: listening }),
    }),
    {
      name: 'vocalIA-store',
      // Solo persistir perfil y progreso, no el pitch en tiempo real
      partialize: (state) => ({
        profile: state.profile,
        isOnboarded: state.isOnboarded,
        progress: state.progress,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
