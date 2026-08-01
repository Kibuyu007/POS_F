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

// Valid routes list
const VALID_ROUTES = [
  "/",
  "/auth",
  "/request",
  "/home",
  "/orders",
  "/menu",
  "/reports",
  "/settings",
];

function Layout() {
  const location = useLocation();

  // Check if current path is a valid route (not 404)
  const isValidRoute = VALID_ROUTES.includes(location.pathname) || 
    location.pathname.startsWith("/request");

  // Hide layout on auth, request, and 404 pages
  const hideLayout = 
    location.pathname === "/auth" ||
    location.pathname.startsWith("/request") ||
    !isValidRoute; // This catches 404 pages

  return (
    <div className="relative min-h-screen">
      {/* Header - only show on valid protected routes */}
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

        {/* 404 - standalone */}
        <Route path="*" element={<Page404 />} />
      </Routes>

      {/* Navigation - only show on valid protected routes */}
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