import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  generateFallbackPlan,
  type WeaknessAnalysis,
  type CoachingPlan,
} from '@/lib/training/adaptiveCoach';

function extractJSON(raw: string): unknown {
  try { return JSON.parse(raw); } catch { /* continue */ }
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) { try { return JSON.parse(fenced[1]); } catch { /* continue */ } }
  const braced = raw.match(/\{[\s\S]*\}/);
  if (braced) { try { return JSON.parse(braced[0]); } catch { /* continue */ } }
  throw new Error('No se pudo extraer JSON de la respuesta');
}

const SYSTEM = `Eres un coach vocal experto y motivador. Analizas datos de progreso vocal y creas planes de entrenamiento semanales personalizados.
IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. Sin texto adicional, sin markdown, sin comentarios fuera del JSON.`;

function buildPrompt(analysis: WeaknessAnalysis): string {
  const { userContext: uc, practiceStats: ps, songContext: sc, weaknesses, strengths } = analysis;

  const weakList = weaknesses.length > 0
    ? weaknesses.map(w => `- ${w.title} [severidad: ${w.severity}]: ${w.description}`).join('\n')
    : '- Sin debilidades detectadas (datos insuficientes o todo en buen estado)';

  const songStats = sc.totalPerformances > 0
    ? `${sc.totalPerformances} práctica(s): afinación ${sc.avgPitchScore}%, ritmo ${sc.avgRhythmScore}%, respiración ${sc.avgBreathingScore}%`
    : 'Sin prácticas de canciones registradas aún';

  return `Crea un plan de entrenamiento vocal personalizado para esta semana.

PERFIL DEL ESTUDIANTE:
- Experiencia: ${uc.experience}
- Tipo de voz: ${uc.voiceType ?? 'No detectado aún'}
- Rango: ${uc.voiceRange ?? 'No medido'}
- Objetivos: ${uc.goals.join(', ')}
- Nivel actual: ${uc.currentLevel}/5
- Lecciones completadas: ${uc.completedCount}

DATOS DE PRÁCTICA (últimas 10 sesiones):
- Total de sesiones: ${ps.totalSessions}
- Precisión de afinación promedio: ${analysis.recentAvgAccuracy.toFixed(0)}%
- Duración promedio por sesión: ${ps.avgMinutesPerSession} min
- Tiempo total acumulado: ${ps.totalMinutes} min
- Racha actual: ${ps.streak} días

DEBILIDADES DETECTADAS:
${weakList}

FORTALEZAS:
${strengths.map(s => `- ${s}`).join('\n')}

CANCIONES:
${songStats}

Responde con este JSON exacto (todos los campos en español):
{
  "intro": "mensaje personalizado de 2-3 oraciones analizando su situación concreta",
  "focusArea": "área principal a trabajar esta semana (frase corta)",
  "weekGoal": "objetivo concreto y medible para 7 días",
  "exercises": [
    {
      "id": "ex-coach-1",
      "title": "Nombre del ejercicio",
      "description": "Descripción breve de qué consiste",
      "type": "breathing",
      "durationMinutes": 5,
      "difficulty": "easy",
      "instructions": ["Paso 1 muy específico", "Paso 2", "Paso 3", "Paso 4"],
      "whyThisHelps": "Cómo este ejercicio ataca específicamente las debilidades detectadas",
      "successCriteria": "Señales concretas de que lo estás haciendo correctamente"
    }
  ],
  "dailyRoutine": {
    "morning": ["5min calentamiento", "8min respiración"],
    "evening": ["10min afinación", "5min canciones"]
  },
  "encouragement": "mensaje motivador personalizado (1-2 oraciones)"
}

Tipos válidos para exercises.type: "breathing", "pitch", "rhythm", "range", "warm-up"
Valores válidos para difficulty: "easy", "medium", "hard"
Genera exactamente 5 ejercicios relevantes a las debilidades detectadas. Sé específico y práctico.`;
}

export async function POST(req: Request) {
  const analysis: WeaknessAnalysis = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ plan: generateFallbackPlan(analysis) });
  }

  try {
    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      system: SYSTEM,
      messages: [{ role: 'user', content: buildPrompt(analysis) }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Sin bloque de texto en la respuesta');
    }

    const plan = extractJSON(textBlock.text) as CoachingPlan;
    return NextResponse.json({ plan });
  } catch (err) {
    console.error('[adaptive-coach]', err);
    return NextResponse.json({ plan: generateFallbackPlan(analysis) });
  }
}
