'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioPitchEngine, VocalRangeAnalyzer } from '@/lib/audio/pitchDetector';
import type { PitchResult } from '@/types';

interface UsePitchDetectorOptions {
  onPitch?: (result: PitchResult) => void;
  autoStart?: boolean;
}

export function usePitchDetector(options: UsePitchDetectorOptions = {}) {
  const engineRef       = useRef<AudioPitchEngine | null>(null);
  const rangeAnalyzerRef = useRef(new VocalRangeAnalyzer());

  // Patrón ref-para-callback: mantiene onPitch actualizado sin recrear handlePitch
  // Esto rompe la cadena options → handlePitch → start → toggle que se recreaba cada render
  const onPitchRef = useRef(options.onPitch);
  useEffect(() => {
    onPitchRef.current = options.onPitch;
  });

  const [isListening, setIsListening] = useState(false);
  const [isStarting,  setIsStarting]  = useState(false);
  const [currentPitch, setCurrentPitch] = useState<PitchResult | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // handlePitch es ESTABLE (deps vacías) porque usa la ref en lugar de options
  const handlePitch = useCallback((result: PitchResult) => {
    setCurrentPitch(result);
    if (result.frequency > 0) {
      rangeAnalyzerRef.current.addFrequency(result.frequency, result.clarity);
    }
    onPitchRef.current?.(result);
  }, []);

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
      const name = err instanceof DOMException ? err.name : '';
      const msg  = err instanceof Error ? err.message : String(err);
      const full = name ? `${name}: ${msg}` : msg;

      if (
        name === 'NotAllowedError' || name === 'PermissionDeniedError' ||
        msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')
      ) {
        setPermissionDenied(true);
        setError('Permiso de micrófono denegado. Ve a ajustes del navegador y habilítalo.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No se encontró ningún micrófono en este dispositivo.');
      } else if (msg.includes('Timeout') || msg.includes('tiempo')) {
        setError('El diálogo de permisos tardó demasiado. Toca de nuevo para reintentar.');
      } else {
        setError(`No se pudo acceder al micrófono: ${full}`);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
