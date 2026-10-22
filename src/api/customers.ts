import { apiFetch } from "./client";
import type { Customer, StrapiCustomer, StrapiResponse } from "./types";

function mapCustomer(customer: StrapiCustomer): Customer {
  return {
    id: customer.documentId,
    name: customer.name,
    phone: customer.phone,
  };
}

export async function findCustomer(
  name: string,
  phone: string,
): Promise<Customer | null> {
  const normalizedName = name.trim();
  const normalizedPhone = phone.trim();

  const response = await apiFetch<StrapiResponse<StrapiCustomer[]>>(
    `/customers?filters[name][$eq]=${encodeURIComponent(
      normalizedName,
    )}&filters[phone][$eq]=${encodeURIComponent(normalizedPhone)}&pagination[pageSize]=1`,
  );

  return response.data.length > 0 ? mapCustomer(response.data[0]) : null;
}

/**
 * Búsqueda normalizada (case-insensitive + sin espacios en phone).
 * Se usa como fallback cuando `findCustomer` no encuentra nada,
 * para evitar crear duplicados por diferencias de mayúsculas o espacios.
 */
export async function findCustomerNormalized(
  name: string,
  phone: string,
): Promise<Customer | null> {
  const normalizedName = name.trim().toLowerCase();
  const normalizedPhone = phone.trim().replace(/\s+/g, "");

  const response = await apiFetch<StrapiResponse<StrapiCustomer[]>>(
    `/customers?pagination[pageSize]=1000`,
  );

  const found = response.data.find((c) => {
    const cName = c.name.trim().toLowerCase();
    const cPhone = c.phone.trim().replace(/\s+/g, "");

    return cName === normalizedName && cPhone === normalizedPhone;
  });

  return found ? mapCustomer(found) : null;
}

export async function createCustomer(
  name: string,
  phone: string,
): Promise<Customer> {
  const response = await apiFetch<StrapiResponse<StrapiCustomer>>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          name,
          phone,
        },
      }),
    },
  );

  return mapCustomer(response.data);
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await apiFetch<StrapiResponse<StrapiCustomer[]>>(
    "/customers?pagination[pageSize]=1000&sort=name:asc",
  );

  return response.data.map(mapCustomer);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const response = await apiFetch<StrapiResponse<StrapiCustomer[]>>(
    `/customers?filters[documentId][$eq]=${encodeURIComponent(id)}&pagination[pageSize]=1`,
  );

  return response.data.length > 0 ? mapCustomer(response.data[0]) : null;
}

export async function updateCustomer(
  id: string,
  name: string,
  phone: string,
): Promise<Customer> {
  const response = await apiFetch<StrapiResponse<StrapiCustomer>>(
    `/customers/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        data: {
          name,
          phone,
        },
      }),
    },
  );

  return mapCustomer(response.data);
}
