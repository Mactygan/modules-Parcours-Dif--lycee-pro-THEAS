import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  pageNumbers: number[];
  showFirstLast?: boolean;
}

/**
 * Composant de pagination réutilisable
 * À utiliser avec le hook usePagination
 *
 * @example
 * ```tsx
 * const pagination = usePagination({ items: users, itemsPerPage: 20 });
 *
 * <Pagination
 *   currentPage={pagination.currentPage}
 *   totalPages={pagination.totalPages}
 *   onPageChange={pagination.setCurrentPage}
 *   onPrevious={pagination.prevPage}
 *   onNext={pagination.nextPage}
 *   onFirst={pagination.goToFirstPage}
 *   onLast={pagination.goToLastPage}
 *   hasNext={pagination.hasNext}
 *   hasPrev={pagination.hasPrev}
 *   pageNumbers={pagination.pageNumbers}
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  onFirst,
  onLast,
  hasNext,
  hasPrev,
  pageNumbers,
  showFirstLast = true
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* Bouton première page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFirst}
          disabled={!hasPrev}
          title="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Bouton page précédente */}
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPrev}
        title="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Numéros de page */}
      <div className="flex gap-1">
        {pageNumbers[0] > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 py-1 text-muted-foreground">...</span>
            )}
          </>
        )}

        {pageNumbers.map(pageNum => (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 py-1 text-muted-foreground">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      {/* Bouton page suivante */}
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!hasNext}
        title="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Bouton dernière page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={onLast}
          disabled={!hasNext}
          title="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}

      {/* Info page actuelle */}
      <span className="text-sm text-muted-foreground ml-2">
        Page {currentPage} sur {totalPages}
      </span>
    </div>
  );
};

export default Pagination;
