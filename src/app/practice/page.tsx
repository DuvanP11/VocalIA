'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { BottomNav, TopBar } from '@/components/layout/Navigation';
import { Card } from '@/components/ui';
import { TunerDisplay } from '@/components/audio/TunerDisplay';
import { AudioVisualizer } from '@/components/audio/AudioVisualizer';
import { NOTE_NAMES_ES, NOTE_NAMES_EN, frequencyToNoteInfo } from '@/lib/audio/noteUtils';
import { PitchDetector } from 'pitchy';
import type { PitchResult } from '@/types';

const REFERENCE_NOTES = [
  { note: 'A2', freq: 110,   label: 'La2' },
  { note: 'E3', freq: 164.8, label: 'Mi3' },
  { note: 'A3', freq: 220,   label: 'La3' },
  { note: 'C4', freq: 261.6, label: 'Do4' },
  { note: 'E4', freq: 329.6, label: 'Mi4' },
  { note: 'A4', freq: 440,   label: 'La4' },
  { note: 'C5', freq: 523.3, label: 'Do5' },
  { note: 'A5', freq: 880,   label: 'La5' },
];

// ─── Estado del micrófono ───────────────────────────────────────
type MicState = 'idle' | 'requesting' | 'active' | 'error';

export default function PracticePage() {
  const { recordSession } = useAppStore();
  const [visType, setVisType] = useState<'waveform' | 'frequency'>('waveform');
  const sessionStartRef = useRef(Date.now());
  const pitchCountRef   = useRef(0);
  const pitchSumRef     = useRef(0);

  // ── Estado del micrófono (sin hook intermedio) ───────────────
  const [micState,   setMicState]   = useState<MicState>('idle');
  const [micError,   setMicError]   = useState('');
  const [currentPitch, setCurrentPitch] = useState<PitchResult | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // ── Diagnóstico — capacidades del navegador ──────────────────
  const [diag, setDiag] = useState('');
  useEffect(() => {
    const parts: string[] = [];
    parts.push(`protocol: ${window.location.protocol}`);
    parts.push(`mediaDevices: ${!!navigator.mediaDevices}`);
    parts.push(`getUserMedia: ${typeof navigator.mediaDevices?.getUserMedia}`);
    parts.push(`AudioContext: ${!!(window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext)}`);
    setDiag(parts.join(' | '));
  }, []);

  // ── Referencias de audio ─────────────────────────────────────
  const streamRef   = useRef<MediaStream | null>(null);
  const ctxRef      = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef   = useRef<MediaStreamAudioSourceNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const bufferRef   = useRef<Float32Array | null>(null);
  const rafRef      = useRef<number | null>(null);

  // ── Parar ────────────────────────────────────────────────────
  const stopMic = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(t => t.stop());
    ctxRef.current?.close();
    streamRef.current = null;
    ctxRef.current    = null;
    analyserRef.current = null;
    sourceRef.current   = null;
    detectorRef.current = null;
    bufferRef.current   = null;
    setAnalyserNode(null);
    setCurrentPitch(null);
    setMicState('idle');
  }, []);

  // ── Iniciar ──────────────────────────────────────────────────
  const startMic = useCallback(async () => {
    if (micState !== 'idle') return;

    setMicState('requesting');
    setMicError('');

    // ── Paso 1: Verificar soporte ────────────────────────────
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('getUserMedia no disponible. Usa Chrome/Safari con HTTPS.');
      setMicState('error');
      return;
    }

    // ── Paso 2: Pedir permiso ────────────────────────────────
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const e = err as DOMException | Error;
      const name = e instanceof DOMException ? e.name : 'Error';
      const msg  = e.message ?? String(e);
      setMicError(`${name}: ${msg}`);
      setMicState('error');
      return;
    }

    // ── Paso 3: Crear AudioContext ───────────────────────────
    let ctx: AudioContext;
    try {
      const AC = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      if (ctx.state === 'suspended') await ctx.resume();
    } catch (err) {
      stream.getTracks().forEach(t => t.stop());
      const msg = err instanceof Error ? err.message : String(err);
      setMicError(`AudioContext error: ${msg}`);
      setMicState('error');
      return;
    }

    // ── Paso 4: Conectar nodos ───────────────────────────────
    const source   = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;
    source.connect(analyser);

    streamRef.current   = stream;
    ctxRef.current      = ctx;
    analyserRef.current = analyser;
    sourceRef.current   = source;
    detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
    bufferRef.current   = new Float32Array(analyser.fftSize);

    setAnalyserNode(analyser);
    setMicState('active');

    // ── Paso 5: Loop de detección ────────────────────────────
    const detect = () => {
      const an  = analyserRef.current;
      const det = detectorRef.current;
      const buf = bufferRef.current;
      const c   = ctxRef.current;

      if (!an || !det || !buf || !c) return;

      an.getFloatTimeDomainData(buf);
      const [freq, clarity] = det.findPitch(buf, c.sampleRate);

      if (clarity >= 0.75 && freq >= 70 && freq <= 1400) {
        const info = frequencyToNoteInfo(freq);
        const result: PitchResult = {
          frequency: freq,
          note:      info.note,
          noteName:  info.noteName,
          octave:    info.octave,
          cents:     info.cents,
          clarity,
          timestamp: Date.now(),
        };
        setCurrentPitch(result);
        pitchCountRef.current++;
        pitchSumRef.current += Math.max(0, 100 - Math.abs(info.cents));
      } else {
        setCurrentPitch(null);
      }

      rafRef.current = requestAnimationFrame(detect);
    };
    rafRef.current = requestAnimationFrame(detect);
  }, [micState]);

  // ── Cleanup al desmontar ─────────────────────────────────────
  useEffect(() => () => stopMic(), [stopMic]);

  // ── Toggle ───────────────────────────────────────────────────
  const handleToggle = () => {
    if (micState === 'active') {
      const durationMin = Math.round((Date.now() - sessionStartRef.current) / 60000);
      const avgAcc = pitchCountRef.current > 0
        ? Math.round(pitchSumRef.current / pitchCountRef.current) : 0;
      if (durationMin >= 1) {
        recordSession({
          date: new Date().toISOString(),
          durationMinutes: durationMin,
          exercisesCompleted: 1,
          avgPitchAccuracy: avgAcc,
          notesReached: [],
        });
      }
      stopMic();
    } else if (micState === 'idle' || micState === 'error') {
      sessionStartRef.current = Date.now();
      pitchCountRef.current   = 0;
      pitchSumRef.current     = 0;
      if (micState === 'error') setMicState('idle');
      startMic();
    }
  };

  const isListening  = micState === 'active';
  const isRequesting = micState === 'requesting';

  // ── Nota de referencia ───────────────────────────────────────
  const playReferenceNote = (freq: number) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.5);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-dvh bg-[#080a12] pb-24 page-enter">
      <TopBar
        title="Práctica Libre"
        subtitle="Modo afinador en tiempo real"
        action={
          <div className="flex gap-1.5">
            <button
              onClick={() => setVisType(v => v === 'waveform' ? 'frequency' : 'waveform')}
              className="text-xs text-white/40 hover:text-white/70 bg-white/[0.05] px-2 py-1 rounded-lg transition-colors"
            >
              {visType === 'waveform' ? '📊' : '〰️'}
            </button>
          </div>
        }
      />

      <div className="px-5 pt-6 space-y-6">

        {/* ── Diagnóstico (siempre visible para debug) ───────── */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Estado del sistema
          </p>
          <p className="text-[10px] font-mono text-white/30 break-all">{diag || '...'}</p>
          <p className="text-[10px] font-mono">
            <span className={`font-bold ${
              micState === 'active'     ? 'text-green-400' :
              micState === 'requesting' ? 'text-yellow-400' :
              micState === 'error'      ? 'text-rose-400'  :
              'text-white/30'
            }`}>
              mic: {micState}
            </span>
          </p>
          {micError && (
            <p className="text-[10px] font-mono text-rose-400 break-all">{micError}</p>
          )}
        </div>

        {/* ── Afinador principal ─────────────────────────────── */}
        <Card className={`p-6 transition-all duration-300 ${isListening ? 'border-violet-500/30 bg-violet-500/[0.04]' : ''}`}>
          <TunerDisplay pitch={currentPitch} isListening={isListening} />
        </Card>

        {/* ── Visualizador ───────────────────────────────────── */}
        <AudioVisualizer
          analyserNode={analyserNode}
          isActive={isListening}
          type={visType}
          color={visType === 'waveform' ? '#7c6aff' : '#38bdf8'}
          height={80}
        />

        {/* ── Error prominente ────────────────────────────────── */}
        {micState === 'error' && micError && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 space-y-2">
            <p className="text-sm font-semibold text-rose-300">⚠️ Error de micrófono</p>
            <p className="text-xs text-rose-400/80 break-all">{micError}</p>
            {micError.includes('NotAllowed') && (
              <p className="text-xs text-white/40">
                Ve a ajustes del navegador → Micrófono → Permitir para este sitio
              </p>
            )}
          </div>
        )}

        {/* ── Botón micrófono ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={isRequesting}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 disabled:opacity-60 ${
              isListening
                ? 'bg-violet-600 shadow-2xl shadow-violet-900/50'
                : isRequesting
                  ? 'bg-white/[0.07] border border-white/[0.12] animate-pulse'
                  : 'bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12]'
            }`}
          >
            {isListening ? '🔴' : isRequesting ? '⏳' : '🎤'}
          </button>
          <p className="text-center text-xs text-white/30 h-4">
            {isListening   ? 'Toca para detener' :
             isRequesting  ? 'Esperando permiso del navegador…' :
             micState === 'error' ? 'Toca para reintentar' : ''}
          </p>
        </div>

        {/* ── Notas de referencia ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white/60">Notas de referencia</h3>
            <span className="text-xs text-white/30">Toca para escuchar</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {REFERENCE_NOTES.map(ref => {
              const isCurrent = isListening && currentPitch?.note?.startsWith(ref.note.slice(0, -1));
              return (
                <button
                  key={ref.note}
                  onClick={() => playReferenceNote(ref.freq)}
                  className={`py-3 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="text-base font-bold">{ref.label.slice(0, 2)}</div>
                  <div className="text-[9px] opacity-60">{ref.note}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Escala cromática ─────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-bold text-white/60 mb-3">Escala cromática</h3>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {NOTE_NAMES_EN.map((note, i) => {
              const isSharp    = note.includes('#');
              const espanol    = NOTE_NAMES_ES[i];
              const isDetected = isListening && currentPitch?.note?.startsWith(note);
              return (
                <div
                  key={note}
                  className={`flex-shrink-0 flex flex-col items-center justify-end rounded-lg transition-all duration-100 ${
                    isSharp ? 'h-12 w-7' : 'h-16 w-9'
                  } ${
                    isDetected
                      ? 'bg-violet-500 shadow-lg shadow-violet-900/50'
                      : isSharp ? 'bg-white/[0.08]' : 'bg-white/[0.05]'
                  }`}
                >
                  <span className={`text-[8px] pb-1 font-bold ${isDetected ? 'text-white' : 'text-white/30'}`}>
                    {espanol.slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
