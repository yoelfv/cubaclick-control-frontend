interface PersonFieldsProps {
  title: string;
  name: string;
  phone: string;
  namePlaceholder: string;
  phonePlaceholder: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

function PersonFields({
  title,
  name,
  phone,
  namePlaceholder,
  phonePlaceholder,
  onNameChange,
  onPhoneChange,
}: PersonFieldsProps) {
  return (
    <section className="order-form-section">
      <div className="order-form-section-header">
        <h3>{title}</h3>
      </div>

      <div className="order-form-grid">
        <label className="order-form-field">
          <span>Nombre</span>
          <input
            type="text"
            placeholder={namePlaceholder}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <label className="order-form-field">
          <span>Teléfono</span>
          <input
            type="tel"
            placeholder={phonePlaceholder}
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

export default PersonFields;