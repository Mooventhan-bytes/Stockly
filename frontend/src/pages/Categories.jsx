import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { listCategories, saveCategory, deleteCategory } from '../api/products.js';
import Modal from '../components/ui/Modal.jsx';

function CategoryForm({ category, onSave, onCancel }) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Enter a category name.');
    setBusy(true); setError('');
    try { await onSave({ id: category?.id, name, description }); }
    catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="cname">Category name</label><input id="cname" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="cdesc">Description (optional)</label><input id="cdesc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-dark" disabled={busy}>{busy ? 'Saving...' : category ? 'Save changes' : 'Add category'}</button>
      </div>
    </form>
  );
}

export default function Categories() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [delError, setDelError] = useState('');

  const load = useCallback(() => listCategories().then(setRows).catch(() => setError('Could not load categories. Try again.')), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); }, [msg]);

  const close = () => { setModal(null); setDelError(''); };
  const onSave = async (c) => { await saveCategory(c); await load(); close(); setMsg(c.id ? 'Category updated.' : 'Category added.'); };
  const onDelete = async () => {
    try { await deleteCategory(modal.category.id); await load(); close(); setMsg('Category deleted.'); }
    catch (err) { setDelError(err.message); }
  };

  return (
    <>
      <div className="title-row">
        <div><h1 className="page-title">Categories</h1><p className="muted">Group products so they are easy to find.</p></div>
        <button className="btn btn-lime" onClick={() => setModal({ type: 'form' })}><Plus size={14} aria-hidden /> Add category</button>
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}
      <section className="card">
        {error ? <p className="form-error" role="alert">{error}</p> : !rows ? <p className="muted">Loading categories...</p>
          : rows.length === 0 ? <p className="empty-msg">No categories yet. Add one to start organising products.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Category</th><th>Description</th><th>Products</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{rows.map((c) => (
              <tr key={c.id}><td><b>{c.name}</b></td><td className="muted">{c.description || 'No description'}</td><td>{c.productCount}</td>
                <td className="row-actions">
                  <button className="icon-btn sm" aria-label={`Edit ${c.name}`} onClick={() => setModal({ type: 'form', category: c })}><Pencil size={15} /></button>
                  <button className="icon-btn sm" aria-label={`Delete ${c.name}`} onClick={() => setModal({ type: 'delete', category: c })}><Trash2 size={15} /></button>
                </td></tr>))}</tbody>
          </table></div>)}
      </section>

      {modal?.type === 'form' && (
        <Modal title={modal.category ? 'Edit category' : 'Add category'} onClose={close}>
          <CategoryForm category={modal.category} onSave={onSave} onCancel={close} />
        </Modal>)}
      {modal?.type === 'delete' && (modal.category.productCount > 0 ? (
        <Modal title="Can't delete this category" onClose={close}>
          <p>{modal.category.name} still has {modal.category.productCount} product{modal.category.productCount > 1 ? 's' : ''}. Move {modal.category.productCount > 1 ? 'them' : 'it'} to another category in Products, then delete it.</p>
          <div className="actions"><button className="btn btn-dark" onClick={close}>Close</button></div>
        </Modal>) : (
        <Modal title="Delete category?" onClose={close}>
          <p>{modal.category.name} will be removed. This can't be undone.</p>
          {delError && <p className="form-error" role="alert">{delError}</p>}
          <div className="actions">
            <button className="btn btn-ghost" onClick={close}>Keep category</button>
            <button className="btn btn-danger" onClick={onDelete}>Delete category</button>
          </div>
        </Modal>))}
    </>
  );
}
