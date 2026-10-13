const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337/api";

const TOKEN_KEY = "cubaclick_auth_token";

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAuthToken();

  const headers = new Headers(options?.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `API error: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();

      if (errorData?.error?.message) {
        message = errorData.error.message;
      }
    } catch {
      // Si la respuesta no contiene JSON, mantenemos el mensaje genérico.
    }

    throw new Error(message);
  }

  return response.json();
}
