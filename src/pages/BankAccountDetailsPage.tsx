import { useEffect, useMemo, useState } from "react";
import { getBankAccounts } from "../api/bankAccounts";
import {
  getBankAccountOrders,
  type CustomerOrdersPagination,
} from "../api/orders";
import type { BankAccount, Order } from "../api/types";
import {
  Pagination,
  PageSizeControls,
  PeriodFilter,
} from "../components/pagination";
import { getPeriodRange, type Period } from "../utils/period";
import { getPaginationRange } from "../utils/pagination";
import { formatAmount } from "../utils/format";
import LoadingState from "../components/common/LoadingState";

interface BankAccountDetailsPageProps {
  bankAccountId: string;
  onBack: () => void;
  onViewDetails: (orderId: string) => void;
}

const PAGE_SIZES = [10, 20, 50, 100];

const EMPTY_PAGINATION: CustomerOrdersPagination = {
  page: 1,
  pageSize: 10,
  pageCount: 0,
  total: 0,
};

export default function BankAccountDetailsPage({
  bankAccountId,
  onBack,
  onViewDetails,
}: BankAccountDetailsPageProps) {
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalAmount: 0,
  });
  const [pagination, setPagination] =
    useState<CustomerOrdersPagination>(EMPTY_PAGINATION);

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

  // Cargar la cuenta
  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      setLoadingAccount(true);
      setAccountError("");

      try {
        const accounts = await getBankAccounts();
        if (cancelled) return;

        const found = accounts.find((item) => item.id === bankAccountId);

        if (!found) {
          setBankAccount(null);
          setAccountError("No se encontró la cuenta solicitada.");
          return;
        }

        setBankAccount(found);
      } catch {
        if (!cancelled) {
          setAccountError("No se pudieron cargar los datos de la cuenta.");
        }
      } finally {
        if (!cancelled) setLoadingAccount(false);
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, [bankAccountId]);

  // Cargar los pedidos de la cuenta
  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      setOrdersError("");

      try {
        const response = await getBankAccountOrders(bankAccountId, {
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
          setSummary({ totalOrders: 0, totalAmount: 0 });
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
  }, [bankAccountId, periodRange, currentPage, pageSize]);

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

  if (loadingAccount) {
    return (
      <div className="sales-rep-details-page">
        <button className="back-button" onClick={onBack} type="button">
          ← Atrás
        </button>
        <LoadingState message="Cargando datos de la cuenta..." />
      </div>
    );
  }

  if (accountError || !bankAccount) {
    return (
      <div className="sales-rep-details-page">
        <button className="back-button" onClick={onBack} type="button">
          ← Atrás
        </button>
        <p className="error-message">
          {accountError || "No se encontró la cuenta."}
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
          <h2>{bankAccount.name}</h2>
          <p>Información de la cuenta</p>
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
        idPrefix="bank-account-period"
      />

      {/* RESUMEN: solo 2 cuadros */}
      <div className="bank-account-summary">
        <div className="bank-account-summary-item">
          <span>Pedidos</span>
          <strong>{summary.totalOrders}</strong>
        </div>

        <div className="bank-account-summary-item bank-account-summary-total">
          <span>Importe total</span>
          <strong>{formatAmount(summary.totalAmount)}</strong>
        </div>
      </div>

      {/* TABLA DE PEDIDOS */}
      <section className="entity-orders-section">
        <div className="entity-orders-header">
          <div>
            <h3>Pedidos de esta cuenta</h3>
            <p>Historial de pedidos asignados</p>
          </div>
        </div>

        {ordersError && <p className="error-message">{ordersError}</p>}

        {loadingOrders ? (
          <LoadingState variant="inline" message="Cargando pedidos..." />
        ) : ordersError ? null : totalOrders === 0 ? (
          <div className="customers-empty">
            <p>
              {period === "historical"
                ? "Esta cuenta no tiene pedidos registrados."
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
                    <th>Vendedora</th>
                    <th>Total</th>
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
                        <div>{order.salesRep.name}</div>
                        <small>{order.salesRep.initials}</small>
                      </td>

                      <td>
                        <strong>{formatAmount(order.total)}</strong>
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

                  <div className="entity-order-card-recipient">
                    <span>Vendedora</span>
                    <strong>{order.salesRep.name}</strong>
                    <small>{order.salesRep.initials}</small>
                  </div>

                  <div className="entity-order-card-summary">
                    <div>
                      <span>Total</span>
                      <strong>{formatAmount(order.total)}</strong>
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
              id="bank-account-page-size"
            />

            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              ariaLabel="Paginación del historial de pedidos de la cuenta"
            />
          </>
        )}
      </section>
    </div>
  );
}
