// ─── Análisis de canciones: tonalidad + BPM ─────────────────
// Key detection:  Krumhansl-Schmuckler (1990) con chroma FFT
// BPM detection:  autocorrelación de función de onset

import type { SongAnalysis } from '@/types';
import { NOTE_NAMES_EN } from './noteUtils';

// ─── Perfiles de tonalidad (Krumhansl-Schmuckler) ───────────
const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

// ─── Correlación de Pearson ──────────────────────────────────
function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const mA = a.reduce((s, v) => s + v, 0) / n;
  const mB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, dA = 0, dB = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - mA) * (b[i] - mB);
    dA += (a[i] - mA) ** 2;
    dB += (b[i] - mB) ** 2;
  }
  const den = Math.sqrt(dA * dB);
  return den < 1e-9 ? 0 : num / den;
}

// ─── FFT Cooley-Tukey radix-2 (in-place) ────────────────────
function fftInPlace(re: Float32Array, im: Float32Array): void {
  const N = re.length;
  // Bit-reversal
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  // Butterfly stages
  for (let len = 2; len <= N; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wRe = Math.cos(ang), wIm = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let curRe = 1, curIm = 0;
      const half = len >> 1;
      for (let j = 0; j < half; j++) {
        const uRe = re[i + j], uIm = im[i + j];
        const vRe = re[i + j + half] * curRe - im[i + j + half] * curIm;
        const vIm = re[i + j + half] * curIm + im[i + j + half] * curRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + half] = uRe - vRe;
        im[i + j + half] = uIm - vIm;
        const nr = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nr;
      }
    }
  }
}

// ─── Ventana de Hanning ──────────────────────────────────────
function hannWindow(N: number): Float32Array {
  const w = new Float32Array(N);
  for (let i = 0; i < N; i++) w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / N));
  return w;
}

// ─── Vector chroma (12 clases de tono) ──────────────────────
function computeChroma(buffer: AudioBuffer): number[] {
  const sr = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  // Sólo los primeros 30 s para velocidad
  const maxSamples = Math.min(data.length, sr * 30);

  const N = 8192;
  const win = hannWindow(N);
  const chroma = new Array<number>(12).fill(0);
  const re = new Float32Array(N);
  const im = new Float32Array(N);

  for (let start = 0; start + N < maxSamples; start += N) {
    for (let i = 0; i < N; i++) { re[i] = data[start + i] * win[i]; im[i] = 0; }
    fftInPlace(re, im);

    for (let k = 1; k < N / 2; k++) {
      const freq = k * sr / N;
      if (freq < 65 || freq > 1050) continue;   // C2 – C6
      const mag = Math.sqrt(re[k] ** 2 + im[k] ** 2);
      if (mag < 1e-7) continue;
      // Frecuencia → clase de tono (0=C, 1=C#, …, 11=B)
      const midiFloat = 12 * Math.log2(freq / 440) + 69;
      const pc = ((Math.round(midiFloat) % 12) + 12) % 12;
      chroma[pc] += mag;
    }
  }
  return chroma;
}

// ─── Detección de tonalidad ──────────────────────────────────
export function detectKey(buffer: AudioBuffer): string {
  const chroma = computeChroma(buffer);
  let bestScore = -Infinity;
  let bestKey = 'C mayor';

  for (let root = 0; root < 12; root++) {
    // El perfil rotado: profile[i] = KS_MAJOR[(i-root+12)%12]
    const maj = Array.from({ length: 12 }, (_, i) => KS_MAJOR[(i - root + 12) % 12]);
    const min = Array.from({ length: 12 }, (_, i) => KS_MINOR[(i - root + 12) % 12]);

    const sc = pearson(chroma, maj);
    const sm = pearson(chroma, min);

    if (sc > bestScore) { bestScore = sc; bestKey = `${NOTE_NAMES_EN[root]} mayor`; }
    if (sm > bestScore) { bestScore = sm; bestKey = `${NOTE_NAMES_EN[root]} menor`; }
  }
  return bestKey;
}

// ─── Detección de BPM via autocorrelación de onset ──────────
export function detectBPM(buffer: AudioBuffer): number {
  const sr = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const frameSize = 512;
  const maxSamples = Math.min(data.length, sr * 30);

  // Energía RMS por frame
  const energies: number[] = [];
  for (let i = 0; i + frameSize < maxSamples; i += frameSize) {
    let e = 0;
    for (let j = 0; j < frameSize; j++) e += data[i + j] ** 2;
    energies.push(Math.sqrt(e / frameSize));
  }

  // Derivada semirectificada (función de onset)
  const onset = energies.map((e, i) => i > 0 ? Math.max(0, e - energies[i - 1]) : 0);

  // Autocorrelación en rango de BPM [60, 180]
  const fps = sr / frameSize; // ≈ 86 frames/s
  const minLag = Math.max(1, Math.round(fps * 60 / 180));
  const maxLag = Math.round(fps * 60 / 60);

  let bestLag = minLag;
  let bestCorr = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag++) {
    const n = onset.length - lag;
    let corr = 0;
    for (let i = 0; i < n; i++) corr += onset[i] * onset[i + lag];
    corr /= n;
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
  }

  let bpm = Math.round(fps * 60 / bestLag);
  // Normalizar a [60, 180]
  while (bpm < 60) bpm *= 2;
  while (bpm > 180) bpm = Math.round(bpm / 2);
  return bpm;
}

// ─── Notas de la escala de una tonalidad ────────────────────
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10];

export function getKeyNotes(key: string): string[] {
  const [root, mode] = key.split(' ');
  const rootIdx = NOTE_NAMES_EN.indexOf(root);
  if (rootIdx === -1) return [];
  const steps = mode === 'mayor' ? MAJOR_STEPS : MINOR_STEPS;
  return steps.map(s => NOTE_NAMES_EN[(rootIdx + s) % 12]);
}

export function isNoteInKey(note: string, key: string): boolean {
  const name = note.replace(/\d/g, '');
  return getKeyNotes(key).includes(name);
}

// ─── Notas dominantes (top 5 por energía) ───────────────────
function dominantNotes(chroma: number[]): string[] {
  return chroma
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5)
    .map(({ i }) => `${NOTE_NAMES_EN[i]}4`);
}

// ─── Dificultad estimada ─────────────────────────────────────
function estimateDifficulty(key: string, duration: number): SongAnalysis['difficulty'] {
  const acc = key.includes('#');
  const minor = key.includes('menor');
  const short = duration < 120;
  if (!acc && !minor && short) return 'easy';
  if (acc && minor && !short) return 'hard';
  if (acc || minor || !short) return 'medium';
  return 'easy';
}

// ─── Análisis completo ───────────────────────────────────────
export async function analyzeSong(
  buffer: AudioBuffer,
  title: string,
  artist?: string,
): Promise<SongAnalysis> {
  const key = detectKey(buffer);
  const tempo = detectBPM(buffer);
  const chroma = computeChroma(buffer);
  const dominant = dominantNotes(chroma);
  const duration = buffer.duration;

  return {
    title,
    artist,
    key,
    tempo,
    dominantNotes: dominant,
    rangeMin: dominant[4] ?? 'C3',
    rangeMax: dominant[0] ?? 'C5',
    difficulty: estimateDifficulty(key, duration),
    duration,
  };
}

// ─── Formato de duración ─────────────────────────────────────
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
