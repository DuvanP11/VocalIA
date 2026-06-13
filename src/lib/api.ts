// ─── Cliente API para VocalIA backend ───────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const TOKEN_KEY = 'vocalIA:token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Tipos devueltos por la API ──────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  goals: string[];
  experience: string;
  dailyGoalMinutes: number;
  createdAt: string;
}

export interface ApiProgress {
  id: string;
  userId: string;
  currentLevel: number;
  completedLessons: string[];
  completedExercises: string[];
  lessonScores: Record<string, number>;
  totalPracticeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  achievements: string[];
  vocalAssessment: unknown;
}

export interface ApiProgressFull {
  progress: ApiProgress | null;
  sessions: Array<{
    id: string;
    date: string;
    durationMinutes: number;
    exercisesCompleted: number;
    avgPitchAccuracy: number;
    notesReached: string[];
    lessonId?: string;
  }>;
}

// ─── Endpoints ───────────────────────────────────────────────

export const api = {
  googleLoginUrl: `${API_URL}/auth/google`,

  auth: {
    me: () => request<ApiUser>('/auth/me'),
  },

  users: {
    update: (data: Partial<ApiUser>) =>
      request<ApiUser>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  progress: {
    get: () => request<ApiProgressFull>('/progress'),
    sync: (progress: Omit<ApiProgress, 'id' | 'userId'>) =>
      request<ApiProgress>('/progress', {
        method: 'PUT',
        body: JSON.stringify(progress),
      }),
    addSession: (session: {
      durationMinutes: number;
      exercisesCompleted: number;
      avgPitchAccuracy: number;
      notesReached: string[];
      lessonId?: string;
    }) =>
      request('/progress/session', {
        method: 'POST',
        body: JSON.stringify(session),
      }),
  },

  coach: {
    latest: () => request<{ id: string; plan: unknown; analysis: unknown; createdAt: string } | null>('/coach/latest'),
    save: (plan: unknown, analysis: unknown) =>
      request('/coach', {
        method: 'POST',
        body: JSON.stringify({ plan, analysis }),
      }),
  },
};
