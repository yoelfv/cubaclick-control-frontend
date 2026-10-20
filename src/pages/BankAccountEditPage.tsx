import { useEffect, useState } from "react";
import {
  createBankAccount,
  getBankAccounts,
  updateBankAccount,
} from "../api/bankAccounts";
import type { BankAccount } from "../api/types";
import FormMessage from "../components/common/FormMessage";
import LoadingState from "../components/common/LoadingState";
import ConfirmDialog from "../components/common/ConfirmDialog";

interface BankAccountEditPageProps {
  /** Si es null, estamos creando una nueva cuenta. */
  bankAccountId: string | null;
  onBack: () => void;
}

export default function BankAccountEditPage({
  bankAccountId,
  onBack,
}: BankAccountEditPageProps) {
  const isEditing = bankAccountId !== null;

  const [original, setOriginal] = useState<BankAccount | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const normalizedName = name.trim();

  const isNameValid = normalizedName.length > 0;
  const hasUserInput = name.trim().length > 0;

  // Si estamos editando, detectamos cambios respecto a los valores originales.
  // Si estamos creando, el botón se activa cuando el nombre es válido.
  const hasChanges = isEditing
    ? original !== null &&
      (normalizedName !== original.name || active !== original.active)
    : isNameValid;

  // Cargar la cuenta si estamos editando
  useEffect(() => {
    if (!isEditing) return;

    async function loadBankAccount() {
      try {
        setIsLoading(true);

        const data = await getBankAccounts();
        const found = data.find((item) => item.id === bankAccountId);

        if (!found) {
          setFormMessage({
            type: "error",
            message: "No se encontró la cuenta.",
          });
          return;
        }

        setOriginal(found);
        setName(found.name);
        setActive(found.active);
      } catch {
        setFormMessage({
          type: "error",
          message: "No se pudo cargar la cuenta.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadBankAccount();
  }, [bankAccountId, isEditing]);

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

    try {
      setIsSaving(true);

      if (isEditing && bankAccountId) {
        await updateBankAccount(bankAccountId, {
          name: normalizedName,
          active,
        });

        setOriginal({
          id: bankAccountId,
          name: normalizedName,
          active,
        });
      } else {
        await createBankAccount({
          name: normalizedName,
          active,
        });

        // En creación, volvemos directamente al listado.
        onBack();
        return;
      }

      setFormMessage({
        type: "success",
        message: "Cuenta actualizada",
      });
    } catch (err) {
      console.error("Error al guardar la cuenta:", err);

      // Strapi devuelve "This attribute must be unique" cuando el nombre
      // ya existe. Lo traducimos a un mensaje más útil en español.
      let message =
        err instanceof Error
          ? err.message
          : "No fue posible guardar la cuenta.";

      if (message.toLowerCase().includes("unique")) {
        message = `Ya existe una cuenta con el nombre "${normalizedName}".`;
      }

      setFormMessage({
        type: "error",
        message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleBack() {
    const shouldConfirm = isEditing ? hasChanges : hasUserInput;

    if (shouldConfirm) {
      setIsLeaveDialogOpen(true);
    } else {
      onBack();
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando cuenta..." />;
  }

  if (isEditing && !original) {
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
            <h2>Editar cuenta</h2>
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
          onClick={handleBack}
          disabled={isSaving}
        >
          ← Atrás
        </button>

        <div>
          <h2>{isEditing ? "Editar cuenta" : "Nueva cuenta"}</h2>
          <p>
            {isEditing
              ? "Modifica los datos de la cuenta."
              : "Registra una nueva cuenta bancaria."}
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
              placeholder="Nombre de la cuenta"
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
            <span>Cuenta activa</span>
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
                : "Crear cuenta"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isLeaveDialogOpen}
        title="Salir sin guardar"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        confirmLabel="Sí, salir sin guardar"
        cancelLabel="No, seguir editando"
        variant="danger"
        onConfirm={() => {
          setIsLeaveDialogOpen(false);
          onBack();
        }}
        onCancel={() => setIsLeaveDialogOpen(false)}
      />
    </div>
  );
}
