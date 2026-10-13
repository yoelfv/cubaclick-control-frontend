interface PageSizeControlsProps {
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange: (size: number) => void;
  /** Texto a la derecha: "Mostrando 1–10 de 427 pedidos". */
  rangeLabel: string;
  /** ID único para el htmlFor del <select>. */
  id?: string;
}

const DEFAULT_SIZES = [10, 20, 50, 100];

export default function PageSizeControls({
  pageSize,
  pageSizeOptions = DEFAULT_SIZES,
  onPageSizeChange,
  rangeLabel,
  id = "page-size",
}: PageSizeControlsProps) {
  return (
    <div className="entity-orders-pagination-controls">
      <label htmlFor={id}>
        <span>Pedidos por página</span>
        <select
          id={id}
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <span className="entity-orders-pagination-total">{rangeLabel}</span>
    </div>
  );
}
