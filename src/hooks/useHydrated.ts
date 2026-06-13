'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';

/**
 * Devuelve true solo cuando el store de Zustand ha terminado de rehidratarse
 * desde localStorage. Evita el flash de redirect en Next.js SSR.
 */
export function useHydrated(): boolean {
  const storeHydrated = useAppStore(s => s._hasHydrated);
  const [localHydrated, setLocalHydrated] = useState(false);

  useEffect(() => {
    // Si el store ya está hidratado (ruta sin SSR), marca OK
    if (storeHydrated) {
      setLocalHydrated(true);
      return;
    }
    // Esperar hasta que el store hidrate o timeout de 300ms
    const unsub = useAppStore.subscribe(
      s => s._hasHydrated,
      (hydrated) => { if (hydrated) setLocalHydrated(true); },
    );
    const fallback = setTimeout(() => setLocalHydrated(true), 400);
    return () => { unsub(); clearTimeout(fallback); };
  }, [storeHydrated]);

  return localHydrated;
}
