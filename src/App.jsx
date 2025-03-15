import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Home, Auth, Orders , Tables,MenuList, Navigation,Settings} from "./Pages/PageIndex";
import Header from "./Components/Shared/Header";
import ReportsDashboard from "./Pages/Reports/ReportsDashboard";



function Layout() {
  const location = useLocation();
  
  // Hide Header on the Auth page
  const hideHeader = location.pathname.startsWith("/auth");

  return (
    <div className="relative min-h-screen">
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/menu" element={<MenuList />} />
        <Route path="/reports" element={<ReportsDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<div>Page Not Found</div>}/>
      </Routes>

      {/* Navigation */}
      {!hideHeader && <Navigation />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
