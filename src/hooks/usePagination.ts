import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  pageNumbers: number[];
}

/**
 * Hook pour gérer la pagination d'une liste d'items
 * @param items - Liste complète des items à paginer
 * @param itemsPerPage - Nombre d'items par page (défaut: 10)
 * @returns Objet contenant l'état de pagination et les fonctions de navigation
 *
 * @example
 * ```typescript
 * const {
 *   paginatedItems,
 *   currentPage,
 *   totalPages,
 *   nextPage,
 *   prevPage,
 *   hasNext,
 *   hasPrev
 * } = usePagination({ items: users, itemsPerPage: 20 });
 * ```
 */
export const usePagination = <T>({
  items,
  itemsPerPage = 10
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Extraire les items de la page actuelle
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  // Vérifier si on peut aller à la page suivante/précédente
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  // Générer les numéros de page pour la navigation
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si moins de 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher 5 pages autour de la page actuelle
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Ajuster si on est près du début ou de la fin
      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  // Fonctions de navigation
  const nextPage = () => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // S'assurer que la page actuelle est valide quand les items changent
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    hasNext,
    hasPrev,
    pageNumbers
  };
};
