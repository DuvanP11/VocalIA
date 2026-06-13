'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⚡', label: 'Inicio' },
  { href: '/training', icon: '🎓', label: 'Entrenar' },
  { href: '/songs',    icon: '🎵', label: 'Canciones' },
  { href: '/practice', icon: '🎤', label: 'Practicar' },
  { href: '/progress', icon: '📈', label: 'Progreso' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const streak = useAppStore(s => s.progress?.currentStreak ?? 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0b10]/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom">
      <div className="max-w-lg mx-auto px-2 py-1">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[52px]',
                  isActive
                    ? 'text-violet-400'
                    : 'text-white/30 hover:text-white/60',
                )}
              >
                <span className="text-xl leading-none relative">
                  {item.icon}
                  {item.label === 'Inicio' && streak > 0 && (
                    <span className="absolute -top-1 -right-2 text-[9px] font-bold bg-amber-500 text-black rounded-full w-4 h-4 flex items-center justify-center">
                      {streak > 9 ? '9+' : streak}
                    </span>
                  )}
                </span>
                <span className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive ? 'text-violet-400' : 'text-white/30',
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-violet-400 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function TopBar({
  title,
  subtitle,
  back = false,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0b10]/90 backdrop-blur-xl border-b border-white/[0.05] px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        {back && (
          <Link
            href=".."
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            ←
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-base leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-white/40 truncate">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}
