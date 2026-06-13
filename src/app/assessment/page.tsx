'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { TunerDisplay } from '@/components/audio/TunerDisplay';
import { AudioVisualizer } from '@/components/audio/AudioVisualizer';
import { Button, ProgressBar, Card } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import {
  classifyVoiceType,
  frequencyToNoteInfo,
  VOICE_TYPE_INFO,
} from '@/lib/audio/noteUtils';
import { generateId } from '@/lib/utils';
import type { VocalAssessmentResult, VocalRange } from '@/types';

type Phase = 'intro' | 'recording' | 'analyzing' | 'results';

export default function AssessmentPage() {
  const router = useRouter();
  const { profile, setAssessment, markLessonDone } = useAppStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [timeLeft, setTimeLeft] = useState(30);
  const [result, setResult] = useState<VocalAssessmentResult | null>(null);

  const {
    isListening,
    currentPitch,
    start,
    stop,
    error,
    getRangeStats,
    resetRangeAnalyzer,
    getAnalyserNode,
  } = usePitchDetector();

  // Temporizador de grabación
  useEffect(() => {
    if (phase !== 'recording') return;
    if (timeLeft <= 0) {
      handleStopRecording();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const handleStartRecording = async () => {
    resetRangeAnalyzer();
    setTimeLeft(30);
    setPhase('recording');
    await start();
  };

  const handleStopRecording = useCallback(() => {
    stop();
    setPhase('analyzing');
    setTimeout(() => buildResults(), 1500);
  }, [stop]);

  const buildResults = () => {
    const stats = getRangeStats();

    if (!stats || stats.count < 5) {
      // Datos insuficientes — usar rango por defecto
      const defaultResult: VocalAssessmentResult = {
        range: {
          lowestNote: 'A2', highestNote: 'A4',
          lowestFreq: 110, highestFreq: 440,
          semitones: 24,
          classification: 'unknown',
        },
        voiceType: 'unknown',
        strengths: ['¡Buen intento! Necesitamos más datos.'],
        weaknesses: ['Grabación corta o señal débil'],
        recommendations: ['Repite el diagnóstico en un lugar silencioso', 'Habla claramente al micrófono'],
        fatigueRisk: 'low',
        developmentPotential: 'medium',
        sessionId: generateId(),
        createdAt: new Date().toISOString(),
      };
      setResult(defaultResult);
      setAssessment(defaultResult);
      setPhase('results');
      return;
    }

    const lowestInfo = frequencyToNoteInfo(stats.lowest);
    const highestInfo = frequencyToNoteInfo(stats.highest);
    const semitones = highestInfo.midi - lowestInfo.midi;
    const voiceType = classifyVoiceType(lowestInfo.midi, highestInfo.midi);

    const range: VocalRange = {
      lowestNote: lowestInfo.note,
      highestNote: highestInfo.note,
      lowestFreq: stats.lowest,
      highestFreq: stats.highest,
      semitones,
      classification: voiceType,
    };

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (semitones >= 24) strengths.push('Rango vocal amplio (2+ octavas)');
    else if (semitones >= 12) strengths.push('Rango vocal de 1 octava, típico para principiantes');
    else weaknesses.push('Rango vocal estrecho — se expandirá con práctica');

    if (voiceType !== 'unknown') strengths.push(`Tipo de voz identificado: ${VOICE_TYPE_INFO[voiceType].label}`);
    else {
      weaknesses.push('Tipo de voz no identificado claramente');
      recommendations.push('Canta más notas en los extremos de tu rango');
    }

    if (stats.count > 50) strengths.push('Buena consistencia en la emisión vocal');
    else weaknesses.push('Practica sostener las notas por más tiempo');

    recommendations.push(
      'Realiza el diagnóstico cada 2 semanas para ver tu progreso',
      'Empieza con las lecciones de respiración del Nivel 1',
    );

    const assessment: VocalAssessmentResult = {
      range,
      voiceType,
      strengths,
      weaknesses,
      recommendations,
      fatigueRisk: semitones >= 30 ? 'medium' : 'low',
      developmentPotential: semitones >= 24 ? 'high' : semitones >= 12 ? 'medium' : 'medium',
      sessionId: generateId(),
      createdAt: new Date().toISOString(),
    };

    setResult(assessment);
    setAssessment(assessment);
    setPhase('results');
  };

  const vInfo = result ? VOICE_TYPE_INFO[result.voiceType] : null;

  return (
    <div className="min-h-dvh flex flex-col bg-[#080a12] page-enter">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold tracking-wider text-violet-400 uppercase">Diagnóstico Vocal</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Análisis de tu Voz</h1>
        <p className="text-sm text-white/50 mt-1">
          {phase === 'intro' && 'Descubriremos tu rango y tipo de voz'}
          {phase === 'recording' && 'Canta libremente — notas graves, medias y agudas'}
          {phase === 'analyzing' && 'Analizando tu voz...'}
          {phase === 'results' && 'Tu diagnóstico está listo'}
        </p>
      </header>

      <div className="flex-1 px-5 pb-24 overflow-y-auto">
        {/* ─── INTRO ─── */}
        {phase === 'intro' && (
          <div className="space-y-6 pt-4">
            <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5">
              <h3 className="font-bold text-violet-300 mb-3">¿Qué vas a hacer?</h3>
              <ul className="space-y-2.5">
                {[
                  { icon: '🎤', text: 'Hablarás al micrófono durante 30 segundos' },
                  { icon: '🎵', text: 'Cantarás cualquier nota — grave, media y aguda' },
                  { icon: '🧠', text: 'La IA analizará tu rango y tipo de voz' },
                  { icon: '📊', text: 'Recibirás un informe personalizado' },
                ].map(item => (
                  <li key={item.text} className="flex gap-3 text-sm text-white/70">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-amber-300">
                💡 <strong>Tip:</strong> Busca un lugar silencioso y mantén el micrófono a ~20cm de tu boca.
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                <p className="text-sm text-rose-400">⚠️ {error}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="xl"
              onClick={handleStartRecording}
              className="w-full"
            >
              🎤 Comenzar Diagnóstico
            </Button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-sm text-white/30 hover:text-white/60 transition-colors py-2"
            >
              Hacer después →
            </button>
          </div>
        )}

        {/* ─── GRABANDO ─── */}
        {phase === 'recording' && (
          <div className="space-y-6 pt-4">
            {/* Timer */}
            <div className="text-center">
              <div
                className="text-7xl font-black font-mono"
                style={{
                  color: timeLeft <= 10 ? '#f87171' : timeLeft <= 20 ? '#fbbf24' : '#34d399',
                }}
              >
                {timeLeft}s
              </div>
              <ProgressBar
                value={((30 - timeLeft) / 30) * 100}
                color={timeLeft <= 10 ? 'bg-rose-500' : 'bg-violet-500'}
                height={4}
                className="mt-3"
              />
            </div>

            {/* Visualizador */}
            <AudioVisualizer
              analyserNode={getAnalyserNode()}
              isActive={isListening}
              type="waveform"
              color="#7c6aff"
              height={90}
            />

            {/* Afinador */}
            <TunerDisplay
              pitch={currentPitch}
              isListening={isListening}
            />

            {/* Instrucciones */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {['🎵 Nota grave', '🎵 Nota media', '🎵 Nota aguda'].map(t => (
                <div key={t} className="bg-white/[0.04] rounded-xl p-2.5 text-xs text-white/50">{t}</div>
              ))}
            </div>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleStopRecording}
              className="w-full"
            >
              ✓ Terminar Ahora
            </Button>
          </div>
        )}

        {/* ─── ANALIZANDO ─── */}
        {phase === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-white font-semibold text-lg">Analizando tu voz...</p>
              <p className="text-white/40 text-sm mt-1">Esto toma solo un momento</p>
            </div>
          </div>
        )}

        {/* ─── RESULTADOS ─── */}
        {phase === 'results' && result && vInfo && (
          <div className="space-y-4 pt-2">
            {/* Tipo de voz */}
            <Card className="p-5 text-center">
              <div className="text-5xl mb-3">🎤</div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Tu tipo de voz</p>
              <h2 className="text-3xl font-black" style={{ color: vInfo.color }}>
                {vInfo.label}
              </h2>
              <p className="text-sm text-white/50 mt-2">{vInfo.description}</p>
              <div className="mt-3 inline-block bg-white/[0.05] rounded-lg px-3 py-1.5 text-xs font-mono text-white/60">
                {result.range.lowestNote} → {result.range.highestNote}
                {' '}· {result.range.semitones} semitonos
              </div>
            </Card>

            {/* Fortalezas */}
            {result.strengths.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-bold text-emerald-400 mb-3">💪 Fortalezas</h3>
                <ul className="space-y-2">
                  {result.strengths.map(s => (
                    <li key={s} className="text-sm text-white/70 flex gap-2">
                      <span className="text-emerald-400 flex-shrink-0">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Debilidades */}
            {result.weaknesses.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-bold text-amber-400 mb-3">🎯 Áreas a mejorar</h3>
                <ul className="space-y-2">
                  {result.weaknesses.map(w => (
                    <li key={w} className="text-sm text-white/70 flex gap-2">
                      <span className="text-amber-400 flex-shrink-0">▸</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Recomendaciones */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-sky-400 mb-3">🗺️ Plan recomendado</h3>
              <ul className="space-y-2">
                {result.recommendations.map(r => (
                  <li key={r} className="text-sm text-white/70 flex gap-2">
                    <span className="text-sky-400 flex-shrink-0">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Potencial */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 text-center">
                <p className="text-xs text-white/40 mb-1">Riesgo de fatiga</p>
                <span className={`text-sm font-bold ${
                  result.fatigueRisk === 'low' ? 'text-emerald-400' :
                  result.fatigueRisk === 'medium' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {result.fatigueRisk === 'low' ? 'Bajo' :
                   result.fatigueRisk === 'medium' ? 'Medio' : 'Alto'}
                </span>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-white/40 mb-1">Potencial</p>
                <span className={`text-sm font-bold ${
                  result.developmentPotential === 'exceptional' ? 'text-amber-300' :
                  result.developmentPotential === 'high' ? 'text-violet-400' : 'text-sky-400'
                }`}>
                  {result.developmentPotential === 'exceptional' ? 'Excepcional' :
                   result.developmentPotential === 'high' ? 'Alto' : 'Bueno'}
                </span>
              </Card>
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={() => router.push('/dashboard')}
              className="w-full mt-4"
            >
              🚀 Ir al Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
