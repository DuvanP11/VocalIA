'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useHydrated } from '@/hooks/useHydrated';
import { BottomNav, TopBar } from '@/components/layout/Navigation';
import { Card, ProgressBar, Badge } from '@/components/ui';
import { CURRICULUM } from '@/lib/training/curriculum';
import { LEVEL_COLORS } from '@/lib/utils';
import { getLevelProgress } from '@/lib/training/progressStore';
import { Icon } from '@/components/ui/Icon';

export default function TrainingPage() {
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

  return (
    <div className="min-h-dvh bg-[#080a12] pb-24 page-enter">
      <TopBar title="Entrenar" subtitle="Elige tu lección" />

      <div className="px-5 pt-4 space-y-4">
        {CURRICULUM.map((level, idx) => {
          const pct = getLevelProgress(progress, level.id);
          const colors = LEVEL_COLORS[level.id];
          const isLocked =
            level.unlockRequires !== null &&
            getLevelProgress(progress, level.unlockRequires) < 100 &&
            progress.currentLevel < level.id;

          return (
            <div key={level.id}>
              {/* Cabecera del nivel */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {isLocked ? <Icon name="lock" size={14} glow={false} /> : pct === 100 ? '✓' : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{level.title}</span>
                    {pct === 100 && <Badge variant="success" size="xs">Completado</Badge>}
                    {isLocked && <Badge variant="default" size="xs">Bloqueado</Badge>}
                  </div>
                  <p className="text-xs text-white/40">{level.subtitle}</p>
                </div>
                <span className={`text-sm font-mono ${colors.text}`}>{pct}%</span>
              </div>

              {/* Lecciones */}
              <div className="space-y-2 pl-2 ml-4 border-l border-white/[0.05]">
                {level.lessons.length === 0 ? (
                  <div className="py-4 pl-3 text-sm text-white/20 italic">
                    Próximamente en esta fase...
                  </div>
                ) : (
                  level.lessons.map(lesson => {
                    const isDone = progress.completedLessons.includes(lesson.id);
                    const score = progress.lessonScores[lesson.id];

                    return (
                      <Link
                        key={lesson.id}
                        href={isLocked ? '#' : `/training/${lesson.id}`}
                        className={isLocked ? 'pointer-events-none opacity-40' : ''}
                      >
                        <Card
                          className={`p-3.5 ml-2 transition-all ${
                            isDone
                              ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                              : 'hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl flex-shrink-0">{lesson.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-white leading-tight">
                                  {lesson.title}
                                </span>
                                {isDone && score !== undefined && (
                                  <Badge
                                    variant={score >= 90 ? 'success' : score >= 70 ? 'info' : 'warning'}
                                    size="xs"
                                  >
                                    {score}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-white/40 truncate">{lesson.subtitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-white/25 inline-flex items-center gap-0.5"><Icon name="stopwatch" size={10} glow={false} /> {lesson.duration} min</span>
                                <span className="text-[10px] text-white/25">·</span>
                                <span className="text-[10px] text-white/25 capitalize">{lesson.type.replace('-', ' ')}</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {isDone ? (
                                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">✓</div>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-white/30 text-sm">→</div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })
                )}
              </div>

              {idx < CURRICULUM.length - 1 && <div className="h-2" />}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
