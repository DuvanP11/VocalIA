'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar, BottomNav } from '@/components/layout/Navigation';
import { AudioVisualizer } from '@/components/audio/AudioVisualizer';
import { songStorage, type StoredSong } from '@/lib/songStorage';
import { useSongPlayer } from '@/hooks/useSongPlayer';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { formatDuration, isNoteInKey, getKeyNotes } from '@/lib/audio/songAnalyzer';
import { centsToColor } from '@/lib/audio/noteUtils';
import type { SongPerformance } from '@/types';

// ─── Estados del modo práctica ───────────────────────────────
type PracticeState = 'idle' | 'countdown' | 'singing' | 'results';

interface PracticeStats {
  totalFrames: number;
  singingFrames: number;
  inKeyFrames: number;
  sumCents: number;
  singingWithPitch: number;
}

const COUNTDOWN_SECS = 3;

export default function SongPracticePage() {
  const { songId } = useParams<{ songId: string }>();
  const router = useRouter();

  const [song, setSong]             = useState<StoredSong | null>(null);
  const [loading, setLoading]       = useState(true);
  const [practiceState, setPracticeState] = useState<PracticeState>('idle');
  const [countdown, setCountdown]   = useState(COUNTDOWN_SECS);
  const [stats, setStats]           = useState<PracticeStats | null>(null);
  const [liveStats, setLiveStats]   = useState<PracticeStats>({ totalFrames: 0, singingFrames: 0, inKeyFrames: 0, sumCents: 0, singingWithPitch: 0 });

  const statsRef  = useRef<PracticeStats>({ totalFrames: 0, singingFrames: 0, inKeyFrames: 0, sumCents: 0, singingWithPitch: 0 });
  const sessionStart = useRef(0);

  const player = useSongPlayer();
  const pitch  = usePitchDetector({ onPitch: () => {} });

  // ── Cargar canción ───────────────────────────────────────────
  useEffect(() => {
    if (!songId) return;
    (async () => {
      const meta = await songStorage.getSong(songId);
      if (!meta) { router.replace('/songs'); return; }
      setSong(meta);
      const blob = await songStorage.getAudio(songId);
      if (blob) await player.loadSong(blob);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  // ── Acumular estadísticas en modo práctica ──────────────────
  useEffect(() => {
    if (practiceState !== 'singing') return;
    const interval = setInterval(() => {
      statsRef.current.totalFrames++;
      const p = pitch.currentPitch;
      if (p && p.clarity > 0.85 && p.frequency > 80) {
        statsRef.current.singingFrames++;
        statsRef.current.sumCents += Math.abs(p.cents);
        statsRef.current.singingWithPitch++;
        if (song?.analysis && isNoteInKey(p.note, song.analysis.key)) {
          statsRef.current.inKeyFrames++;
        }
      }
      // Actualizar estado visible cada 500ms (cada 5 ticks de 100ms)
      if (statsRef.current.totalFrames % 5 === 0) {
        setLiveStats({ ...statsRef.current });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [practiceState, pitch.currentPitch, song]);

  // ── Countdown ────────────────────────────────────────────────
  useEffect(() => {
    if (practiceState !== 'countdown') return;
    setCountdown(COUNTDOWN_SECS);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          startActualPractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceState]);

  function startActualPractice() {
    statsRef.current = { totalFrames: 0, singingFrames: 0, inKeyFrames: 0, sumCents: 0, singingWithPitch: 0 };
    sessionStart.current = Date.now();
    player.play();
    pitch.start();
    setPracticeState('singing');
  }

  // ── Cuando la canción termina, cerrar práctica ───────────────
  useEffect(() => {
    if (practiceState === 'singing' && !player.isPlaying && player.progress > 0.98) {
      stopPractice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.isPlaying, player.progress, practiceState]);

  const stopPractice = useCallback(async () => {
    player.pause();
    pitch.stop();
    const s = statsRef.current;
    setStats({ ...s });
    setPracticeState('results');

    // Guardar performance
    if (song && s.singingWithPitch > 0) {
      const inKeyPct = s.inKeyFrames / s.singingWithPitch * 100;
      const pitchScore = Math.max(0, 100 - (s.sumCents / s.singingWithPitch));
      const overall = Math.round((inKeyPct * 0.6 + pitchScore * 0.4));
      const perf: SongPerformance = {
        songId: song.id,
        date: new Date().toISOString(),
        scores: {
          pitch: Math.round(pitchScore),
          rhythm: 70,
          breathing: Math.round(s.singingFrames / Math.max(s.totalFrames, 1) * 100),
          expression: Math.round(inKeyPct),
          overall,
        },
        highlights: [],
      };
      await songStorage.addPerformance(song.id, perf);
      setSong(prev => prev ? { ...prev, performances: [...prev.performances, perf] } : prev);
    }
  }, [player, pitch, song]);

  // ── Helpers de UI ────────────────────────────────────────────
  const inKeyNow = pitch.currentPitch && song?.analysis
    ? isNoteInKey(pitch.currentPitch.note, song.analysis.key)
    : null;

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#080a12] flex items-center justify-center">
        <div className="text-white/30 text-sm animate-pulse">Cargando…</div>
      </div>
    );
  }
  if (!song) return null;

  return (
    <div className="min-h-dvh bg-[#080a12] pb-24">
      <BottomNav />
      <TopBar
        title={song.title}
        subtitle={song.artist || 'Sin artista'}
        back
        action={
          practiceState === 'singing' && (
            <button
              onClick={stopPractice}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-medium transition-all"
            >
              Detener
            </button>
          )
        }
      />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ── Metadata ────────────────────────────────────────── */}
        {song.analysis && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: `🔑 ${song.analysis.key}` },
              { label: `♩ ${song.analysis.tempo} BPM` },
              { label: `⏱ ${formatDuration(song.duration)}` },
            ].map(({ label }) => (
              <span key={label} className="text-xs text-white/50 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                {label}
              </span>
            ))}
          </div>
        )}

        {/* ── Player ──────────────────────────────────────────── */}
        {practiceState === 'idle' && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
            {/* Barra de progreso */}
            <div>
              <div
                className="relative h-1.5 bg-white/10 rounded-full cursor-pointer"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  player.seek(ratio * player.duration);
                }}
              >
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${player.progress * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>{formatDuration(player.currentTime)}</span>
                <span>{formatDuration(player.duration)}</span>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={player.isPlaying ? player.pause : player.play}
                  disabled={!player.isLoaded}
                  className="w-10 h-10 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 flex items-center justify-center text-xl transition-all disabled:opacity-40"
                >
                  {player.isPlaying ? '⏸' : '▶️'}
                </button>
                <button
                  onClick={() => { player.pause(); player.seek(0); }}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-sm transition-all"
                >
                  ⏮
                </button>
              </div>

              {/* Volumen */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">🔊</span>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={player.volume}
                  onChange={e => player.setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-violet-500"
                />
              </div>
            </div>

            {/* Waveform */}
            <AudioVisualizer
              analyserNode={player.analyserNode}
              isActive={player.isPlaying}
              type="waveform"
              color="#7c6aff"
              height={60}
            />
          </div>
        )}

        {/* ── Countdown ───────────────────────────────────────── */}
        {practiceState === 'countdown' && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
            <p className="text-white/50 text-sm mb-3">Prepara tu voz…</p>
            <div className="text-7xl font-black text-violet-400 animate-pulse">{countdown}</div>
          </div>
        )}

        {/* ── Modo cantar ──────────────────────────────────────── */}
        {practiceState === 'singing' && (
          <div className="space-y-3">
            {/* Progreso de la canción */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                <span>{formatDuration(player.currentTime)}</span>
                <span>{formatDuration(player.duration)}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${player.progress * 100}%` }}
                />
              </div>
            </div>

            {/* Pitch en tiempo real */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              {pitch.currentPitch && pitch.currentPitch.clarity > 0.85 ? (
                <div className="text-center space-y-1">
                  <div className="text-4xl font-black" style={{ color: centsToColor(pitch.currentPitch.cents) }}>
                    {pitch.currentPitch.noteName}
                  </div>
                  <div className="text-xs text-white/40">{pitch.currentPitch.note} · {pitch.currentPitch.cents > 0 ? '+' : ''}{pitch.currentPitch.cents} cents</div>
                  {song.analysis && (
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-1 ${
                      inKeyNow
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {inKeyNow ? `✓ En tonalidad (${song.analysis.key})` : `✗ Fuera de tonalidad`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-white/30 text-sm py-2">
                  🎤 Canta algo…
                </div>
              )}

              {/* Waveform del micrófono */}
              <AudioVisualizer
                analyserNode={pitch.getAnalyserNode()}
                isActive={pitch.isListening}
                type="waveform"
                color="#34d399"
                height={50}
                className="mt-3"
              />
            </div>

            {/* Stats en vivo */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: 'Cantando',
                  value: `${Math.round(liveStats.singingFrames / Math.max(liveStats.totalFrames, 1) * 100)}%`,
                  color: '#34d399',
                },
                {
                  label: 'En clave',
                  value: `${liveStats.singingWithPitch > 0
                    ? Math.round(liveStats.inKeyFrames / liveStats.singingWithPitch * 100)
                    : 0}%`,
                  color: '#7c6aff',
                },
                {
                  label: 'Tiempo',
                  value: formatDuration(player.currentTime),
                  color: '#94a3b8',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                  <div className="text-base font-bold" style={{ color }}>{value}</div>
                  <div className="text-[10px] text-white/30">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Resultados ───────────────────────────────────────── */}
        {practiceState === 'results' && stats && (() => {
          const singingPct = Math.round(stats.singingFrames / Math.max(stats.totalFrames, 1) * 100);
          const inKeyPct   = stats.singingWithPitch > 0
            ? Math.round(stats.inKeyFrames / stats.singingWithPitch * 100) : 0;
          const avgCents   = stats.singingWithPitch > 0
            ? Math.round(stats.sumCents / stats.singingWithPitch) : 0;
          const overall    = Math.round(inKeyPct * 0.6 + Math.max(0, 100 - avgCents) * 0.4);

          return (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-2">
                  {overall >= 80 ? '⭐' : overall >= 60 ? '🎤' : '💪'}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {overall >= 80 ? '¡Excelente!' : overall >= 60 ? '¡Bien hecho!' : '¡Sigue practicando!'}
                </h2>
                <p className="text-3xl font-black text-violet-400 mt-1">{overall}<span className="text-lg text-white/40">/100</span></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tiempo cantando', value: `${singingPct}%`, icon: '🎤' },
                  { label: 'En tonalidad',    value: `${inKeyPct}%`,   icon: '🎯' },
                  { label: 'Afinación media', value: `±${avgCents}¢`,  icon: '🎵' },
                  { label: 'Prácticas',       value: `${(song.performances.length)}`, icon: '📊' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                    <div className="text-lg mb-0.5">{icon}</div>
                    <div className="text-base font-bold text-white">{value}</div>
                    <div className="text-[10px] text-white/40">{label}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    player.seek(0);
                    setPracticeState('countdown');
                  }}
                  className="flex-1 py-3 rounded-xl bg-violet-500/20 text-violet-300 font-semibold text-sm hover:bg-violet-500/30 transition-all"
                >
                  🔄 Repetir
                </button>
                <button
                  onClick={() => {
                    player.seek(0);
                    setPracticeState('idle');
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/[0.04] text-white/60 font-semibold text-sm hover:bg-white/[0.07] transition-all"
                >
                  ← Volver
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Botón principal: Cantar ───────────────────────── */}
        {practiceState === 'idle' && (
          <div className="space-y-3">
            {song.analysis && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-xs text-white/40 mb-1.5">Notas de la escala ({song.analysis.key})</p>
                <div className="flex flex-wrap gap-1.5">
                  {getKeyNotes(song.analysis.key).map((n: string) => (
                    <span key={n} className="text-[11px] font-mono font-bold text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                player.pause();
                player.seek(0);
                setPracticeState('countdown');
              }}
              disabled={!player.isLoaded || pitch.permissionDenied}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              🎤 Cantar con esta canción
            </button>
            {pitch.permissionDenied && (
              <p className="text-xs text-rose-400 text-center">
                ⚠️ Activa el micrófono en tu navegador para cantar
              </p>
            )}
          </div>
        )}

        {/* ── Historial de prácticas ───────────────────────── */}
        {song.performances.length > 0 && practiceState === 'idle' && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide">Historial</h3>
            {song.performances.slice(-5).reverse().map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                <span className="text-xs text-white/40">{new Date(p.date).toLocaleDateString()}</span>
                <span className="text-sm font-bold text-violet-400">{p.scores.overall}/100</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
