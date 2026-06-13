'use client';

import { useEffect, useRef } from 'react';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  type?: 'waveform' | 'frequency';
  color?: string;
  height?: number;
  className?: string;
}

export function AudioVisualizer({
  analyserNode,
  isActive,
  type = 'waveform',
  color = '#7c6aff',
  height = 80,
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useAudioVisualizer(canvasRef, analyserNode, isActive, { color, type });

  // Ajustar tamaño del canvas al contenedor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      className={cn('w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]', className)}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={600}
        height={height}
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-1 items-end h-8">
            {[20, 30, 14, 32, 18, 28, 12, 35, 22, 16, 30, 24].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-white/10 rounded-full"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mini visualizador para usar en cards pequeñas
const MINI_IDLE_HEIGHTS = [5, 8, 4, 10, 6, 9, 3, 11, 7, 5, 8, 6, 4, 10, 7, 5];

export function MiniWaveform({
  isActive,
  color = '#7c6aff',
}: {
  isActive: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {MINI_IDLE_HEIGHTS.map((h, i) => (
        <div
          key={i}
          suppressHydrationWarning
          className="w-0.5 rounded-full transition-all"
          style={{
            height: `${h}px`,
            backgroundColor: isActive ? color : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </div>
  );
}
