import { NOTE_NAMES_EN } from './noteUtils';

// Parsea "C4", "A#3", "Bb4" → frecuencia Hz
export function parseNoteToFreq(noteStr: string): number {
  const match = noteStr.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 0;
  const [, noteName, octaveStr] = match;
  const noteIdx = NOTE_NAMES_EN.indexOf(noteName);
  if (noteIdx === -1) return 0;
  const octave = parseInt(octaveStr, 10);
  const midi = (octave + 1) * 12 + noteIdx;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface PlayNoteOptions {
  duration?: number;         // segundos (default: 2)
  volume?: number;           // 0-1 (default: 0.4)
  type?: OscillatorType;     // default: 'sine'
  fadeIn?: number;           // segundos (default: 0.05)
  fadeOut?: number;          // segundos (default: 0.4)
}

let currentCtx: AudioContext | null = null;

/**
 * Reproduce una nota musical en el navegador usando Web Audio API.
 * Retorna una Promise que resuelve cuando termina la nota.
 */
export function playNote(noteStr: string, opts: PlayNoteOptions = {}): Promise<void> {
  const {
    duration = 2,
    volume = 0.4,
    type = 'sine',
    fadeIn = 0.05,
    fadeOut = 0.4,
  } = opts;

  const freq = parseNoteToFreq(noteStr);
  if (!freq) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      currentCtx = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Fade in
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn);
      // Sustain
      gain.gain.setValueAtTime(volume, ctx.currentTime + duration - fadeOut);
      // Fade out
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);

      osc.onended = () => {
        ctx.close();
        if (currentCtx === ctx) currentCtx = null;
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Reproduce una secuencia de notas con pausa entre cada una.
 */
export async function playNoteSequence(
  notes: string[],
  opts: PlayNoteOptions & { pauseBetween?: number } = {},
): Promise<void> {
  const { pauseBetween = 0.3, ...noteOpts } = opts;
  for (const note of notes) {
    await playNote(note, noteOpts);
    if (pauseBetween > 0) {
      await new Promise(r => setTimeout(r, pauseBetween * 1000));
    }
  }
}

export function stopCurrentNote(): void {
  currentCtx?.close();
  currentCtx = null;
}
