import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import { listProducts, createOrder } from '../api/products.js';
import { money } from '../utils/format.js';

let uid = 0;
const newLine = () => ({ k: ++uid, productId: '', quantity: '1' });

export default function OrderForm() {
  const navigate = useNavigate();
  const key = useRef(crypto.randomUUID()); // same key on retry = no duplicate order
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [lines, setLines] = useState([newLine()]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { listProducts().then(setProducts); }, []);

  const price = (id) => products.find((p) => p.id === Number(id))?.price || 0;
  const preview = lines.reduce((t, l) => t + price(l.productId) * (Number(l.quantity) || 0), 0);
  const setLine = (k, patch) => setLines(lines.map((l) => (l.k === k ? { ...l, ...patch } : l)));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { const o = await createOrder({ customer, lines, key: key.current }); navigate(`/orders/${o.id}`); }
    catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <>
      <div className="title-row"><div><h1 className="page-title">Create order</h1><p className="muted">Stock is reserved as soon as the order is saved.</p></div></div>
      <form className="card form" onSubmit={submit} noValidate>
        <div className="three">
          <div className="field"><label htmlFor="cn">Customer name</label><input id="cn" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="cp">Phone</label><input id="cp" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></div>
          <div className="field"><label htmlFor="ce">Email</label><input id="ce" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div>
        </div>
        <h2 className="sub">Items</h2>
        {lines.map((l, i) => (
          <div className="line-row" key={l.k}>
            <div className="field grow"><label htmlFor={`p${l.k}`}>Product {i + 1}</label>
              <select id={`p${l.k}`} value={l.productId} onChange={(e) => setLine(l.k, { productId: e.target.value })}>
                <option value="">Select...</option>
                {products.map((p) => <option key={p.id} value={p.id} disabled={p.stock === 0}>{p.name} ({p.stock === 0 ? 'out of stock' : `${p.stock} in stock`})</option>)}
              </select></div>
            <div className="field qty"><label htmlFor={`q${l.k}`}>Quantity</label><input id={`q${l.k}`} inputMode="numeric" value={l.quantity} onChange={(e) => setLine(l.k, { quantity: e.target.value })} /></div>
            <div className="muted line-total">{money(price(l.productId) * (Number(l.quantity) || 0))}</div>
            <button type="button" className="icon-btn sm" aria-label={`Remove item ${i + 1}`} disabled={lines.length === 1} onClick={() => setLines(lines.filter((x) => x.k !== l.k))}><Trash2 size={15} /></button>
          </div>))}
        <button type="button" className="btn btn-ghost add-line" onClick={() => setLines([...lines, newLine()])}><Plus size={14} aria-hidden /> Add item</button>
        <p className="muted">Estimated total <b>{money(preview)}</b>. The final prices and total are calculated when the order is saved.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="actions">
          <Link className="btn btn-ghost" to="/orders">Cancel</Link>
          <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save order'}</button>
        </div>
      </form>
    </>
  );
}
