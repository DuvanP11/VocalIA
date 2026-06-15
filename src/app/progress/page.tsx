'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useHydrated } from '@/hooks/useHydrated';
import { BottomNav, TopBar } from '@/components/layout/Navigation';
import { Card, ScoreRing, Badge, SectionHeader } from '@/components/ui';
import { getWeeklyData } from '@/lib/training/progressStore';
import { CURRICULUM } from '@/lib/training/curriculum';
import { formatMinutes, pluralize } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Cell, Tooltip,
} from 'recharts';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

const ACHIEVEMENTS_CATALOG: { id: string; iconName: IconName; title: string; desc: string; color: string }[] = [
  { id: 'first-breath',     iconName: 'wave',       title: 'Primera respiración',  desc: 'Completaste el ejercicio de respiración',   color: '#38bdf8' },
  { id: 'first-note',       iconName: 'music-note', title: 'Primera nota',          desc: 'Cantaste tu primera nota con el mic',       color: '#7c6aff' },
  { id: 'level-1-complete', iconName: 'graduation', title: 'Nivel 1 completado',   desc: 'Dominaste los fundamentos',                 color: '#34d399' },
  { id: 'streak-7',         iconName: 'fire',       title: 'Semana de fuego',       desc: '7 días seguidos de práctica',               color: '#f59e0b' },
  { id: 'streak-30',        iconName: 'diamond',    title: 'Mes de diamante',       desc: '30 días seguidos de práctica',              color: '#818cf8' },
  { id: 'first-hour',       iconName: 'stopwatch',  title: 'Primera hora',          desc: 'Acumulaste 1 hora de práctica total',      color: '#f43f5e' },
  { id: 'diagnosed',        iconName: 'microscope', title: 'Diagnóstico vocal',     desc: 'Completaste el análisis inicial de tu voz', color: '#fb923c' },
];

export default function ProgressPage() {
  const router = useRouter();
  const { isOnboarded, progress } = useAppStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !isOnboarded) router.replace('/');
  }, [hydrated, isOnboarded, router]);

  if (!hydrated || !progress) return (
    <div className="min-h-dvh bg-[#080a12] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const weeklyData = getWeeklyData(progress);
  const totalWeekMin = weeklyData.reduce((a, b) => a + b.minutes, 0);

  // Datos de progreso por lección (historial de puntajes)
  const scoreHistory = Object.entries(progress.lessonScores)
    .slice(-10)
    .map(([lessonId, score]) => {
      const lessonData = CURRICULUM.flatMap(l => l.lessons).find(l => l.id === lessonId);
      return { name: lessonData?.title.slice(0, 12) ?? lessonId.slice(0, 8), score };
    });

  const avgScore = scoreHistory.length > 0
    ? Math.round(scoreHistory.reduce((a, b) => a + b.score, 0) / scoreHistory.length)
    : 0;

  const unlockedAchievements = ACHIEVEMENTS_CATALOG.filter(a =>
    progress.achievements.includes(a.id),
  );
  const lockedAchievements = ACHIEVEMENTS_CATALOG.filter(a =>
    !progress.achievements.includes(a.id),
  );

  return (
    <div className="min-h-dvh bg-[#080a12] pb-24 page-enter">
      <TopBar title="Mi Progreso" subtitle="Estadísticas y logros" />

      <div className="px-5 pt-4 space-y-6">
        {/* ─── STATS PRINCIPALES ─── */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <div className="text-4xl font-black text-violet-400">{progress.currentStreak}</div>
            <div className="text-xs text-white/40 mt-1 flex items-center justify-center gap-0.5">
              días seguidos <Icon name="fire" size={11} glow={false} />
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-4xl font-black text-sky-400">{progress.longestStreak}</div>
            <div className="text-xs text-white/40 mt-1 flex items-center justify-center gap-0.5">
              racha más larga <Icon name="trophy" size={11} glow={false} />
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-black text-emerald-400">{formatMinutes(progress.totalPracticeMinutes)}</div>
            <div className="text-xs text-white/40 mt-1">tiempo total</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-black text-amber-400">{progress.completedLessons.length}</div>
            <div className="text-xs text-white/40 mt-1">{pluralize(progress.completedLessons.length, 'lección', 'lecciones')}</div>
          </Card>
        </div>

        {/* ─── ACTIVIDAD SEMANAL ─── */}
        <div>
          <SectionHeader
            title="Esta semana"
            subtitle={`${formatMinutes(totalWeekMin)} de práctica`}
          />
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={weeklyData} barCategoryGap="30%">
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b', border: '1px solid #334155',
                    borderRadius: '8px', fontSize: '11px', color: '#fff',
                  }}
                  formatter={(v) => [`${v ?? 0} min`, '']}
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={entry.minutes > 0 ? '#7c6aff' : 'rgba(255,255,255,0.06)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ─── PUNTAJES DE LECCIONES ─── */}
        {scoreHistory.length > 0 && (
          <div>
            <SectionHeader
              title="Puntajes recientes"
              subtitle={`Promedio: ${avgScore}%`}
              action={<ScoreRing score={avgScore} size={40} />}
            />
            <Card className="p-4">
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={scoreHistory}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b', border: '1px solid #334155',
                      borderRadius: '8px', fontSize: '11px', color: '#fff',
                    }}
                    formatter={(v) => [`${v ?? 0}%`, 'Puntaje']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#7c6aff"
                    strokeWidth={2}
                    dot={{ fill: '#7c6aff', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ─── LOGROS ─── */}
        <div>
          <SectionHeader
            title="Logros"
            subtitle={`${unlockedAchievements.length} de ${ACHIEVEMENTS_CATALOG.length} desbloqueados`}
          />
          <div className="space-y-2">
            {unlockedAchievements.map(a => (
              <Card key={a.id} className="p-3.5 border-white/[0.1] bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${a.color}20` }}
                  >
                    <Icon name={a.iconName} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{a.title}</span>
                      <Badge variant="success" size="xs">✓</Badge>
                    </div>
                    <p className="text-xs text-white/40">{a.desc}</p>
                  </div>
                </div>
              </Card>
            ))}

            {lockedAchievements.length > 0 && (
              <>
                <p className="text-xs text-white/20 text-center py-1">Por desbloquear</p>
                {lockedAchievements.map(a => (
                  <Card key={a.id} className="p-3.5 opacity-40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 grayscale">
                        <Icon name="lock" size={20} glow={false} />
                      </div>
                      <div>
                        <div className="font-semibold text-white/60 text-sm">{a.title}</div>
                        <p className="text-xs text-white/30">{a.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
