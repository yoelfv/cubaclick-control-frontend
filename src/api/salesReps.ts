import { apiFetch } from "./client";
import type {
  SalesRep,
  StrapiResponse,
  StrapiSalesRep,
} from "./types";

function mapSalesRep(salesRep: StrapiSalesRep): SalesRep {
  return {
    id: salesRep.documentId,
    name: salesRep.name,
    initials: salesRep.initials,
    active: salesRep.active,
  };
}

export async function getSalesReps(): Promise<SalesRep[]> {
  const response = await apiFetch<StrapiResponse<StrapiSalesRep[]>>(
    "/sales-reps?sort=name:asc",
  );

  return response.data.map(mapSalesRep);
}

export interface CreateSalesRepInput {
  name: string;
  initials: string;
  active: boolean;
}

export async function createSalesRep(
  data: CreateSalesRepInput,
): Promise<SalesRep> {
  const response = await apiFetch<StrapiResponse<StrapiSalesRep>>(
    "/sales-reps",
    {
      method: "POST",
      body: JSON.stringify({
        data,
      }),
    },
  );

  return mapSalesRep(response.data);
}

export interface UpdateSalesRepInput {
  name: string;
  initials: string;
  active: boolean;
}

export async function updateSalesRep(
  id: string,
  data: UpdateSalesRepInput,
): Promise<SalesRep> {
  const response = await apiFetch<StrapiResponse<StrapiSalesRep>>(
    `/sales-reps/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        data,
      }),
    },
  );

  return mapSalesRep(response.data);
}