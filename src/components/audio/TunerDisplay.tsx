'use client';

import { useMemo } from 'react';
import { centsToColor, centsToLabel } from '@/lib/audio/noteUtils';
import { cn } from '@/lib/utils';
import type { PitchResult } from '@/types';

interface TunerDisplayProps {
  pitch: PitchResult | null;
  isListening: boolean;
  className?: string;
}

export function TunerDisplay({ pitch, isListening, className }: TunerDisplayProps) {
  const hasSignal = pitch && pitch.frequency > 0;

  const deviationPercent = useMemo(() => {
    if (!hasSignal) return 50; // centrado
    return 50 + (pitch.cents / 100) * 45; // ±45% del ancho
  }, [hasSignal, pitch?.cents]);

  const noteColor = useMemo(() => {
    if (!hasSignal) return '#475569';
    return centsToColor(pitch.cents);
  }, [hasSignal, pitch?.cents]);

  const label = useMemo(() => {
    if (!isListening) return 'Presiona el micrófono para comenzar';
    if (!hasSignal) return 'Escuchando... canta una nota';
    return centsToLabel(pitch.cents);
  }, [isListening, hasSignal, pitch?.cents]);

  return (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      {/* Nota principal */}
      <div className="text-center">
        <div
          className="text-8xl font-black tracking-tight transition-all duration-100"
          style={{ color: noteColor }}
        >
          {hasSignal ? pitch.noteName : '—'}
        </div>
        {hasSignal && (
          <div className="text-lg font-mono text-white/40 mt-1">
            {pitch.note} · {Math.round(pitch.frequency)} Hz
          </div>
        )}
      </div>

      {/* Medidor de cents */}
      <div className="w-full max-w-xs">
        {/* Escala */}
        <div className="flex justify-between text-[10px] text-white/30 font-mono mb-1 px-1">
          <span>-50¢</span>
          <span className="text-white/50">0</span>
          <span>+50¢</span>
        </div>

        {/* Barra */}
        <div className="relative h-3 rounded-full bg-white/[0.06] overflow-visible">
          {/* Zona de afinación perfecta */}
          <div
            className="absolute h-full rounded-full"
            style={{
              left: '45%',
              width: '10%',
              background: 'rgba(52, 211, 153, 0.15)',
              borderLeft: '1px solid rgba(52, 211, 153, 0.3)',
              borderRight: '1px solid rgba(52, 211, 153, 0.3)',
            }}
          />
          {/* Centro */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/20 rounded-full"
            style={{ left: '50%' }}
          />
          {/* Indicador */}
          {hasSignal && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg transition-all duration-75"
              style={{
                left: `calc(${Math.min(95, Math.max(5, deviationPercent))}% - 6px)`,
                backgroundColor: noteColor,
                boxShadow: `0 0 8px ${noteColor}80`,
              }}
            />
          )}
        </div>
      </div>

      {/* Label semántico */}
      <div
        className="text-sm font-medium transition-all duration-300"
        style={{ color: hasSignal ? noteColor : '#64748b' }}
      >
        {label}
      </div>

      {/* Frecuencia y claridad */}
      {hasSignal && (
        <div className="flex gap-4 text-xs font-mono text-white/30">
          <span>Claridad: {Math.round(pitch.clarity * 100)}%</span>
          <span>Octava: {pitch.octave}</span>
          <span>Desv: {pitch.cents > 0 ? '+' : ''}{pitch.cents}¢</span>
        </div>
      )}
    </div>
  );
}
