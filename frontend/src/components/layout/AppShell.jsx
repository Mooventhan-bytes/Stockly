import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes, ShoppingCart, Tags, BellRing, Users, Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getDashboardSummary } from '../../api/products.js';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, count: 'pending' },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/alerts', label: 'Alerts', icon: BellRing, count: 'alerts' },
  { to: '/users', label: 'Users', icon: Users, admin: true },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState('');
  const [counts, setCounts] = useState({ alerts: 0, pending: 0 });
  const initials = user.name.split(' ').map((s) => s[0]).join('');

  useEffect(() => { // refreshed on every page change so the badges follow the database
    getDashboardSummary().then((s) => setCounts({ alerts: s.activeAlerts, pending: s.pendingOrders })).catch(() => {});
  }, [loc.pathname]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Stockly</div>
        <nav aria-label="Main">
          {nav.filter((n) => !n.admin || user.role === 'ADMIN').map(({ to, label, icon: Icon, end, count }) => (
            <NavLink key={to} to={to} end={end} className="nav-item">
              <Icon size={18} aria-hidden /> <span className="label">{label}</span>
              {count && counts[count] > 0 ? <span className="badge-lime">{counts[count]}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="promo">
          <strong>Got a new sale?</strong>
          <span>Record it and stock updates automatically.</span>
          <Link className="btn btn-dark" to="/orders/new">Create order</Link>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="who">
            <div className="avatar" aria-hidden>{initials}</div>
            <div><div className="name">{user.name}</div><div className="mail">{user.email}</div></div>
            <button className="icon-btn" onClick={() => { logout(); navigate('/login'); }} aria-label="Log out" title="Log out"><LogOut size={16} /></button>
          </div>
          <div className="top-right">
            <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/products?q=${encodeURIComponent(q)}`); }}>
              <Search size={16} aria-hidden />
              <input aria-label="Search products" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
            <Link className="icon-btn bell" to="/alerts" aria-label={`${counts.alerts} stock alerts`}>
              <Bell size={18} />{counts.alerts > 0 && <span className="badge-lime">{counts.alerts}</span>}
            </Link>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
