import { useEffect, useState } from "react";
import { createSalesRep, getSalesReps, updateSalesRep } from "../api/salesReps";
import type { SalesRep } from "../api/types";
import FormMessage from "../components/common/FormMessage";

interface SalesRepEditPageProps {
  /** Si es null, estamos creando una nueva vendedora. */
  salesRepId: string | null;
  onBack: () => void;
}

export default function SalesRepEditPage({
  salesRepId,
  onBack,
}: SalesRepEditPageProps) {
  const isEditing = salesRepId !== null;

  const [original, setOriginal] = useState<SalesRep | null>(null);
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [active, setActive] = useState(true);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const normalizedInitials = initials.trim().toUpperCase();
  const normalizedName = name.trim();

  const isInitialsValid = /^[A-Z]{3}$/.test(normalizedInitials);
  const isNameValid = normalizedName.length > 0;

  // Si estamos editando, detectamos cambios respecto a los valores originales.
  // Si estamos creando, el botón se activa cuando los campos son válidos.
  const hasChanges = isEditing
    ? original !== null &&
      (normalizedName !== original.name ||
        normalizedInitials !== original.initials ||
        active !== original.active)
    : isNameValid && isInitialsValid;

  // Cargar la vendedora si estamos editando
  useEffect(() => {
    if (!isEditing) return;

    async function loadSalesRep() {
      try {
        setIsLoading(true);

        const data = await getSalesReps();
        const found = data.find((item) => item.id === salesRepId);

        if (!found) {
          setFormMessage({
            type: "error",
            message: "No se encontró la vendedora.",
          });
          return;
        }

        setOriginal(found);
        setName(found.name);
        setInitials(found.initials);
        setActive(found.active);
      } catch {
        setFormMessage({
          type: "error",
          message: "No se pudo cargar la vendedora.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSalesRep();
  }, [salesRepId, isEditing]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);

    if (!isNameValid) {
      setFormMessage({
        type: "error",
        message: "El nombre es obligatorio.",
      });
      return;
    }

    if (!isInitialsValid) {
      setFormMessage({
        type: "error",
        message: "Las iniciales deben contener exactamente 3 letras.",
      });
      return;
    }

    try {
      setIsSaving(true);

      if (isEditing && salesRepId) {
        await updateSalesRep(salesRepId, {
          name: normalizedName,
          initials: normalizedInitials,
          active,
        });

        setOriginal({
          id: salesRepId,
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

        // En creación, volvemos directamente al listado.
        onBack();
        return;
      }

      setFormMessage({
        type: "success",
        message: "Vendedora actualizada",
      });
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

  if (isLoading) {
    return <p>Cargando vendedora...</p>;
  }

  if (isEditing && !original) {
    return (
      <div className="sales-rep-form-page">
        <div className="sales-rep-form-header">
          <button type="button" className="back-button" onClick={onBack}>
            ← Atrás
          </button>
          <div>
            <h2>Editar vendedora</h2>
          </div>
        </div>

        {formMessage && (
          <FormMessage
            type={formMessage.type}
            message={formMessage.message}
            onClose={() => setFormMessage(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="sales-rep-form-page">
      <div className="sales-rep-form-header">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          disabled={isSaving}
        >
          ← Atrás
        </button>

        <div>
          <h2>{isEditing ? "Editar vendedora" : "Nueva vendedora"}</h2>
          <p>
            {isEditing
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
              : isEditing
                ? "Guardar cambios"
                : "Crear vendedora"}
          </button>
        </div>
      </form>
    </div>
  );
}
