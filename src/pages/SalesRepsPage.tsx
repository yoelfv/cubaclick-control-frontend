import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSalesReps, updateSalesRep } from "../api/salesReps";
import type { SalesRep } from "../api/types";
import { useAuthUser } from "../hooks/useAuthUser";
import LoadingState from "../components/common/LoadingState";
import ConfirmDialog from "../components/common/ConfirmDialog";

export default function SalesRepsPage() {
  const navigate = useNavigate();
  const { canEdit } = useAuthUser();

  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salesRepFilter, setSalesRepFilter] = useState<"active" | "inactive">(
    "active",
  );

  const [salesRepToReactivate, setSalesRepToReactivate] =
    useState<SalesRep | null>(null);

  const loadSalesReps = useCallback(async () => {
    try {
      const data = await getSalesReps();
      setSalesReps(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar las vendedoras:", err);
      setError("No fue posible cargar las vendedoras.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getSalesReps();

        if (!cancelled) {
          setSalesReps(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar las vendedoras:", err);
          setError("No fue posible cargar las vendedoras.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSalesReps = salesReps.filter((salesRep) =>
    salesRepFilter === "active" ? salesRep.active : !salesRep.active,
  );

  async function handleConfirmReactivate() {
    if (!salesRepToReactivate) return;

    const salesRep = salesRepToReactivate;
    setSalesRepToReactivate(null);

    try {
      setError(null);

      await updateSalesRep(salesRep.id, {
        name: salesRep.name,
        initials: salesRep.initials,
        active: true,
      });

      await loadSalesReps();
    } catch (err) {
      console.error("Error al reactivar la vendedora:", err);
      setError("No fue posible reactivar la vendedora.");
    }
  }

  function renderActions(salesRep: SalesRep) {
    return (
      <>
        <button
          type="button"
          className="order-details-button"
          onClick={() => navigate(`/sales-reps/${salesRep.id}`)}
        >
          Detalles
        </button>

        {canEdit && salesRep.active && (
          <button
            type="button"
            className="order-edit-button"
            onClick={() => navigate(`/sales-reps/${salesRep.id}/edit`)}
          >
            Editar
          </button>
        )}

        {canEdit && !salesRep.active && (
          <button
            type="button"
            className="order-edit-button"
            onClick={() => setSalesRepToReactivate(salesRep)}
          >
            Reactivar
          </button>
        )}
      </>
    );
  }

  return (
    <div className="sales-reps-page">
      <div className="sales-reps-header">
        <div>
          <h2>Vendedoras</h2>
          <p>Gestiona las vendedoras registradas.</p>
        </div>

        <div className="sales-reps-header-actions">
          <select
            value={salesRepFilter}
            onChange={(event) =>
              setSalesRepFilter(event.target.value as "active" | "inactive")
            }
            aria-label="Filtrar vendedoras por estado"
          >
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>

          {canEdit && (
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/sales-reps/new")}
            >
              + Nueva vendedora
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando vendedoras..." />
      ) : error ? (
        <p className="sales-reps-error">{error}</p>
      ) : filteredSalesReps.length === 0 ? (
        <div className="sales-reps-empty">
          <p>
            No hay vendedoras{" "}
            {salesRepFilter === "active" ? "activas" : "inactivas"} registradas.
          </p>
        </div>
      ) : (
        <>
          <div className="sales-reps-table-wrapper">
            <table className="sales-reps-table">
              <thead>
                <tr>
                  <th>Vendedora</th>
                  <th>Iniciales</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredSalesReps.map((salesRep) => (
                  <tr key={salesRep.id} className="sales-rep-row">
                    <td>
                      <strong>{salesRep.name}</strong>
                    </td>
                    <td>
                      <span className="sales-rep-initials">
                        {salesRep.initials}
                      </span>
                    </td>
                    <td>
                      <div className="sales-rep-actions">
                        {renderActions(salesRep)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sales-reps-cards">
            {filteredSalesReps.map((salesRep) => (
              <article className="sales-rep-mobile-card" key={salesRep.id}>
                <div className="sales-rep-card-main">
                  <span>Vendedora</span>
                  <strong>{salesRep.name}</strong>
                </div>

                <div className="sales-rep-card-initials">
                  <span>Iniciales</span>
                  <strong>{salesRep.initials}</strong>
                </div>

                <div className="sales-rep-card-actions">
                  {renderActions(salesRep)}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={salesRepToReactivate !== null}
        title="Reactivar vendedora"
        message={`¿Seguro que quieres reactivar a ${salesRepToReactivate?.name ?? ""}? Volverá a estar activa y podrá recibir pedidos nuevos.`}
        confirmLabel="Sí, reactivar"
        cancelLabel="No, volver"
        variant="default"
        onConfirm={handleConfirmReactivate}
        onCancel={() => setSalesRepToReactivate(null)}
      />
    </div>
  );
}
