'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { useHydrated } from '@/hooks/useHydrated';
import { TopBar, BottomNav } from '@/components/layout/Navigation';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import {
  analyzeWeaknesses,
  type WeaknessAnalysis,
  type CoachingPlan,
  type CoachingExercise,
  type WeaknessArea,
} from '@/lib/training/adaptiveCoach';
import { songStorage } from '@/lib/songStorage';
import type { SongPerformance } from '@/types';

// ─── Constantes de presentación ──────────────────────────────

const SEVERITY_STYLE: Record<WeaknessArea['severity'], { dot: string; badge: string; label: string }> = {
  high:   { dot: 'bg-rose-500',   badge: 'text-rose-400 bg-rose-500/10',   label: 'Alta' },
  medium: { dot: 'bg-amber-500',  badge: 'text-amber-400 bg-amber-500/10', label: 'Media' },
  low:    { dot: 'bg-sky-500',    badge: 'text-sky-400 bg-sky-500/10',     label: 'Baja' },
};

const CATEGORY_ICON: Record<WeaknessArea['category'], IconName> = {
  pitch:             'music-note',
  rhythm:            'drum',
  breathing:         'lungs',
  range:             'satellite',
  consistency:       'stopwatch',
  'lesson-progress': 'books',
};

const TYPE_ICON: Record<CoachingExercise['type'], IconName> = {
  breathing: 'lungs',
  pitch:     'music-note',
  rhythm:    'drum',
  range:     'satellite',
  'warm-up': 'fire',
};

const TYPE_COLOR: Record<CoachingExercise['type'], string> = {
  breathing: 'text-sky-400 bg-sky-500/10',
  pitch:     'text-violet-400 bg-violet-500/10',
  rhythm:    'text-amber-400 bg-amber-500/10',
  range:     'text-emerald-400 bg-emerald-500/10',
  'warm-up': 'text-orange-400 bg-orange-500/10',
};

const DIFF_LABEL: Record<CoachingExercise['difficulty'], string> = {
  easy:   'Fácil',
  medium: 'Medio',
  hard:   'Difícil',
};

const DIFF_COLOR: Record<CoachingExercise['difficulty'], string> = {
  easy:   'text-emerald-400',
  medium: 'text-amber-400',
  hard:   'text-rose-400',
};

function scoreColor(score: number): string {
  if (score >= 80) return '#34d399'; // emerald
  if (score >= 65) return '#38bdf8'; // sky
  if (score >= 50) return '#fbbf24'; // amber
  return '#fb7185'; // rose
}

const CACHE_KEY = 'vocalIA:coachingPlan';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h

interface CachedData {
  plan: CoachingPlan;
  analysis: WeaknessAnalysis;
  generatedAt: number;
}

// ─── Componentes menores ─────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black" style={{ color }}>{score}</span>
        <span className="text-[9px] text-white/30 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function ExerciseCard({ ex }: { ex: CoachingExercise }) {
  const [expanded, setExpanded] = useState(false);
  const typeStyle = TYPE_COLOR[ex.type] ?? 'text-violet-400 bg-violet-500/10';
  const diffStyle = DIFF_COLOR[ex.difficulty];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full p-4 text-left flex items-start gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
          <Icon name={TYPE_ICON[ex.type]} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeStyle}`}>
              {ex.type.toUpperCase()}
            </span>
            <span className={`text-[10px] font-semibold ${diffStyle}`}>
              {DIFF_LABEL[ex.difficulty]}
            </span>
            <span className="text-[10px] text-white/30 ml-auto flex-shrink-0">
              {ex.durationMinutes} min
            </span>
          </div>
          <h3 className="font-semibold text-white text-sm leading-tight">{ex.title}</h3>
          <p className="text-xs text-white/40 mt-0.5 leading-snug">{ex.description}</p>
        </div>
        <span className={`text-white/30 transition-transform flex-shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05]">
          {/* Instrucciones */}
          <div className="pt-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Instrucciones</p>
            <ol className="space-y-1.5">
              {ex.instructions.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/60 leading-snug">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 text-[9px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Por qué ayuda */}
          <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Por qué ayuda</p>
            <p className="text-xs text-white/60 leading-snug">{ex.whyThisHelps}</p>
          </div>

          {/* Criterio de éxito */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Éxito cuando</p>
            <p className="text-xs text-white/60 leading-snug">{ex.successCriteria}</p>
          </div>

          {/* Botón practicar */}
          <Link
            href="/practice"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 text-xs font-semibold hover:bg-violet-600/30 transition-all active:scale-[0.98]"
          >
            <Icon name="microphone" size={14} /> Practicar ahora
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────

type Phase = 'hydrating' | 'analyzing' | 'loading-plan' | 'done' | 'error';

export default function CoachPage() {
  const router  = useRouter();
  const { profile, progress } = useAppStore();
  const hydrated = useHydrated();

  const [phase,    setPhase]    = useState<Phase>('hydrating');
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [plan,     setPlan]     = useState<CoachingPlan | null>(null);
  const [errMsg,   setErrMsg]   = useState('');

  const generate = useCallback(async (prof = profile, prog = progress) => {
    if (!prof || !prog) return;

    setPhase('analyzing');
    setErrMsg('');

    const songs = await songStorage.listSongs();
    const songPerfs: SongPerformance[] = songs.flatMap(s => s.performances);
    const wAnalysis = analyzeWeaknesses(prog, prof, songPerfs);
    setAnalysis(wAnalysis);

    setPhase('loading-plan');
    try {
      const res = await fetch('/api/adaptive-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wAnalysis),
      });
      const data = await res.json();
      if (!res.ok || !data.plan) throw new Error(data.error ?? 'Error desconocido');

      setPlan(data.plan);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        plan: data.plan, analysis: wAnalysis, generatedAt: Date.now(),
      } satisfies CachedData));
      setPhase('done');
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Error generando el plan');
      setPhase('error');
    }
  }, [profile, progress]);

  useEffect(() => {
    if (!hydrated) return;
    if (!profile || !progress) { router.replace('/'); return; }

    // Check cache
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as CachedData;
        if (Date.now() - cached.generatedAt < CACHE_TTL) {
          setAnalysis(cached.analysis);
          setPlan(cached.plan);
          setPhase('done');
          return;
        }
      }
    } catch { /* ignore */ }

    generate(profile, progress);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearCacheAndRegenerate() {
    localStorage.removeItem(CACHE_KEY);
    setAnalysis(null);
    setPlan(null);
    generate();
  }

  // ── Pantallas de carga ──────────────────────────────────────
  if (phase === 'hydrating') {
    return (
      <div className="min-h-dvh bg-[#080a12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 'analyzing' || phase === 'loading-plan') {
    return (
      <div className="min-h-dvh bg-[#080a12] flex flex-col items-center justify-center gap-6 px-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-violet-500/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center"><Icon name="robot" size={30} /></div>
        </div>
        <div className="text-center space-y-2">
          <p className="font-semibold text-white">
            {phase === 'analyzing' ? 'Analizando tu progreso…' : 'Generando tu plan con IA…'}
          </p>
          <p className="text-xs text-white/40">
            {phase === 'analyzing'
              ? 'Evaluando sesiones, lecciones y canciones'
              : 'Claude está personalizando tus ejercicios'}
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-dvh bg-[#080a12] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <Icon name="warning" size={48} />
        <div>
          <p className="font-semibold text-white mb-1">No se pudo generar el plan</p>
          <p className="text-xs text-white/40">{errMsg}</p>
        </div>
        <button
          onClick={() => generate()}
          className="px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors"
        >
          Intentar de nuevo
        </button>
        <Link href="/dashboard" className="text-xs text-white/30 hover:text-white/60">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!analysis || !plan) return null;

  // ── Vista completa ──────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[#080a12] pb-28">
      <TopBar
        title="IA Coach"
        subtitle="Tu plan personalizado"
        back
        action={
          <button
            onClick={clearCacheAndRegenerate}
            className="text-[11px] text-white/40 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
          >
            ↺ Nuevo
          </button>
        }
      />
      <BottomNav />

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">

        {/* ── Diagnóstico ───────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <div className="flex items-start gap-4 mb-4">
            <ScoreRing score={analysis.overallScore} />
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Diagnóstico</p>
              <h2 className="font-black text-white text-lg leading-tight">
                {analysis.overallScore >= 80
                  ? 'En gran forma'
                  : analysis.overallScore >= 60
                    ? 'Progresando bien'
                    : analysis.overallScore >= 40
                      ? 'En desarrollo'
                      : 'Empezando'}
              </h2>
              <p className="text-xs text-white/40 mt-1">
                {analysis.practiceStats.totalSessions} sesión{analysis.practiceStats.totalSessions !== 1 ? 'es' : ''} · {analysis.practiceStats.totalMinutes} min totales
              </p>
            </div>
          </div>

          {/* Debilidades */}
          {analysis.weaknesses.length > 0 && (
            <div className="space-y-2 mb-3">
              {analysis.weaknesses.map(w => {
                const style = SEVERITY_STYLE[w.severity];
                return (
                  <div key={w.category} className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${style.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white/80 inline-flex items-center gap-1">
                          <Icon name={CATEGORY_ICON[w.category]} size={13} /> {w.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 leading-snug mt-0.5">{w.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fortalezas */}
          {analysis.strengths.length > 0 && (
            <div className="space-y-1.5 pt-3 border-t border-white/[0.05]">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-emerald-400">
                  <span className="text-emerald-500 flex-shrink-0">✓</span>
                  {s}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Plan IA ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-violet-600/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="robot" size={18} />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Plan IA</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed mb-4">{plan.intro}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Foco</p>
              <p className="text-xs font-semibold text-white leading-snug">{plan.focusArea}</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Meta semanal</p>
              <p className="text-xs font-semibold text-white leading-snug">{plan.weekGoal}</p>
            </div>
          </div>
        </section>

        {/* ── Ejercicios ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">
              Ejercicios · <span className="text-violet-400">{plan.exercises.length}</span>
            </h3>
            <span className="text-[10px] text-white/30">Toca para ver instrucciones</span>
          </div>
          <div className="space-y-2">
            {plan.exercises.map(ex => (
              <ExerciseCard key={ex.id} ex={ex} />
            ))}
          </div>
        </section>

        {/* ── Rutina diaria ─────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <h3 className="text-sm font-bold text-white mb-4">Rutina diaria</h3>
          <div className="space-y-4">
            {([
              { iconName: 'fire' as IconName, label: 'Mañana', items: plan.dailyRoutine.morning },
              { iconName: 'star' as IconName, label: 'Noche',  items: plan.dailyRoutine.evening },
            ] as const).map(slot => (
              <div key={slot.label}>
                <p className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1">
                  <Icon name={slot.iconName} size={13} /> {slot.label}
                </p>
                <ul className="space-y-1.5">
                  {slot.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                      <span className="w-1 h-1 rounded-full bg-violet-500/60 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Motivación ────────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <p className="text-sm text-amber-300/80 leading-relaxed italic">
            "{plan.encouragement}"
          </p>
          <p className="text-[10px] text-white/20 mt-2">— Tu coach IA</p>
        </div>

        {/* ── Acciones ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          <Link
            href="/practice"
            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-violet-600/15 border border-violet-500/20 hover:bg-violet-600/20 transition-all"
          >
            <Icon name="microphone" size={22} />
            <span className="text-xs font-semibold text-violet-400">Practicar libre</span>
          </Link>
          <Link
            href="/training"
            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-sky-600/10 border border-sky-500/20 hover:bg-sky-600/15 transition-all"
          >
            <Icon name="graduation" size={22} />
            <span className="text-xs font-semibold text-sky-400">Ir a lecciones</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
