import { useEffect, useState } from "react";
import { getCustomerById } from "../api/customers";
import { getCustomerOrders } from "../api/orders";
import type { Customer, Order } from "../api/types";
import type { CustomerOrdersSummary } from "../api/orders";
import {
  Pagination,
  PageSizeControls,
  PeriodFilter,
} from "../components/pagination";
import { getPeriodRange, type Period } from "../utils/period";
import { getPaginationRange } from "../utils/pagination";
import { formatAmount, getPaymentLabel } from "../utils/format";

interface CustomerDetailsPageProps {
  customerId: string;
  onBack: () => void;
  onViewDetails: (orderId: string) => void;
}

const PAGE_SIZES = [10, 20, 50, 100];

const EMPTY_SUMMARY: CustomerOrdersSummary = {
  totalOrders: 0,
  totalAmount: 0,
  paidOrders: 0,
  paidAmount: 0,
  pendingOrders: 0,
  pendingAmount: 0,
};

export default function CustomerDetailsPage({
  customerId,
  onBack,
  onViewDetails,
}: CustomerDetailsPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<CustomerOrdersSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<Period>("historical");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const data = await getCustomerById(customerId);
        setCustomer(data);

        if (!data) {
          setError("No se encontró el cliente.");
          return;
        }
      } catch {
        setError("No se pudo cargar el cliente.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomer();
  }, [customerId]);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsOrdersLoading(true);
        setError("");

        const { dateFrom, dateTo } = getPeriodRange(
          period,
          customDateFrom,
          customDateTo,
        );

        const result = await getCustomerOrders(customerId, {
          dateFrom,
          dateTo,
          page: currentPage,
          pageSize,
        });

        setOrders(result.data);
        setPageCount(result.pagination.pageCount);
        setTotalOrders(result.pagination.total);
        setSummary(result.summary);
      } catch (err) {
        console.error("Error al cargar los pedidos del cliente:", err);
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar los pedidos.",
        );
      } finally {
        setIsOrdersLoading(false);
      }
    }

    loadOrders();
  }, [customerId, period, customDateFrom, customDateTo, currentPage, pageSize]);

  function handlePeriodChange(value: Period) {
    setPeriod(value);
    setCurrentPage(1);
  }

  function handleCustomDateFromChange(value: string) {
    setCustomDateFrom(value);
    setCurrentPage(1);

    if (customDateTo && value && value > customDateTo) {
      setCustomDateTo(value);
    }
  }

  function handleCustomDateToChange(value: string) {
    setCustomDateTo(value);
    setCurrentPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setCurrentPage(1);
  }

  if (isLoading) {
    return <p>Cargando cliente...</p>;
  }

  if (error || !customer) {
    return (
      <div className="entity-details-page">
        <button type="button" className="back-button" onClick={onBack}>
          ← Volver a Clientes
        </button>

        <div className="customers-empty">
          <p>{error || "No se encontró el cliente."}</p>
        </div>
      </div>
    );
  }

  const { start, end } = getPaginationRange(currentPage, pageSize, totalOrders);

  return (
    <div className="entity-details-page">
      <div className="entity-details-header">
        <button type="button" className="back-button" onClick={onBack}>
          ← Atrás
        </button>

        <div>
          <h2>{customer.name}</h2>
          <p>Información del cliente</p>
        </div>
      </div>

      <PeriodFilter
        period={period}
        onPeriodChange={handlePeriodChange}
        customDateFrom={customDateFrom}
        customDateTo={customDateTo}
        onCustomDateFromChange={handleCustomDateFromChange}
        onCustomDateToChange={handleCustomDateToChange}
        title="Período"
        description="Selecciona el período que deseas consultar."
        idPrefix="entity-period"
      />

      <div className="entity-details-card">
        <div className="entity-details-fields">
          <div className="entity-details-field">
            <span>Nombre</span>
            <strong>{customer.name}</strong>
          </div>

          <div className="entity-details-field">
            <span>Teléfono</span>
            <strong>{customer.phone}</strong>
          </div>
        </div>

        <div className="entity-details-summary">
          <div className="entity-details-summary-item">
            <span>Pedidos realizados</span>
            <strong>{summary.totalOrders}</strong>
            <small>${formatAmount(summary.totalAmount)}</small>
          </div>

          <div className="entity-details-summary-item entity-details-summary-paid">
            <span>Pagados</span>
            <strong>{summary.paidOrders}</strong>
            <small>${formatAmount(summary.paidAmount)}</small>
          </div>

          <div className="entity-details-summary-item entity-details-summary-pending">
            <span>Pendientes</span>
            <strong>{summary.pendingOrders}</strong>
            <small>${formatAmount(summary.pendingAmount)}</small>
          </div>
        </div>
      </div>

      <section className="entity-orders-section">
        <div className="entity-orders-header">
          <div>
            <h3>Pedidos del cliente</h3>
            <p>Historial de pedidos registrados</p>
          </div>
        </div>

        {isOrdersLoading && (
          <p className="entity-orders-loading">Cargando pedidos...</p>
        )}

        {totalOrders === 0 ? (
          <div className="customers-empty">
            <p>
              {period === "historical"
                ? "Este cliente no tiene pedidos registrados."
                : "No hay pedidos registrados en el período seleccionado."}
            </p>
          </div>
        ) : (
          <>
            {/* TABLA ESCRITORIO */}
            <div className="entity-orders-table-wrapper">
              <table className="entity-orders-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Vendedora</th>
                    <th>Destinatario</th>
                    <th>Total</th>
                    <th>Pago</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className={
                        order.cancelled ? "entity-order-cancelled" : ""
                      }
                    >
                      <td>
                        <strong>{order.code}</strong>
                      </td>

                      <td>
                        <div>{order.salesRep.name}</div>
                        <small>{order.salesRep.initials}</small>
                      </td>

                      <td>
                        <div>{order.recipientName}</div>
                        <small>{order.recipientPhone}</small>
                      </td>

                      <td>
                        <strong>${formatAmount(order.total)}</strong>
                      </td>

                      <td>
                        <span
                          className={`payment-badge ${
                            order.paymentStatus === "paid"
                              ? "payment-paid"
                              : "payment-pending"
                          }`}
                        >
                          {getPaymentLabel(order.paymentStatus)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            order.cancelled
                              ? "status-badge status-cancelled"
                              : "status-badge status-active"
                          }
                        >
                          {order.cancelled ? "Cancelado" : "Vigente"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="order-details-button"
                          onClick={() => onViewDetails(order.id)}
                        >
                          Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CARDS MÓVIL */}
            <div className="entity-orders-cards">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className={`entity-order-card ${
                    order.cancelled ? "entity-order-card-cancelled" : ""
                  }`}
                >
                  <div className="entity-order-card-header">
                    <div>
                      <strong>{order.code}</strong>
                      <span>{order.recipientName}</span>
                    </div>

                    <span
                      className={
                        order.cancelled
                          ? "status-badge status-cancelled"
                          : "status-badge status-active"
                      }
                    >
                      {order.cancelled ? "Cancelado" : "Vigente"}
                    </span>
                  </div>

                  <div className="entity-order-card-recipient">
                    <span>Vendedora</span>
                    <strong>{order.salesRep.name}</strong>
                    <small>{order.salesRep.initials}</small>
                  </div>

                  <div className="entity-order-card-recipient">
                    <span>Destinatario</span>
                    <strong>{order.recipientName}</strong>
                    <small>{order.recipientPhone}</small>
                  </div>

                  <div className="entity-order-card-summary">
                    <div>
                      <span>Total</span>
                      <strong>${formatAmount(order.total)}</strong>
                    </div>

                    <div>
                      <span>Pago</span>
                      <span
                        className={`payment-badge ${
                          order.paymentStatus === "paid"
                            ? "payment-paid"
                            : "payment-pending"
                        }`}
                      >
                        {getPaymentLabel(order.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="entity-order-card-actions">
                    <button
                      type="button"
                      className="order-card-details-button"
                      onClick={() => onViewDetails(order.id)}
                    >
                      Ver detalles
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* PAGINACIÓN */}
            <PageSizeControls
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              onPageSizeChange={handlePageSizeChange}
              rangeLabel={
                totalOrders === 0
                  ? "Sin pedidos"
                  : `Mostrando ${start}–${end} de ${totalOrders} ${
                      totalOrders === 1 ? "pedido" : "pedidos"
                    }`
              }
              id="customer-page-size"
            />

            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              ariaLabel="Paginación del historial de pedidos del cliente"
            />
          </>
        )}
      </section>
    </div>
  );
}
