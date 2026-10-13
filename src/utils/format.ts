/**
 * Formateo de importes y etiquetas.
 */

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getPaymentLabel(paymentStatus: string): string {
  return paymentStatus === "paid" ? "Pagado" : "Pendiente";
}

export function getPaymentClass(paymentStatus: string): string {
  return paymentStatus === "paid" ? "payment-paid" : "payment-pending";
}
