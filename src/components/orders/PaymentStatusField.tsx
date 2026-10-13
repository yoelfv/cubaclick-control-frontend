interface PaymentStatusFieldProps {
  value: "pending" | "paid";
  onChange: (value: "pending" | "paid") => void;
}

function PaymentStatusField({ value, onChange }: PaymentStatusFieldProps) {
  return (
    <section className="order-form-section">
      <div className="order-form-section-header">
        <h3>Pago</h3>
      </div>

      <div className="payment-options">
        <label className="payment-option">
          <input
            type="radio"
            name="paymentStatus"
            value="pending"
            checked={value === "pending"}
            onChange={() => onChange("pending")}
          />
          <span>Pendiente</span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="paymentStatus"
            value="paid"
            checked={value === "paid"}
            onChange={() => onChange("paid")}
          />
          <span>Pagado</span>
        </label>
      </div>
    </section>
  );
}

export default PaymentStatusField;
