import { useState, useEffect, useCallback, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour gérer les opérations asynchrones avec état de chargement et erreurs
 * Gère automatiquement le nettoyage pour éviter les setState après unmount
 *
 * @param asyncFunction - La fonction asynchrone à exécuter
 * @param options - Options de configuration
 * @returns État et fonctions de contrôle
 *
 * @example
 * ```typescript
 * const fetchUser = async (id: string) => {
 *   const { data } = await supabase.from('users').select('*').eq('id', id).single();
 *   return data;
 * };
 *
 * const { data: user, isLoading, error, execute, reset } = useAsync(
 *   () => fetchUser(userId),
 *   { immediate: true }
 * );
 *
 * // Exécuter manuellement
 * const handleRefresh = () => execute();
 *
 * // Réinitialiser l'état
 * const handleReset = () => reset();
 * ```
 */
export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
  });

  const isMountedRef = useRef(true);
  const lastCallIdRef = useRef(0);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fonction pour exécuter l'opération async
  const execute = useCallback(
    async (...args: Args) => {
      // Incrémenter l'ID d'appel pour annuler les appels précédents
      lastCallIdRef.current += 1;
      const currentCallId = lastCallIdRef.current;

      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const data = await asyncFunction(...args);

        // Vérifier si le composant est toujours monté et si c'est le dernier appel
        if (isMountedRef.current && currentCallId === lastCallIdRef.current) {
          setState({
            data,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });

          if (onSuccess) {
            onSuccess(data);
          }
        }

        return { data, error: null };
      } catch (error) {
        const err = error as Error;

        if (isMountedRef.current && currentCallId === lastCallIdRef.current) {
          setState({
            data: null,
            error: err,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });

          if (onError) {
            onError(err);
          }
        }

        return { data: null, error: err };
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  // Fonction pour réinitialiser l'état
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({
        data: null,
        error: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
      });
    }
  }, []);

  // Exécution immédiate si demandée
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // Volontairement ne pas inclure execute pour éviter les boucles

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook simplifié pour les requêtes Supabase
 * Ajoute une gestion spécifique pour les erreurs Supabase
 *
 * @example
 * ```typescript
 * const { data: users, isLoading, error, refetch } = useSupabaseQuery(
 *   async () => {
 *     const { data, error } = await supabase.from('users').select('*');
 *     if (error) throw error;
 *     return data;
 *   }
 * );
 * ```
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  options?: UseAsyncOptions
) {
  const result = useAsync(queryFn, { immediate: true, ...options });

  return {
    data: result.data,
    error: result.error,
    isLoading: result.isLoading,
    isSuccess: result.isSuccess,
    isError: result.isError,
    refetch: result.execute,
    reset: result.reset,
  };
}

/**
 * Hook pour gérer les mutations (create, update, delete)
 * Optimisé pour les opérations qui modifient des données
 *
 * @example
 * ```typescript
 * const { mutate: deleteUser, isLoading } = useMutation(
 *   async (userId: string) => {
 *     const { error } = await supabase.from('users').delete().eq('id', userId);
 *     if (error) throw error;
 *   },
 *   {
 *     onSuccess: () => {
 *       toast.success('Utilisateur supprimé');
 *       refreshData();
 *     },
 *     onError: (error) => {
 *       toast.error('Erreur lors de la suppression');
 *     }
 *   }
 * );
 *
 * <Button onClick={() => mutate(user.id)} disabled={isLoading}>
 *   Supprimer
 * </Button>
 * ```
 */
export function useMutation<T, Args extends any[] = []>(
  mutationFn: (...args: Args) => Promise<T>,
  options?: UseAsyncOptions
) {
  const result = useAsync(mutationFn, options);

  return {
    mutate: result.execute,
    data: result.data,
    error: result.error,
    isLoading: result.isLoading,
    isSuccess: result.isSuccess,
    isError: result.isError,
    reset: result.reset,
  };
}

export default useAsync;
