import { useState, useCallback } from 'react';

interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Hook pour gérer l'état d'ouverture/fermeture des dialogues
 * Simplifie la gestion des modales dans l'application
 *
 * @param initialState - État initial du dialogue (par défaut: false)
 * @returns Objet contenant l'état et les fonctions de contrôle
 *
 * @example
 * ```typescript
 * const deleteDialog = useDialog();
 * const editDialog = useDialog();
 *
 * // Utilisation
 * <Button onClick={deleteDialog.open}>Supprimer</Button>
 * <Dialog open={deleteDialog.isOpen} onOpenChange={deleteDialog.setOpen}>
 *   ...
 * </Dialog>
 * ```
 */
export const useDialog = (initialState = false): UseDialogReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen,
  };
};

/**
 * Hook pour gérer un dialogue avec des données associées
 * Utile pour les dialogues d'édition ou de détails
 *
 * @example
 * ```typescript
 * const editDialog = useDialogWithData<User>();
 *
 * // Ouvrir avec des données
 * <Button onClick={() => editDialog.open(user)}>Éditer</Button>
 *
 * // Utiliser les données
 * <Dialog open={editDialog.isOpen} onOpenChange={editDialog.setOpen}>
 *   {editDialog.data && <UserForm user={editDialog.data} />}
 * </Dialog>
 * ```
 */
export function useDialogWithData<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((dialogData: T) => {
    setData(dialogData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Garder les données un peu plus longtemps pour les animations
    setTimeout(() => setData(null), 300);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    setOpen: setIsOpen,
  };
}

export default useDialog;
