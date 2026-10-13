import { useState } from "react";
import type { Customer } from "../../api/types";

interface CustomerFieldsProps {
  name: string;
  phone: string;
  customers: Customer[];
  isLoadingCustomers: boolean;
  customersError: string | null;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

function CustomerFields({
  name,
  phone,
  customers,
  isLoadingCustomers,
  customersError,
  onNameChange,
  onPhoneChange,
}: CustomerFieldsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<"name" | "phone" | null>(null);

  const matches = searchTerm.trim()
    ? customers
        .filter((customer) => {
          const term = searchTerm.trim().toLocaleLowerCase();

          return (
            customer.name.toLocaleLowerCase().includes(term) ||
            customer.phone.includes(searchTerm.trim())
          );
        })
        .slice(0, 8)
    : [];

  const selectCustomer = (customer: Customer) => {
    onNameChange(customer.name);
    onPhoneChange(customer.phone);
    setSearchTerm("");
    setIsOpen(false);
    setActiveField(null);
  };

  return (
    <section className="order-form-section">
      <div className="order-form-section-header">
        <h3>Cliente</h3>
      </div>

      <div className="order-form-grid">
        <label className="order-form-field">
          <span>Nombre</span>

          <input
            type="text"
            placeholder="Nombre del cliente"
            value={name}
            onChange={(event) => {
              const value = event.target.value;
              onNameChange(value);
              setSearchTerm(value);
              setActiveField("name");
              setIsOpen(true);
            }}
            onFocus={() => {
              setActiveField("name");

              if (searchTerm) {
                setIsOpen(true);
              }
            }}
          />

          {activeField === "name" &&
            isOpen &&
            searchTerm.trim() &&
            matches.length > 0 && (
              <div className="customer-suggestions">
                {matches.map((customer) => (
                  <button
                    type="button"
                    className="customer-suggestion"
                    key={customer.id}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectCustomer(customer)}
                  >
                    <strong>{customer.name}</strong>
                    <span>{customer.phone}</span>
                  </button>
                ))}
              </div>
            )}

          {activeField === "name" &&
            isOpen &&
            searchTerm.trim() &&
            !isLoadingCustomers &&
            matches.length === 0 && (
              <div className="customer-no-results">
                No se encontraron clientes.
              </div>
            )}
        </label>

        <label className="order-form-field">
          <span>Teléfono</span>

          <input
            type="tel"
            placeholder="Teléfono del cliente"
            value={phone}
            onChange={(event) => {
              const value = event.target.value;
              onPhoneChange(value);
              setSearchTerm(value);
              setActiveField("phone");
              setIsOpen(true);
            }}
            onFocus={() => {
              setActiveField("phone");

              if (searchTerm) {
                setIsOpen(true);
              }
            }}
          />

          {activeField === "phone" &&
            isOpen &&
            searchTerm.trim() &&
            matches.length > 0 && (
              <div className="customer-suggestions">
                {matches.map((customer) => (
                  <button
                    type="button"
                    className="customer-suggestion"
                    key={customer.id}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectCustomer(customer)}
                  >
                    <strong>{customer.name}</strong>
                    <span>{customer.phone}</span>
                  </button>
                ))}
              </div>
            )}

          {activeField === "phone" &&
            isOpen &&
            searchTerm.trim() &&
            !isLoadingCustomers &&
            matches.length === 0 && (
              <div className="customer-no-results">
                No se encontraron clientes.
              </div>
            )}
        </label>
      </div>

      {isLoadingCustomers && <small>Cargando clientes...</small>}

      {customersError && (
        <small className="order-form-field-error">{customersError}</small>
      )}
    </section>
  );
}

export default CustomerFields;
