import { useEffect, useState } from "react";
import { getOrders, getRecentOrders } from "../api/orders";
import type { Order } from "../api/types";

type View = "dashboard" | "orders" | "customers" | "salesReps" | "statistics";

interface DashboardProps {
  onViewChange: (view: View) => void;
}

function Dashboard({ onViewChange }: DashboardProps) {
  const [period, setPeriod] = useState<"today" | "week" | "month">("month");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [recentError, setRecentError] = useState("");

  function getPeriodDates(selectedPeriod: "today" | "week" | "month") {
    const today = new Date();
    const endDate = new Date(today);

    const startDate = new Date(today);

    if (selectedPeriod === "week") {
      const day = startDate.getDay();
      const daysSinceMonday = day === 0 ? 6 : day - 1;
      startDate.setDate(startDate.getDate() - daysSinceMonday);
    }

    if (selectedPeriod === "month") {
      startDate.setDate(1);
    }

    function formatDate(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    return {
      from: formatDate(startDate),
      to: formatDate(endDate),
    };
  }

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const { from, to } = getPeriodDates(period);
        const data = await getOrders(from, to);

        setOrders(data);
      } catch {
        setError("No se pudieron cargar los pedidos.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [period]);

  useEffect(() => {
    async function loadRecentOrders() {
      try {
        setIsLoadingRecent(true);
        setRecentError("");

        const data = await getRecentOrders(4);
        setRecentOrders(data);
      } catch {
        setRecentError("No se pudieron cargar los pedidos recientes.");
      } finally {
        setIsLoadingRecent(false);
      }
    }

    loadRecentOrders();
  }, []);

  const activeOrders = orders.filter((order) => !order.cancelled);

  if (isLoading) {
    return <p>Cargando dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const totalSales = activeOrders.reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = activeOrders.filter(
    (order) => order.paymentStatus === "pending",
  ).length;

  const customerIds = new Set(activeOrders.map((order) => order.customer.id));

  const stats = [
    {
      label: "Pedidos",
      value: String(activeOrders.length),
      description: "En el período seleccionado",
    },
    {
      label: "Ventas",
      value: `$${totalSales.toFixed(2)}`,
      description: "Total de pedidos",
    },
    {
      label: "Pendientes",
      value: String(pendingOrders),
      description: "Pedidos por cobrar",
    },
    {
      label: "Clientes",
      value: String(customerIds.size),
      description: "Clientes con pedidos",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Resumen</h2>
          <p>Consulta rápida de la actividad de Cubaclick.</p>
        </div>

        <select
          className="period-select"
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value as "today" | "week" | "month")
          }
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-label">{stat.label}</span>
            <strong className="stat-value">{stat.value}</strong>
            <span className="stat-description">{stat.description}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h3>Pedidos recientes</h3>
            <p>Los últimos pedidos registrados.</p>
          </div>

          <button
            className="secondary-button"
            onClick={() => onViewChange("orders")}
          >
            Ver todos
          </button>
        </div>

        <div className="orders-list">
          {isLoadingRecent ? (
            <p>Cargando pedidos recientes...</p>
          ) : recentError ? (
            <p>{recentError}</p>
          ) : recentOrders.length === 0 ? (
            <p>No hay pedidos recientes.</p>
          ) : (
            recentOrders.map((order) => (
              <article className="recent-order" key={order.id}>
                <div className="recent-order-main">
                  <strong>{order.code}</strong>
                  <span>{order.customer.name}</span>
                </div>

                <div className="recent-order-details">
                  <span>{order.salesRep.name}</span>
                  <span>
                    {new Date(`${order.date}T00:00:00`).toLocaleDateString(
                      "es-ES",
                    )}
                  </span>
                  <strong>${order.total.toFixed(2)}</strong>

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
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
