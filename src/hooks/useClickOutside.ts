import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook pour détecter les clics en dehors d'un élément
 * Utile pour fermer les dropdowns, modals, menus contextuels, etc.
 *
 * @param handler - Fonction appelée lors du clic en dehors
 * @param enabled - Active/désactive la détection (défaut: true)
 * @returns Ref à attacher à l'élément à surveiller
 *
 * @example
 * ```typescript
 * const DropdownMenu = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const menuRef = useClickOutside<HTMLDivElement>(() => {
 *     setIsOpen(false);
 *   });
 *
 *   return (
 *     <div ref={menuRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Toggle Menu</button>
 *       {isOpen && (
 *         <div className="dropdown-content">
 *           // Menu items
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;

      // Ne rien faire si l'élément n'existe pas ou si le clic est à l'intérieur
      if (!element || element.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // Ajouter les listeners avec un petit délai pour éviter les fermetures immédiates
    // lors de l'ouverture du menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, enabled]);

  return ref;
}

/**
 * Hook avancé pour détecter les clics en dehors de plusieurs éléments
 * Utile quand plusieurs éléments sont considérés comme "internes"
 *
 * @param handler - Fonction appelée lors du clic en dehors
 * @param enabled - Active/désactive la détection (défaut: true)
 * @returns Objet avec les refs à attacher aux éléments
 *
 * @example
 * ```typescript
 * const Modal = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const refs = useClickOutsideMultiple(
 *     () => setIsOpen(false),
 *     isOpen
 *   );
 *
 *   return (
 *     <>
 *       <button ref={refs.add}>Ouvrir</button>
 *       {isOpen && (
 *         <div ref={refs.add}>
 *           <div>Contenu du modal</div>
 *         </div>
 *       )}
 *     </>
 *   );
 * };
 * ```
 */
export function useClickOutsideMultiple(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
) {
  const refsSet = useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Vérifier si le clic est à l'intérieur d'un des éléments
      const clickedInside = Array.from(refsSet.current).some(element =>
        element.contains(event.target as Node)
      );

      if (!clickedInside) {
        handler(event);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, enabled]);

  const addRef = (element: HTMLElement | null) => {
    if (element) {
      refsSet.current.add(element);
    }
  };

  const removeRef = (element: HTMLElement | null) => {
    if (element) {
      refsSet.current.delete(element);
    }
  };

  return {
    add: addRef,
    remove: removeRef,
    clear: () => refsSet.current.clear(),
  };
}

export default useClickOutside;
