import { useEffect, useMemo, useState } from "react";
import { getSalesReps } from "../api/salesReps";
import {
  getSalesRepOrders,
  type CustomerOrdersPagination,
  type CustomerOrdersSummary,
} from "../api/orders";
import type { Order, SalesRep } from "../api/types";
import {
  Pagination,
  PageSizeControls,
  PeriodFilter,
} from "../components/pagination";
import { getPeriodRange, type Period } from "../utils/period";
import { getPaginationRange } from "../utils/pagination";
import { formatAmount, getPaymentLabel } from "../utils/format";

interface SalesRepDetailsPageProps {
  salesRepId: string;
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

export default function SalesRepDetailsPage({
  salesRepId,
  onBack,
  onViewDetails,
}: SalesRepDetailsPageProps) {
  const [salesRep, setSalesRep] = useState<SalesRep | null>(null);
  const [loadingSalesRep, setLoadingSalesRep] = useState(true);
  const [salesRepError, setSalesRepError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<CustomerOrdersSummary>(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState<CustomerOrdersPagination>({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  });

  const [period, setPeriod] = useState<Period>("historical");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const periodRange = useMemo(
    () => getPeriodRange(period, customDateFrom, customDateTo),
    [period, customDateFrom, customDateTo],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSalesRep() {
      setLoadingSalesRep(true);
      setSalesRepError("");

      try {
        const salesReps = await getSalesReps();
        if (cancelled) return;

        const found = salesReps.find((item) => item.id === salesRepId);

        if (!found) {
          setSalesRep(null);
          setSalesRepError("No se encontró la vendedora solicitada.");
          return;
        }

        setSalesRep(found);
      } catch {
        if (!cancelled) {
          setSalesRepError("No se pudieron cargar los datos de la vendedora.");
        }
      } finally {
        if (!cancelled) setLoadingSalesRep(false);
      }
    }

    void loadSalesRep();

    return () => {
      cancelled = true;
    };
  }, [salesRepId]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      setOrdersError("");

      try {
        const response = await getSalesRepOrders(salesRepId, {
          dateFrom: periodRange.dateFrom,
          dateTo: periodRange.dateTo,
          page: currentPage,
          pageSize,
        });

        if (cancelled) return;

        setOrders(response.data);
        setSummary(response.summary);
        setPagination(response.pagination);
      } catch {
        if (!cancelled) {
          setOrders([]);
          setSummary(EMPTY_SUMMARY);
          setPagination({
            page: currentPage,
            pageSize,
            pageCount: 0,
            total: 0,
          });
          setOrdersError("No se pudieron cargar los pedidos.");
        }
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [salesRepId, periodRange, currentPage, pageSize]);

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

  const pageCount = pagination.pageCount;
  const totalOrders = pagination.total;

  if (loadingSalesRep) {
    return (
      <div className="sales-rep-details-page">
        <button className="back-button" onClick={onBack} type="button">
          ← Atrás
        </button>
        <p>Cargando datos de la vendedora...</p>
      </div>
    );
  }

  if (salesRepError || !salesRep) {
    return (
      <div className="sales-rep-details-page">
        <button className="back-button" onClick={onBack} type="button">
          ← Atrás
        </button>
        <p className="error-message">
          {salesRepError || "No se encontró la vendedora."}
        </p>
      </div>
    );
  }

  const { start, end } = getPaginationRange(currentPage, pageSize, totalOrders);

  return (
    <div className="sales-rep-details-page">
      <div className="entity-details-header">
        <button className="back-button" onClick={onBack} type="button">
          ← Atrás
        </button>

        <div>
          <h2>{salesRep.name}</h2>
          <p>Información de la vendedora</p>
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
        idPrefix="sales-rep-period"
      />

      <div className="entity-details-card">
        <div className="entity-details-fields">
          <div className="entity-details-field">
            <span>Nombre</span>
            <strong>{salesRep.name}</strong>
          </div>

          <div className="entity-details-field">
            <span>Iniciales</span>
            <strong>{salesRep.initials || "—"}</strong>
          </div>

          <div className="entity-details-field">
            <span>Estado</span>
            <strong>{salesRep.active ? "Activa" : "Inactiva"}</strong>
          </div>
        </div>

        <div className="entity-details-summary">
          <div className="entity-details-summary-item">
            <span>Pedidos atendidos</span>
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
            <h3>Pedidos atendidos</h3>
            <p>Historial de pedidos registrados</p>
          </div>
        </div>

        {ordersError && <p className="error-message">{ordersError}</p>}

        {loadingOrders ? (
          <p className="entity-orders-loading">Cargando pedidos...</p>
        ) : ordersError ? null : totalOrders === 0 ? (
          <div className="customers-empty">
            <p>
              {period === "historical"
                ? "Esta vendedora no tiene pedidos registrados."
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
                    <th>Cliente</th>
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
                        <div>{order.customer.name}</div>
                        <small>{order.customer.phone}</small>
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
                    <span>Cliente</span>
                    <strong>{order.customer.name}</strong>
                    <small>{order.customer.phone}</small>
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
              id="sales-rep-page-size"
            />

            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              ariaLabel="Paginación del historial de pedidos de la vendedora"
            />
          </>
        )}
      </section>
    </div>
  );
}
