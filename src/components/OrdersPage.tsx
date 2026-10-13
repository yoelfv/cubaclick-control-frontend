import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrders } from "../api/orders";
import type { Order } from "../api/types";
import OrderCard from "../components/orders/OrderCard";

interface OrdersPageProps {
  onNewOrder: () => void;
  onEditOrder: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
}

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function OrdersPage({
  onNewOrder,
  onEditOrder,
  onViewDetails,
}: OrdersPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFromUrl = searchParams.get("date") ?? getTodayDate();
  const selectedDate = dateFromUrl;
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams.get("date")) {
      setSearchParams({ date: getTodayDate() }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getOrders(selectedDate);
        setOrders(data);
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError("No fue posible cargar los pedidos.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [selectedDate]);

  const sortedOrders = [...orders].sort((a, b) => {
    const salesRepComparison = a.salesRep.name.localeCompare(
      b.salesRep.name,
      "es",
    );

    if (salesRepComparison !== 0) {
      return salesRepComparison;
    }

    return a.sequenceNumber - b.sequenceNumber;
  });

  return (
    <div className="orders-page">
      <div className="orders-page-header">
        <div>
          <h2>Pedidos</h2>
          <p>Gestiona los pedidos registrados en Cubaclick.</p>
        </div>

        <button type="button" className="secondary-button" onClick={onNewOrder}>
          + Nuevo pedido
        </button>
      </div>

      <div className="orders-date-filter">
        <label htmlFor="orders-date">Fecha</label>
        <input
          id="orders-date"
          type="date"
          value={selectedDate}
          onChange={(event) => {
            const newDate = event.target.value;
            setSearchParams({ date: newDate });
          }}
        />
      </div>

      {isLoading ? (
        <p>Cargando pedidos...</p>
      ) : error ? (
        <p>{error}</p>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <p>No hay pedidos para esta fecha.</p>
        </div>
      ) : (
        <>
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Vendedora</th>
                  <th>Cliente</th>
                  <th>Destinatario</th>
                  <th>Remesa</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {sortedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={order.cancelled ? "order-cancelled" : ""}
                  >
                    <td>
                      <strong>{order.code}</strong>
                    </td>

                    <td>{order.salesRep.name}</td>

                    <td>
                      <div className="order-person">
                        <strong>{order.customer.name}</strong>
                        <span>{order.customer.phone}</span>
                      </div>
                    </td>

                    <td>
                      <div className="order-person">
                        <strong>{order.recipientName}</strong>
                        <span>{order.recipientPhone}</span>
                      </div>
                    </td>

                    <td>
                      <strong>
                        {order.remittance > 0
                          ? `$${order.remittance.toFixed(2)}`
                          : "—"}
                      </strong>
                    </td>

                    <td>
                      <strong>${order.total.toFixed(2)}</strong>
                    </td>

                    <td>
                      <span
                        className={`payment-badge ${
                          order.paymentStatus === "paid"
                            ? "payment-paid"
                            : "payment-pending"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? "Pagado"
                          : "Pendiente"}
                      </span>

                      {order.cancelled && (
                        <span className="status-badge status-cancelled">
                          Cancelado
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="order-table-actions">
                        <button
                          type="button"
                          className="order-details-button"
                          onClick={() => onViewDetails(order.id)}
                        >
                          Detalles
                        </button>

                        {!order.cancelled && (
                          <button
                            type="button"
                            className="order-edit-button"
                            aria-label={`Editar pedido ${order.code}`}
                            onClick={() => onEditOrder(order.id)}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="orders-cards">
            {sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={onViewDetails}
                onEditOrder={onEditOrder}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default OrdersPage;
