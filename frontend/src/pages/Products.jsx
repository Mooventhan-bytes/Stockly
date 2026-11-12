import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { listProducts, getCategories, saveProduct, deleteProduct } from '../api/products.js';
import { stockStatus, STATUS_LABEL } from '../utils/stock.js';
import { money } from '../utils/format.js';
import Modal from '../components/ui/Modal.jsx';
import ProductForm from './ProductForm.jsx';

const PAGE = 8;
const cols = [['name', 'Product'], ['category', 'Category'], ['price', 'Price'], ['stock', 'Stock']];

export default function Products() {
  const navigate = useNavigate();
  const isNew = useLocation().pathname.endsWith('/new');
  const [params] = useSearchParams();
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(isNew ? { type: 'form' } : null);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => listProducts().then(setItems).catch(() => setError('Could not load products. Try again.')), []);
  useEffect(() => { load(); getCategories().then(setCategories); }, [load]);
  useEffect(() => setPage(1), [q, cat, status]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); }, [msg]);

  const rows = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    return items
      .filter((p) => (!s || p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s))
        && (!cat || p.category === cat) && (!status || stockStatus(p) === status))
      .sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0) * sort.dir);
  }, [items, q, cat, status, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const visible = rows.slice((page - 1) * PAGE, page * PAGE);
  const closeModal = () => { setModal(null); if (isNew) navigate('/products', { replace: true }); };
  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));

  const onSave = async (p) => {
    await saveProduct(p); await load(); closeModal();
    setMsg(p.id ? 'Product updated.' : 'Product added.');
  };
  const onDelete = async () => {
    await deleteProduct(modal.product.id); await load(); setModal(null); setMsg('Product deleted.');
  };

  return (
    <>
      <div className="title-row">
        <div><h1 className="page-title">Products</h1><p className="muted">{items ? `${rows.length} of ${items.length} products` : 'Loading...'}</p></div>
        <button className="btn btn-lime" onClick={() => setModal({ type: 'form' })}><Plus size={14} aria-hidden /> Add product</button>
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}

      <section className="card">
        <div className="filters">
          <input aria-label="Search products" placeholder="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Filter by stock status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All stock levels</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {error ? <p className="form-error" role="alert">{error}</p>
          : !items ? <p className="muted">Loading products...</p>
          : rows.length === 0 ? <p className="empty-msg">No products match these filters. Clear a filter or add a product.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  {cols.map(([k, label]) => (
                    <th key={k} aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                      <button className="th-btn" onClick={() => toggleSort(k)}>{label}
                        {sort.key === k && (sort.dir === 1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</button>
                    </th>
                  ))}
                  <th>Status</th><th><span className="sr-only">Actions</span></th>
                </tr></thead>
                <tbody>
                  {visible.map((p) => { const s = stockStatus(p); return (
                    <tr key={p.id}>
                      <td><b>{p.name}</b><div className="muted">{p.sku}</div></td>
                      <td>{p.category}</td><td>{money(p.price)}</td>
                      <td>{p.stock} <span className="muted">/ reorder {p.threshold}</span></td>
                      <td><span className={`badge st-${s}`}>{STATUS_LABEL[s]}</span></td>
                      <td className="row-actions">
                        <button className="icon-btn sm" aria-label={`View ${p.name}`} onClick={() => setModal({ type: 'view', product: p })}><Eye size={15} /></button>
                        <button className="icon-btn sm" aria-label={`Edit ${p.name}`} onClick={() => setModal({ type: 'form', product: p })}><Pencil size={15} /></button>
                        <button className="icon-btn sm" aria-label={`Delete ${p.name}`} onClick={() => setModal({ type: 'delete', product: p })}><Trash2 size={15} /></button>
                      </td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          )}
        {rows.length > PAGE && (
          <div className="pager">
            <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="muted">Page {page} of {pages}</span>
            <button className="btn btn-ghost" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </section>

      {modal?.type === 'form' && (
        <Modal title={modal.product ? 'Edit product' : 'Add product'} onClose={closeModal}>
          <ProductForm product={modal.product} categories={categories} onSave={onSave} onCancel={closeModal} />
        </Modal>)}
      {modal?.type === 'view' && (
        <Modal title={modal.product.name} onClose={() => setModal(null)}>
          <dl className="details">
            <dt>SKU</dt><dd>{modal.product.sku}</dd><dt>Category</dt><dd>{modal.product.category}</dd>
            <dt>Unit price</dt><dd>{money(modal.product.price)}</dd>
            <dt>Stock</dt><dd>{modal.product.stock} (reorder at {modal.product.threshold})</dd>
            <dt>Description</dt><dd>{modal.product.description || 'No description'}</dd>
          </dl>
          <div className="actions"><button className="btn btn-dark" onClick={() => setModal(null)}>Close</button></div>
        </Modal>)}
      {modal?.type === 'delete' && (
        <Modal title="Delete product?" onClose={() => setModal(null)}>
          <p>{modal.product.name} ({modal.product.sku}) will be removed from the catalogue. This can't be undone.</p>
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Keep product</button>
            <button className="btn btn-danger" onClick={onDelete}>Delete product</button>
          </div>
        </Modal>)}
    </>
  );
}
