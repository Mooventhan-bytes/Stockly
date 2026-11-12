import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { listOrders } from '../api/products.js';
import { ORDER_LABEL, when } from '../utils/orders.js';
import { money } from '../utils/format.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => { listOrders().then(setOrders).catch(() => setError('Could not load orders. Try again.')); }, []);

  const s = q.trim().toLowerCase();
  const rows = (orders || []).filter((o) => (!status || o.status === status) && (!s || o.id.toLowerCase().includes(s) || o.customer.name.toLowerCase().includes(s)));

  return (
    <>
      <div className="title-row">
        <div><h1 className="page-title">Orders</h1><p className="muted">{orders ? `${rows.length} of ${orders.length} orders` : 'Loading...'}</p></div>
        <Link className="btn btn-lime" to="/orders/new"><Plus size={14} aria-hidden /> Create order</Link>
      </div>
      <section className="card">
        <div className="filters">
          <input aria-label="Search orders" placeholder="Search order ID or customer" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>{Object.entries(ORDER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : !orders ? <p className="muted">Loading orders...</p>
          : rows.length === 0 ? <p className="empty-msg">No orders match. Clear the filters or create an order.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Order</th><th>Customer</th><th>Created</th><th>Total</th><th>Status</th><th><span className="sr-only">Open</span></th></tr></thead>
            <tbody>{rows.map((o) => (
              <tr key={o.id}><td><b>{o.id}</b></td><td>{o.customer.name}</td><td>{when(o.createdAt)}</td><td>{money(o.total)}</td>
                <td><span className={`badge st-${o.status.toLowerCase()}`}>{ORDER_LABEL[o.status]}</span></td>
                <td className="row-actions"><Link className="btn btn-ghost" to={`/orders/${o.id}`}>View order</Link></td></tr>))}</tbody>
          </table></div>)}
      </section>
    </>
  );
}
