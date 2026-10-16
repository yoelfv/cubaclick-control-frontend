import { apiFetch, setAuthToken, setAuthUser, type StoredUser } from "./client";

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

export interface CurrentUserResponse {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role?: {
    id: number;
    name: string;
    type: string;
  };
}

/**
 * Inicia sesión y guarda el JWT + el usuario en localStorage.
 * Después del login, hace una segunda llamada a /users/me para obtener el rol.
 */
export async function login(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  // 1. Login
  const response = await apiFetch<LoginResponse>("/auth/local", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });

  setAuthToken(response.jwt);

  // 2. Obtener el rol del usuario (necesita el JWT ya guardado)
  try {
    const me = await apiFetch<CurrentUserResponse>("/users/me?populate=role");

    const storedUser: StoredUser = {
      id: me.id,
      username: me.username,
      email: me.email,
      role: me.role,
    };

    setAuthUser(storedUser);
  } catch (err) {
    // Si falla la segunda llamada, guardamos al menos el usuario básico.
    console.warn("No se pudo obtener el rol del usuario:", err);

    setAuthUser({
      id: response.user.id,
      username: response.user.username,
      email: response.user.email,
    });
  }

  return response;
}
