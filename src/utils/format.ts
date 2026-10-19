/**
 * Formateo de importes y etiquetas.
 */

export function formatAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `$${formatted}`;
}

export function getPaymentLabel(paymentStatus: string): string {
  return paymentStatus === "paid" ? "Pagado" : "Pendiente";
}

/**
 * Convierte una fecha "2026-10-17" (o "2026-10-17T00:00:00Z") en "17/10/2026".
 * Si la cadena no tiene el formato esperado, la devuelve tal cual.
 */
export function formatDate(date: string): string {
  if (!date) return "—";

  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}
