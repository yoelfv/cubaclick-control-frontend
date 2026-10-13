import { apiFetch, setAuthToken } from "./client";

export interface LoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
  };
}

export async function login(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/auth/local", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
    }),
  });

  setAuthToken(response.jwt);

  return response;
}
