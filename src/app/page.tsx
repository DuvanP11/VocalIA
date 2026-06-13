'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';

export default function Home() {
  const router = useRouter();
  const isOnboarded = useAppStore(s => s.isOnboarded);

  useEffect(() => {
    if (isOnboarded) router.replace('/dashboard');
  }, [isOnboarded, router]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-between bg-[#080a12] overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #7c6aff 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #38bdf8 0%, transparent 70%)' }}
        />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 relative z-10">
        {/* Logo */}
        <div className="text-7xl mb-6 float">🎤</div>

        <div className="mb-2">
          <span className="text-xs font-bold tracking-[3px] text-violet-400 uppercase">Bienvenido a</span>
        </div>

        <h1 className="text-6xl font-black tracking-tight glow-text mb-3">
          <span className="bg-gradient-to-r from-violet-300 via-purple-200 to-sky-300 bg-clip-text text-transparent">
            VocalIA
          </span>
        </h1>

        <p className="text-lg text-white/60 max-w-xs leading-relaxed mb-8">
          Tu profesor de canto personal con inteligencia artificial — disponible las 24 horas.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-10 w-full max-w-sm">
          {[
            { icon: '🎯', text: 'Afinación en tiempo real' },
            { icon: '🧠', text: 'IA adaptativa' },
            { icon: '😊', text: 'Análisis facial' },
            { icon: '📈', text: 'Seguimiento de progreso' },
          ].map(f => (
            <div key={f.text} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 flex items-center gap-2.5">
              <span className="text-xl">{f.icon}</span>
              <span className="text-xs text-white/60 font-medium leading-tight">{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/onboarding"
            className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold text-lg text-center transition-all duration-200 shadow-lg shadow-violet-900/40"
          >
            Comenzar Gratis 🚀
          </Link>
          <p className="text-xs text-white/30 text-center">
            Sin tarjeta de crédito · Sin registro obligatorio
          </p>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="w-full border-t border-white/[0.05] px-6 py-5 flex justify-around relative z-10">
        {[
          { value: '5', unit: 'Niveles', icon: '🎓' },
          { value: '40+', unit: 'Lecciones', icon: '📚' },
          { value: '100%', unit: 'Gratis MVP', icon: '💜' },
        ].map(s => (
          <div key={s.unit} className="text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-[10px] text-white/30">{s.unit}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
