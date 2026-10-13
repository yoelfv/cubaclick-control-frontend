import type { PaginationItem } from "../../utils/pagination";
import { getPaginationPages } from "../../utils/pagination";

interface PaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Etiqueta accesible del <nav>. */
  ariaLabel?: string;
  /** Opciones avanzadas para getPaginationPages. */
  maxWithoutEllipsis?: number;
  siblings?: number;
}

export default function Pagination({
  currentPage,
  pageCount,
  onPageChange,
  ariaLabel = "Paginación",
  maxWithoutEllipsis,
  siblings,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const items: PaginationItem[] = getPaginationPages(currentPage, pageCount, {
    maxWithoutEllipsis,
    siblings,
  });

  const goTo = (page: number) => {
    const safe = Math.min(Math.max(1, page), pageCount);
    if (safe !== currentPage) onPageChange(safe);
  };

  return (
    <nav className="entity-orders-pagination" aria-label={ariaLabel}>
      <div className="entity-orders-pagination-group">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => goTo(1)}
        >
          Primera
        </button>

        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => goTo(currentPage - 1)}
        >
          Anterior
        </button>
      </div>

      <div className="entity-orders-pagination-pages">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="entity-orders-pagination-ellipsis"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={
                item === currentPage
                  ? "entity-orders-pagination-active"
                  : undefined
              }
              aria-current={item === currentPage ? "page" : undefined}
              onClick={() => goTo(item)}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <div className="entity-orders-pagination-group">
        <button
          type="button"
          disabled={currentPage === pageCount}
          onClick={() => goTo(currentPage + 1)}
        >
          Siguiente
        </button>

        <button
          type="button"
          disabled={currentPage === pageCount}
          onClick={() => goTo(pageCount)}
        >
          Última
        </button>
      </div>
    </nav>
  );
}
