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
  localStorage.removeItem(USER_KEY);
}

const USER_KEY = "cubaclick_auth_user";

export interface StoredUser {
  id: number;
  username: string;
  email: string;
  role?: {
    id: number;
    name: string;
    type: string;
  };
}

export function setAuthUser(user: StoredUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearAuthUser() {
  localStorage.removeItem(USER_KEY);
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
