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
  const [isStarting, setIsStarting] = useState(false);
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
    if (isListening || isStarting) return;
    setError(null);
    setIsStarting(true);
    try {
      if (!engineRef.current) {
        engineRef.current = new AudioPitchEngine();
      }
      await engineRef.current.start(handlePitch);
      setIsListening(true);
    } catch (err) {
      engineRef.current = null;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed') || msg.includes('NotFoundError')) {
        setPermissionDenied(true);
        setError('Permiso de micrófono denegado. Actívalo en los ajustes del navegador.');
      } else {
        setError(`No se pudo acceder al micrófono: ${msg}`);
      }
    } finally {
      setIsStarting(false);
    }
  }, [isListening, isStarting, handlePitch]);

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
    isStarting,
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
