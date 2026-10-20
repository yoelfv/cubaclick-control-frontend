import { apiFetch } from "./client";
import type { BankAccount, StrapiBankAccount, StrapiResponse } from "./types";

function mapBankAccount(account: StrapiBankAccount): BankAccount {
  return {
    id: account.documentId,
    name: account.name,
    active: account.active,
  };
}

export async function getBankAccounts(): Promise<BankAccount[]> {
  const response = await apiFetch<StrapiResponse<StrapiBankAccount[]>>(
    "/bank-accounts?sort=name:asc&pagination[pageSize]=100",
  );

  return response.data.map(mapBankAccount);
}

export interface CreateBankAccountInput {
  name: string;
  active: boolean;
}

export async function createBankAccount(
  data: CreateBankAccountInput,
): Promise<BankAccount> {
  const response = await apiFetch<StrapiResponse<StrapiBankAccount>>(
    "/bank-accounts",
    {
      method: "POST",
      body: JSON.stringify({ data }),
    },
  );

  return mapBankAccount(response.data);
}

export interface UpdateBankAccountInput {
  name: string;
  active: boolean;
}

export async function updateBankAccount(
  id: string,
  data: UpdateBankAccountInput,
): Promise<BankAccount> {
  const response = await apiFetch<StrapiResponse<StrapiBankAccount>>(
    `/bank-accounts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ data }),
    },
  );

  return mapBankAccount(response.data);
}
