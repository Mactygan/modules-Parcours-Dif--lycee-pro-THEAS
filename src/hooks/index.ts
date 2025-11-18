/**
 * Index centralisé pour tous les hooks personnalisés
 * Facilite les imports dans l'application
 *
 * @example
 * ```typescript
 * // Au lieu de:
 * import { useDebounce } from './hooks/useDebounce';
 * import { useDialog } from './hooks/useDialog';
 *
 * // Utiliser:
 * import { useDebounce, useDialog } from './hooks';
 * ```
 */

// Hooks d'UI et interaction
export { useDialog, useDialogWithData } from './useDialog';
export { useClickOutside, useClickOutsideMultiple } from './useClickOutside';
export { useMediaQuery, useBreakpoint, useSystemPreferences, useOrientation } from './useMediaQuery';
export { useWindowSize, useWindowWidth, useWindowHeight, useIsBelowWidth, useIsAboveWidth } from './useWindowSize';

// Hooks de données et état
export { useDebounce } from './useDebounce';
export { usePagination } from './usePagination';
export { useLocalStorage, usePreferences } from './useLocalStorage';
export { usePrevious, useCompare, useChangedFrom, useChangedTo } from './usePrevious';

// Hooks asynchrones
export { useAsync, useSupabaseQuery, useMutation } from './useAsync';

// Types réexportés pour faciliter l'utilisation
export type { UserPreferences } from './useLocalStorage';

/**
 * Guide d'utilisation des hooks
 *
 * ## Hooks d'UI et interaction
 *
 * ### useDialog / useDialogWithData
 * Gérer l'état d'ouverture/fermeture des modales et dialogues
 * - useDialog: Pour les dialogues simples
 * - useDialogWithData: Pour les dialogues avec des données associées
 *
 * ### useClickOutside / useClickOutsideMultiple
 * Détecter les clics en dehors d'un élément
 * - useClickOutside: Pour un seul élément
 * - useClickOutsideMultiple: Pour plusieurs éléments
 *
 * ### useMediaQuery / useBreakpoint / useSystemPreferences / useOrientation
 * Réagir aux media queries et préférences système
 * - useMediaQuery: Media query personnalisée
 * - useBreakpoint: Breakpoints Tailwind prédéfinis
 * - useSystemPreferences: Préférences système (dark mode, etc.)
 * - useOrientation: Portrait ou landscape
 *
 * ### useWindowSize / useWindowWidth / useWindowHeight / useIsBelowWidth / useIsAboveWidth
 * Obtenir et surveiller la taille de la fenêtre
 * - useWindowSize: Width et height
 * - useWindowWidth/Height: Une seule dimension
 * - useIsBelow/AboveWidth: Comparaison avec breakpoint
 *
 * ## Hooks de données et état
 *
 * ### useDebounce
 * Débouncer une valeur (utile pour les champs de recherche)
 *
 * ### usePagination
 * Gérer la pagination d'une liste d'items
 *
 * ### useLocalStorage / usePreferences
 * Gérer localStorage de manière sécurisée
 * - useLocalStorage: Wrapper générique
 * - usePreferences: Pour les préférences utilisateur
 *
 * ### usePrevious / useCompare / useChangedFrom / useChangedTo
 * Comparer les valeurs entre renders
 * - usePrevious: Obtenir la valeur précédente
 * - useCompare: Comparer actuel vs précédent
 * - useChangedFrom/To: Détecter les transitions d'état
 *
 * ## Hooks asynchrones
 *
 * ### useAsync / useSupabaseQuery / useMutation
 * Gérer les opérations asynchrones
 * - useAsync: Wrapper générique pour async
 * - useSupabaseQuery: Pour les requêtes Supabase
 * - useMutation: Pour les mutations (create/update/delete)
 */
