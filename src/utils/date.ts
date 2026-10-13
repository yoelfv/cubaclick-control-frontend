/**
 * Utilidades de fecha/hora con zona horaria de La Habana.
 */

export function getHavanaToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Havana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);

  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, "0"),
    String(result.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * Convierte "2026-10-12" → "12/10/2026".
 * Si la cadena no tiene el formato esperado, la devuelve tal cual.
 */
export function formatDate(date: string): string {
  if (!date) return "—";

  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}
