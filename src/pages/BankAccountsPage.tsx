import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBankAccounts, updateBankAccount } from "../api/bankAccounts";
import type { BankAccount } from "../api/types";
import { useAuthUser } from "../hooks/useAuthUser";
import LoadingState from "../components/common/LoadingState";
import ConfirmDialog from "../components/common/ConfirmDialog";

export default function BankAccountsPage() {
  const navigate = useNavigate();
  const { canEdit } = useAuthUser();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"active" | "inactive">("active");

  const [accountToReactivate, setAccountToReactivate] =
    useState<BankAccount | null>(null);

  const loadBankAccounts = useCallback(async () => {
    try {
      const data = await getBankAccounts();
      setBankAccounts(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar las cuentas:", err);
      setError("No fue posible cargar las cuentas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getBankAccounts();

        if (!cancelled) {
          setBankAccounts(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar las cuentas:", err);
          setError("No fue posible cargar las cuentas.");
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

  const filteredAccounts = bankAccounts.filter((account) =>
    filter === "active" ? account.active : !account.active,
  );

  async function handleConfirmReactivate() {
    if (!accountToReactivate) return;

    const account = accountToReactivate;
    setAccountToReactivate(null);

    try {
      setError(null);

      await updateBankAccount(account.id, {
        name: account.name,
        active: true,
      });

      await loadBankAccounts();
    } catch (err) {
      console.error("Error al reactivar la cuenta:", err);
      setError("No fue posible reactivar la cuenta.");
    }
  }

  function renderActions(account: BankAccount) {
    return (
      <>
        <button
          type="button"
          className="order-details-button"
          onClick={() => navigate(`/bank-accounts/${account.id}`)}
        >
          Detalles
        </button>

        {canEdit && account.active && (
          <button
            type="button"
            className="order-edit-button"
            onClick={() => navigate(`/bank-accounts/${account.id}/edit`)}
          >
            Editar
          </button>
        )}

        {canEdit && !account.active && (
          <button
            type="button"
            className="order-edit-button"
            onClick={() => setAccountToReactivate(account)}
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
          <h2>Cuentas bancarias</h2>
          <p>Gestiona las cuentas donde se reciben los pagos.</p>
        </div>

        <div className="sales-reps-header-actions">
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as "active" | "inactive")
            }
            aria-label="Filtrar cuentas por estado"
          >
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>

          {canEdit && (
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/bank-accounts/new")}
            >
              + Nueva cuenta
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando cuentas..." />
      ) : error ? (
        <p className="sales-reps-error">{error}</p>
      ) : filteredAccounts.length === 0 ? (
        <div className="sales-reps-empty">
          <p>
            No hay cuentas {filter === "active" ? "activas" : "inactivas"}{" "}
            registradas.
          </p>
        </div>
      ) : (
        <>
          <div className="sales-reps-table-wrapper">
            <table className="sales-reps-table">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="sales-rep-row">
                    <td>
                      <strong>{account.name}</strong>
                    </td>
                    <td>
                      <div className="sales-rep-actions">
                        {renderActions(account)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sales-reps-cards">
            {filteredAccounts.map((account) => (
              <article className="sales-rep-mobile-card" key={account.id}>
                <div className="sales-rep-card-main">
                  <span>Cuenta</span>
                  <strong>{account.name}</strong>
                </div>

                <div className="sales-rep-card-actions">
                  {renderActions(account)}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={accountToReactivate !== null}
        title="Reactivar cuenta"
        message={`¿Seguro que quieres reactivar la cuenta "${accountToReactivate?.name ?? ""}"? Volverá a estar disponible para asignar a nuevos pedidos.`}
        confirmLabel="Sí, reactivar"
        cancelLabel="No, volver"
        variant="default"
        onConfirm={handleConfirmReactivate}
        onCancel={() => setAccountToReactivate(null)}
      />
    </div>
  );
}
