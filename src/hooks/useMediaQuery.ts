import { useState, useEffect } from 'react';

/**
 * Hook pour réagir aux media queries CSS
 * Utile pour le responsive design et l'adaptation de l'interface
 *
 * @param query - La media query CSS à surveiller
 * @returns true si la media query correspond
 *
 * @example
 * ```typescript
 * const ResponsiveComponent = () => {
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 *   const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileNav />}
 *       {isTablet && <TabletNav />}
 *       {!isMobile && !isTablet && <DesktopNav />}
 *     </div>
 *   );
 * };
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Mettre à jour l'état avec la valeur actuelle
    setMatches(mediaQuery.matches);

    // Fonction de callback pour les changements
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Supporter les anciennes et nouvelles APIs
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback pour les navigateurs plus anciens
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook avec breakpoints prédéfinis pour faciliter le responsive design
 * Basé sur les breakpoints Tailwind CSS
 *
 * @returns Objet avec les différentes tailles d'écran
 *
 * @example
 * ```typescript
 * const Layout = () => {
 *   const { isMobile, isTablet, isDesktop, isLargeDesktop } = useBreakpoint();
 *
 *   return (
 *     <div className={isMobile ? 'grid-cols-1' : 'grid-cols-3'}>
 *       {isMobile ? <MobileMenu /> : <SidebarMenu />}
 *       <main>{content}</main>
 *     </div>
 *   );
 * };
 * ```
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)');

  // Détecter la taille actuelle (une seule sera true)
  const currentBreakpoint = isMobile
    ? 'mobile'
    : isTablet
    ? 'tablet'
    : isDesktop
    ? 'desktop'
    : 'large-desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint,
    // Helpers utiles
    isSmallScreen: isMobile || isTablet,
    isLargeScreen: isDesktop || isLargeDesktop,
  };
}

/**
 * Hook pour détecter les préférences système de l'utilisateur
 *
 * @returns Objet avec les préférences détectées
 *
 * @example
 * ```typescript
 * const App = () => {
 *   const {
 *     prefersDarkMode,
 *     prefersReducedMotion,
 *     prefersHighContrast
 *   } = useSystemPreferences();
 *
 *   useEffect(() => {
 *     if (prefersDarkMode) {
 *       document.documentElement.classList.add('dark');
 *     }
 *   }, [prefersDarkMode]);
 *
 *   return (
 *     <div className={prefersReducedMotion ? 'no-animations' : ''}>
 *       {/* App content *\/}
 *     </div>
 *   );
 * };
 * ```
 */
export function useSystemPreferences() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  const prefersLowContrast = useMediaQuery('(prefers-contrast: low)');

  return {
    prefersDarkMode,
    prefersLightMode: !prefersDarkMode,
    prefersReducedMotion,
    prefersHighContrast,
    prefersLowContrast,
  };
}

/**
 * Hook pour détecter l'orientation de l'appareil
 *
 * @returns 'portrait' ou 'landscape'
 *
 * @example
 * ```typescript
 * const VideoPlayer = () => {
 *   const orientation = useOrientation();
 *
 *   return (
 *     <div className={orientation === 'landscape' ? 'fullscreen' : 'normal'}>
 *       <video controls />
 *     </div>
 *   );
 * };
 * ```
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

export default useMediaQuery;
