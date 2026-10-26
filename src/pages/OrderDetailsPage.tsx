import { useEffect, useState } from "react";
import { getOrderById } from "../api/orders";
import type { Order } from "../api/types";
import LoadingState from "../components/common/LoadingState";
import { formatAmount } from "../utils/format";

interface OrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

function OrderDetailsPage({ orderId, onBack }: OrderDetailsPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error al cargar los detalles del pedido:", err);
        setError("No fue posible cargar los detalles del pedido.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <LoadingState message="Cargando detalles del pedido..." />;
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="order-details-header">
          <div>
            <h2>Detalles del pedido</h2>
            <p>Consulta la información completa del pedido.</p>
          </div>
        </div>

        <button
          type="button"
          className="order-form-back-button"
          onClick={onBack}
        >
          ← Atrás
        </button>

        <p>{error ?? "No se encontró el pedido."}</p>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="order-details-header">
        <div>
          <h2>Detalles del pedido</h2>
          <p>Consulta la información completa del pedido.</p>
        </div>
      </div>

      <button type="button" className="back-button" onClick={onBack}>
        ← Atrás
      </button>

      {order.cancelled && (
        <div className="order-details-cancelled">
          <strong>Estado: Cancelado</strong>
          <span>
            Este pedido fue cancelado y se conserva únicamente como registro.
          </span>
        </div>
      )}

      <div className="order-details-sections">
        <section className="order-details-section">
          <div className="order-details-section-header">
            <h3>Información del pedido</h3>
          </div>

          <div className="order-details-grid">
            <div className="order-details-field">
              <span>Pedido</span>
              <strong>{order.code}</strong>
            </div>

            <div className="order-details-field">
              <span>Vendedora</span>
              <strong>{order.salesRep.name}</strong>
            </div>
          </div>
        </section>

        <section className="order-details-section">
          <div className="order-details-section-header">
            <h3>Cliente</h3>
          </div>

          <div className="order-details-grid">
            <div className="order-details-field">
              <span>Nombre</span>
              <strong>{order.customer.name}</strong>
            </div>

            <div className="order-details-field">
              <span>Teléfono</span>
              <strong>{order.customer.phone}</strong>
            </div>
          </div>
        </section>

        <section className="order-details-section">
          <div className="order-details-section-header">
            <h3>Destinatario</h3>
          </div>

          <div className="order-details-grid">
            <div className="order-details-field">
              <span>Nombre</span>
              <strong>{order.recipientName}</strong>
            </div>

            <div className="order-details-field">
              <span>Teléfono</span>
              <strong>{order.recipientPhone}</strong>
            </div>
          </div>
        </section>

        <section className="order-details-section">
          <div className="order-details-section-header">
            <h3>Productos</h3>
          </div>

          <div className="order-details-products">
            {order.orderItems.map((item) => {
              const subtotal = item.unitPrice * item.quantity;

              return (
                <div className="order-details-product" key={item.id}>
                  <div className="order-details-product-main">
                    <strong>{item.product.name}</strong>
                  </div>

                  <div className="order-details-product-value">
                    <span>Cantidad</span>
                    <strong>{item.quantity}</strong>
                  </div>

                  <div className="order-details-product-value">
                    <span>Precio</span>
                    <strong>{formatAmount(item.unitPrice)}</strong>
                  </div>

                  <div className="order-details-product-value">
                    <span>Subtotal</span>
                    <strong>{formatAmount(subtotal)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-details-products-total">
            <span>Total productos</span>
            <strong>
              $
              {order.orderItems
                .reduce(
                  (total, item) => total + item.unitPrice * item.quantity,
                  0,
                )
                .toFixed(2)}
            </strong>
          </div>
        </section>

        <section className="order-details-section">
          <div className="order-details-section-header">
            <h3>Pago</h3>
          </div>

          <div className="order-details-payment">
            <div className="order-details-payment-item">
              <span>Remesa</span>
              <strong>
                {order.remittance > 0 ? `$${order.remittance.toFixed(2)}` : "—"}
              </strong>
            </div>

            <div className="order-details-payment-item">
              <span>Total del pedido</span>
              <strong>{formatAmount(order.total)}</strong>
            </div>

            <div className="order-details-payment-item">
              <span>Estado del pago</span>
              <span
                className={`payment-badge ${
                  order.paymentStatus === "paid"
                    ? "payment-paid"
                    : "payment-pending"
                }`}
              >
                {order.paymentStatus === "paid" ? "Pagado" : "Pendiente"}
              </span>
            </div>
            <div className="order-details-payment-item">
              <span>Cuenta de pago</span>
              <strong>{order.bankAccount?.name ?? "Sin asignar"}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
