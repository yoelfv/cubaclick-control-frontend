export type PaginationItem = number | "ellipsis";

export interface PaginationPagesOptions {
  /** Máximo de páginas sin elipsis antes de colapsar. */
  maxWithoutEllipsis?: number;
  /** Números a cada lado de la página actual. */
  siblings?: number;
}

/**
 * Genera la lista de páginas a mostrar con elipsis.
 * Lógica unificada para que Cliente y Vendedora se comporten igual.
 *
 * Ejemplos (pageCount=28, siblings=1):
 *   currentPage=1  → [1, 2, …, 28]
 *   currentPage=5  → [1, …, 4, 5, 6, …, 28]
 *   currentPage=28 → [1, …, 27, 28]
 */
export function getPaginationPages(
  currentPage: number,
  pageCount: number,
  options: PaginationPagesOptions = {},
): PaginationItem[] {
  const { maxWithoutEllipsis = 7, siblings = 1 } = options;

  if (pageCount <= 0) return [];

  if (pageCount <= maxWithoutEllipsis) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const left = Math.max(2, currentPage - siblings);
  const right = Math.min(pageCount - 1, currentPage + siblings);

  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;

  const pages: PaginationItem[] = [1];

  if (showLeftEllipsis) pages.push("ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (showRightEllipsis) pages.push("ellipsis");

  pages.push(pageCount);

  return pages;
}

export interface PaginationRange {
  start: number;
  end: number;
}

export function getPaginationRange(
  currentPage: number,
  pageSize: number,
  totalItems: number,
): PaginationRange {
  if (totalItems === 0) return { start: 0, end: 0 };

  return {
    start: (currentPage - 1) * pageSize + 1,
    end: Math.min(currentPage * pageSize, totalItems),
  };
}
