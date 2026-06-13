import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Formatea el porcentaje con color semántico
export function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-sky-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

export function scoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500/20 border-emerald-500/40';
  if (score >= 75) return 'bg-sky-500/20 border-sky-500/40';
  if (score >= 60) return 'bg-amber-500/20 border-amber-500/40';
  return 'bg-rose-500/20 border-rose-500/40';
}

export const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string; glow: string }> = {
  1: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
  2: { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/30',     glow: 'shadow-sky-500/20'     },
  3: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   glow: 'shadow-amber-500/20'   },
  4: { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30',  glow: 'shadow-purple-500/20'  },
  5: { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/30',    glow: 'shadow-rose-500/20'    },
};

export function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
