import type { Product } from "../api/types";
import type { OrderItemForm } from "../types/orderForm";

export function calculateProductsTotal(
  orderItems: OrderItemForm[],
  products: Product[],
): number {
  return orderItems.reduce((total, orderItem) => {
    const product = products.find(
      (product) => product.id === orderItem.productId,
    );

    if (!product || orderItem.quantity === "") {
      return total;
    }

    const unitPrice = orderItem.unitPrice ?? product.price;

    return total + unitPrice * Number(orderItem.quantity);
  }, 0);
}

export function calculateOrderTotal(
  productsTotal: number,
  remittance: string,
): number {
  return productsTotal + Number(remittance || 0);
}
