import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  Home,
  Auth,
  Orders,
  MenuList,
  Settings,
  Navigation,
} from "./Pages/PageIndex";
import Header from "./Components/Shared/Header";
import ReportsDashboard from "./Pages/Reports/ReportsDashboard";
import ProtectedRoute from "./Components/Shared/ProtectedRoute";
import RequestOrder from "./Pages/Orders/ReuestOrder";
import { Toaster } from "react-hot-toast";
import Page404 from "./Components/Shared/Page404";

function Layout() {
  const location = useLocation();

  // Hide admin layout on public pages
  const hideLayout =
    location.pathname === "/auth" ||
    location.pathname.startsWith("/request");

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      {!hideLayout && <Header />}

      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Public */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/request" element={<RequestOrder />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu" element={<MenuList />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Page404 />} />
      </Routes>

      {/* Navigation */}
      {!hideLayout && <Navigation />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}

export default App;
