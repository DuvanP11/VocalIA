'use client';

import { useEffect } from 'react';
import { useFaceTracker, FaceMetrics } from '@/hooks/useFaceTracker';

// ─── Subcomponente: medidor de barra ────────────────────────

function MetricBar({
  label,
  value,
  good,
  warn,
  unit = '%',
}: {
  label: string;
  value: number;        // 0-1
  good: [number, number]; // rango verde
  warn: [number, number]; // rango amarillo
  unit?: string;
}) {
  const pct = Math.round(value * 100);
  const color =
    value >= good[0] && value <= good[1] ? '#22c55e' :
    value >= warn[0] && value <= warn[1] ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span style={{ color }} className="font-mono font-bold">{pct}{unit}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Subcomponente: indicador de mentón ─────────────────────

function ChinIndicator({ position }: { position: FaceMetrics['chinPosition'] }) {
  const config = {
    up:      { icon: '↑', label: 'Mentón alto', color: '#ef4444' },
    down:    { icon: '↓', label: 'Mentón bajo', color: '#f59e0b' },
    neutral: { icon: '→', label: 'Mentón neutro', color: '#22c55e' },
  }[position];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/50">Mentón</span>
      <span
        className="text-sm font-bold px-2 py-0.5 rounded-full"
        style={{ color: config.color, backgroundColor: `${config.color}20` }}
      >
        {config.icon} {config.label}
      </span>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────

interface FaceAnalysisPanelProps {
  onMetrics?: (m: FaceMetrics) => void;
  autoStart?: boolean;
  showVideo?: boolean;
}

export function FaceAnalysisPanel({
  onMetrics,
  autoStart = false,
  showVideo = false,
}: FaceAnalysisPanelProps) {
  const { videoRef, canvasRef, metrics, isLoading, isActive, error, start, stop } =
    useFaceTracker({ onMetrics, drawOverlay: showVideo });

  useEffect(() => {
    if (autoStart) start();
    return () => { stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Estado de detección ────────────────────────────────────
  const statusDot = isActive
    ? metrics.isDetected
      ? 'bg-green-500'
      : 'bg-amber-500 animate-pulse'
    : 'bg-white/20';

  const statusText = isLoading
    ? 'Cargando MediaPipe…'
    : isActive
      ? metrics.isDetected ? 'Rostro detectado' : 'Buscando rostro…'
      : 'Cámara inactiva';

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="text-xs font-medium text-white/60">{statusText}</span>
        </div>
        <button
          onClick={isActive ? stop : start}
          disabled={isLoading}
          className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
            isActive
              ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
              : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
          } disabled:opacity-40`}
        >
          {isLoading ? '…' : isActive ? 'Detener' : '📷 Activar cámara'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-xs text-rose-400 bg-rose-500/10">
          ⚠️ {error}
        </div>
      )}

      {/* Video feed (opcional) */}
      {showVideo && (
        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1]"
            width={320}
            height={240}
          />
          {!metrics.isDetected && isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/40 text-sm">Colócate frente a la cámara</p>
            </div>
          )}
        </div>
      )}

      {/* Video hidden pero activo (sin showVideo) */}
      {!showVideo && (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="hidden" width={320} height={240} />
        </>
      )}

      {/* Métricas */}
      <div className="px-4 py-3 space-y-3">
        {/* Apertura mandibular */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/50">Apertura mandibular</span>
            <span className="text-white/30 text-[10px]">objetivo: 40-70%</span>
          </div>
          <MetricBar
            label=""
            value={metrics.jawOpenness}
            good={[0.4, 0.7]}
            warn={[0.2, 0.4]}
          />
          {isActive && metrics.isDetected && (
            <p className="text-[10px] text-white/30 mt-0.5">
              {metrics.jawOpenness < 0.2
                ? '⚠️ Boca muy cerrada — abre más la mandíbula'
                : metrics.jawOpenness < 0.4
                ? '💡 Abre un poco más — apunta a 40%+'
                : metrics.jawOpenness > 0.75
                ? '💡 Un poco excesivo — relaja ligeramente'
                : '✓ Apertura correcta'}
            </p>
          )}
        </div>

        {/* Tensión labial */}
        <MetricBar
          label="Tensión labial"
          value={metrics.lipTension}
          good={[0, 0.25]}
          warn={[0.25, 0.5]}
        />

        {/* Mentón */}
        {isActive && metrics.isDetected
          ? <ChinIndicator position={metrics.chinPosition} />
          : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Mentón</span>
              <span className="text-xs text-white/20">— sin datos</span>
            </div>
          )
        }

        {/* Simetría */}
        {isActive && metrics.isDetected && (
          <MetricBar
            label="Simetría facial"
            value={metrics.facialSymmetry}
            good={[0.85, 1]}
            warn={[0.7, 0.85]}
          />
        )}

        {/* Tip si hay tensión */}
        {isActive && metrics.isDetected && metrics.chinPosition !== 'neutral' && (
          <p className="text-[10px] text-amber-400/80 bg-amber-500/10 rounded-lg px-2 py-1.5">
            {metrics.chinPosition === 'up'
              ? '⬇️ Baja el mentón — la tensión en el cuello bloquea la laringe'
              : '⬆️ Levanta el mentón — la posición comprime la vía aérea'}
          </p>
        )}
      </div>
    </div>
  );
}
