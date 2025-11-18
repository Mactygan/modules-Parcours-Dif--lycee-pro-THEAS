import { useState, useEffect, useCallback } from 'react';

/**
 * Hook sécurisé pour gérer localStorage avec gestion d'erreurs
 * ATTENTION: Ne jamais stocker de données sensibles (tokens, mots de passe, etc.)
 *
 * @param key - La clé localStorage
 * @param initialValue - Valeur initiale si aucune valeur n'existe
 * @returns [valeur, setter, supprimer]
 *
 * @example
 * ```typescript
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 *
 * // Changer le thème
 * setTheme('dark');
 *
 * // Supprimer la préférence
 * removeTheme();
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour sauvegarder dans localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permettre la valeur d'être une fonction comme useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erreur lors de l'écriture dans localStorage pour la clé "${key}":`, error);
    }
  }, [key, storedValue]);

  // Fonction pour supprimer de localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de localStorage pour la clé "${key}":`, error);
    }
  }, [key, initialValue]);

  // Écouter les changements dans d'autres onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Erreur lors de la synchronisation localStorage pour la clé "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook pour des préférences utilisateur non sensibles
 * Simplifie l'utilisation de useLocalStorage avec des valeurs communes
 *
 * @example
 * ```typescript
 * const preferences = usePreferences();
 *
 * preferences.setTheme('dark');
 * preferences.setLanguage('fr');
 * preferences.clear(); // Réinitialiser toutes les préférences
 * ```
 */
export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  sidebarCollapsed?: boolean;
  gridView?: boolean;
  [key: string]: any;
}

export function usePreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage<UserPreferences>(
    'user-preferences',
    {}
  );

  const updatePreference = useCallback((key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, [setPreferences]);

  const clearPreferences = useCallback(() => {
    removePreferences();
  }, [removePreferences]);

  return {
    preferences,
    setTheme: (theme: 'light' | 'dark') => updatePreference('theme', theme),
    setLanguage: (language: string) => updatePreference('language', language),
    setSidebarCollapsed: (collapsed: boolean) => updatePreference('sidebarCollapsed', collapsed),
    setGridView: (gridView: boolean) => updatePreference('gridView', gridView),
    updatePreference,
    clear: clearPreferences,
  };
}

export default useLocalStorage;
