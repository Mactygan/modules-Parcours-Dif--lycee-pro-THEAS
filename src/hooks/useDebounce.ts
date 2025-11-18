import { useState, useEffect } from 'react';

/**
 * Hook pour debouncer une valeur
 * Utile pour les champs de recherche, filtres, etc.
 *
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes (par défaut: 500ms)
 * @returns La valeur debouncée
 *
 * @example
 * ```typescript
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 *   useEffect(() => {
 *     // Cette effet ne s'exécute que 300ms après que l'utilisateur arrête de taper
 *     if (debouncedSearchTerm) {
 *       fetchResults(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *
 *   return <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;
 * };
 * ```
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Créer un timer qui mettra à jour la valeur après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si value change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
