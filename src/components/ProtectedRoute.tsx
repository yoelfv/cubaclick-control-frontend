import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Si es `true`, solo usuarios con permiso de edición pueden acceder. */
  requiresEdit?: boolean;
}

/**
 * Envuelve rutas que requieren permisos especiales.
 * - Si requiresEdit y el usuario no puede editar → redirige a "/".
 */
export default function ProtectedRoute({
  children,
  requiresEdit = false,
}: ProtectedRouteProps) {
  const { canEdit } = useAuthUser();

  if (requiresEdit && !canEdit) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
