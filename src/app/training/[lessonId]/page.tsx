'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { TopBar } from '@/components/layout/Navigation';
import { Button, Card, ProgressBar, ScoreRing, Badge } from '@/components/ui';
import { TunerDisplay } from '@/components/audio/TunerDisplay';
import { AudioVisualizer } from '@/components/audio/AudioVisualizer';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { getLessonById, getNextLesson } from '@/lib/training/curriculum';
import { centsToColor } from '@/lib/audio/noteUtils';
import type { Exercise, ExerciseType } from '@/types';

type LessonPhase = 'theory' | 'exercise' | 'results';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const { progress, markLessonDone, markExerciseDone, recordSession } = useAppStore();

  const lessonData = getLessonById(lessonId);
  const lesson = lessonData?.lesson;
  const level = lessonData?.level;

  const [phase, setPhase] = useState<LessonPhase>('theory');
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [isExerciseRunning, setIsExerciseRunning] = useState(false);
  const [pitchAccuracies, setPitchAccuracies] = useState<number[]>([]);
  const [exercisesDone, setExercisesDone] = useState<string[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const sessionStartRef = useRef(Date.now());

  const {
    isListening,
    currentPitch,
    start: startMic,
    stop: stopMic,
    getAnalyserNode,
  } = usePitchDetector();

  useEffect(() => {
    if (!lesson) {
      router.replace('/training');
    }
  }, [lesson, router]);

  // Timer del ejercicio
  useEffect(() => {
    if (!isExerciseRunning || exerciseTimeLeft <= 0) return;
    const t = setTimeout(() => setExerciseTimeLeft(tt => tt - 1), 1000);
    return () => clearTimeout(t);
  }, [isExerciseRunning, exerciseTimeLeft]);

  // Auto-terminar ejercicio al llegar a 0
  useEffect(() => {
    if (isExerciseRunning && exerciseTimeLeft === 0) {
      handleExerciseDone();
    }
  }, [exerciseTimeLeft, isExerciseRunning]);

  // Acumular precisión de afinación durante ejercicio con micrófono
  useEffect(() => {
    if (!isListening || !isExerciseRunning || !currentPitch) return;
    if (currentPitch.frequency > 0) {
      const accuracy = Math.max(0, 100 - Math.abs(currentPitch.cents));
      setPitchAccuracies(prev => [...prev, accuracy]);
    }
  }, [currentPitch, isListening, isExerciseRunning]);

  if (!lesson || !level) return null;

  const currentExercise: Exercise | undefined = lesson.exercises[currentExerciseIdx];
  const isLastExercise = currentExerciseIdx === lesson.exercises.length - 1;

  const handleStartExercise = async () => {
    setPitchAccuracies([]);
    setExerciseTimeLeft(currentExercise.duration);
    setIsExerciseRunning(true);
    const nonMicTypes: ExerciseType[] = ['breathing-inhale', 'breathing-exhale'];
    if (!nonMicTypes.includes(currentExercise.type)) {
      await startMic().catch(() => {/* mic opcional */});
    }
  };

  const handleExerciseDone = useCallback(() => {
    setIsExerciseRunning(false);
    stopMic();

    const avgAccuracy = pitchAccuracies.length > 0
      ? Math.round(pitchAccuracies.reduce((a, b) => a + b, 0) / pitchAccuracies.length)
      : 85;

    setExercisesDone(prev => [...prev, currentExercise.id]);
    markExerciseDone(currentExercise.id);

    if (isLastExercise) {
      // Calcular puntaje final
      const score = Math.min(100, Math.max(60, avgAccuracy));
      setFinalScore(score);
      markLessonDone(lessonId, score);

      const durationMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000);
      recordSession({
        date: new Date().toISOString(),
        durationMinutes: Math.max(1, durationMinutes),
        exercisesCompleted: lesson.exercises.length,
        avgPitchAccuracy: avgAccuracy,
        notesReached: [],
        lessonId,
      });

      setPhase('results');
    } else {
      setCurrentExerciseIdx(i => i + 1);
    }
  }, [currentExercise, isLastExercise, pitchAccuracies, lessonId, markExerciseDone, markLessonDone, recordSession, stopMic, lesson]);

  const nextLessonId = getNextLesson(lessonId);

  return (
    <div className="min-h-dvh bg-[#080a12] pb-8 page-enter">
      <TopBar
        title={lesson.title}
        subtitle={level.title}
        back
        action={
          <span className="text-xs text-white/30 font-mono">
            {currentExerciseIdx + 1}/{lesson.exercises.length} ej.
          </span>
        }
      />

      <div className="px-5 pt-4 space-y-5">
        {/* ─── TEORÍA ─── */}
        {phase === 'theory' && (
          <>
            {/* Intro */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{lesson.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
                  <span className="text-xs text-white/40">⏱ {lesson.duration} minutos</span>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{lesson.content.introduction}</p>
            </Card>

            {/* Puntos clave */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-violet-400 mb-3">📌 Puntos clave</h3>
              <ul className="space-y-2.5">
                {lesson.content.keyPoints.map((kp, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-white/70">
                    <span className="text-violet-400 flex-shrink-0 font-bold">{i + 1}.</span>
                    {kp}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Tips */}
            {lesson.content.tips.length > 0 && (
              <Card className="p-4 bg-amber-500/[0.05] border-amber-500/20">
                <h3 className="text-sm font-bold text-amber-400 mb-3">💡 Tips del profesor</h3>
                <ul className="space-y-2">
                  {lesson.content.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-white/65 flex gap-2">
                      <span className="text-amber-400 flex-shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Advertencias */}
            {lesson.content.warnings.length > 0 && (
              <Card className="p-4 bg-rose-500/[0.05] border-rose-500/20">
                <h3 className="text-sm font-bold text-rose-400 mb-3">⚠️ Importante</h3>
                <ul className="space-y-2">
                  {lesson.content.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-white/65 flex gap-2">
                      <span className="text-rose-400 flex-shrink-0">!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Button
              variant="primary"
              size="xl"
              onClick={() => setPhase('exercise')}
              className="w-full"
            >
              Comenzar Ejercicios →
            </Button>
          </>
        )}

        {/* ─── EJERCICIO ─── */}
        {phase === 'exercise' && currentExercise && (
          <>
            {/* Cabecera del ejercicio */}
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="info" size="sm">
                  Ejercicio {currentExerciseIdx + 1} de {lesson.exercises.length}
                </Badge>
                <h2 className="text-xl font-bold text-white mt-2">{currentExercise.name}</h2>
                <p className="text-sm text-white/50">{currentExercise.description}</p>
              </div>
            </div>

            {/* Timer */}
            {isExerciseRunning && (
              <div className="text-center">
                <div className={`text-6xl font-black font-mono ${
                  exerciseTimeLeft <= 10 ? 'text-rose-400' :
                  exerciseTimeLeft <= 20 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {exerciseTimeLeft}s
                </div>
                <ProgressBar
                  value={((currentExercise.duration - exerciseTimeLeft) / currentExercise.duration) * 100}
                  height={3}
                  className="mt-2"
                />
              </div>
            )}

            {/* Visualizador de audio */}
            {isListening && (
              <>
                <AudioVisualizer
                  analyserNode={getAnalyserNode()}
                  isActive={isListening}
                  type="waveform"
                  height={72}
                />
                <TunerDisplay pitch={currentPitch} isListening={isListening} />
              </>
            )}

            {/* Instrucciones */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-white/60 mb-3">🎓 Instrucciones</h3>
              <ol className="space-y-2">
                {currentExercise.instructions.map((instr, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-white/70">
                    <span className="text-violet-400 font-bold flex-shrink-0">{i + 1}.</span>
                    {instr}
                  </li>
                ))}
              </ol>
            </Card>

            {/* Notas objetivo */}
            {currentExercise.targetNotes && currentExercise.targetNotes.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-white/30">Notas objetivo:</span>
                {currentExercise.targetNotes.map(n => (
                  <span key={n} className="text-xs font-mono bg-violet-500/15 text-violet-300 rounded px-2 py-0.5">
                    {n}
                  </span>
                ))}
              </div>
            )}

            {/* Botón de acción */}
            {!isExerciseRunning ? (
              <Button variant="primary" size="xl" onClick={handleStartExercise} className="w-full">
                🎤 Iniciar Ejercicio
              </Button>
            ) : (
              <Button variant="secondary" size="lg" onClick={handleExerciseDone} className="w-full">
                ✓ Terminar Antes
              </Button>
            )}
          </>
        )}

        {/* ─── RESULTADOS ─── */}
        {phase === 'results' && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <ScoreRing score={finalScore} size={120} />
              <h2 className="text-2xl font-black text-white mt-4">
                {finalScore >= 90 ? '¡Excelente! 🌟' :
                 finalScore >= 75 ? '¡Bien hecho! 🎉' :
                 finalScore >= 60 ? 'Buen intento 👍' :
                 'Sigue practicando 💪'}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                Lección completada con {finalScore}%
              </p>
            </div>

            {/* Ejercicios completados */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-white/60 mb-3">Ejercicios completados</h3>
              <div className="space-y-2">
                {lesson.exercises.map(ex => {
                  const done = exercisesDone.includes(ex.id);
                  return (
                    <div key={ex.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-white/30'
                      }`}>
                        {done ? '✓' : '○'}
                      </div>
                      <span className="text-sm text-white/70">{ex.name}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Navegación */}
            <div className="space-y-3">
              {nextLessonId && (
                <Button
                  variant="primary"
                  size="xl"
                  onClick={() => router.push(`/training/${nextLessonId}`)}
                  className="w-full"
                >
                  Siguiente Lección →
                </Button>
              )}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/training')}
                className="w-full"
              >
                Volver al plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
