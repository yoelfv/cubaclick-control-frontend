import type { BankAccount } from "../../api/types";

interface BankAccountFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  bankAccounts: BankAccount[];
  isLoading: boolean;
  error: string | null;
  /**
   * Cuenta actual del pedido si NO está en la lista de cuentas activas.
   * Se usa para mostrar cuentas inactivas asignadas previamente.
   */
  inactiveFallback?: { id: string; name: string } | null;
}

function BankAccountField({
  value,
  onChange,
  bankAccounts,
  isLoading,
  error,
  inactiveFallback,
}: BankAccountFieldProps) {
  // Construimos las opciones del desplegable:
  // - "Sin asignar" siempre primero
  // - Todas las cuentas activas
  // - Si el `value` actual no está en la lista de activas, añadimos
  //   `inactiveFallback` como opción adicional con prefijo "(inactiva)"
  const options = [...bankAccounts];
  const valueIsInActiveList = value
    ? bankAccounts.some((account) => account.id === value)
    : true; // Si value es null, no hay que añadir nada

  const needsInactiveOption = !valueIsInActiveList && value && inactiveFallback;

  return (
    <section className="order-form-section">
      <div className="order-form-section-header">
        <h3>Pago</h3>
        <p>Selecciona la cuenta donde se recibió el pago.</p>
      </div>

      <div className="order-form-field">
        <span>Cuenta de pago</span>
        <select
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : event.target.value)
          }
          disabled={isLoading}
        >
          <option value="">Sin asignar (pendiente)</option>
          {options.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
          {needsInactiveOption && (
            <option value={inactiveFallback.id}>
              {inactiveFallback.name} (inactiva)
            </option>
          )}
        </select>
        {error && <small className="form-field-error">{error}</small>}
      </div>
    </section>
  );
}

export default BankAccountField;
