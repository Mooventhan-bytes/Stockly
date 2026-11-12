import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { listProducts, listMovements, adjustStock } from '../api/products.js';
import { stockStatus, STATUS_LABEL } from '../utils/stock.js';
import Modal from '../components/ui/Modal.jsx';

const REASONS = { IN: ['Restock received', 'Customer return', 'Count correction'], OUT: ['Damaged', 'Lost', 'Count correction'] };
const when = (iso) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

function AdjustForm({ product, onDone, onCancel }) {
  const [type, setType] = useState('IN');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const n = /^\d+$/.test(qty) ? Number(qty) : null;
  const after = n === null ? null : type === 'IN' ? product.stock + n : product.stock - n;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await adjustStock(product.id, { type, quantity: qty, reason, note }); onDone(); }
    catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <form className="form" onSubmit={submit} noValidate>
      <p className="muted">{product.name} ({product.sku}) · current stock <b>{product.stock}</b></p>
      <div className="seg" role="group" aria-label="Adjustment type">
        {[['IN', 'Add stock'], ['OUT', 'Remove stock']].map(([v, l]) => (
          <button type="button" key={v} aria-pressed={type === v} className={type === v ? 'on' : ''}
            onClick={() => { setType(v); setReason(''); }}>{l}</button>))}
      </div>
      <div className="two">
        <div className="field"><label htmlFor="qty">Quantity</label><input id="qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
        <div className="field"><label htmlFor="reason">Reason</label>
          <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select...</option>{REASONS[type].map((r) => <option key={r}>{r}</option>)}</select></div>
      </div>
      <div className="field"><label htmlFor="note">Note (optional)</label><input id="note" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      {after !== null && <p className={after < 0 ? 'form-error' : 'muted'}>New stock level: <b>{after < 0 ? 'not allowed (below 0)' : after}</b></p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-dark" disabled={busy || after < 0}>{busy ? 'Saving...' : 'Save adjustment'}</button>
      </div>
    </form>
  );
}

export default function Inventory() {
  const [items, setItems] = useState(null);
  const [moves, setMoves] = useState([]);
  const [tab, setTab] = useState('levels');
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => Promise.all([listProducts(), listMovements()])
    .then(([p, m]) => { setItems(p); setMoves(m); }).catch(() => setError('Could not load inventory. Try again.')), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); }, [msg]);

  const counts = useMemo(() => (items || []).reduce((c, p) => ({ ...c, [stockStatus(p)]: c[stockStatus(p)] + 1 }), { in: 0, low: 0, out: 0 }), [items]);
  const rows = (items || []).filter((p) => (!filter || stockStatus(p) === filter)
    && (!q.trim() || (p.name + p.sku).toLowerCase().includes(q.trim().toLowerCase())));
  const needsStock = counts.low + counts.out;

  return (
    <>
      <div className="title-row">
        <div><h1 className="page-title">Inventory</h1><p className="muted">Adjust stock and review every change.</p></div>
        <div className="seg" role="tablist">
          {[['levels', 'Stock levels'], ['history', 'Movement history']].map(([v, l]) => (
            <button key={v} role="tab" aria-selected={tab === v} className={tab === v ? 'on' : ''} onClick={() => setTab(v)}>{l}</button>))}
        </div>
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {needsStock > 0 && (
        <div className="banner"><AlertTriangle size={16} aria-hidden /> {counts.low} low-stock and {counts.out} out-of-stock products need restocking.
          <button className="link-btn" onClick={() => { setTab('levels'); setFilter(counts.out ? 'out' : 'low'); }}>Show them</button></div>)}

      <section className="card">
        {tab === 'levels' ? (
          <>
            <div className="filters">
              <input aria-label="Search inventory" placeholder="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
              {[['', 'All', (items || []).length], ['in', 'In stock', counts.in], ['low', 'Low stock', counts.low], ['out', 'Out of stock', counts.out]].map(([v, l, c]) => (
                <button key={l} aria-pressed={filter === v} className={`chip-btn ${filter === v ? 'on' : ''}`} onClick={() => setFilter(v)}>{l} ({c})</button>))}
            </div>
            {!items ? <p className="muted">Loading inventory...</p> : rows.length === 0 ? <p className="empty-msg">No products in this view.</p> : (
              <div className="table-wrap"><table>
                <thead><tr><th>Product</th><th>Stock</th><th>Reorder at</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
                <tbody>{rows.map((p) => { const s = stockStatus(p); return (
                  <tr key={p.id}><td><b>{p.name}</b><div className="muted">{p.sku}</div></td><td>{p.stock}</td><td>{p.threshold}</td>
                    <td><span className={`badge st-${s}`}>{STATUS_LABEL[s]}</span></td>
                    <td className="row-actions"><button className="btn btn-ghost" onClick={() => setTarget(p)}>Adjust stock</button></td></tr>); })}</tbody>
              </table></div>)}
          </>
        ) : moves.length === 0 ? <p className="empty-msg">No stock changes recorded yet.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>When</th><th>Product</th><th>Type</th><th>Change</th><th>Stock</th><th>Reason</th></tr></thead>
            <tbody>{moves.map((m) => (
              <tr key={m.id}><td>{when(m.createdAt)}</td><td><b>{m.productName}</b><div className="muted">{m.sku}</div></td>
                <td><span className={`badge ${m.type === 'IN' ? 'st-in' : 'st-pending'}`}>{m.type === 'IN' ? 'Stock in' : 'Stock out'}</span></td>
                <td>{m.type === 'IN' ? '+' : '-'}{m.quantity}</td><td>{m.before} → {m.after}</td><td>{m.reason}</td></tr>))}</tbody>
          </table></div>)}
      </section>

      {target && (
        <Modal title="Adjust stock" onClose={() => setTarget(null)}>
          <AdjustForm product={target} onCancel={() => setTarget(null)}
            onDone={async () => { setTarget(null); await load(); setMsg('Stock adjusted and recorded.'); }} />
        </Modal>)}
    </>
  );
}
