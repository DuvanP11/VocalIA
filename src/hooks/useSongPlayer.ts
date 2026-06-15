'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

// ─── Reproductor de canciones con Web Audio API ──────────────

export interface UseSongPlayerReturn {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  currentTime: number;       // segundos
  duration: number;          // segundos
  progress: number;          // 0-1
  volume: number;            // 0-1
  isLoaded: boolean;
  error: string | null;
  loadSong(blob: Blob): Promise<void>;
  play(): void;
  pause(): void;
  seek(time: number): void;
  setVolume(v: number): void;
}

export function useSongPlayer(): UseSongPlayerReturn {
  const ctxRef     = useRef<AudioContext | null>(null);
  const gainRef    = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef  = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef  = useRef<AudioBuffer | null>(null);

  const startCtxTimeRef  = useRef(0);   // audioCtx.currentTime en el momento de play()
  const pauseOffsetRef   = useRef(0);   // segundos en la pista al pausar
  const stoppedRef       = useRef(false); // true si stop() fue manual (vs. fin de pista)
  const rafRef           = useRef<number | null>(null);

  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolumeState]      = useState(0.8);
  const [isLoaded, setIsLoaded]       = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── Carga y decodifica la canción ───────────────────────────
  const loadSong = useCallback(async (blob: Blob) => {
    setError(null);
    setIsLoaded(false);
    stoppedRef.current = true;
    sourceRef.current?.stop();
    sourceRef.current = null;

    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;

      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      bufferRef.current = audioBuffer;
      pauseOffsetRef.current = 0;
      setDuration(audioBuffer.duration);
      setCurrentTime(0);

      // Grafo de audio: source → analyser → gain → destination
      if (!gainRef.current) {
        gainRef.current = ctx.createGain();
        gainRef.current.gain.value = volume;
        gainRef.current.connect(ctx.destination);
      }
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.connect(gainRef.current);
        setAnalyserNode(analyserRef.current);
      }

      setIsLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar canción');
    }
  }, [volume]);

  // ── Reproducir ───────────────────────────────────────────────
  const play = useCallback(() => {
    if (!ctxRef.current || !bufferRef.current) return;
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    stoppedRef.current = true;
    sourceRef.current?.stop();

    const source = ctx.createBufferSource();
    source.buffer = bufferRef.current;
    source.connect(analyserRef.current ?? gainRef.current ?? ctx.destination);
    source.start(0, pauseOffsetRef.current);

    source.onended = () => {
      if (!stoppedRef.current) {
        // Fin natural de la pista
        setIsPlaying(false);
        setCurrentTime(bufferRef.current?.duration ?? 0);
        pauseOffsetRef.current = 0;
      }
      stoppedRef.current = false;
    };

    sourceRef.current = source;
    startCtxTimeRef.current = ctx.currentTime;
    stoppedRef.current = false;
    setIsPlaying(true);
  }, []);

  // ── Pausar ───────────────────────────────────────────────────
  const pause = useCallback(() => {
    if (!ctxRef.current || !isPlaying) return;
    pauseOffsetRef.current += ctxRef.current.currentTime - startCtxTimeRef.current;
    stoppedRef.current = true;
    sourceRef.current?.stop();
    setIsPlaying(false);
  }, [isPlaying]);

  // ── Seek ─────────────────────────────────────────────────────
  const seek = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(time, bufferRef.current?.duration ?? 0));
    pauseOffsetRef.current = clamped;
    setCurrentTime(clamped);
    if (isPlaying) {
      // Relanzar desde nuevo offset
      stoppedRef.current = true;
      sourceRef.current?.stop();
      setTimeout(play, 0);
    }
  }, [isPlaying, play]);

  // ── Volumen ──────────────────────────────────────────────────
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (gainRef.current) gainRef.current.gain.value = clamped;
  }, []);

  // ── RAF para actualizar currentTime ──────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      if (ctxRef.current) {
        const elapsed = ctxRef.current.currentTime - startCtxTimeRef.current;
        const t = Math.min(pauseOffsetRef.current + elapsed, bufferRef.current?.duration ?? 0);
        setCurrentTime(t);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying]);

  // ── Cleanup ──────────────────────────────────────────────────
  useEffect(() => () => {
    stoppedRef.current = true;
    sourceRef.current?.stop();
    ctxRef.current?.close();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return {
    analyserNode,
    isPlaying,
    currentTime,
    duration,
    progress: duration > 0 ? currentTime / duration : 0,
    volume,
    isLoaded,
    error,
    loadSong,
    play,
    pause,
    seek,
    setVolume,
  };
}
