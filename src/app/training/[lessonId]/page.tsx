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
import { NOTE_NAMES_ES, NOTE_NAMES_EN } from '@/lib/audio/noteUtils';
import { playNote, playNoteSequence, stopCurrentNote } from '@/lib/audio/playNote';
import { FaceAnalysisPanel } from '@/components/facial/FaceAnalysisPanel';
import type { Exercise, ExerciseType } from '@/types';

type LessonPhase = 'theory' | 'exercise' | 'results';

// Ejercicios que se benefician de escuchar la nota antes de cantar
const PITCH_EXERCISE_TYPES: ExerciseType[] = ['sustained-note', 'scale-up', 'scale-down', 'arpeggio'];
const NON_MIC_TYPES: ExerciseType[] = ['breathing-inhale', 'breathing-exhale'];

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

  // Análisis facial (opcional)
  const [showFacePanel, setShowFacePanel] = useState(false);

  // Estado de reproducción de notas
  const [isPlayingNote, setIsPlayingNote] = useState(false);
  const [playingNoteLabel, setPlayingNoteLabel] = useState('');
  const [hasListened, setHasListened] = useState(false);
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);

  const {
    isListening,
    currentPitch,
    start: startMic,
    stop: stopMic,
    getAnalyserNode,
  } = usePitchDetector();

  useEffect(() => {
    if (!lesson) router.replace('/training');
  }, [lesson, router]);

  // Al cambiar de ejercicio, resetear estado de escucha
  useEffect(() => {
    setHasListened(false);
    setCurrentTargetIdx(0);
    setIsPlayingNote(false);
    stopCurrentNote();
  }, [currentExerciseIdx]);

  // Auto-reproducir la primera nota al llegar a un ejercicio de pitch
  useEffect(() => {
    if (phase !== 'exercise') return;
    const ex = lesson?.exercises[currentExerciseIdx];
    if (!ex) return;
    if (PITCH_EXERCISE_TYPES.includes(ex.type) && ex.targetNotes && ex.targetNotes.length > 0) {
      // Pequeño delay para que la UI cargue primero
      const timer = setTimeout(() => {
        handlePlayNote(ex.targetNotes![0]);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, currentExerciseIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer del ejercicio
  useEffect(() => {
    if (!isExerciseRunning || exerciseTimeLeft <= 0) return;
    const t = setTimeout(() => setExerciseTimeLeft(tt => tt - 1), 1000);
    return () => clearTimeout(t);
  }, [isExerciseRunning, exerciseTimeLeft]);

  // Auto-terminar al llegar a 0
  useEffect(() => {
    if (isExerciseRunning && exerciseTimeLeft === 0) handleExerciseDone();
  }, [exerciseTimeLeft, isExerciseRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // Acumular precisión de afinación
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
  const needsListening =
    PITCH_EXERCISE_TYPES.includes(currentExercise?.type) &&
    (currentExercise?.targetNotes?.length ?? 0) > 0;

  // ─── Reproducir una nota ─────────────────────────────────────

  const handlePlayNote = async (noteStr: string) => {
    if (isPlayingNote) {
      stopCurrentNote();
      setIsPlayingNote(false);
      return;
    }

    // Etiqueta amigable: "C4" → "Do (C4)"
    const noteMatch = noteStr.match(/^([A-G]#?)(\d+)$/);
    const noteIdx = noteMatch ? NOTE_NAMES_EN.indexOf(noteMatch[1]) : -1;
    const noteLabel = noteIdx >= 0
      ? `${NOTE_NAMES_ES[noteIdx]} (${noteStr})`
      : noteStr;

    setIsPlayingNote(true);
    setPlayingNoteLabel(noteLabel);

    await playNote(noteStr, { duration: 2.5, volume: 0.5, fadeOut: 0.6 });

    setIsPlayingNote(false);
    setPlayingNoteLabel('');
    setHasListened(true);
  };

  const handlePlaySequence = async () => {
    if (!currentExercise.targetNotes) return;
    if (isPlayingNote) { stopCurrentNote(); setIsPlayingNote(false); return; }

    setIsPlayingNote(true);
    setPlayingNoteLabel('secuencia...');

    await playNoteSequence(currentExercise.targetNotes, {
      duration: 1.5,
      volume: 0.45,
      pauseBetween: 0.25,
    });

    setIsPlayingNote(false);
    setPlayingNoteLabel('');
    setHasListened(true);
  };

  // ─── Iniciar ejercicio ───────────────────────────────────────

  const handleStartExercise = async () => {
    stopCurrentNote();
    setIsPlayingNote(false);
    setPitchAccuracies([]);
    setExerciseTimeLeft(currentExercise.duration);
    setIsExerciseRunning(true);
    if (!NON_MIC_TYPES.includes(currentExercise.type)) {
      await startMic().catch(() => { /* mic opcional */ });
    }
  };

  const handleExerciseDone = useCallback(() => {
    setIsExerciseRunning(false);
    stopMic();
    stopCurrentNote();

    const avgAccuracy = pitchAccuracies.length > 0
      ? Math.round(pitchAccuracies.reduce((a, b) => a + b, 0) / pitchAccuracies.length)
      : 85;

    setExercisesDone(prev => [...prev, currentExercise.id]);
    markExerciseDone(currentExercise.id);

    if (isLastExercise) {
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

        {/* ══════════════════════════════════════════
            FASE: TEORÍA
        ══════════════════════════════════════════ */}
        {phase === 'theory' && (
          <>
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

            <Button variant="primary" size="xl" onClick={() => setPhase('exercise')} className="w-full">
              Comenzar Ejercicios →
            </Button>
          </>
        )}

        {/* ══════════════════════════════════════════
            FASE: EJERCICIO
        ══════════════════════════════════════════ */}
        {phase === 'exercise' && currentExercise && (
          <>
            {/* Cabecera */}
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm">
                  Ejercicio {currentExerciseIdx + 1} de {lesson.exercises.length}
                </Badge>
                <button
                  onClick={() => setShowFacePanel(v => !v)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    showFacePanel
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60'
                  }`}
                >
                  📷 <span>Postura</span>
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">{currentExercise.name}</h2>
              <p className="text-sm text-white/50">{currentExercise.description}</p>
            </div>

            {/* ── NOTAS DE REFERENCIA (antes y durante) ──────── */}
            {currentExercise.targetNotes && currentExercise.targetNotes.length > 0 && (
              <Card className={`p-4 transition-all duration-300 ${
                !isExerciseRunning
                  ? 'border-sky-500/30 bg-sky-500/[0.06]'
                  : 'border-white/[0.07] bg-white/[0.03]'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-sky-300">
                      {isExerciseRunning ? '🔊 Notas objetivo' : '🎧 Escucha antes de cantar'}
                    </h3>
                    {!isExerciseRunning && !hasListened && (
                      <p className="text-xs text-white/40 mt-0.5">
                        Interioriza la nota antes de activar el micrófono
                      </p>
                    )}
                    {hasListened && !isExerciseRunning && (
                      <p className="text-xs text-emerald-400 mt-0.5">
                        ✓ Nota escuchada — listo para cantar
                      </p>
                    )}
                  </div>
                  {/* Reproducir secuencia completa */}
                  {currentExercise.targetNotes.length > 1 && (
                    <button
                      onClick={handlePlaySequence}
                      disabled={isExerciseRunning && isPlayingNote}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                        isPlayingNote && playingNoteLabel === 'secuencia...'
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                          : 'bg-white/[0.05] border-white/[0.1] text-white/50 hover:text-white/80'
                      }`}
                    >
                      {isPlayingNote && playingNoteLabel === 'secuencia...' ? '⏹ Detener' : '▶ Secuencia'}
                    </button>
                  )}
                </div>

                {/* Botones de notas individuales */}
                <div className="flex gap-2 flex-wrap">
                  {currentExercise.targetNotes.map((noteStr) => {
                    const noteMatch = noteStr.match(/^([A-G]#?)(\d+)$/);
                    const noteIdx = noteMatch ? NOTE_NAMES_EN.indexOf(noteMatch[1]) : -1;
                    const espanol = noteIdx >= 0 ? NOTE_NAMES_ES[noteIdx] : noteStr;
                    const isThisPlaying = isPlayingNote && playingNoteLabel.includes(noteStr);

                    return (
                      <button
                        key={noteStr}
                        onClick={() => handlePlayNote(noteStr)}
                        className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-150 min-w-[64px] ${
                          isThisPlaying
                            ? 'bg-sky-500/25 border-sky-400/60 text-sky-300 scale-105 shadow-lg shadow-sky-900/30'
                            : 'bg-white/[0.04] border-white/[0.1] text-white/70 hover:bg-white/[0.08] hover:border-white/20 active:scale-95'
                        }`}
                      >
                        <span className="text-lg leading-none">
                          {isThisPlaying ? '⏹' : '🔊'}
                        </span>
                        <span className="text-sm font-bold mt-1">{espanol}</span>
                        <span className="text-[10px] font-mono opacity-50">{noteStr}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Indicador de "reproduciendo" */}
                {isPlayingNote && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-sky-400">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="w-1 bg-sky-400 rounded-full animate-bounce"
                          style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <span>Reproduciendo {playingNoteLabel}</span>
                  </div>
                )}
              </Card>
            )}

            {/* ── TIMER (solo durante ejercicio) ──────────────── */}
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

            {/* ── VISUALIZADOR + AFINADOR (durante ejercicio) ─── */}
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

            {/* ── ANÁLISIS FACIAL (opcional) ───────────────────── */}
            {showFacePanel && (
              <FaceAnalysisPanel autoStart showVideo={false} />
            )}

            {/* ── INSTRUCCIONES ────────────────────────────────── */}
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

            {/* ── BOTÓN PRINCIPAL ──────────────────────────────── */}
            {!isExerciseRunning ? (
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleStartExercise}
                  className="w-full"
                >
                  🎤 {needsListening && !hasListened ? 'Cantar sin escuchar' : 'Comenzar a Cantar'}
                </Button>
                {needsListening && !hasListened && (
                  <p className="text-center text-xs text-white/30">
                    Te recomendamos escuchar la nota primero 👆
                  </p>
                )}
              </div>
            ) : (
              <Button variant="secondary" size="lg" onClick={handleExerciseDone} className="w-full">
                ✓ Terminar Antes
              </Button>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            FASE: RESULTADOS
        ══════════════════════════════════════════ */}
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
