'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

export type IconName =
  | 'lightning' | 'graduation' | 'music-note' | 'microphone' | 'chart-up'
  | 'fire' | 'trophy' | 'robot' | 'brain' | 'microscope' | 'rocket'
  | 'lock' | 'warning' | 'bulb' | 'star' | 'diamond' | 'target'
  | 'key' | 'stopwatch' | 'lungs' | 'muscle' | 'thumbs-up' | 'books'
  | 'headphone' | 'drum' | 'wave' | 'seedling' | 'tree' | 'chick'
  | 'satellite' | 'check' | 'pin' | 'red-circle' | 'hourglass' | 'heart';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** glow violeta por defecto; false para desactivar */
  glow?: boolean;
}

// Paleta del gradiente: violet-400 → cyan-300
const C0 = '#c084fc';
const C1 = '#67e8f9';

export function Icon({ name, size = 24, className, glow = true }: IconProps) {
  const uid = useId().replace(/:/g, '');
  const gid = `vg-${name}-${uid}`;
  const f   = `url(#${gid})`;   // fill gradient
  const s   = `url(#${gid})`;   // stroke gradient

  const glowStyle =
    glow && name !== 'red-circle'
      ? { filter: 'drop-shadow(0 0 5px rgba(192,132,252,0.65))' }
      : glow && name === 'red-circle'
        ? { filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.7))' }
        : undefined;

  const Defs = () => (
    <defs>
      <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor={C0} />
        <stop offset="100%" stopColor={C1} />
      </linearGradient>
    </defs>
  );

  let body: React.ReactNode = null;

  switch (name) {

    /* ── Navegación ───────────────────────────────────────────── */
    case 'lightning':
      body = (<><Defs /><path d="M13 2L5.5 13H11L10.5 22L20 11H14.5L13 2Z" fill={f} /></>);
      break;

    case 'graduation':
      body = (
        <>
          <Defs />
          <polygon points="12,3 2,9 12,15 22,9" fill={f} />
          <path d="M7 11.5V16C9 18.5 15 18.5 17 16V11.5" stroke={s} strokeWidth="1.5" fill={f} opacity="0.7" />
          <line x1="19.5" y1="9"  x2="19.5" y2="14.5" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="19.5" cy="15.5" r="1.5" fill={f} />
        </>
      );
      break;

    case 'music-note':
      body = (
        <>
          <Defs />
          <path d="M9 18V5L21 3V16" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx="7"  cy="18" rx="3" ry="2.2" transform="rotate(-10 7 18)"  fill={f} />
          <ellipse cx="19" cy="16" rx="3" ry="2.2" transform="rotate(-10 19 16)" fill={f} />
        </>
      );
      break;

    case 'microphone':
      body = (
        <>
          <Defs />
          <rect x="9" y="2" width="6" height="11" rx="3" fill={f} />
          <path d="M5 11A7 7 0 0 0 19 11" stroke={s} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="22" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8"  y1="22" x2="16" y2="22" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'chart-up':
      body = (
        <>
          <Defs />
          <line x1="2" y1="21" x2="22" y2="21" stroke={s} strokeWidth="1" opacity="0.25" />
          <polyline points="3,19 8,12 13,15 21,6"  stroke={s} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="15,6 21,6 21,12"        stroke={s} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;

    /* ── Gamificación ─────────────────────────────────────────── */
    case 'fire':
      body = (
        <>
          <Defs />
          <path d="M12 2C9 6 7 10 7 14a5 5 0 0 0 10 0c0-2.5-1.5-4.5-1.5-4.5S15 11 13.5 12.5C13.5 10.5 13 7 12 2Z" fill={f} />
          <path d="M10 18a2 2 0 0 0 4 0c0-1.2-1.5-2.5-2-2.5-0.5 1-2 1.3-2 2.5Z" fill="white" opacity="0.25" />
        </>
      );
      break;

    case 'trophy':
      body = (
        <>
          <Defs />
          <path d="M7 3H17V12C17 14.8 14.8 17 12 17C9.2 17 7 14.8 7 12V3Z" fill={f} />
          <path d="M3 4H7V9C5 9 3.5 7.5 3 6.5V4Z"   fill={f} opacity="0.65" />
          <path d="M17 4H21V6.5C20.5 7.5 19 9 17 9V4Z" fill={f} opacity="0.65" />
          <line x1="12" y1="17" x2="12" y2="20" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8"  y1="21" x2="16" y2="21" stroke={s} strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'star':
      body = (
        <>
          <Defs />
          <polygon points="12,2 15.1,8.6 22,9.7 17,14.5 18.2,21.4 12,18.1 5.8,21.4 7,14.5 2,9.7 8.9,8.6" fill={f} />
          <polygon points="12,5 14.2,9.8 19.5,10.6 15.5,14.4 16.4,19.7 12,17.4 7.6,19.7 8.5,14.4 4.5,10.6 9.8,9.8" fill="white" opacity="0.2" />
        </>
      );
      break;

    case 'diamond':
      body = (
        <>
          <Defs />
          <polygon points="12,2 22,9 12,22 2,9" fill={f} />
          <polygon points="12,2 22,9 12,12 2,9"       fill="white" opacity="0.2" />
          <polygon points="12,12 17,10.5 22,9 12,22"  fill="white" opacity="0.08" />
        </>
      );
      break;

    case 'rocket':
      body = (
        <>
          <Defs />
          <path d="M12 2C12 2 8 6 8 13L12 15L16 13C16 6 12 2 12 2Z" fill={f} />
          <circle cx="12" cy="9.5" r="1.8" fill="white" opacity="0.4" />
          <path d="M8 13L5.5 16.5L9 15.5L12 22L15 15.5L18.5 16.5L16 13" fill={f} opacity="0.65" />
        </>
      );
      break;

    case 'muscle':
      body = (
        <>
          <Defs />
          <path d="M5 14L7 10L10 12.5L13 7.5L16.5 11L19.5 9L21 13.5C21 13.5 19 17.5 16.5 18C14 18.5 12 16 12 16C12 16 9.5 19 7 18.5C4.5 18 5 14 5 14Z" fill={f} />
        </>
      );
      break;

    case 'thumbs-up':
      body = (
        <>
          <Defs />
          <path d="M9 9L12 3C13.1 3 14 4 14 5.2V9H19.5C20.3 9 21 9.5 21 10.5V19C21 19.6 20.3 20 19.5 20H9" fill={f} opacity="0.85" />
          <rect x="3" y="10" width="6" height="10" rx="1" fill={f} opacity="0.6" />
        </>
      );
      break;

    /* ── IA y tecnología ──────────────────────────────────────── */
    case 'robot':
      body = (
        <>
          <Defs />
          <rect x="5"  y="9"  width="14" height="11" rx="2" fill={f} opacity="0.85" />
          <rect x="9"  y="2"  width="6"  height="5"  rx="1" fill={f} />
          <line x1="12" y1="7" x2="12" y2="9" stroke={s} strokeWidth="1.5" />
          <circle cx="9.5"  cy="13.5" r="1.5" fill="white" opacity="0.85" />
          <circle cx="14.5" cy="13.5" r="1.5" fill="white" opacity="0.85" />
          <path d="M9 17H15" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="2"  y1="11" x2="5"  y2="11" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="19" y1="11" x2="22" y2="11" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'brain':
      body = (
        <>
          <Defs />
          <path d="M9.5 2C7 2 5 4 5 6.5C3.5 7 2.5 8.5 2.5 10.5C2.5 12 3.5 13.5 5 14C5 16 7 18 9 18H12V2H9.5Z"   fill={f} opacity="0.85" />
          <path d="M14.5 2C17 2 19 4 19 6.5C20.5 7 21.5 8.5 21.5 10.5C21.5 12 20.5 13.5 19 14C19 16 17 18 15 18H12V2H14.5Z" fill={f} opacity="0.65" />
          <line x1="9"  y1="20" x2="15" y2="20" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="22" x2="14" y2="22" stroke={s} strokeWidth="1"   strokeLinecap="round" opacity="0.6" />
        </>
      );
      break;

    case 'microscope':
      body = (
        <>
          <Defs />
          <rect x="9.5" y="2" width="5" height="8" rx="1" fill={f} opacity="0.9" />
          <circle cx="12" cy="7" r="2" fill="white" opacity="0.3" />
          <path d="M8 10L5.5 20H18.5L16 10H8Z" fill={f} opacity="0.65" />
          <line x1="7" y1="22" x2="17" y2="22" stroke={s} strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="4" x2="19" y2="2" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="19.5" cy="1.5" r="1" fill={f} />
        </>
      );
      break;

    /* ── Cuerpo / técnica vocal ───────────────────────────────── */
    case 'lungs':
      body = (
        <>
          <Defs />
          <path d="M12 3V8" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 8C5 8 3 10 3 13V17C3 19.2 5 21 7.5 21S12 19.2 12 17V8"    fill={f} opacity="0.5" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 8C19 8 21 10 21 13V17C21 19.2 19 21 16.5 21S12 19.2 12 17V8" fill={f} opacity="0.35" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'headphone':
      body = (
        <>
          <Defs />
          <path d="M3 14V12A9 9 0 0 1 21 12V14" stroke={s} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="2"  y="14" width="4" height="6" rx="2" fill={f} />
          <rect x="18" y="14" width="4" height="6" rx="2" fill={f} />
        </>
      );
      break;

    case 'drum':
      body = (
        <>
          <Defs />
          <ellipse cx="12" cy="8" rx="10" ry="4" fill={f} opacity="0.85" />
          <path d="M2 8V16C2 18.2 6.5 20 12 20C17.5 20 22 18.2 22 16V8" fill={f} opacity="0.45" />
          <ellipse cx="12" cy="8" rx="10" ry="4" stroke={s} strokeWidth="1" fill="none" />
          <line x1="7"  y1="5.5" x2="4"  y2="2" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="5.5" x2="20" y2="2" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'wave':
      body = (
        <>
          <Defs />
          <path d="M2 11C5 7.5 7 6 9 8C11 10 13 14 15 14C17 14 19 10 22 8"     stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M2 16C5 12.5 7 11 9 13C11 15 13 19 15 19C17 19 19 15 22 13" stroke={s} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
        </>
      );
      break;

    case 'satellite':
      body = (
        <>
          <Defs />
          <rect x="8" y="9.5" width="7.5" height="7.5" rx="1" fill={f} opacity="0.8" />
          <path d="M4.5 7.5L8 11"   stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M15.5 11L19.5 7.5" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="0.5"  y="3.5" width="7" height="4.5" rx="0.5" fill={f} opacity="0.7"  transform="rotate(-45 4 6)" />
          <rect x="16.5" y="1"   width="7" height="4.5" rx="0.5" fill={f} opacity="0.55" transform="rotate(-45 20 3.25)" />
        </>
      );
      break;

    /* ── UI / estado ──────────────────────────────────────────── */
    case 'lock':
      body = (
        <>
          <Defs />
          <rect x="5" y="11" width="14" height="10" rx="2" fill={f} />
          <path d="M8 11V7A4 4 0 0 1 16 7V11" stroke={s} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="16" r="2" fill="white" opacity="0.35" />
          <line x1="12" y1="16" x2="12" y2="18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
        </>
      );
      break;

    case 'warning':
      body = (
        <>
          <Defs />
          <path d="M12 2L2 21H22L12 2Z" fill={f} opacity="0.85" />
          <line x1="12" y1="9" x2="12" y2="14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="17.5" r="1.5" fill="white" />
        </>
      );
      break;

    case 'bulb':
      body = (
        <>
          <Defs />
          <path d="M12 2C8.7 2 6 4.7 6 8C6 10.5 7.5 12.7 9.8 13.8L10 17H14L14.2 13.8C16.5 12.7 18 10.5 18 8C18 4.7 15.3 2 12 2Z" fill={f} />
          <circle cx="12" cy="8" r="2.5" fill="white" opacity="0.25" />
          <line x1="10"   y1="17" x2="14"   y2="17" stroke={s} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="10.5" y1="19" x2="13.5" y2="19" stroke={s} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="11"   y1="21" x2="13"   y2="21" stroke={s} strokeWidth="1"   strokeLinecap="round" />
        </>
      );
      break;

    case 'target':
      body = (
        <>
          <Defs />
          <circle cx="12" cy="12" r="10" stroke={s} strokeWidth="1.5" fill={f} fillOpacity="0.1" />
          <circle cx="12" cy="12" r="6.5" stroke={s} strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="3"   fill={f} opacity="0.8" />
          <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.5" />
        </>
      );
      break;

    case 'key':
      body = (
        <>
          <Defs />
          <circle cx="8" cy="9" r="5" fill={f} opacity="0.85" />
          <circle cx="8" cy="9" r="2.5" fill="white" opacity="0.3" />
          <path d="M12.5 12.5L20 20" stroke={s} strokeWidth="2" strokeLinecap="round" />
          <line x1="16"   y1="17"   x2="18"   y2="15"   stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18.5" y1="19.5" x2="20.5" y2="17.5" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'stopwatch':
      body = (
        <>
          <Defs />
          <circle cx="12" cy="13" r="8" fill={f} fillOpacity="0.15" />
          <circle cx="12" cy="13" r="8" stroke={s} strokeWidth="1.5" fill="none" />
          <line x1="12" y1="9"  x2="12" y2="13" stroke={s} strokeWidth="2"   strokeLinecap="round" />
          <line x1="12" y1="13" x2="15" y2="15" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="2"  x2="14" y2="2"  stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="2"  x2="12" y2="5"  stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'check':
      body = (
        <>
          <Defs />
          <polyline points="20,6 9,17 4,12" stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;

    case 'pin':
      body = (
        <>
          <Defs />
          <path d="M12 2L15.5 5.5L14 9.5L17 13L12 22L7 13L10 9.5L8.5 5.5L12 2Z" fill={f} />
        </>
      );
      break;

    case 'hourglass':
      body = (
        <>
          <Defs />
          <path d="M5 3H19V7.5L13 12L19 16.5V21H5V16.5L11 12L5 7.5V3Z" fill={f} opacity="0.7" />
          <path d="M7 4.5H17L12 8.5L7 4.5Z"  fill={f} />
          <path d="M7 19.5H17L12 15.5L7 19.5Z" fill={f} opacity="0.4" />
        </>
      );
      break;

    case 'red-circle':
      body = <circle cx="12" cy="12" r="10" fill="#ef4444" />;
      break;

    /* ── Naturaleza / onboarding ──────────────────────────────── */
    case 'seedling':
      body = (
        <>
          <Defs />
          <path d="M12 22V13" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 13C12 13 7.5 12 5.5 7.5C5.5 7.5 10 6.5 12 13Z"   fill={f} opacity="0.85" stroke={s} strokeWidth="0.75" />
          <path d="M12 13C12 13 16.5 11 18.5 6.5C18.5 6.5 14 5.5 12 13Z" fill={f} opacity="0.65" stroke={s} strokeWidth="0.75" />
        </>
      );
      break;

    case 'tree':
      body = (
        <>
          <Defs />
          <polygon points="12,2 4,11 8,11 3,19 21,19 16,11 20,11" fill={f} />
          <rect x="10.5" y="19" width="3" height="2.5" rx="0.5" fill={f} opacity="0.7" />
        </>
      );
      break;

    case 'chick':
      body = (
        <>
          <Defs />
          <circle cx="12" cy="14" r="7"  fill={f} opacity="0.85" />
          <circle cx="12" cy="8"  r="4"  fill={f} />
          <circle cx="10.5" cy="7"  r="1.2" fill="white" opacity="0.9" />
          <circle cx="13.5" cy="7"  r="1.2" fill="white" opacity="0.9" />
          <circle cx="10.7" cy="7.2" r="0.5" fill="#1e1b4b" />
          <circle cx="13.7" cy="7.2" r="0.5" fill="#1e1b4b" />
          <polygon points="12,9.2 11,11 13,11" fill="#f59e0b" />
        </>
      );
      break;

    /* ── Misc ─────────────────────────────────────────────────── */
    case 'books':
      body = (
        <>
          <Defs />
          <rect x="3"    y="5" width="4" height="14" rx="0.5" fill={f} />
          <rect x="9"    y="3" width="4" height="16" rx="0.5" fill={f} opacity="0.75" />
          <rect x="15.5" y="6" width="4" height="13" rx="0.5" fill={f} opacity="0.55" />
          <line x1="3" y1="21" x2="20" y2="21" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;

    case 'heart':
      body = (
        <>
          <Defs />
          <path d="M12 21C12 21 3 15.5 3 9.5A5 5 0 0 1 12 7A5 5 0 0 1 21 9.5C21 15.5 12 21 12 21Z" fill={f} />
          <path d="M12 10C11 10 10 11 10 12" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        </>
      );
      break;

    default:
      body = null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      style={glowStyle}
    >
      {body}
    </svg>
  );
}
