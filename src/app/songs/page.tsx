'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar, BottomNav } from '@/components/layout/Navigation';
import { songStorage, type StoredSong } from '@/lib/songStorage';
import { analyzeSong, formatDuration } from '@/lib/audio/songAnalyzer';

const ACCEPTED = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/x-m4a'];
const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil', medium: 'Medio', hard: 'Difícil', expert: 'Experto',
};
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-green-400 bg-green-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  hard: 'text-orange-400 bg-orange-500/10',
  expert: 'text-rose-400 bg-rose-500/10',
};

// ─── Componente ──────────────────────────────────────────────

export default function SongsPage() {
  const router = useRouter();
  const [songs, setSongs]         = useState<StoredSong[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null); // song id
  const [dragOver, setDragOver]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    songStorage.listSongs().then(setSongs);
  }, []);

  // ── Procesar archivo ─────────────────────────────────────────
  async function processFile(file: File) {
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(mp3|ogg|wav|aac|flac|m4a)$/i)) {
      alert('Formato no soportado. Usa MP3, OGG, WAV, AAC o FLAC.');
      return;
    }
    setUploading(true);

    try {
      // 1. Guardar archivo inmediatamente
      const stored = await songStorage.addSong(file);
      setSongs(prev => [stored, ...prev]);
      setUploading(false);

      // 2. Analizar en background (tonalidad + BPM)
      setAnalyzing(stored.id);
      const ctx = new AudioContext();
      const ab = await file.arrayBuffer();
      const buffer = await ctx.decodeAudioData(ab);
      ctx.close();

      const title = stored.title;
      const analysis = await analyzeSong(buffer, title);
      await songStorage.updateSong(stored.id, {
        duration: buffer.duration,
        analysis,
      });
      setSongs(prev => prev.map(s =>
        s.id === stored.id ? { ...s, duration: buffer.duration, analysis } : s,
      ));
    } catch (e) {
      console.error('Error procesando canción:', e);
      setUploading(false);
    } finally {
      setAnalyzing(null);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    Array.from(files).forEach(processFile);
  }

  async function deleteSong(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('¿Eliminar esta canción?')) return;
    await songStorage.deleteSong(id);
    setSongs(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="min-h-dvh bg-[#080a12] pb-24">
      <TopBar title="Mis Canciones" subtitle={`${songs.length} ${songs.length !== 1 ? 'canciones' : 'canción'}`} back />
      <BottomNav />

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* ── Upload zone ───────────────────────────────────── */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${dragOver
              ? 'border-violet-400 bg-violet-500/10'
              : 'border-white/[0.1] hover:border-violet-500/50 hover:bg-white/[0.02]'}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="space-y-2">
              <div className="text-3xl animate-pulse">⏳</div>
              <p className="text-sm text-white/50">Guardando…</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">🎵</div>
              <p className="text-sm font-medium text-white/70">Arrastra un archivo aquí</p>
              <p className="text-xs text-white/30">MP3 · OGG · WAV · AAC · FLAC</p>
            </div>
          )}
        </div>

        {/* ── Lista de canciones ────────────────────────────── */}
        {songs.length === 0 && !uploading && (
          <div className="text-center py-12 space-y-2">
            <p className="text-4xl opacity-30">🎤</p>
            <p className="text-sm text-white/30">Sin canciones todavía</p>
            <p className="text-xs text-white/20">Sube un MP3 para empezar</p>
          </div>
        )}

        <div className="space-y-3">
          {songs.map(song => (
            <Link
              key={song.id}
              href={`/songs/${song.id}`}
              className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-all active:scale-[0.99]"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icono */}
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎵</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white truncate">{song.title}</h3>
                      {analyzing === song.id && (
                        <span className="text-[10px] text-violet-400 animate-pulse flex-shrink-0">
                          Analizando…
                        </span>
                      )}
                    </div>
                    {song.artist && (
                      <p className="text-xs text-white/40 truncate mb-1">{song.artist}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {song.analysis ? (
                        <>
                          <span className="text-[11px] text-white/50">🔑 {song.analysis.key}</span>
                          <span className="text-white/20">·</span>
                          <span className="text-[11px] text-white/50">♩ {song.analysis.tempo} BPM</span>
                          <span className="text-white/20">·</span>
                          <span className="text-[11px] text-white/50">⏱ {formatDuration(song.duration)}</span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLOR[song.analysis.difficulty]}`}
                          >
                            {DIFFICULTY_LABEL[song.analysis.difficulty]}
                          </span>
                        </>
                      ) : song.duration > 0 ? (
                        <span className="text-[11px] text-white/50">⏱ {formatDuration(song.duration)}</span>
                      ) : (
                        <span className="text-[11px] text-white/30 italic">Sin analizar</span>
                      )}
                    </div>
                    {song.performances.length > 0 && (
                      <p className="text-[10px] text-white/30 mt-1">
                        {song.performances.length} práctica{song.performances.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Botón borrar */}
                  <button
                    onClick={e => deleteSong(song.id, e)}
                    className="text-white/20 hover:text-rose-400 transition-colors p-1 flex-shrink-0"
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
