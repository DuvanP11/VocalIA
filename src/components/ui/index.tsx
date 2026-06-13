'use client';

import { cn } from '@/lib/utils';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

// ─── Button ──────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white focus:ring-violet-500 shadow-lg shadow-violet-900/40',
    secondary: 'bg-white/5 hover:bg-white/10 active:bg-white/5 text-white border border-white/10 hover:border-white/20 focus:ring-white/30',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5 focus:ring-white/30',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-lg shadow-rose-900/40',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 shadow-lg shadow-emerald-900/40',
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    xl: 'text-lg px-8 py-4',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/[0.04] border border-white/[0.08] rounded-2xl',
        glow && 'shadow-lg',
        onClick && 'cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────

interface ProgressBarProps {
  value: number;  // 0-100
  color?: string;
  height?: number;
  animated?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  color = 'bg-violet-500',
  height = 6,
  animated = false,
  label,
  showValue = false,
  className = '',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-white/50">{label}</span>}
          {showValue && <span className="text-xs font-mono text-white/70">{pct}%</span>}
        </div>
      )}
      <div
        className="w-full bg-white/[0.08] rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', color, animated && 'animate-pulse')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white/70 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  };
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border font-medium', variants[variant], sizes[size])}>
      {children}
    </span>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <svg
      className={cn('animate-spin text-current', sizes[size])}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Score Ring ───────────────────────────────────────────────

export function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) * 0.8;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 90 ? '#34d399' : pct >= 75 ? '#38bdf8' : pct >= 60 ? '#fbbf24' : '#f87171';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize={size * 0.22} fontWeight="700">
        {pct}%
      </text>
    </svg>
  );
}

// ─── Section Header ───────────────────────────────────────────

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
