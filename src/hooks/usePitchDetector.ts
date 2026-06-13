'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioPitchEngine, VocalRangeAnalyzer } from '@/lib/audio/pitchDetector';
import type { PitchResult } from '@/types';

interface UsePitchDetectorOptions {
  onPitch?: (result: PitchResult) => void;
  autoStart?: boolean;
}

export function usePitchDetector(options: UsePitchDetectorOptions = {}) {
  const engineRef = useRef<AudioPitchEngine | null>(null);
  const rangeAnalyzerRef = useRef(new VocalRangeAnalyzer());
  const [isListening, setIsListening] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<PitchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handlePitch = useCallback(
    (result: PitchResult) => {
      setCurrentPitch(result);
      if (result.frequency > 0) {
        rangeAnalyzerRef.current.addFrequency(result.frequency, result.clarity);
      }
      options.onPitch?.(result);
    },
    [options],
  );

  const start = useCallback(async () => {
    if (isListening) return;
    setError(null);
    try {
      if (!engineRef.current) {
        engineRef.current = new AudioPitchEngine();
      }
      await engineRef.current.start(handlePitch);
      setIsListening(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
        setPermissionDenied(true);
        setError('Permiso de micrófono denegado. Actívalo en la configuración del navegador.');
      } else {
        setError('No se pudo acceder al micrófono. Verifica que esté conectado.');
      }
    }
  }, [isListening, handlePitch]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    setIsListening(false);
    setCurrentPitch(null);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  const resetRangeAnalyzer = useCallback(() => {
    rangeAnalyzerRef.current.reset();
  }, []);

  const getRangeStats = useCallback(() => {
    return rangeAnalyzerRef.current.getStats();
  }, []);

  const getAnalyserNode = useCallback(() => {
    return engineRef.current?.getAnalyserNode() ?? null;
  }, []);

  useEffect(() => {
    if (options.autoStart) start();
    return () => { engineRef.current?.stop(); };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isListening,
    currentPitch,
    error,
    permissionDenied,
    start,
    stop,
    toggle,
    resetRangeAnalyzer,
    getRangeStats,
    getAnalyserNode,
  };
}
