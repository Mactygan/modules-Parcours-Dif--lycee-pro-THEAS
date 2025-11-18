import { useRef, useEffect } from 'react';

/**
 * Hook pour obtenir la valeur précédente d'une state ou prop
 * Utile pour comparer les changements et détecter les mises à jour
 *
 * @param value - La valeur dont on veut tracker l'historique
 * @returns La valeur précédente
 *
 * @example
 * ```typescript
 * const Counter = ({ count }: { count: number }) => {
 *   const prevCount = usePrevious(count);
 *
 *   useEffect(() => {
 *     if (prevCount !== undefined && prevCount < count) {
 *       console.log('Le compteur a augmenté');
 *     }
 *   }, [count, prevCount]);
 *
 *   return (
 *     <div>
 *       <p>Actuel: {count}</p>
 *       <p>Précédent: {prevCount ?? 'N/A'}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook pour comparer les changements entre deux valeurs
 * Retourne un objet avec des informations sur le changement
 *
 * @param value - La valeur à surveiller
 * @returns Objet avec valeur actuelle, précédente et indicateur de changement
 *
 * @example
 * ```typescript
 * const UserProfile = ({ userId }: { userId: string }) => {
 *   const { current, previous, hasChanged } = useCompare(userId);
 *
 *   useEffect(() => {
 *     if (hasChanged) {
 *       console.log(`User changed from ${previous} to ${current}`);
 *       fetchNewUserData(current);
 *     }
 *   }, [hasChanged, current, previous]);
 *
 *   return <div>User ID: {current}</div>;
 * };
 * ```
 */
export function useCompare<T>(value: T) {
  const previous = usePrevious(value);
  const hasChanged = previous !== undefined && previous !== value;

  return {
    current: value,
    previous,
    hasChanged,
  };
}

/**
 * Hook pour détecter si une valeur a changé d'une liste spécifique de valeurs
 * Utile pour les status, états, etc.
 *
 * @param value - La valeur actuelle
 * @param targetValues - Les valeurs à surveiller
 * @returns true si la valeur précédente était dans targetValues et a changé
 *
 * @example
 * ```typescript
 * const OrderStatus = ({ status }: { status: string }) => {
 *   const wasInProgress = useChangedFrom(status, ['pending', 'processing']);
 *
 *   useEffect(() => {
 *     if (wasInProgress && status === 'completed') {
 *       toast.success('Commande complétée!');
 *     }
 *   }, [status, wasInProgress]);
 *
 *   return <div>Status: {status}</div>;
 * };
 * ```
 */
export function useChangedFrom<T>(value: T, targetValues: T[]): boolean {
  const previous = usePrevious(value);

  if (previous === undefined) return false;

  return targetValues.includes(previous) && !targetValues.includes(value);
}

/**
 * Hook pour détecter si une valeur a changé vers une liste spécifique de valeurs
 *
 * @param value - La valeur actuelle
 * @param targetValues - Les valeurs cibles
 * @returns true si la valeur a changé vers une des valeurs cibles
 *
 * @example
 * ```typescript
 * const TaskItem = ({ status }: { status: string }) => {
 *   const becameComplete = useChangedTo(status, ['done', 'completed']);
 *
 *   useEffect(() => {
 *     if (becameComplete) {
 *       playSuccessSound();
 *     }
 *   }, [becameComplete]);
 *
 *   return <div>Task status: {status}</div>;
 * };
 * ```
 */
export function useChangedTo<T>(value: T, targetValues: T[]): boolean {
  const previous = usePrevious(value);

  if (previous === undefined) return false;

  return !targetValues.includes(previous) && targetValues.includes(value);
}

export default usePrevious;
