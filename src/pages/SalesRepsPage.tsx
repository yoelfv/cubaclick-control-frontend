import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSalesRep, getSalesReps, updateSalesRep } from "../api/salesReps";
import type { SalesRep } from "../api/types";
import FormMessage from "../components/common/FormMessage";

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
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [originalName, setOriginalName] = useState("");
  const [originalInitials, setOriginalInitials] = useState("");
  const [originalActive, setOriginalActive] = useState(true);

  const normalizedInitials = initials.trim().toUpperCase();

  const isInitialsValid = /^[A-Z]{3}$/.test(normalizedInitials);
  const isNameValid = name.trim().length > 0;

  const hasChanges = editingSalesRepId
    ? name.trim() !== originalName ||
      normalizedInitials !== originalInitials ||
      active !== originalActive
    : isNameValid && isInitialsValid;

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

    setOriginalName("");
    setOriginalInitials("");
    setOriginalActive(true);
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

    // Guardamos los valores originales para detectar cambios
    setOriginalName(salesRep.name);
    setOriginalInitials(salesRep.initials);
    setOriginalActive(salesRep.active);
  }

  function closeForm() {
    setIsFormOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);

    const normalizedName = name.trim();

    if (!normalizedName) {
      setFormMessage({
        type: "error",
        message: "El nombre es obligatorio.",
      });
      return;
    }

    if (!/^[A-Z]{3}$/.test(normalizedInitials)) {
      setFormMessage({
        type: "error",
        message: "Las iniciales deben contener exactamente 3 letras.",
      });
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
      setFormMessage({
        type: "error",
        message: "No fue posible guardar la vendedora.",
      });
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
        <div className="sales-rep-form-page">
          <div className="sales-rep-form-header">
            <button
              type="button"
              className="back-button"
              onClick={closeForm}
              disabled={isSaving}
            >
              ← Atrás
            </button>

            <div>
              <h2>
                {editingSalesRepId ? "Editar vendedora" : "Nueva vendedora"}
              </h2>
              <p>
                {editingSalesRepId
                  ? "Modifica los datos de la vendedora."
                  : "Registra una nueva vendedora."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="sales-rep-form">
            <div className="sales-rep-form-fields">
              <label>
                <span>Nombre</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nombre de la vendedora"
                  disabled={isSaving}
                  autoComplete="off"
                />
              </label>

              <label className="sales-rep-form-field-initials">
                <span>Iniciales</span>
                <input
                  type="text"
                  value={initials}
                  onChange={(event) =>
                    setInitials(event.target.value.toUpperCase())
                  }
                  placeholder="ABC"
                  maxLength={3}
                  disabled={isSaving}
                  autoComplete="off"
                />
              </label>

              <label className="sales-rep-active-field">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  disabled={isSaving}
                />
                <span>Vendedora activa</span>
              </label>
            </div>

            {formMessage && (
              <FormMessage
                type={formMessage.type}
                message={formMessage.message}
                onClose={() => setFormMessage(null)}
              />
            )}

            <div className="sales-rep-form-actions">
              <button
                type="submit"
                className="sales-rep-save-button"
                disabled={isSaving || !hasChanges}
              >
                {isSaving
                  ? "Guardando..."
                  : editingSalesRepId
                    ? "Guardar cambios"
                    : "Crear vendedora"}
              </button>
            </div>
          </form>
        </div>
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
