interface RemittanceFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function RemittanceField({ value, onChange }: RemittanceFieldProps) {
  return (
    <section className="order-form-section">
      <div className="order-form-section-header">
        <h3>Remesa</h3>
      </div>

      <div className="order-form-grid order-form-grid-single">
        <label className="order-form-field">
          <span>Valor de remesa</span>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={value}
            onChange={(event) => {
              const newValue = event.target.value;

              if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
                onChange(newValue);
              }
            }}
          />
        </label>
      </div>
    </section>
  );
}

export default RemittanceField;