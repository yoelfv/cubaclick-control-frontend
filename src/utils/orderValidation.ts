import type { OrderItemForm } from "../types/orderForm";
import { isValidUsPhone, isValidCubaPhone } from "./phoneValidation";

interface ValidateOrderFormParams {
  date: string;
  salesRepId: string;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  orderItems: OrderItemForm[];
  remittance: string;
}

export function hasSelectedProducts(orderItems: OrderItemForm[]): boolean {
  return orderItems.some((orderItem) => orderItem.productId !== "");
}

export function validateOrderForm({
  date,
  salesRepId,
  customerName,
  customerPhone,
  recipientName,
  recipientPhone,
  orderItems,
  remittance,
}: ValidateOrderFormParams): string | null {
  if (!date) {
    return "Debes seleccionar la fecha del pedido.";
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (date > todayString) {
    return "La fecha del pedido no puede ser posterior a hoy.";
  }

  if (!salesRepId) {
    return "Debes seleccionar una vendedora.";
  }

  if (!customerName.trim()) {
    return "Debes introducir el nombre del cliente.";
  }

  if (!customerPhone.trim()) {
    return "Debes introducir el teléfono del cliente.";
  }

  if (!isValidUsPhone(customerPhone)) {
    return "El teléfono del cliente debe ser un número válido de Estados Unidos.";
  }

  if (!recipientName.trim()) {
    return "Debes introducir el nombre del destinatario.";
  }

  if (!recipientPhone.trim()) {
    return "Debes introducir el teléfono del destinatario.";
  }

  if (!isValidCubaPhone(recipientPhone)) {
    return "El teléfono del destinatario debe ser un número válido de Cuba.";
  }

  const hasProducts = hasSelectedProducts(orderItems);

  if (hasProducts) {
    for (const orderItem of orderItems) {
      if (!orderItem.productId) {
        return "Debes seleccionar un producto en todas las filas.";
      }

      if (
        !orderItem.quantity ||
        !/^\d+$/.test(orderItem.quantity) ||
        Number(orderItem.quantity) < 1
      ) {
        return "La cantidad de cada producto debe ser un número entero mayor que cero.";
      }
    }
  }

  if (remittance !== "" && Number(remittance) < 0) {
    return "El valor de la remesa no puede ser negativo.";
  }

  const remittanceAmount = Number(remittance || 0);

  if (!hasProducts && remittanceAmount === 0) {
    return "El pedido debe contener al menos un producto o una remesa mayor que cero.";
  }

  return null;
}
