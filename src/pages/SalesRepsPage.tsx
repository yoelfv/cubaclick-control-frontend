import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSalesRep, getSalesReps, updateSalesRep } from "../api/salesReps";
import type { SalesRep } from "../api/types";

export default function SalesRepsPage() {
  const navigate = useNavigate();

  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salesRepFilter, setSalesRepFilter] = useState<"active" | "inactive">(
    "active",
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSalesRepId, setEditingSalesRepId] = useState<string | null>(
    null,
  );

  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

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
        console.error("Error al cargar las vendedoras:", err);

        if (!cancelled) {
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

  function resetForm() {
    setName("");
    setInitials("");
    setActive(true);
    setEditingSalesRepId(null);
    setFormMessage(null);
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(salesRep: SalesRep) {
    setEditingSalesRepId(salesRep.id);
    setName(salesRep.name);
    setInitials(salesRep.initials);
    setActive(salesRep.active);
    setFormMessage(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);

    const normalizedName = name.trim();
    const normalizedInitials = initials.trim().toUpperCase();

    if (!normalizedName) {
      setFormMessage("El nombre es obligatorio.");
      return;
    }

    if (!/^[A-Z]{3}$/.test(normalizedInitials)) {
      setFormMessage("Las iniciales deben contener exactamente 3 letras.");
      return;
    }

    try {
      setIsSaving(true);

      if (editingSalesRepId) {
        await updateSalesRep(editingSalesRepId, {
          name: normalizedName,
          initials: normalizedInitials,
          active,
        });
      } else {
        await createSalesRep({
          name: normalizedName,
          initials: normalizedInitials,
          active,
        });
      }

      await loadSalesReps();
      closeForm();
    } catch (err) {
      console.error("Error al guardar la vendedora:", err);
      setFormMessage("No fue posible guardar la vendedora.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReactivate(salesRep: SalesRep) {
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

        {salesRep.active ? (
          <button
            type="button"
            className="order-edit-button"
            onClick={() => openEditForm(salesRep)}
          >
            Editar
          </button>
        ) : (
          <button
            type="button"
            className="order-edit-button"
            onClick={() => handleReactivate(salesRep)}
          >
            Reactivar
          </button>
        )}
      </>
    );
  }

  return (
    <div className="sales-reps-page">
      {!isFormOpen && (
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

            <button
              type="button"
              className="primary-button"
              onClick={openCreateForm}
            >
              + Nueva vendedora
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <section className="sales-rep-form-section">
          <div className="sales-rep-form-header">
            <button
              type="button"
              className="back-button"
              onClick={closeForm}
              disabled={isSaving}
            >
              ← Atrás
            </button>

            <h2>
              {editingSalesRepId ? "Editar vendedora" : "Nueva vendedora"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="sales-rep-form">
            <div className="form-field">
              <label htmlFor="sales-rep-name">Nombre</label>
              <input
                id="sales-rep-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre de la vendedora"
                required
                disabled={isSaving}
              />
            </div>

            <div className="form-field">
              <label htmlFor="sales-rep-initials">Iniciales</label>
              <input
                id="sales-rep-initials"
                type="text"
                value={initials}
                onChange={(event) =>
                  setInitials(event.target.value.toUpperCase())
                }
                placeholder="Ej. ABC"
                maxLength={3}
                required
                disabled={isSaving}
              />
              <small>Introduce exactamente tres letras.</small>
            </div>

            <label className="sales-rep-active-field">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                disabled={isSaving}
              />
              Vendedora activa
            </label>

            {formMessage && <p className="sales-reps-error">{formMessage}</p>}

            <div className="sales-rep-form-actions">
              <button
                type="button"
                className="back-button"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={isSaving}
              >
                {isSaving
                  ? "Guardando..."
                  : editingSalesRepId
                    ? "Guardar cambios"
                    : "Crear vendedora"}
              </button>
            </div>
          </form>
        </section>
      )}

      {!isFormOpen && (
        <>
          {isLoading ? (
            <p>Cargando vendedoras...</p>
          ) : error ? (
            <p className="sales-reps-error">{error}</p>
          ) : filteredSalesReps.length === 0 ? (
            <div className="sales-reps-empty">
              <p>
                No hay vendedoras{" "}
                {salesRepFilter === "active" ? "activas" : "inactivas"}{" "}
                registradas.
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
        </>
      )}
    </div>
  );
}
