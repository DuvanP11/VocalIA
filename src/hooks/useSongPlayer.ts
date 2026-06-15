'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

// ─── Reproductor de canciones con Web Audio API ──────────────
// AudioContext se crea en play() (gesto del usuario) para cumplir
// con la política de autoplay de iOS Safari y Chrome Android.

export interface UseSongPlayerReturn {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isLoaded: boolean;
  error: string | null;
  loadSong(blob: Blob): Promise<void>;
  play(): void;
  pause(): void;
  seek(time: number): void;
  setVolume(v: number): void;
}

export function useSongPlayer(): UseSongPlayerReturn {
  const ctxRef      = useRef<AudioContext | null>(null);
  const gainRef     = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef   = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef   = useRef<AudioBuffer | null>(null);
  const rawBlobRef  = useRef<Blob | null>(null);     // blob crudo, se decodifica en play()
  const decodingRef = useRef(false);

  const startCtxTimeRef = useRef(0);
  const pauseOffsetRef  = useRef(0);
  const stoppedRef      = useRef(false);
  const rafRef          = useRef<number | null>(null);

  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolumeState]      = useState(0.8);
  const [isLoaded, setIsLoaded]       = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── Crea/reutiliza el grafo de audio ─────────────────────────
  const ensureGraph = useCallback((ctx: AudioContext) => {
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
  }, [volume]);

  // ── Carga: solo almacena el blob, sin AudioContext ───────────
  // Diferimos la creación del AudioContext a play() para cumplir
  // con la política de autoplay en iOS Safari y Chrome Android.
  const loadSong = useCallback(async (blob: Blob) => {
    setError(null);
    setIsLoaded(false);
    stoppedRef.current = true;
    sourceRef.current?.stop();
    sourceRef.current = null;
    bufferRef.current = null;
    rawBlobRef.current = null;
    decodingRef.current = false;
    pauseOffsetRef.current = 0;
    setCurrentTime(0);
    setDuration(0);

    try {
      // Intentar decodificar ahora (funciona si el contexto puede crearse)
      const AudioCtx = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new AudioCtx();
      }
      const ctx = ctxRef.current;

      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      bufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      ensureGraph(ctx);
      setIsLoaded(true);
    } catch {
      // Si falla (autoplay bloqueado en iOS), guardamos el blob crudo.
      // La decodificación real ocurrirá en play() tras el gesto del usuario.
      rawBlobRef.current = blob;
      setIsLoaded(true);  // habilitamos el botón; la decodificación real es en play()
    }
  }, [ensureGraph]);

  // ── Decodificación diferida (llamada desde play) ─────────────
  const decodeIfNeeded = useCallback(async (ctx: AudioContext): Promise<boolean> => {
    if (bufferRef.current) return true;
    if (!rawBlobRef.current || decodingRef.current) return false;
    decodingRef.current = true;
    try {
      const arrayBuffer = await rawBlobRef.current.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      bufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      ensureGraph(ctx);
      decodingRef.current = false;
      return true;
    } catch (e) {
      decodingRef.current = false;
      setError(e instanceof Error ? e.message : 'Error al decodificar audio');
      setIsLoaded(false);
      return false;
    }
  }, [ensureGraph]);

  // ── Reproducir ───────────────────────────────────────────────
  const play = useCallback(() => {
    const AudioCtx = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;

    // Reanudar si el contexto está suspendido (gesto del usuario activo)
    if (ctx.state === 'suspended') ctx.resume();

    if (!bufferRef.current) {
      // Decodificar blob en diferido (primera vez en iOS)
      decodeIfNeeded(ctx).then(ok => {
        if (ok) play();
      });
      return;
    }

    stoppedRef.current = true;
    sourceRef.current?.stop();

    const source = ctx.createBufferSource();
    source.buffer = bufferRef.current;
    source.connect(analyserRef.current ?? gainRef.current ?? ctx.destination);
    source.start(0, pauseOffsetRef.current);

    source.onended = () => {
      if (!stoppedRef.current) {
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
  }, [decodeIfNeeded]);

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

  // ── RAF para currentTime ─────────────────────────────────────
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
