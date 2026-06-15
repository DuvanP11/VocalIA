'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { useHydrated } from '@/hooks/useHydrated';
import { BottomNav, TopBar } from '@/components/layout/Navigation';
import { Card, Badge } from '@/components/ui';
import { VOICE_TYPE_INFO } from '@/lib/audio/noteUtils';
import { Icon } from '@/components/ui/Icon';
import { formatMinutes } from '@/lib/utils';

const GOAL_LABELS: Record<string, { label: string; icon: string }> = {
  'sing-in-tune':       { label: 'Cantar afinado',   icon: '🎯' },
  'improve-power':      { label: 'Más potencia',      icon: '💪' },
  'higher-notes':       { label: 'Notas agudas',      icon: '⬆️' },
  'lower-notes':        { label: 'Notas graves',      icon: '⬇️' },
  'audition-prep':      { label: 'Audiciones',        icon: '🎭' },
  'hobby':              { label: 'Por diversión',     icon: '😄' },
  'improve-expression': { label: 'Expresividad',      icon: '🎨' },
};

const EXP_LABELS: Record<string, string> = {
  'absolute-beginner': 'Principiante absoluto',
  'beginner':          'Principiante',
  'intermediate':      'Intermedio',
  'advanced':          'Avanzado',
};

export default function ProfilePage() {
  const router = useRouter();
  const { isOnboarded, profile, progress, logout } = useAppStore();
  const hydrated = useHydrated();

  function handleLogout() {
    const hasAccount = typeof window !== 'undefined' && !!localStorage.getItem('vocalIA:token');
    const msg = hasAccount
      ? '¿Cerrar sesión? Podrás ingresar de nuevo con tu cuenta de Google.'
      : '¿Cerrar sesión? Tu progreso guardado localmente se borrará porque no tienes cuenta vinculada.';
    if (!confirm(msg)) return;
    logout();
    router.replace('/');
  }

  useEffect(() => {
    if (hydrated && !isOnboarded) router.replace('/');
  }, [hydrated, isOnboarded, router]);

  if (!hydrated || !profile || !progress) return (
    <div className="min-h-dvh bg-[#080a12] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const assessment = progress.vocalAssessment;
  const vInfo = assessment ? VOICE_TYPE_INFO[assessment.voiceType] : null;

  return (
    <div className="min-h-dvh bg-[#080a12] pb-24 page-enter">
      <TopBar title="Mi Perfil" />

      <div className="px-5 pt-4 space-y-5">
        {/* Avatar + nombre */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-2xl font-black text-white shadow-lg">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{profile.name}</h2>
              <p className="text-sm text-white/40">{EXP_LABELS[profile.experience] ?? 'Cantante'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="info" size="xs">
                  {formatMinutes(progress.totalPracticeMinutes)} practicados
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Objetivos */}
        <Card className="p-4">
          <h3 className="text-sm font-bold text-white/60 mb-3">Mis objetivos</h3>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map(goal => {
              const g = GOAL_LABELS[goal];
              return g ? (
                <span key={goal} className="flex items-center gap-1.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg px-2.5 py-1 text-xs font-medium">
                  {g.icon} {g.label}
                </span>
              ) : null;
            })}
          </div>
        </Card>

        {/* Meta diaria */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white/60">Meta diaria</h3>
              <p className="text-2xl font-black text-white mt-1">{profile.dailyGoalMinutes} minutos</p>
            </div>
            <Icon name="stopwatch" size={30} />
          </div>
        </Card>

        {/* Tipo de voz */}
        {assessment && vInfo ? (
          <Card className="p-4">
            <h3 className="text-sm font-bold text-white/60 mb-3">Mi voz</h3>
            <div className="flex items-center gap-4">
              <Icon name="microphone" size={36} />
              <div>
                <p className="text-xl font-black" style={{ color: vInfo.color }}>
                  {vInfo.label}
                </p>
                <p className="text-xs text-white/40 font-mono">
                  {assessment.range.lowestNote} — {assessment.range.highestNote}
                </p>
                <p className="text-xs text-white/30 mt-0.5">{vInfo.rangeLabel}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Link href="/assessment">
            <Card className="p-4 border-dashed border-white/10">
              <div className="flex items-center gap-3 text-white/40">
                <Icon name="microscope" size={22} />
                <p className="text-sm">Realiza el diagnóstico vocal →</p>
              </div>
            </Card>
          </Link>
        )}

        {/* Sobre VocalIA */}
        <Card className="p-4">
          <h3 className="text-sm font-bold text-white/60 mb-3">Sobre VocalIA</h3>
          <div className="space-y-2">
            {[
              { label: 'Versión', value: '1.0.0 MVP' },
              { label: 'Motor audio', value: 'pitchy / Web Audio API' },
              { label: 'Visión', value: 'MediaPipe Face Mesh' },
              { label: 'Datos', value: 'Solo local — 100% privado' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-white/40">{item.label}</span>
                <span className="text-white/60 font-mono text-xs">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 active:bg-rose-500/15 text-rose-400 font-semibold text-sm transition-all duration-200"
        >
          <Icon name="lock" size={16} glow={false} />
          Cerrar sesión
        </button>

        {/* Créditos */}
        <p className="text-center text-xs text-white/20 pb-4">
          VocalIA · Construido con 💜 y Next.js 14
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
