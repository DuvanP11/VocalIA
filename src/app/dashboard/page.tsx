'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useHydrated } from '@/hooks/useHydrated';
import { BottomNav } from '@/components/layout/Navigation';
import { Card, ProgressBar, Badge, SectionHeader } from '@/components/ui';
import { CURRICULUM } from '@/lib/training/curriculum';
import { VOICE_TYPE_INFO } from '@/lib/audio/noteUtils';
import { LEVEL_COLORS, formatMinutes } from '@/lib/utils';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { getWeeklyData, getLevelProgress } from '@/lib/training/progressStore';

export default function DashboardPage() {
  const router = useRouter();
  const { profile, progress, isOnboarded } = useAppStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !isOnboarded) router.replace('/');
  }, [hydrated, isOnboarded, router]);

  if (!hydrated || !profile || !progress) return (
    <div className="min-h-dvh bg-[#080a12] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const streak = progress.currentStreak;
  const totalMin = progress.totalPracticeMinutes;
  const assessment = progress.vocalAssessment;
  const weeklyData = getWeeklyData(progress);
  const completedLessonsCount = progress.completedLessons.length;

  // Próxima lección recomendada
  const nextLesson = (() => {
    for (const level of CURRICULUM) {
      for (const lesson of level.lessons) {
        if (!progress.completedLessons.includes(lesson.id)) {
          return { lesson, level };
        }
      }
    }
    return null;
  })();

  return (
    <div className="min-h-dvh bg-[#080a12] pb-24 page-enter">
      {/* Header personalizado */}
      <header className="px-5 pt-8 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 text-sm">Hola, {profile.name} 👋</p>
            <h1 className="text-2xl font-black text-white mt-0.5">Tu Progreso</h1>
          </div>
          <div className="text-right">
            {streak > 0 ? (
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-2">
                <div className="text-xl font-black text-amber-400">{streak}</div>
                <div className="text-[10px] text-amber-400/70">días 🔥</div>
              </div>
            ) : (
              <Link href="/training">
                <div className="bg-violet-600/15 border border-violet-500/30 rounded-xl px-3 py-2 text-center">
                  <div className="text-xs text-violet-400 font-semibold">Empieza</div>
                  <div className="text-[10px] text-violet-400/70">hoy 🚀</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="px-5 space-y-6">
        {/* ─── STATS ROW ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Lecciones', value: completedLessonsCount, icon: '📚', color: 'text-violet-400' },
            { label: 'Tiempo', value: formatMinutes(totalMin), icon: '⏱️', color: 'text-sky-400' },
            { label: 'Logros', value: progress.achievements.length, icon: '🏆', color: 'text-amber-400' },
          ].map(stat => (
            <Card key={stat.label} className="p-3 text-center">
              <div className="text-xl">{stat.icon}</div>
              <div className={`text-lg font-black mt-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-white/40">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* ─── PRÓXIMA LECCIÓN ─── */}
        {nextLesson && (
          <Link href={`/training/${nextLesson.lesson.id}`}>
            <Card glow className="p-4 border-violet-500/20 bg-gradient-to-r from-violet-600/15 to-purple-600/10 hover:from-violet-600/20 active:from-violet-600/25 transition-all">
              <div className="flex items-center gap-1 mb-3">
                <Badge variant="info" size="xs">CONTINÚA AQUÍ</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{nextLesson.lesson.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40">{nextLesson.level.title}</p>
                  <h3 className="font-bold text-white text-base leading-tight">{nextLesson.lesson.title}</h3>
                  <p className="text-xs text-white/50 mt-0.5">{nextLesson.lesson.subtitle}</p>
                </div>
                <div className="text-white/30 text-xl flex-shrink-0">→</div>
              </div>
            </Card>
          </Link>
        )}

        {/* ─── ACTIVIDAD SEMANAL ─── */}
        <div>
          <SectionHeader title="Esta semana" subtitle="Minutos de práctica" />
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={weeklyData} barCategoryGap="25%">
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={24}>
                  {weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.minutes > 0 ? '#7c6aff' : 'rgba(255,255,255,0.05)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ─── NIVELES ─── */}
        <div>
          <SectionHeader
            title="Niveles"
            action={
              <Link href="/training" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Ver todos →
              </Link>
            }
          />
          <div className="space-y-2">
            {CURRICULUM.map(level => {
              const pct = getLevelProgress(progress, level.id);
              const colors = LEVEL_COLORS[level.id];
              const isLocked = level.unlockRequires !== null &&
                getLevelProgress(progress, level.unlockRequires) < 100 &&
                progress.currentLevel < level.id;

              return (
                <Link
                  key={level.id}
                  href={isLocked ? '/training' : `/training?level=${level.id}`}
                  className={`block ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <Card className={`p-3.5 ${colors.bg} ${colors.border}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl flex-shrink-0">{level.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-bold ${colors.text}`}>{level.title}</span>
                          {isLocked && <span className="text-[10px] text-white/30">🔒 Bloqueado</span>}
                          {pct === 100 && <Badge variant="success" size="xs">✓ Completado</Badge>}
                        </div>
                        <ProgressBar
                          value={pct}
                          color={`bg-current ${colors.text}`}
                          height={3}
                        />
                      </div>
                      <span className={`text-xs font-mono flex-shrink-0 ${colors.text}`}>{pct}%</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── IA COACH ─── */}
        <Link href="/coach">
          <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-600/15 to-violet-600/10 p-4 hover:from-indigo-600/20 hover:to-violet-600/15 transition-all active:scale-[0.99]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">IA Coach</span>
                  <span className="text-[9px] text-white/30 bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20">Nuevo</span>
                </div>
                <h3 className="font-bold text-white text-sm">Plan personalizado esta semana</h3>
                <p className="text-[11px] text-white/40 mt-0.5">Ejercicios basados en tus debilidades detectadas</p>
              </div>
              <span className="text-white/30 text-xl flex-shrink-0">→</span>
            </div>
          </div>
        </Link>

        {/* ─── VOZ ─── */}
        {assessment ? (
          <div>
            <SectionHeader
              title="Tu voz"
              action={
                <Link href="/assessment" className="text-xs text-violet-400">
                  Rediagnosticar
                </Link>
              }
            />
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎤</div>
                <div>
                  <p className="text-xs text-white/40">Tipo detectado</p>
                  <p className="text-xl font-black" style={{
                    color: VOICE_TYPE_INFO[assessment.voiceType].color,
                  }}>
                    {VOICE_TYPE_INFO[assessment.voiceType].label}
                  </p>
                  <p className="text-xs text-white/40 font-mono mt-0.5">
                    {assessment.range.lowestNote} — {assessment.range.highestNote}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Link href="/assessment">
            <Card className="p-4 border-dashed border-white/10 hover:border-violet-500/30 transition-colors">
              <div className="flex items-center gap-3 text-white/40">
                <span className="text-2xl">🔬</span>
                <div>
                  <p className="font-semibold text-white/60">Diagnóstico vocal pendiente</p>
                  <p className="text-xs">Descubre tu tipo de voz →</p>
                </div>
              </div>
            </Card>
          </Link>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
