import { useEffect, useState } from "react";
import { getCustomerById, updateCustomer } from "../api/customers";
import FormMessage from "../components/common/FormMessage";
import type { Customer } from "../api/types";

interface CustomerEditPageProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerEditPage({
  customerId,
  onBack,
}: CustomerEditPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const hasChanges =
    name.trim() !== (customer?.name ?? "") ||
    phone.trim() !== (customer?.phone ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const data = await getCustomerById(customerId);

        if (!data) {
          setFormMessage({
            type: "error",
            message: "No se encontró el cliente.",
          });
          return;
        }

        setCustomer(data);
        setName(data.name);
        setPhone(data.phone);
      } catch {
        setFormMessage({
          type: "error",
          message: "No se pudo cargar el cliente.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomer();
  }, [customerId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      setFormMessage({
        type: "error",
        message: "El nombre y el teléfono son obligatorios.",
      });
      return;
    }

    try {
      setIsSaving(true);
      setFormMessage(null);

      await updateCustomer(customerId, trimmedName, trimmedPhone);

      setCustomer((current) =>
        current
          ? {
              ...current,
              name: trimmedName,
              phone: trimmedPhone,
            }
          : current,
      );

      setName(trimmedName);
      setPhone(trimmedPhone);
      setFormMessage({
        type: "success",
        message: "Cliente actualizado",
      });
    } catch (err) {
      setFormMessage({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el cliente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p>Cargando cliente...</p>;
  }
  if (!customer) {
    return (
      <div className="customer-edit-page">
        <button type="button" className="back-button" onClick={onBack}>
          ← Atrás
        </button>

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
    <div className="customer-edit-page">
      <div className="customer-edit-header">
        <button type="button" className="back-button" onClick={onBack}>
          ← Atrás
        </button>

        <div>
          <h2>Editar cliente</h2>
          <p>Modifica los datos del cliente.</p>
        </div>
      </div>

      <form className="customer-edit-form" onSubmit={handleSubmit}>
        <div className="customer-edit-fields">
          <label>
            <span>Nombre</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSaving}
              autoComplete="name"
            />
          </label>

          <label>
            <span>Teléfono</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={isSaving}
              autoComplete="tel"
            />
          </label>
        </div>

        {formMessage && (
          <FormMessage
            type={formMessage.type}
            message={formMessage.message}
            onClose={() => setFormMessage(null)}
          />
        )}

        <div className="customer-edit-actions">
          <button
            type="submit"
            className="customer-edit-save-button"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
