import { useEffect, useRef, useState } from "react";
import { getAuthUser } from "../api/client";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administradora",
  viewer: "Dueña",
};

function Topbar({ title, onMenuClick, onLogout }: TopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = getAuthUser();
  const username = user?.username ?? "Usuario";
  const roleName = user?.role?.type
    ? (ROLE_LABELS[user.role.type] ?? user.role.name)
    : "Usuario";

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Cerrar el menú con Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <button
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <h1>{title}</h1>

      <div className="topbar-user" ref={menuRef}>
        <button
          type="button"
          className="topbar-user-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <span className="topbar-user-avatar">{initial}</span>
          <span className="topbar-user-name">{username}</span>
          <span className="topbar-user-chevron" aria-hidden="true">
            ▾
          </span>
        </button>

        {isMenuOpen && (
          <div className="topbar-user-menu" role="menu">
            <div className="topbar-user-menu-header">
              <strong>{username}</strong>
              <span>{roleName}</span>
            </div>

            <button
              type="button"
              className="topbar-user-menu-logout"
              onClick={() => {
                setIsMenuOpen(false);
                onLogout();
              }}
              role="menuitem"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
