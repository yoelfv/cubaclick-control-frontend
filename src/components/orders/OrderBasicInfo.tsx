import type { SalesRep } from "../../api/types";

interface OrderBasicInfoProps {
  date: string;
  salesRepId: string;
  salesReps: SalesRep[];
  isLoadingSalesReps: boolean;
  salesRepsError: string | null;
  isEditing: boolean;
  onDateChange: (value: string) => void;
  onSalesRepChange: (value: string) => void;
}

function OrderBasicInfo({
  date,
  salesRepId,
  salesReps,
  isLoadingSalesReps,
  salesRepsError,
  isEditing,
  onDateChange,
  onSalesRepChange,
}: OrderBasicInfoProps) {
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <section className="order-form-section">
      <div className="order-form-section-header">
        <h3>Información del pedido</h3>
      </div>

      <div className="order-form-grid">
        <label className="order-form-field">
          <span>Fecha</span>

          <input
            type="date"
            value={date}
            max={todayString}
            onChange={(event) => onDateChange(event.target.value)}
            disabled={isEditing}
          />
        </label>

        <label className="order-form-field">
          <span>Vendedora</span>

          <select
            value={salesRepId}
            onChange={(event) => onSalesRepChange(event.target.value)}
            disabled={isEditing}
          >
            <option value="" disabled>
              {isLoadingSalesReps
                ? "Cargando vendedoras..."
                : "Selecciona una vendedora"}
            </option>

            {!isLoadingSalesReps &&
              !salesRepsError &&
              salesReps.map((salesRep) => (
                <option key={salesRep.id} value={salesRep.id}>
                  {salesRep.name}
                </option>
              ))}
          </select>

          {salesRepsError && (
            <small className="order-form-field-error">{salesRepsError}</small>
          )}
        </label>
      </div>
    </section>
  );
}

export default OrderBasicInfo;
