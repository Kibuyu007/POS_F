import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Home, Auth, Orders, MenuList, Navigation, Settings } from "./Pages/PageIndex";
import Header from "./Components/Shared/Header";
import ReportsDashboard from "./Pages/Reports/ReportsDashboard";
import ProtectedRoute from "./Components/Shared/ProtectedRoute";

import { Toaster } from "react-hot-toast";

function Layout() {
  const location = useLocation();  // Get current route

  return (
    <div className="relative min-h-screen">
      {/* Render Header and Navigation only if not on /auth route */}
      {location.pathname !== "/auth" && <Header />}
      
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Public Route - Only for Login */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes - Require Login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu" element={<MenuList />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>

      {/* Render Navigation only if not on /auth route */}
      {location.pathname !== "/auth" && <Navigation />}
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
