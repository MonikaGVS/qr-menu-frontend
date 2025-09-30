import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import WaiterLogin from "./pages/WaiterLogin.jsx";
import WaiterDashboard from "./pages/WaiterDashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/r/:slug/t/:tableNumber" element={<MenuPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/waiter-login" element={<WaiterLogin />} />
        <Route path="/waiter-dashboard" element={<WaiterDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
