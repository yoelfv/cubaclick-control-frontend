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
