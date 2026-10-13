import { useEffect, useState } from "react";
import { getOrders } from "../api/orders";
import type { Order } from "../api/types";

export default function StatisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch {
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading) {
    return <p>Cargando estadísticas...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const activeOrders = orders.filter((order) => !order.cancelled);

  const totalSales = activeOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  const totalRemittance = activeOrders.reduce(
    (sum, order) => sum + order.remittance,
    0,
  );

  const paidOrders = activeOrders.filter(
    (order) => order.paymentStatus === "paid",
  ).length;

  const pendingOrders = activeOrders.filter(
    (order) => order.paymentStatus === "pending",
  ).length;

  return (
    <div>
      <h3>Estadísticas</h3>

      <div>
        <div>
          <strong>Pedidos</strong>
          <p>{activeOrders.length}</p>
        </div>

        <div>
          <strong>Total vendido</strong>
          <p>${totalSales.toFixed(2)}</p>
        </div>

        <div>
          <strong>Total de remesas</strong>
          <p>${totalRemittance.toFixed(2)}</p>
        </div>

        <div>
          <strong>Pedidos pagados</strong>
          <p>{paidOrders}</p>
        </div>

        <div>
          <strong>Pedidos pendientes</strong>
          <p>{pendingOrders}</p>
        </div>
      </div>
    </div>
  );
}