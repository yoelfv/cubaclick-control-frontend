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
  const response = await apiFetch<StrapiResponse<StrapiCustomer[]>>(
    `/customers?filters[name][$eq]=${encodeURIComponent(
      name,
    )}&filters[phone][$eq]=${encodeURIComponent(phone)}&pagination[pageSize]=1`,
  );

  return response.data.length > 0 ? mapCustomer(response.data[0]) : null;
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
