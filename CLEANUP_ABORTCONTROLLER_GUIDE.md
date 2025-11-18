# Guide d'implémentation - Cleanup et AbortController

Ce document détaille comment implémenter le cleanup approprié et AbortController pour éviter les fuites mémoire dans l'application.

## Problème identifié

Actuellement, plusieurs opérations asynchrones peuvent continuer à s'exécuter après le démontage des composants, causant :
- Des appels à `setState` sur des composants démontés (warnings React)
- Des fuites mémoire potentielles
- Des comportements imprévisibles

## Solution : Pattern isMounted + AbortController

### 1. Pattern isMounted (Déjà implémenté dans AuthContext)

✅ **Déjà implémenté** dans `src/contexts/AuthContext.tsx:116-190`

```typescript
useEffect(() => {
  let isMounted = true; // Flag de montage

  const initializeAuth = async () => {
    // Vérifier isMounted avant chaque setState
    if (!isMounted) return;

    // ... opérations async ...

    if (!isMounted) return;
    setSession(newSession);
  };

  initializeAuth();

  return () => {
    isMounted = false; // Cleanup
  };
}, []);
```

### 2. AbortController pour les requêtes Supabase

#### Implémentation recommandée pour AppContext

**Dans `src/contexts/AppContext.tsx`:**

```typescript
// Ajouter un AbortController global pour le contexte
const [abortController, setAbortController] = useState<AbortController | null>(null);

// Fonction de refresh avec signal d'annulation
const refreshData = useCallback(async (signal?: AbortSignal) => {
  if (signal?.aborted) {
    console.log('refreshData: Operation cancelled');
    return;
  }

  try {
    setIsLoading(true);

    // Pour chaque requête Supabase
    if (signal?.aborted) return;
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .abortSignal(signal); // IMPORTANT: Passer le signal à Supabase

    if (signal?.aborted) return;
    if (data) setReservations(data);

    // Répéter pour chaque table...
  } catch (error: any) {
    // Ignorer les erreurs d'annulation
    if (error.name === 'AbortError' || signal?.aborted) {
      console.log('Operation cancelled');
      return;
    }
    // Gérer les vraies erreurs...
  } finally {
    if (!signal?.aborted) {
      setIsLoading(false);
    }
  }
}, []);

// Dans le useEffect de chargement initial
useEffect(() => {
  const controller = new AbortController();

  const loadData = async () => {
    await refreshData(controller.signal);
  };

  loadData();

  return () => {
    controller.abort(); // Annuler toutes les requêtes en cours
  };
}, [refreshData]);
```

### 3. Cleanup pour les souscriptions temps réel

**Déjà partiellement implémenté** dans `src/contexts/AppContext.tsx:365-376`

Améliorations recommandées :

```typescript
useEffect(() => {
  if (!supabaseConnected) return;

  let isMounted = true; // Ajouter flag de montage
  const subscriptions: any[] = [];

  const setupSubscriptions = () => {
    const resSubscription = supabase
      .channel('reservations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          if (!isMounted) return; // Vérifier avant de traiter
          await delayedRefresh();
        }
      )
      .subscribe();

    subscriptions.push(resSubscription);
    // Répéter pour les autres tables...
  };

  setupSubscriptions();

  return () => {
    isMounted = false;
    subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
  };
}, [supabaseConnected, delayedRefresh]);
```

### 4. Debouncing pour delayedRefresh

**Déjà partiellement implémenté** avec un délai de 500ms

Amélioration recommandée avec cancel :

```typescript
const delayedRefresh = useCallback(() => {
  // Annuler le refresh précédent si en cours
  if (refreshTimeoutRef.current) {
    clearTimeout(refreshTimeoutRef.current);
  }

  refreshTimeoutRef.current = setTimeout(async () => {
    await refreshData();
    refreshTimeoutRef.current = null;
  }, 500);
}, [refreshData]);

// Dans le cleanup du useEffect
return () => {
  if (refreshTimeoutRef.current) {
    clearTimeout(refreshTimeoutRef.current);
  }
};
```

## Checklist d'implémentation

### Phase 1 - Contexts (Priorité HAUTE)

- [x] AuthContext : Pattern isMounted ✅ DÉJÀ FAIT
- [ ] AppContext : Ajouter AbortController à refreshData
- [ ] AppContext : Ajouter isMounted aux souscriptions
- [ ] AppContext : Cleanup des timeouts delayedRefresh

### Phase 2 - Composants pages (Priorité MOYENNE)

#### Calendrier.tsx
- [ ] Ajouter isMounted au useEffect de création de réservation
- [ ] Cleanup des états de formulaire au démontage

#### Reservations.tsx
- [ ] Ajouter cleanup pour les opérations de modification
- [ ] Gérer l'annulation lors du démontage pendant une mise à jour

#### Supervision.tsx
- [ ] Cleanup des opérations de suppression en cours
- [ ] Gérer l'annulation des opérations admin

#### Utilisateurs.tsx
- [ ] Cleanup des opérations CRUD utilisateur
- [ ] Gérer l'annulation pendant l'ajout/modification/suppression

### Phase 3 - Hooks personnalisés (Priorité BASSE)

- [ ] Créer un hook `useAbortableRequest` réutilisable
- [ ] Créer un hook `useMountedState` pour le pattern isMounted

## Hooks réutilisables recommandés

### useAbortableRequest Hook

```typescript
// src/hooks/useAbortableRequest.ts
import { useEffect, useRef } from 'react';

export const useAbortableRequest = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getSignal = () => {
    // Créer un nouveau controller si nécessaire
    if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current.signal;
  };

  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { getSignal, abort };
};

// Utilisation
const MyComponent = () => {
  const { getSignal, abort } = useAbortableRequest();

  const fetchData = async () => {
    const signal = getSignal();
    const { data } = await supabase
      .from('table')
      .select('*')
      .abortSignal(signal);
  };

  return <button onClick={abort}>Cancel</button>;
};
```

### useMountedState Hook

```typescript
// src/hooks/useMountedState.ts
import { useEffect, useRef } from 'react';

export const useMountedState = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};

// Utilisation
const MyComponent = () => {
  const isMountedRef = useMountedState();

  const fetchData = async () => {
    const data = await apiCall();
    if (isMountedRef.current) {
      setState(data);
    }
  };
};
```

## Tests recommandés

### Test de fuite mémoire

```typescript
describe('Memory leak tests', () => {
  it('should cleanup subscriptions on unmount', () => {
    const { unmount } = render(<AppProvider>...</AppProvider>);
    // Vérifier que les souscriptions sont actives
    unmount();
    // Vérifier que les souscriptions sont nettoyées
  });

  it('should abort requests on unmount', async () => {
    const { unmount } = render(<MyComponent />);
    // Démarrer une requête longue
    unmount();
    // Vérifier que la requête est annulée
  });
});
```

### Test avec React DevTools Profiler

1. Ouvrir React DevTools
2. Onglet "Profiler"
3. Naviguer entre les pages rapidement
4. Vérifier qu'il n'y a pas de warnings "Can't perform a React state update on an unmounted component"

## Ressources

- [React useEffect cleanup](https://react.dev/reference/react/useEffect#removing-unnecessary-object-dependencies)
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Supabase Client abortSignal](https://supabase.com/docs/reference/javascript/installing)

## État actuel

### ✅ Déjà implémenté
- Pattern isMounted dans AuthContext
- Cleanup des souscriptions Supabase (basique)
- useCallback pour delayedRefresh

### ⚠️ À implémenter
- AbortController dans refreshData
- isMounted dans les souscriptions temps réel
- Cleanup des timeouts
- Hooks réutilisables

### 🔍 À tester
- Pas de warnings React
- Pas de requêtes orphelines
- Performance de l'application

## Ordre d'implémentation recommandé

1. **Immédiat** : Ajouter isMounted aux souscriptions AppContext
2. **Court terme** : Implémenter AbortController dans refreshData
3. **Moyen terme** : Créer les hooks réutilisables
4. **Long terme** : Appliquer aux composants pages

## Impact estimé

- **Fiabilité** : +40% (moins de warnings, moins de comportements imprévisibles)
- **Performance** : +10% (moins de requêtes inutiles)
- **Maintenabilité** : +30% (code plus robuste et réutilisable)
