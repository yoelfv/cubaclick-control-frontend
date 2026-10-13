import { getHavanaToday } from "../../utils/date";
import { PERIOD_OPTIONS, type Period } from "../../utils/period";

interface PeriodFilterProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  customDateFrom: string;
  customDateTo: string;
  onCustomDateFromChange: (value: string) => void;
  onCustomDateToChange: (value: string) => void;
  /** Título del bloque. Por defecto "Período". */
  title?: string;
  /** Descripción bajo el título. Opcional. */
  description?: string;
  /** ID base para evitar colisiones si hay varios filtros. */
  idPrefix?: string;
}

export default function PeriodFilter({
  period,
  onPeriodChange,
  customDateFrom,
  customDateTo,
  onCustomDateFromChange,
  onCustomDateToChange,
  title = "Período",
  description,
  idPrefix = "period",
}: PeriodFilterProps) {
  const today = getHavanaToday();

  return (
    <section className="entity-period-filter">
      <div className="entity-period-filter-header">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
      </div>

      <div className="entity-period-options">
        <label>
          <span>Período</span>
          <select
            id={`${idPrefix}-select`}
            value={period}
            onChange={(event) => onPeriodChange(event.target.value as Period)}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {period === "custom" && (
          <>
            <label>
              <span>Fecha inicial</span>
              <input
                type="date"
                value={customDateFrom}
                max={today}
                onChange={(event) => onCustomDateFromChange(event.target.value)}
              />
            </label>

            <label>
              <span>Fecha final</span>
              <input
                type="date"
                value={customDateTo}
                min={customDateFrom || undefined}
                max={today}
                onChange={(event) => onCustomDateToChange(event.target.value)}
              />
            </label>
          </>
        )}
      </div>
    </section>
  );
}
