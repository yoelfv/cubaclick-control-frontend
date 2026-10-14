import { useEffect, useMemo, useState } from "react";
import { getCustomers } from "../api/customers";
import type { Customer } from "../api/types";

interface CustomersPageProps {
  onViewDetails: (customerId: string) => void;
  onEdit: (customerId: string) => void;
}

export default function CustomersPage({
  onViewDetails,
  onEdit,
}: CustomersPageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch {
        setError("No se pudieron cargar los clientes.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const savedScrollY = sessionStorage.getItem("customersScrollY");

    if (savedScrollY !== null) {
      requestAnimationFrame(() => {
        window.scrollTo(0, Number(savedScrollY));
        sessionStorage.removeItem("customersScrollY");
      });
    }
  }, [isLoading]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.phone.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [customers, search]);

  const handleViewDetails = (customerId: string) => {
    sessionStorage.setItem("customersScrollY", String(window.scrollY));
    onViewDetails(customerId);
  };

  const handleEdit = (customerId: string) => {
    onEdit(customerId);
  };

  if (isLoading) {
    return <p>Cargando clientes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="customers-page">
      <div className="customers-page-header">
        <div>
          <h2>Listado de Clientes</h2>
          <p>Consulta los clientes registrados en Cubaclick.</p>
        </div>
      </div>

      <div className="customers-search">
        <label htmlFor="customers-search-input">Buscar cliente</label>
        <input
          id="customers-search-input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nombre o teléfono"
        />
      </div>

      {customers.length === 0 ? (
        <div className="customers-empty">
          <p>No hay clientes registrados.</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="customers-empty">
          <p>No se encontraron clientes con esa búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="customer-row">
                    <td>
                      <strong>{customer.name}</strong>
                    </td>
                    <td>{customer.phone}</td>
                    <td>
                      <div className="customer-actions">
                        <button
                          type="button"
                          className="customer-details-button"
                          onClick={() => handleViewDetails(customer.id)}
                        >
                          Detalles
                        </button>

                        <button
                          type="button"
                          className="customer-edit-button"
                          onClick={() => handleEdit(customer.id)}
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="customers-cards">
            {filteredCustomers.map((customer) => (
              <article className="customer-card" key={customer.id}>
                <div className="customer-card-main">
                  <span>Cliente</span>
                  <strong>{customer.name}</strong>
                </div>

                <div className="customer-card-phone">
                  <span>Teléfono</span>
                  <strong>{customer.phone}</strong>
                </div>

                <div className="customer-card-actions">
                  <button
                    type="button"
                    className="customer-details-button"
                    onClick={() => handleViewDetails(customer.id)}
                  >
                    Detalles
                  </button>

                  <button
                    type="button"
                    className="customer-edit-button"
                    onClick={() => handleEdit(customer.id)}
                  >
                    Editar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
