'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui';
import type { VocalGoal, ExperienceLevel } from '@/types';

const GOALS: { id: VocalGoal; label: string; icon: string; desc: string }[] = [
  { id: 'sing-in-tune',     label: 'Cantar afinado',      icon: '🎯', desc: 'Mejorar la precisión de notas' },
  { id: 'improve-power',    label: 'Más potencia',         icon: '💪', desc: 'Voz más fuerte y proyectada' },
  { id: 'higher-notes',     label: 'Notas agudas',         icon: '⬆️', desc: 'Ampliar rango hacia arriba' },
  { id: 'lower-notes',      label: 'Notas graves',         icon: '⬇️', desc: 'Ampliar rango hacia abajo' },
  { id: 'audition-prep',    label: 'Audiciones',           icon: '🎭', desc: 'Prepararme para actuar' },
  { id: 'hobby',            label: 'Por diversión',        icon: '😄', desc: 'Cantar sin presión' },
  { id: 'improve-expression', label: 'Más expresividad',  icon: '🎨', desc: 'Contar historias con la voz' },
];

const EXPERIENCE: { id: ExperienceLevel; label: string; icon: string; desc: string }[] = [
  { id: 'absolute-beginner', label: 'Nunca he cantado',   icon: '🐣', desc: 'Empiezo desde cero' },
  { id: 'beginner',          label: 'Algo he cantado',    icon: '🌱', desc: 'Canto en casa o ducha' },
  { id: 'intermediate',      label: 'Tengo práctica',     icon: '🌿', desc: 'Canto con regularidad' },
  { id: 'advanced',          label: 'Nivel avanzado',     icon: '🌳', desc: 'Tengo formación musical' },
];

const PRACTICE_TIMES = [5, 10, 15, 20, 30, 45] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { setupProfile, completeOnboarding } = useAppStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<VocalGoal[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(15);

  const totalSteps = 4;

  const toggleGoal = (id: VocalGoal) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id],
    );
  };

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return experience !== null;
    return true;
  };

  const handleFinish = () => {
    setupProfile({
      name: name.trim(),
      goals: selectedGoals,
      experience: experience ?? 'absolute-beginner',
      dailyGoalMinutes: dailyMinutes,
    });
    completeOnboarding();
    router.push('/assessment');
  };

  const steps = [
    // Paso 0: Nombre
    <div key="name" className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-2xl font-bold text-white">¿Cómo te llamas?</h2>
        <p className="text-white/50 mt-2 text-sm">Tu profesor IA te llamará por tu nombre</p>
      </div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Tu nombre"
        maxLength={30}
        autoFocus
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 text-lg font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
        onKeyDown={e => e.key === 'Enter' && canNext() && setStep(1)}
      />
    </div>,

    // Paso 1: Objetivos
    <div key="goals" className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-white">¿Cuál es tu objetivo?</h2>
        <p className="text-white/50 mt-2 text-sm">Puedes elegir varios</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {GOALS.map(g => {
          const selected = selectedGoals.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                selected
                  ? 'bg-violet-600/20 border-violet-500/50 text-white'
                  : 'bg-white/[0.03] border-white/[0.07] text-white/60 hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-xl flex-shrink-0">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{g.label}</div>
                <div className="text-xs opacity-60">{g.desc}</div>
              </div>
              {selected && <span className="text-violet-400 flex-shrink-0">✓</span>}
            </button>
          );
        })}
      </div>
    </div>,

    // Paso 2: Experiencia
    <div key="experience" className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h2 className="text-2xl font-bold text-white">¿Cuál es tu nivel?</h2>
        <p className="text-white/50 mt-2 text-sm">Esto personaliza tu plan de estudio</p>
      </div>
      <div className="space-y-2">
        {EXPERIENCE.map(e => (
          <button
            key={e.id}
            onClick={() => setExperience(e.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
              experience === e.id
                ? 'bg-violet-600/20 border-violet-500/50 text-white'
                : 'bg-white/[0.03] border-white/[0.07] text-white/60 hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-2xl">{e.icon}</span>
            <div>
              <div className="font-semibold">{e.label}</div>
              <div className="text-xs opacity-60">{e.desc}</div>
            </div>
            {experience === e.id && <span className="ml-auto text-violet-400">✓</span>}
          </button>
        ))}
      </div>
    </div>,

    // Paso 3: Meta diaria
    <div key="daily" className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">⏱️</div>
        <h2 className="text-2xl font-bold text-white">¿Cuánto tiempo al día?</h2>
        <p className="text-white/50 mt-2 text-sm">
          {dailyMinutes} min diarios = grandes resultados en semanas
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PRACTICE_TIMES.map(t => (
          <button
            key={t}
            onClick={() => setDailyMinutes(t)}
            className={`py-4 rounded-xl border font-bold text-lg transition-all duration-200 ${
              dailyMinutes === t
                ? 'bg-violet-600/30 border-violet-500/60 text-violet-300'
                : 'bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.06]'
            }`}
          >
            {t}′
          </button>
        ))}
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <p className="text-sm text-emerald-400 text-center">
          🔥 Con {dailyMinutes} minutos al día estarás cantando con confianza en <strong>{dailyMinutes <= 10 ? '8' : dailyMinutes <= 20 ? '4' : '3'} semanas</strong>
        </p>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-[#080a12] px-5 py-8">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-violet-500' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-white/30 text-right">{step + 1} de {totalSteps}</p>
      </div>

      {/* Contenido del paso */}
      <div className="flex-1 overflow-y-auto">
        {steps[step]}
      </div>

      {/* Botones de navegación */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setStep(s => s - 1)}
            className="flex-1"
          >
            ← Atrás
          </Button>
        )}
        {step < totalSteps - 1 ? (
          <Button
            variant="primary"
            size="lg"
            disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
            className="flex-1"
          >
            Continuar →
          </Button>
        ) : (
          <Button
            variant="success"
            size="lg"
            onClick={handleFinish}
            className="flex-1"
          >
            ¡Empezar! 🎤
          </Button>
        )}
      </div>
    </div>
  );
}
