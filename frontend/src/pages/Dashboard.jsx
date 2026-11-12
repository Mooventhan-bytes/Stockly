import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Boxes, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { categoryShare, monthly } from '../mock/data.js'; // sample data for the two charts only
import { getDashboardSummary, listOrders, listAlerts } from '../api/products.js';
import { money, num } from '../utils/format.js';

const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function Stat({ icon: Icon, title, value, sub }) {
  return (
    <section className="card stat">
      <div className="card-head"><span className="chip"><Icon size={16} aria-hidden /></span>{title}</div>
      <div className="big">{value}</div>
      <div className="muted">{sub}</div>
    </section>
  );
}

const Badge = ({ status }) => <span className={`badge st-${status.toLowerCase()}`}>{status.toLowerCase()}</span>;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([getDashboardSummary(), listOrders(), listAlerts()]).then(([s, orders, alertList]) => setData({
      summary: { products: s.totalProducts, units: s.totalUnits, low: s.lowStock, out: s.outOfStock, pending: s.pendingOrders },
      stockStatus: { inStock: Math.max(s.totalProducts - s.lowStock - s.outOfStock, 0), low: s.lowStock, out: s.outOfStock },
      recentOrders: orders.slice(0, 4).map((o) => ({ id: o.id, customer: o.customer.name, total: o.total, status: o.status })),
      alerts: alertList.filter((a) => !a.resolvedAt).slice(0, 3).map((a) => ({ sku: a.sku, name: a.productName, stock: a.stock, threshold: a.threshold })),
    })).catch((e) => setError(e.message));
  }, []);
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!data) return <p className="muted">Loading dashboard...</p>;
  const { summary, recentOrders, alerts } = data;
  const { inStock, low, out } = data.stockStatus;
  const d = (n) => Math.round(48 + 80 * Math.sqrt(n / Math.max(inStock, 1)));
  return (
    <>
      <div className="title-row">
        <div>
          <h1 className="page-title">Inventory Overview</h1>
          <p className="muted">Keep stock healthy and orders moving.</p>
        </div>
        <div className="title-actions">
          <span className="muted">{today}</span>
          <Link className="btn btn-lime" to="/products/new">Add product</Link>
          <Link className="btn btn-dark" to="/orders/new">Create order</Link>
        </div>
      </div>

      <div className="grid">
        <Stat icon={Package} title="Total products" value={num(summary.products)} sub="across all categories" />
        <Stat icon={Boxes} title="Units in stock" value={num(summary.units)} sub="total inventory" />
        <Stat icon={AlertTriangle} title="Low stock" value={summary.low} sub={`${summary.out} out of stock`} />
        <Stat icon={Clock} title="Pending orders" value={summary.pending} sub="awaiting confirmation" />

        <section className="card status-card">
          <div className="card-head">Stock status</div>
          <div className="bubbles" role="img" aria-label={`${inStock} in stock, ${low} low stock, ${out} out of stock`}>
            <div className="bubble lav" style={{ width: d(inStock), height: d(inStock), left: 0, top: 10 }}><b>{inStock}</b><small>in stock</small></div>
            <div className="bubble dark" style={{ width: d(low) + 24, height: d(low) + 24, right: 0, top: 30 }}><b>{low}</b><small>low</small></div>
            <div className="bubble lime" style={{ width: d(out) + 36, height: d(out) + 36, left: '38%', bottom: 0 }}><b>{out}</b><small>out</small></div>
          </div>
          {categoryShare.map((c) => (
            <div key={c.name} className="bar-row">
              <div className="bar-top"><b>{c.pct}<small>%</small></b><span>{c.name}</span></div>
              <div className="track"><div className={`fill ${c.tone}`} style={{ width: `${c.pct}%` }} /></div>
            </div>
          ))}
        </section>

        <section className="card dark chart-card">
          <div className="card-head">Stock movement <span className="muted">(sample data)</span></div>
          <div className="legend"><span><i className="dot lime" /> Stock in</span><span><i className="dot lav" /> Stock out</span></div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthly} barGap={4}>
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#aaa', fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,.06)' }} contentStyle={{ background: '#2a2a2a', border: 0, borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="in" name="Stock in" fill="#d8f05a" radius={20}>
                {monthly.map((r, i) => <Cell key={r.m} fillOpacity={i === monthly.length - 1 ? 1 : 0.35} />)}
              </Bar>
              <Bar dataKey="out" name="Stock out" fill="#b9a5f0" radius={20}>
                {monthly.map((r, i) => <Cell key={r.m} fillOpacity={i === monthly.length - 1 ? 1 : 0.35} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="card wide-2">
          <div className="card-head">Recent orders <Link to="/orders" className="link">View all</Link></div>
          <ul className="list">
            {recentOrders.slice(0, 3).map((o) => (
              <li key={o.id}><div><b>{o.id}</b><div className="muted">{o.customer}</div></div><div className="right"><b>{money(o.total)}</b><Badge status={o.status} /></div></li>
            ))}
          </ul>
        </section>

        <section className="card wide-2">
          <div className="card-head">Low-stock alerts <Link to="/alerts" className="link">View all</Link></div>
          <ul className="list">
            {alerts.map((a) => (
              <li key={a.sku}>
                <div><b>{a.name}</b><div className="muted">{a.sku} · reorder at {a.threshold}</div></div>
                <div className="right"><b>{a.stock} left</b><span className={`badge ${a.stock === 0 ? 'st-out' : 'st-low'}`}>{a.stock === 0 ? 'out of stock' : 'low stock'}</span></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
