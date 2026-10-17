import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";
import Sidebar, { type View } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/DashboardPage";
import OrdersPage from "./components/OrdersPage";
import LoginPage from "./components/LoginPage";
import { clearAuthToken, getAuthToken } from "./api/client";
import OrderFormPage from "./pages/OrderFormPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import SalesRepsPage from "./pages/SalesRepsPage";
import SalesRepEditPage from "./pages/SalesRepEditPage";
import CustomersPage from "./pages/CustomersPage";
import StatisticsPage from "./pages/StatisticsPage";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import SalesRepDetailsPage from "./pages/SalesRepDetailsPage";
import CustomerEditPage from "./pages/CustomerEditPage";
import ProtectedRoute from "./components/ProtectedRoute";

interface AppLayoutProps {
  onLogout: () => void;
}

function EditOrderRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <OrderFormPage
      onBack={() => navigate(`/orders${location.search}`)}
      orderId={id ?? null}
    />
  );
}

function OrderDetailsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from ?? `/orders${location.search}`;

  return <OrderDetailsPage orderId={id ?? ""} onBack={() => navigate(from)} />;
}

function CustomerDetailsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <CustomerDetailsPage
      customerId={id ?? ""}
      onBack={() => navigate("/customers")}
      onViewDetails={(orderId) =>
        navigate(`/orders/${orderId}`, {
          state: { from: `/customers/${id}` },
        })
      }
    />
  );
}

function CustomerEditRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <CustomerEditPage
      customerId={id ?? ""}
      onBack={() => navigate("/customers")}
    />
  );
}

function SalesRepDetailsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <SalesRepDetailsPage
      salesRepId={id ?? ""}
      onBack={() => navigate("/sales-reps")}
      onViewDetails={(orderId) =>
        navigate(`/orders/${orderId}`, {
          state: { from: `/sales-reps/${id}` },
        })
      }
    />
  );
}

function SalesRepEditRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <SalesRepEditPage
      salesRepId={id ?? null}
      onBack={() => navigate("/sales-reps")}
    />
  );
}

function AppLayout({ onLogout }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname, search } = location;

  const getSidebarView = (): View => {
    if (pathname === "/orders" || pathname.startsWith("/orders/")) {
      return "orders";
    }
    if (pathname === "/customers" || pathname.startsWith("/customers/")) {
      return "customers";
    }
    if (pathname === "/sales-reps" || pathname.startsWith("/sales-reps/")) {
      return "salesReps";
    }
    if (pathname === "/statistics") {
      return "statistics";
    }
    return "dashboard";
  };

  const getPageTitle = (): string => {
    // Pedidos
    if (pathname === "/orders/new") return "Nuevo pedido";
    if (/^\/orders\/[^/]+\/edit$/.test(pathname)) return "Editar pedido";
    if (/^\/orders\/[^/]+$/.test(pathname)) return "Detalles del pedido";
    if (pathname === "/orders") return "Pedidos";

    // Clientes
    if (/^\/customers\/[^/]+\/edit$/.test(pathname)) return "Editar cliente";
    if (/^\/customers\/[^/]+$/.test(pathname)) return "Detalles del cliente";
    if (pathname === "/customers") return "Clientes";

    // Vendedoras
    if (pathname === "/sales-reps/new") return "Nueva vendedora";
    if (/^\/sales-reps\/[^/]+\/edit$/.test(pathname)) return "Editar vendedora";
    if (/^\/sales-reps\/[^/]+$/.test(pathname))
      return "Detalles de la vendedora";
    if (pathname === "/sales-reps") return "Vendedoras";

    // Estadísticas
    if (pathname === "/statistics") return "Estadísticas";

    // Dashboard por defecto
    return "Dashboard";
  };

  const currentView = getSidebarView();

  const handleViewChange = (view: View) => {
    switch (view) {
      case "dashboard":
        navigate("/");
        break;
      case "orders":
        navigate("/orders");
        break;
      case "customers":
        navigate("/customers");
        break;
      case "salesReps":
        navigate("/sales-reps");
        break;
      case "statistics":
        navigate("/statistics");
        break;
    }

    setIsSidebarOpen(false);
  };

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="main-content">
        <Topbar
          title={getPageTitle()}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={onLogout}
        />

        <section className="content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard onViewChange={handleViewChange} />}
            />

            <Route
              path="/orders"
              element={
                <OrdersPage
                  onNewOrder={() => navigate("/orders/new")}
                  onEditOrder={(orderId) =>
                    navigate(`/orders/${orderId}/edit${search}`)
                  }
                  onViewDetails={(orderId) =>
                    navigate(`/orders/${orderId}${search}`)
                  }
                />
              }
            />

            <Route
              path="/orders/new"
              element={
                <ProtectedRoute requiresEdit>
                  <OrderFormPage
                    onBack={() => navigate(`/orders${location.search}`)}
                    orderId={null}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id/edit"
              element={
                <ProtectedRoute requiresEdit>
                  <EditOrderRoute />
                </ProtectedRoute>
              }
            />

            <Route path="/orders/:id" element={<OrderDetailsRoute />} />

            <Route
              path="/customers/:id/edit"
              element={
                <ProtectedRoute requiresEdit>
                  <CustomerEditRoute />
                </ProtectedRoute>
              }
            />

            <Route path="/customers/:id" element={<CustomerDetailsRoute />} />

            <Route
              path="/sales-reps/new"
              element={
                <ProtectedRoute requiresEdit>
                  <SalesRepEditPage
                    salesRepId={null}
                    onBack={() => navigate("/sales-reps")}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sales-reps/:id/edit"
              element={
                <ProtectedRoute requiresEdit>
                  <SalesRepEditRoute />
                </ProtectedRoute>
              }
            />

            <Route path="/sales-reps/:id" element={<SalesRepDetailsRoute />} />

            <Route
              path="/customers"
              element={
                <CustomersPage
                  onViewDetails={(customerId) =>
                    navigate(`/customers/${customerId}`)
                  }
                  onEdit={(customerId) =>
                    navigate(`/customers/${customerId}/edit`)
                  }
                />
              }
            />

            <Route path="/sales-reps" element={<SalesRepsPage />} />

            <Route path="/statistics" element={<StatisticsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getAuthToken() !== null,
  );

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <AppLayout onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
