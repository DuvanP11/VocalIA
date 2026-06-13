'use client';

import { useCallback, useEffect, useRef } from 'react';

interface VisualizerOptions {
  color?: string;
  backgroundColor?: string;
  lineWidth?: number;
  type?: 'waveform' | 'frequency';
}

export function useAudioVisualizer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  analyserNode: AnalyserNode | null,
  isActive: boolean,
  options: VisualizerOptions = {},
) {
  const animRef = useRef<number | null>(null);
  const {
    color = '#7c6aff',
    backgroundColor = 'transparent',
    lineWidth = 2,
    type = 'waveform',
  } = options;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserNode;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (type === 'waveform') {
      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(dataArray);

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i];
        const y = (v + 1) * height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
    } else {
      // Frecuencias (barras)
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = width / (bufferLength * 0.4);
      let x = 0;

      for (let i = 0; i < bufferLength * 0.4; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const alpha = 0.4 + (dataArray[i] / 255) * 0.6;
        ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [analyserNode, canvasRef, color, backgroundColor, lineWidth, type]);

  useEffect(() => {
    if (isActive && analyserNode) {
      draw();
    } else {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      // Limpiar canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isActive, analyserNode, draw]);
}
