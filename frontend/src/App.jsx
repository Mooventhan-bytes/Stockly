import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Inventory from './pages/Inventory.jsx';
import Categories from './pages/Categories.jsx';
import Orders from './pages/Orders.jsx';
import OrderForm from './pages/OrderForm.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Alerts from './pages/Alerts.jsx';
import Users from './pages/Users.jsx';

// Only hides the page for staff; the backend is what actually refuses non-admin requests.
function AdminOnly({ children }) {
  const { user } = useAuth();
  return user.role === 'ADMIN' ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/new" element={<OrderForm />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="users" element={<AdminOnly><Users /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
