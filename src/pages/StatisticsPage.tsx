import { useEffect, useState } from "react";
import { getStatistics } from "../api/orders";
import type { DailyStat, StatisticsSummary } from "../api/types";
import {
  Pagination,
  PageSizeControls,
  PeriodFilter,
} from "../components/pagination";
import { getPeriodRange, type Period } from "../utils/period";
import { getPaginationRange } from "../utils/pagination";
import { formatAmount, formatDate } from "../utils/format";
import LoadingState from "../components/common/LoadingState";

const PAGE_SIZES = [10, 20, 50, 100];

const EMPTY_SUMMARY: StatisticsSummary = {
  totalOrders: 0,
  totalAmount: 0,
  paidOrders: 0,
  paidAmount: 0,
  pendingOrders: 0,
  pendingAmount: 0,
};

export default function StatisticsPage() {
  const [summary, setSummary] = useState<StatisticsSummary>(EMPTY_SUMMARY);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [totalDays, setTotalDays] = useState(0);
  const [period, setPeriod] = useState<Period>("historical");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const { dateFrom, dateTo } = getPeriodRange(
          period,
          customDateFrom,
          customDateTo,
        );

        const result = await getStatistics({
          dateFrom,
          dateTo,
          page: currentPage,
          pageSize,
        });

        setSummary(result.summary);
        setDaily(result.daily);
        setPageCount(result.pagination.pageCount);
        setTotalDays(result.pagination.total);
      } catch (err) {
        console.error("Error al cargar las estadísticas:", err);
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar las estadísticas.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [period, customDateFrom, customDateTo, currentPage, pageSize]);

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

  const { start, end } = getPaginationRange(currentPage, pageSize, totalDays);

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <div>
          <h2>Estadísticas</h2>
          <p>Resumen del funcionamiento de la tienda.</p>
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
        idPrefix="statistics-period"
      />

      {/* RESUMEN */}
      <div className="statistics-summary">
        <div className="statistics-summary-item">
          <span>Pedidos</span>
          <strong>{summary.totalOrders}</strong>
          <small>{formatAmount(summary.totalAmount)}</small>
        </div>

        <div className="statistics-summary-item statistics-summary-paid">
          <span>Pagados</span>
          <strong>{summary.paidOrders}</strong>
          <small>{formatAmount(summary.paidAmount)}</small>
        </div>

        <div className="statistics-summary-item statistics-summary-pending">
          <span>Pendientes</span>
          <strong>{summary.pendingOrders}</strong>
          <small>{formatAmount(summary.pendingAmount)}</small>
        </div>
      </div>

      {/* TABLA POR DÍA */}
      <section className="statistics-section">
        <div className="statistics-section-header">
          <div>
            <h3>Ventas por día</h3>
            <p>Detalle diario del período seleccionado.</p>
          </div>
        </div>

        {isLoading && (
          <LoadingState variant="inline" message="Cargando estadísticas..." />
        )}

        {error && !isLoading && (
          <div className="statistics-empty">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && totalDays === 0 && (
          <div className="statistics-empty">
            <p>No hay ventas registradas en el período seleccionado.</p>
          </div>
        )}

        {!isLoading && !error && totalDays > 0 && (
          <>
            {/* TABLA ESCRITORIO */}
            <div className="statistics-table-wrapper">
              <table className="statistics-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Pedidos</th>
                    <th>Total</th>
                    <th>Pagado</th>
                    <th>Pendiente</th>
                  </tr>
                </thead>

                <tbody>
                  {daily.map((day) => (
                    <tr key={day.date}>
                      <td>
                        <strong>{formatDate(day.date)}</strong>
                      </td>
                      <td>{day.orders}</td>
                      <td>
                        <strong>{formatAmount(day.total)}</strong>
                      </td>
                      <td>{formatAmount(day.paid)}</td>
                      <td>{formatAmount(day.pending)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CARDS MÓVIL */}
            <div className="statistics-cards">
              {daily.map((day) => (
                <article className="statistics-card" key={day.date}>
                  <div className="statistics-card-header">
                    <strong>{formatDate(day.date)}</strong>
                    <span>
                      {day.orders} {day.orders === 1 ? "pedido" : "pedidos"}
                    </span>
                  </div>

                  <div className="statistics-card-summary">
                    <div>
                      <span>Total</span>
                      <strong>{formatAmount(day.total)}</strong>
                    </div>
                    <div>
                      <span>Pagado</span>
                      <strong>{formatAmount(day.paid)}</strong>
                    </div>
                    <div>
                      <span>Pendiente</span>
                      <strong>{formatAmount(day.pending)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* CONTROLES + PAGINACIÓN */}
            <PageSizeControls
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              onPageSizeChange={handlePageSizeChange}
              rangeLabel={
                totalDays === 0
                  ? "Sin días"
                  : `Mostrando ${start}–${end} de ${totalDays} ${
                      totalDays === 1 ? "día" : "días"
                    }`
              }
              id="statistics-page-size"
            />

            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              ariaLabel="Paginación de ventas por día"
            />
          </>
        )}
      </section>
    </div>
  );
}
