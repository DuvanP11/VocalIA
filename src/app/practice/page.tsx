'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { BottomNav, TopBar } from '@/components/layout/Navigation';
import { Button, Card, Badge } from '@/components/ui';
import { TunerDisplay } from '@/components/audio/TunerDisplay';
import { AudioVisualizer } from '@/components/audio/AudioVisualizer';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { NOTE_NAMES_ES, NOTE_NAMES_EN } from '@/lib/audio/noteUtils';

const REFERENCE_NOTES = [
  { note: 'A2', freq: 110,   label: 'La2',  icon: '⬇️' },
  { note: 'E3', freq: 164.8, label: 'Mi3',  icon: '↙️' },
  { note: 'A3', freq: 220,   label: 'La3',  icon: '↓'  },
  { note: 'C4', freq: 261.6, label: 'Do4',  icon: '·'  },
  { note: 'E4', freq: 329.6, label: 'Mi4',  icon: '↑'  },
  { note: 'A4', freq: 440,   label: 'La4',  icon: '↑'  },
  { note: 'C5', freq: 523.3, label: 'Do5',  icon: '↗️' },
  { note: 'A5', freq: 880,   label: 'La5',  icon: '⬆️' },
];

export default function PracticePage() {
  const { isOnboarded, recordSession } = useAppStore();
  const [showFreq, setShowFreq] = useState(false);
  const [visType, setVisType] = useState<'waveform' | 'frequency'>('waveform');
  const sessionStartRef = useRef(Date.now());
  const pitchCountRef = useRef(0);
  const pitchSumRef = useRef(0);
  const [sessionActive, setSessionActive] = useState(false);

  const {
    isListening,
    currentPitch,
    toggle,
    error,
    permissionDenied,
    getAnalyserNode,
  } = usePitchDetector({
    onPitch: (p) => {
      if (p.frequency > 0) {
        pitchCountRef.current++;
        pitchSumRef.current += Math.max(0, 100 - Math.abs(p.cents));
      }
    },
  });

  const handleToggle = () => {
    if (!isListening) {
      sessionStartRef.current = Date.now();
      pitchCountRef.current = 0;
      pitchSumRef.current = 0;
      setSessionActive(true);
    } else {
      const durationMin = Math.round((Date.now() - sessionStartRef.current) / 60000);
      const avgAcc = pitchCountRef.current > 0
        ? Math.round(pitchSumRef.current / pitchCountRef.current)
        : 0;

      if (durationMin >= 1) {
        recordSession({
          date: new Date().toISOString(),
          durationMinutes: durationMin,
          exercisesCompleted: 1,
          avgPitchAccuracy: avgAcc,
          notesReached: [],
        });
      }
      setSessionActive(false);
    }
    toggle();
  };

  // Nota referencia (reproduce un tono)
  const playReferenceNote = (freq: number) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
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
            <button
              onClick={() => setShowFreq(v => !v)}
              className="text-xs text-white/40 hover:text-white/70 bg-white/[0.05] px-2 py-1 rounded-lg transition-colors"
            >
              Hz
            </button>
          </div>
        }
      />

      <div className="px-5 pt-6 space-y-6">
        {/* Afinador principal */}
        <Card className={`p-6 transition-all duration-300 ${isListening ? 'border-violet-500/30 bg-violet-500/[0.04]' : ''}`}>
          <TunerDisplay
            pitch={currentPitch}
            isListening={isListening}
          />
        </Card>

        {/* Visualizador */}
        <AudioVisualizer
          analyserNode={getAnalyserNode()}
          isActive={isListening}
          type={visType}
          color={visType === 'waveform' ? '#7c6aff' : '#38bdf8'}
          height={80}
        />

        {/* Error de micrófono */}
        {error && (
          <Card className="p-4 border-rose-500/20 bg-rose-500/[0.05]">
            <p className="text-sm text-rose-400">⚠️ {error}</p>
          </Card>
        )}

        {/* Botón micrófono */}
        <div className="flex justify-center">
          <button
            onClick={handleToggle}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 ${
              isListening
                ? 'bg-violet-600 mic-active shadow-2xl shadow-violet-900/50'
                : 'bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12]'
            }`}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
        </div>

        {isListening && (
          <p className="text-center text-xs text-white/30 -mt-2">
            Toca para detener
          </p>
        )}

        {/* Notas de referencia */}
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

        {/* Escala cromática */}
        <div>
          <h3 className="text-sm font-bold text-white/60 mb-3">Escala cromática — Do central (C4)</h3>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {NOTE_NAMES_EN.map((note, i) => {
              const isSharp = note.includes('#');
              const espanol = NOTE_NAMES_ES[i];
              const isDetected = isListening && currentPitch?.note?.startsWith(note);

              return (
                <div
                  key={note}
                  className={`flex-shrink-0 flex flex-col items-center justify-end rounded-lg transition-all duration-100 ${
                    isSharp ? 'h-12 w-7' : 'h-16 w-9'
                  } ${
                    isDetected
                      ? 'bg-violet-500 shadow-lg shadow-violet-900/50'
                      : isSharp
                        ? 'bg-white/[0.08] hover:bg-white/[0.14]'
                        : 'bg-white/[0.05] hover:bg-white/[0.10]'
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
