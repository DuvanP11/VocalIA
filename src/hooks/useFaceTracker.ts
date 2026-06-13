'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

// ─── Tipos públicos ──────────────────────────────────────────

export interface FaceMetrics {
  jawOpenness: number;                        // 0-1 (0=cerrada, 1=muy abierta)
  lipTension: number;                         // 0-1 (0=relajada, 1=muy tensa)
  chinPosition: 'up' | 'down' | 'neutral';   // posición del mentón
  facialSymmetry: number;                     // 0-1 (1=perfecta)
  isDetected: boolean;
}

export const DEFAULT_FACE_METRICS: FaceMetrics = {
  jawOpenness: 0,
  lipTension: 0,
  chinPosition: 'neutral',
  facialSymmetry: 1,
  isDetected: false,
};

// ─── Índices de landmarks MediaPipe Face Mesh ────────────────

const LM = {
  upperLipInner: 13,   // labio superior interior
  lowerLipInner: 14,   // labio inferior interior
  leftLipCorner: 61,   // comisura izquierda
  rightLipCorner: 291, // comisura derecha
  noseTip: 1,          // punta de nariz
  chin: 152,           // punta del mentón
  foreheadTop: 10,     // frente superior centro
  leftEyeOuter: 33,    // esquina exterior ojo izquierdo
  rightEyeOuter: 263,  // esquina exterior ojo derecho
};

type Lm = { x: number; y: number; z: number };

function dist(a: Lm, b: Lm) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function computeMetrics(lms: Lm[]): FaceMetrics {
  const faceH = dist(lms[LM.foreheadTop], lms[LM.chin]);
  if (faceH < 0.01) return { ...DEFAULT_FACE_METRICS, isDetected: true };

  // ── Apertura mandibular ────────────────────────────────────
  const jawDist = dist(lms[LM.upperLipInner], lms[LM.lowerLipInner]);
  // ~0.25 de la altura de la cara es el denominador de referencia
  const jawOpenness = Math.min(1, jawDist / (faceH * 0.22));

  // ── Tensión labial ─────────────────────────────────────────
  // Ratio ancho-boca / ancho-ocular. Mayor ratio → labios más estirados
  const mouthW = dist(lms[LM.leftLipCorner], lms[LM.rightLipCorner]);
  const eyeW = dist(lms[LM.leftEyeOuter], lms[LM.rightEyeOuter]);
  // Relajado ≈ 0.65× el ancho ocular; muy tenso ≈ 0.85×
  const lipRatio = mouthW / (eyeW * 0.65);
  const lipTension = Math.min(1, Math.max(0, lipRatio - 1));

  // ── Posición del mentón ────────────────────────────────────
  // Comparamos cara superior (frente→nariz) con cara inferior (nariz→mentón)
  const upperFace = lms[LM.noseTip].y - lms[LM.foreheadTop].y;
  const lowerFace = lms[LM.chin].y - lms[LM.noseTip].y;
  const ratio = upperFace > 0.001 ? lowerFace / upperFace : 1;
  const chinPosition: FaceMetrics['chinPosition'] =
    ratio < 0.85 ? 'up' : ratio > 1.15 ? 'down' : 'neutral';

  // ── Simetría facial ────────────────────────────────────────
  const eyeMidX = (lms[LM.leftEyeOuter].x + lms[LM.rightEyeOuter].x) / 2;
  const noseX = lms[LM.noseTip].x;
  const asymmetry = Math.abs(eyeMidX - noseX) / (eyeW * 0.5);
  const facialSymmetry = Math.max(0, 1 - asymmetry * 2);

  return { jawOpenness, lipTension, chinPosition, facialSymmetry, isDetected: true };
}

// ─── Tipos internos para la API global de MediaPipe ──────────

interface FaceMeshInstance {
  setOptions(opts: Record<string, unknown>): void;
  onResults(cb: (results: { multiFaceLandmarks?: Lm[][] }) => void): void;
  send(opts: { image: HTMLVideoElement }): Promise<void>;
  close(): void;
}

// ─── Hook principal ──────────────────────────────────────────

interface UseFaceTrackerOptions {
  onMetrics?: (m: FaceMetrics) => void;
  drawOverlay?: boolean;
}

export function useFaceTracker({
  onMetrics,
  drawOverlay = true,
}: UseFaceTrackerOptions = {}) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fmRef      = useRef<FaceMeshInstance | null>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isActive,  setIsActive]  = useState(false);
  const [metrics,   setMetrics]   = useState<FaceMetrics>(DEFAULT_FACE_METRICS);
  const [error,     setError]     = useState<string | null>(null);

  // ── Dibuja landmarks en el canvas overlay ──────────────────
  const drawLandmarks = useCallback((lms: Lm[], m: FaceMetrics) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Puntos clave (labios, nariz, mentón)
    ctx.fillStyle = 'rgba(124,106,255,0.9)';
    for (const idx of Object.values(LM)) {
      const p = lms[idx];
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Línea de apertura mandibular
    const uL = lms[LM.upperLipInner];
    const lL = lms[LM.lowerLipInner];
    ctx.strokeStyle =
      m.jawOpenness > 0.45 ? '#22c55e' :
      m.jawOpenness > 0.2  ? '#f59e0b' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(uL.x * canvas.width, uL.y * canvas.height);
    ctx.lineTo(lL.x * canvas.width, lL.y * canvas.height);
    ctx.stroke();
  }, []);

  // ── Callback de resultados ─────────────────────────────────
  const handleResults = useCallback((results: { multiFaceLandmarks?: Lm[][] }) => {
    if (!results.multiFaceLandmarks?.[0]) {
      setMetrics(prev => prev.isDetected ? { ...DEFAULT_FACE_METRICS } : prev);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }
    const lms = results.multiFaceLandmarks[0];
    const m = computeMetrics(lms);
    setMetrics(m);
    onMetrics?.(m);
    if (drawOverlay) drawLandmarks(lms, m);
  }, [onMetrics, drawOverlay, drawLandmarks]);

  // ── start ──────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (isActive || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      await loadScript(
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js',
      );

      const win = window as Window & {
        FaceMesh: new (c: unknown) => FaceMeshInstance;
      };

      const faceMesh = new win.FaceMesh({
        locateFile: (f: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults(handleResults);
      fmRef.current = faceMesh;

      const video = videoRef.current;
      if (!video) throw new Error('Video element no disponible');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      const sendFrames = async () => {
        if (fmRef.current && video.readyState >= 2) {
          await fmRef.current.send({ image: video });
        }
        rafRef.current = requestAnimationFrame(sendFrames);
      };
      rafRef.current = requestAnimationFrame(sendFrames);

      setIsActive(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al iniciar cámara';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isActive, isLoading, handleResults]);

  // ── stop ───────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    fmRef.current?.close();
    fmRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setMetrics(DEFAULT_FACE_METRICS);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  useEffect(() => () => { stop(); }, [stop]);

  return { videoRef, canvasRef, metrics, isLoading, isActive, error, start, stop };
}

// ─── Helper: carga dinámica de scripts ──────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
    document.head.appendChild(s);
  });
}
