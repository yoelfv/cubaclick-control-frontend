interface OrderSummaryProps {
  total: number;
}

function OrderSummary({ total }: OrderSummaryProps) {
  return (
    <div className="order-form-summary">
      <span>Total del pedido</span>
      <strong>${total.toFixed(2)}</strong>
    </div>
  );
}

export default OrderSummary;
