export type View =
  | "dashboard"
  | "orders"
  | "orderForm"
  | "orderDetails"
  | "customers"
  | "salesReps"
  | "statistics";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Pedidos" },
  { id: "customers", label: "Clientes" },
  { id: "salesReps", label: "Vendedoras" },
  { id: "statistics", label: "Estadísticas" },
];

function Sidebar({ currentView, onViewChange, isOpen, onClose }: SidebarProps) {
  const handleViewChange = (view: View) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">C</div>

          <div>
            <div className="sidebar-title">Cubaclick</div>
            <div className="sidebar-subtitle">Control</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${
                currentView === item.id ? "sidebar-item-active" : ""
              }`}
              onClick={() => handleViewChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
