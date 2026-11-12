import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAlerts } from '../api/products.js';
import { when } from '../utils/orders.js';

const KIND = { LOW: ['st-low', 'Low stock'], OUT: ['st-out', 'Out of stock'] };

export default function Alerts() {
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');
  const [kind, setKind] = useState('');
  useEffect(() => { listAlerts().then(setAlerts).catch(() => setError('Could not load alerts. Try again.')); }, []);

  const active = (alerts || []).filter((a) => !a.resolvedAt);
  const resolved = (alerts || []).filter((a) => a.resolvedAt);
  const rows = (tab === 'active' ? active : resolved).filter((a) => !kind || a.kind === kind);
  const n = (k) => active.filter((a) => a.kind === k).length;

  return (
    <>
      <div className="title-row">
        <div><h1 className="page-title">Low-stock alerts</h1><p className="muted">Alerts clear on their own once a product is restocked above its reorder level.</p></div>
        <div className="seg" role="tablist">
          {[['active', `Active (${active.length})`], ['resolved', `Resolved (${resolved.length})`]].map(([v, l]) => (
            <button key={v} role="tab" aria-selected={tab === v} className={tab === v ? 'on' : ''} onClick={() => setTab(v)}>{l}</button>))}
        </div>
      </div>
      <section className="card">
        <div className="filters">
          {[['', `All (${tab === 'active' ? active.length : resolved.length})`], ['LOW', `Low stock (${n('LOW')})`], ['OUT', `Out of stock (${n('OUT')})`]].map(([v, l]) => (
            tab === 'active' || v === '' ? <button key={v} aria-pressed={kind === v} className={`chip-btn ${kind === v ? 'on' : ''}`} onClick={() => setKind(v)}>{l}</button> : null))}
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : !alerts ? <p className="muted">Loading alerts...</p>
          : rows.length === 0 ? <p className="empty-msg">{tab === 'active' ? 'No active alerts. Every product is above its reorder level.' : 'No resolved alerts yet.'}</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Product</th><th>Level</th><th>Stock</th><th>{tab === 'active' ? 'Raised' : 'Resolved'}</th><th><span className="sr-only">Action</span></th></tr></thead>
            <tbody>{rows.map((a) => (
              <tr key={a.id}><td><b>{a.productName}</b><div className="muted">{a.sku}</div></td>
                <td><span className={`badge ${KIND[a.kind][0]}`}>{KIND[a.kind][1]}</span></td>
                <td>{a.stock} <span className="muted">/ reorder {a.threshold}</span></td>
                <td>{when(a.resolvedAt || a.createdAt)}</td>
                <td className="row-actions">{tab === 'active' && <Link className="btn btn-ghost" to="/inventory">Restock</Link>}</td></tr>))}</tbody>
          </table></div>)}
      </section>
    </>
  );
}
