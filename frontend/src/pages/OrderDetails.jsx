import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, updateOrderStatus, ORDER_FLOW } from '../api/products.js';
import { ORDER_LABEL, ACTION_LABEL, when } from '../utils/orders.js';
import { money } from '../utils/format.js';
import Modal from '../components/ui/Modal.jsx';

const FLOW = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetails() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const load = useCallback(() => getOrder(id).then(setO).catch((e) => setError(e.message)), [id]);
  useEffect(() => { load(); }, [load]);

  const move = async (next) => {
    setActionError('');
    try { setO(await updateOrderStatus(id, next)); setConfirmCancel(false); } catch (e) { setActionError(e.message); setConfirmCancel(false); }
  };

  if (error) return <><h1 className="page-title">Order</h1><div className="card empty"><p role="alert">{error}</p><Link className="btn btn-dark" to="/orders">Back to orders</Link></div></>;
  if (!o) return <p className="muted">Loading order...</p>;

  const steps = o.status === 'CANCELLED' ? o.history.map((h) => ({ s: h.status, at: h.at }))
    : FLOW.map((s) => ({ s, at: o.history.find((h) => h.status === s)?.at }));

  return (
    <>
      <div className="title-row">
        <div><h1 className="page-title">{o.id}</h1><p className="muted">Created {when(o.createdAt)}</p></div>
        <span className={`badge big-badge st-${o.status.toLowerCase()}`}>{ORDER_LABEL[o.status]}</span>
      </div>
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      <div className="grid details-grid">
        <section className="card wide-2">
          <div className="card-head">Items</div>
          <div className="table-wrap"><table>
            <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Line total</th></tr></thead>
            <tbody>{o.lines.map((l) => <tr key={l.productId}><td><b>{l.name}</b><div className="muted">{l.sku}</div></td><td>{money(l.unitPrice)}</td><td>{l.quantity}</td><td>{money(l.lineTotal)}</td></tr>)}</tbody>
            <tfoot><tr><td colSpan="3"><b>Order total</b></td><td><b>{money(o.total)}</b></td></tr></tfoot>
          </table></div>
        </section>
        <section className="card">
          <div className="card-head">Customer</div>
          <p><b>{o.customer.name}</b></p>
          <p className="muted">{o.customer.phone || 'No phone'}<br />{o.customer.email || 'No email'}</p>
        </section>
        <section className="card">
          <div className="card-head">Timeline</div>
          <ol className="timeline">{steps.map((st) => (
            <li key={st.s} className={st.at ? 'done' : ''}><b>{ORDER_LABEL[st.s]}</b><span className="muted">{st.at ? when(st.at) : 'Not yet'}</span></li>))}</ol>
        </section>
      </div>
      <div className="actions left">
        <Link className="btn btn-ghost" to="/orders">Back to orders</Link>
        {ORDER_FLOW[o.status].map((n) => n === 'CANCELLED'
          ? <button key={n} className="btn btn-danger" onClick={() => setConfirmCancel(true)}>{ACTION_LABEL[n]}</button>
          : <button key={n} className="btn btn-dark" onClick={() => move(n)}>{ACTION_LABEL[n]}</button>)}
      </div>
      {confirmCancel && (
        <Modal title="Cancel this order?" onClose={() => setConfirmCancel(false)}>
          <p>{o.id} will be cancelled and its stock returned to inventory. This can't be undone.</p>
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => setConfirmCancel(false)}>Keep order</button>
            <button className="btn btn-danger" onClick={() => move('CANCELLED')}>Cancel order</button>
          </div>
        </Modal>)}
    </>
  );
}
