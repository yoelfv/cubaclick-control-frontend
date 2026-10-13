import { getHavanaToday, addDays } from "./date";

/**
 * Períodos soportados por ambas vistas.
 * Unificamos "all" y "historical" en "historical" para que las dos
 * páginas usen el mismo valor y el mismo <select>.
 */
export type Period =
  "historical" | "year" | "month" | "week" | "today" | "custom";

export interface PeriodRange {
  dateFrom?: string;
  dateTo?: string;
}

export function getPeriodRange(
  period: Period,
  customDateFrom: string,
  customDateTo: string,
): PeriodRange {
  const today = getHavanaToday();

  switch (period) {
    case "historical":
      return {};

    case "year":
      return { dateFrom: `${today.slice(0, 4)}-01-01`, dateTo: today };

    case "month":
      return { dateFrom: `${today.slice(0, 7)}-01`, dateTo: today };

    case "week": {
      const [year, month, day] = today.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      const daysSinceMonday = (date.getUTCDay() + 6) % 7;

      return { dateFrom: addDays(today, -daysSinceMonday), dateTo: today };
    }

    case "today":
      return { dateFrom: today, dateTo: today };

    case "custom": {
      const dateFrom = customDateFrom || undefined;
      const dateTo = customDateTo || undefined;

      return {
        dateFrom: dateFrom && dateTo && dateFrom > dateTo ? dateTo : dateFrom,
        dateTo,
      };
    }
  }
}

export const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: "historical", label: "Histórico" },
  { value: "year", label: "Este año" },
  { value: "month", label: "Este mes" },
  { value: "week", label: "Esta semana" },
  { value: "today", label: "Hoy" },
  { value: "custom", label: "Personalizado" },
];
