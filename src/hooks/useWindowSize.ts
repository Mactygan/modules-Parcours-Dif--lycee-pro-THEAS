import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook pour obtenir et surveiller la taille de la fenêtre
 * Utile pour les calculs de layout dynamiques
 *
 * @param debounceMs - Délai de debounce en ms (défaut: 150ms)
 * @returns Objet avec width et height
 *
 * @example
 * ```typescript
 * const ResponsiveGrid = () => {
 *   const { width, height } = useWindowSize();
 *
 *   // Calculer le nombre de colonnes selon la largeur
 *   const columns = width < 640 ? 1 : width < 1024 ? 2 : 3;
 *
 *   return (
 *     <div>
 *       <p>Fenêtre: {width}x{height}px</p>
 *       <div className={`grid-cols-${columns}`}>
 *         {/* items *\/}
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export function useWindowSize(debounceMs: number = 150): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      // Annuler le timeout précédent si existe
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Créer un nouveau timeout pour debouncer
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    // Ajouter le listener
    window.addEventListener('resize', handleResize);

    // Nettoyer
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return windowSize;
}

/**
 * Hook pour obtenir uniquement la largeur de la fenêtre
 * Plus performant si seule la largeur est nécessaire
 *
 * @param debounceMs - Délai de debounce en ms (défaut: 150ms)
 * @returns La largeur de la fenêtre
 *
 * @example
 * ```typescript
 * const Sidebar = () => {
 *   const width = useWindowWidth();
 *   const isCollapsed = width < 768;
 *
 *   return (
 *     <aside className={isCollapsed ? 'w-16' : 'w-64'}>
 *       {/* sidebar content *\/}
 *     </aside>
 *   );
 * };
 * ```
 */
export function useWindowWidth(debounceMs: number = 150): number {
  const { width } = useWindowSize(debounceMs);
  return width;
}

/**
 * Hook pour obtenir uniquement la hauteur de la fenêtre
 * Plus performant si seule la hauteur est nécessaire
 *
 * @param debounceMs - Délai de debounce en ms (défaut: 150ms)
 * @returns La hauteur de la fenêtre
 *
 * @example
 * ```typescript
 * const ScrollableContent = () => {
 *   const height = useWindowHeight();
 *   const contentHeight = height - 120; // Soustraire header + footer
 *
 *   return (
 *     <div style={{ height: contentHeight, overflow: 'auto' }}>
 *       {/* long content *\/}
 *     </div>
 *   );
 * };
 * ```
 */
export function useWindowHeight(debounceMs: number = 150): number {
  const { height } = useWindowSize(debounceMs);
  return height;
}

/**
 * Hook pour détecter si la fenêtre est en dessous d'une certaine largeur
 * Optimisé pour éviter les re-renders inutiles
 *
 * @param breakpoint - Largeur en pixels
 * @param debounceMs - Délai de debounce en ms (défaut: 150ms)
 * @returns true si la largeur est inférieure au breakpoint
 *
 * @example
 * ```typescript
 * const Navigation = () => {
 *   const isMobileWidth = useIsBelowWidth(768);
 *
 *   return isMobileWidth ? <MobileNav /> : <DesktopNav />;
 * };
 * ```
 */
export function useIsBelowWidth(
  breakpoint: number,
  debounceMs: number = 150
): boolean {
  const [isBelow, setIsBelow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const newIsBelow = window.innerWidth < breakpoint;
        // Mettre à jour seulement si la valeur change (optimisation)
        if (newIsBelow !== isBelow) {
          setIsBelow(newIsBelow);
        }
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint, debounceMs, isBelow]);

  return isBelow;
}

/**
 * Hook pour détecter si la fenêtre est au-dessus d'une certaine largeur
 *
 * @param breakpoint - Largeur en pixels
 * @param debounceMs - Délai de debounce en ms (défaut: 150ms)
 * @returns true si la largeur est supérieure au breakpoint
 *
 * @example
 * ```typescript
 * const Dashboard = () => {
 *   const showSidebar = useIsAboveWidth(1024);
 *
 *   return (
 *     <div className="flex">
 *       {showSidebar && <Sidebar />}
 *       <main>{/* content *\/}</main>
 *     </div>
 *   );
 * };
 * ```
 */
export function useIsAboveWidth(
  breakpoint: number,
  debounceMs: number = 150
): boolean {
  const [isAbove, setIsAbove] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const newIsAbove = window.innerWidth >= breakpoint;
        if (newIsAbove !== isAbove) {
          setIsAbove(newIsAbove);
        }
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint, debounceMs, isAbove]);

  return isAbove;
}

export default useWindowSize;
