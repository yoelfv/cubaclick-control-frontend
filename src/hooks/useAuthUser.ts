import { getAuthUser, type StoredUser } from "../api/client";

export interface AuthUser {
  user: StoredUser | null;
  isAdmin: boolean;
  canEdit: boolean;
}

/**
 * Devuelve el usuario actual y helpers para saber si puede editar.
 * - isAdmin: el usuario tiene el rol "administrator"
 * - canEdit: alias de isAdmin (por ahora solo administradores editan)
 */
export function useAuthUser(): AuthUser {
  const user = getAuthUser();
  const isAdmin = user?.role?.type === "administrator";

  return {
    user,
    isAdmin,
    canEdit: isAdmin,
  };
}
