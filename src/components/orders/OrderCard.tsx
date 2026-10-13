import type { Order } from "../../api/types";

interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
}

function OrderCard({ order, onViewDetails, onEditOrder }: OrderCardProps) {
  const cardClassName = order.cancelled
    ? "order-card order-card-cancelled"
    : "order-card";

  const paymentClassName =
    order.paymentStatus === "paid"
      ? "payment-badge payment-paid"
      : "payment-badge payment-pending";

  return (
    <article className={cardClassName}>
      <div className="order-card-header">
        <div>
          <h3>{order.code}</h3>
          <p>{order.salesRep.name}</p>
        </div>

        {order.cancelled && (
          <span className="status-badge status-cancelled">Cancelado</span>
        )}
      </div>

      <div className="order-card-person">
        <span>Cliente</span>
        <strong>{order.customer.name}</strong>
        <small>{order.customer.phone}</small>
      </div>

      <div className="order-card-person">
        <span>Destinatario</span>
        <strong>{order.recipientName}</strong>
        <small>{order.recipientPhone}</small>
      </div>

      <div className="order-card-summary">
        <div>
          <span>Remesa</span>
          <strong>
            {order.remittance > 0 ? "$" + order.remittance.toFixed(2) : "—"}
          </strong>
        </div>

        <div>
          <span>Total</span>
          <strong>{"$" + order.total.toFixed(2)}</strong>
        </div>

        <div>
          <span>Pago</span>
          <span className={paymentClassName}>
            {order.paymentStatus === "paid" ? "Pagado" : "Pendiente"}
          </span>
        </div>
      </div>

      <div className="order-card-actions">
        <button
          type="button"
          className="order-card-details-button"
          onClick={() => onViewDetails(order.id)}
        >
          Detalles
        </button>

        {!order.cancelled && (
          <button
            type="button"
            className="order-edit-button"
            onClick={() => onEditOrder(order.id)}
          >
            Editar
          </button>
        )}
      </div>
    </article>
  );
}

export default OrderCard;
