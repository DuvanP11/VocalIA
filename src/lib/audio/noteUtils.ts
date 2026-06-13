import type { VoiceType, VocalRange } from '@/types';

export const NOTE_NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

export function frequencyToMidi(frequency: number): number {
  return 12 * Math.log2(frequency / 440) + 69;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToNoteInfo(frequency: number): {
  note: string;
  noteName: string;
  octave: number;
  cents: number;
  midi: number;
} {
  if (frequency <= 0) return { note: '—', noteName: '—', octave: 0, cents: 0, midi: 0 };

  const midi = frequencyToMidi(frequency);
  const midiRounded = Math.round(midi);
  const noteIndex = ((midiRounded % 12) + 12) % 12;
  const octave = Math.floor(midiRounded / 12) - 1;
  const cents = Math.round((midi - midiRounded) * 100);

  return {
    note: `${NOTE_NAMES_EN[noteIndex]}${octave}`,
    noteName: NOTE_NAMES_ES[noteIndex],
    octave,
    cents,
    midi: midiRounded,
  };
}

export function noteToFrequency(note: string, octave: number): number {
  const idx = NOTE_NAMES_EN.indexOf(note);
  if (idx === -1) return 0;
  const midi = (octave + 1) * 12 + idx;
  return midiToFrequency(midi);
}

export function centsToColor(cents: number): string {
  const abs = Math.abs(cents);
  if (abs <= 10) return '#34d399';  // verde — muy afinado
  if (abs <= 25) return '#fbbf24';  // amarillo — aceptable
  return '#f87171';                  // rojo — desafinado
}

export function centsToLabel(cents: number): string {
  const abs = Math.abs(cents);
  if (abs <= 5) return '¡Perfecto!';
  if (abs <= 15) return cents > 0 ? 'Ligeramente alto' : 'Ligeramente bajo';
  if (abs <= 30) return cents > 0 ? 'Un poco alto' : 'Un poco bajo';
  return cents > 0 ? 'Demasiado alto' : 'Demasiado bajo';
}

// Clasificación de tipo de voz según rango (MIDI)
export function classifyVoiceType(lowestMidi: number, highestMidi: number): VoiceType {
  const range = highestMidi - lowestMidi;

  // Voces femeninas (fundamental > C4 = midi 60)
  if (lowestMidi >= 55) {
    if (highestMidi >= 81) return 'soprano';          // hasta A5
    if (highestMidi >= 76) return 'mezzo-soprano';    // hasta E5
    return 'contralto';                               // hasta C5
  }

  // Voces masculinas
  if (lowestMidi <= 48) {
    if (lowestMidi <= 40) return 'bass';              // E2 y abajo
    return 'baritone';                                // C2-G2
  }
  if (lowestMidi <= 52) return 'tenor';               // E2-C3
  if (range >= 24 && highestMidi >= 72) return 'countertenor';

  return 'unknown';
}

export const VOICE_TYPE_INFO: Record<VoiceType, { label: string; rangeLabel: string; description: string; color: string }> = {
  bass: {
    label: 'Bajo',
    rangeLabel: 'E2 – E4',
    description: 'La voz masculina más grave. Rica y oscura, con gran presencia y autoridad.',
    color: '#6366f1',
  },
  baritone: {
    label: 'Barítono',
    rangeLabel: 'G2 – G4',
    description: 'La voz masculina media. Cálida y versátil, la más común en hombres.',
    color: '#8b5cf6',
  },
  tenor: {
    label: 'Tenor',
    rangeLabel: 'C3 – C5',
    description: 'La voz masculina más aguda. Brillante y expresiva, reina en la ópera.',
    color: '#06b6d4',
  },
  countertenor: {
    label: 'Contratenor',
    rangeLabel: 'E3 – E5',
    description: 'Registro muy agudo en voz masculina, con uso del registro de falsete.',
    color: '#22d3ee',
  },
  contralto: {
    label: 'Contralto',
    rangeLabel: 'E3 – G5',
    description: 'La voz femenina más grave. Profunda, cálida y de gran carácter.',
    color: '#f97316',
  },
  'mezzo-soprano': {
    label: 'Mezzosoprano',
    rangeLabel: 'A3 – A5',
    description: 'Voz femenina media. Cálida en graves y brillante en agudos.',
    color: '#ec4899',
  },
  soprano: {
    label: 'Soprano',
    rangeLabel: 'C4 – C6',
    description: 'La voz femenina más aguda. Brillante, luminosa e icónica.',
    color: '#f43f5e',
  },
  unknown: {
    label: 'Sin clasificar',
    rangeLabel: '—',
    description: 'Necesitas más datos para clasificar tu voz. ¡Continúa el diagnóstico!',
    color: '#64748b',
  },
};

// Notas objetivo para ejercicios de calentamiento según tipo de voz
export function getWarmupNotes(voiceType: VoiceType): string[] {
  const warmups: Record<VoiceType, string[]> = {
    bass:            ['E2', 'G2', 'B2', 'D3', 'E3'],
    baritone:        ['G2', 'B2', 'D3', 'F3', 'G3'],
    tenor:           ['C3', 'E3', 'G3', 'B3', 'C4'],
    countertenor:    ['E3', 'G3', 'B3', 'D4', 'E4'],
    contralto:       ['E3', 'G3', 'B3', 'D4', 'E4'],
    'mezzo-soprano': ['A3', 'C4', 'E4', 'G4', 'A4'],
    soprano:         ['C4', 'E4', 'G4', 'B4', 'C5'],
    unknown:         ['A3', 'C4', 'E4', 'G4', 'A4'],
  };
  return warmups[voiceType];
}
