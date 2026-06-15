import { PitchDetector as PitchyDetector } from 'pitchy';
import { frequencyToNoteInfo } from './noteUtils';
import type { PitchResult } from '@/types';

// Configuración del motor de detección
const FFT_SIZE = 2048;
const CLARITY_THRESHOLD = 0.75; // 0-1: confianza mínima para reportar nota
const MIN_FREQUENCY = 70;       // Hz — por debajo se ignora (ruido)
const MAX_FREQUENCY = 1400;     // Hz — límite superior vocal
const MIC_TIMEOUT_MS = 12000;   // 12 s para que el usuario acepte el permiso

export class AudioPitchEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private detector: PitchyDetector<Float32Array> | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;
  private animFrameId: number | null = null;
  private onPitch: ((result: PitchResult) => void) | null = null;
  private isRunning = false;

  async start(onPitch: (result: PitchResult) => void): Promise<void> {
    if (this.isRunning) return;
    this.onPitch = onPitch;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException(
        'getUserMedia no disponible. Asegúrate de usar HTTPS y un navegador compatible.',
        'NotSupportedError',
      );
    }

    // ── 1. Solicitar micrófono con timeout ──────────────────────
    // getUserMedia puede colgar si el usuario ignora el diálogo → bloqueamos
    // isStarting para siempre. Promise.race lo resuelve.
    this.stream = await this.getUserMediaWithTimeout();

    // ── 2. Crear AudioContext DESPUÉS de tener el stream ────────
    // Crearlo antes haría que iOS/Android lo suspendieran durante el diálogo.
    const AudioCtx = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioContext = new AudioCtx();

    // ── 3. Conectar grafo de audio ───────────────────────────────
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser   = this.audioContext.createAnalyser();
    this.analyser.fftSize = FFT_SIZE;
    this.analyser.smoothingTimeConstant = 0;
    this.sourceNode.connect(this.analyser);

    this.detector = PitchyDetector.forFloat32Array(this.analyser.fftSize);
    this.buffer   = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;

    // ── 4. Reanudar si el contexto quedó suspendido ──────────────
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }

    this.isRunning = true;
    this.detectLoop();
  }

  private async getUserMediaWithTimeout(): Promise<MediaStream> {
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        reject(new Error('Timeout: el diálogo de permisos no respondió en tiempo'));
      }, MIC_TIMEOUT_MS);
    });

    // Intentar con constraints de calidad óptimos; si falla, usar audio básico
    const withConstraints = navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    try {
      const stream = await Promise.race([withConstraints, timeout]);
      clearTimeout(timerId);
      return stream;
    } catch (err) {
      clearTimeout(timerId);
      // Si el error es NotAllowedError / Timeout, propagar directamente
      if (
        err instanceof DOMException ||
        (err instanceof Error && err.message.includes('Timeout'))
      ) {
        throw err;
      }
      // Fallback: constraints pueden no ser soportados en algunos navegadores móviles
      return navigator.mediaDevices.getUserMedia({ audio: true });
    }
  }

  stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stream?.getTracks().forEach(t => t.stop());
    this.sourceNode?.disconnect();
    this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.stream = null;
    this.detector = null;
    this.buffer = null;
  }

  private detectLoop = (): void => {
    if (!this.isRunning || !this.analyser || !this.detector || !this.buffer || !this.audioContext) return;

    this.analyser.getFloatTimeDomainData(this.buffer);
    const [frequency, clarity] = this.detector.findPitch(
      this.buffer,
      this.audioContext.sampleRate,
    );

    if (
      clarity >= CLARITY_THRESHOLD &&
      frequency >= MIN_FREQUENCY &&
      frequency <= MAX_FREQUENCY
    ) {
      const noteInfo = frequencyToNoteInfo(frequency);
      this.onPitch?.({
        frequency,
        note: noteInfo.note,
        noteName: noteInfo.noteName,
        octave: noteInfo.octave,
        cents: noteInfo.cents,
        clarity,
        timestamp: Date.now(),
      });
    } else {
      this.onPitch?.({
        frequency: -1,
        note: '—',
        noteName: '—',
        octave: 0,
        cents: 0,
        clarity: 0,
        timestamp: Date.now(),
      });
    }

    this.animFrameId = requestAnimationFrame(this.detectLoop);
  };

  getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  getSampleRate(): number {
    return this.audioContext?.sampleRate ?? 44100;
  }
}

// ─── Analizador de rango vocal ────────────────────────────────

export class VocalRangeAnalyzer {
  private detectedFrequencies: number[] = [];
  private sessionStart = Date.now();

  addFrequency(freq: number, clarity: number): void {
    if (freq > 0 && clarity >= CLARITY_THRESHOLD) {
      this.detectedFrequencies.push(freq);
    }
  }

  getStats() {
    if (this.detectedFrequencies.length < 10) {
      return null;
    }

    const sorted = [...this.detectedFrequencies].sort((a, b) => a - b);
    const p5  = sorted[Math.floor(sorted.length * 0.05)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    const filtered = sorted.filter(f => f >= p5 && f <= p95);
    const avg = filtered.reduce((a, b) => a + b, 0) / filtered.length;

    return {
      lowest:  filtered[0],
      highest: filtered[filtered.length - 1],
      average: avg,
      count:   filtered.length,
      durationSeconds: (Date.now() - this.sessionStart) / 1000,
    };
  }

  reset(): void {
    this.detectedFrequencies = [];
    this.sessionStart = Date.now();
  }
}
