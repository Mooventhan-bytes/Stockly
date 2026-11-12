import { useState } from 'react';

const empty = { name: '', sku: '', category: '', description: '', price: '', stock: '0', threshold: '10' };

export default function ProductForm({ product, categories, onSave, onCancel }) {
  const editing = Boolean(product);
  const [f, setF] = useState(editing ? Object.fromEntries(Object.entries(product).map(([k, v]) => [k, String(v)])) : empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const wholeNum = (v) => /^\d+$/.test(v);

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Enter a product name.';
    if (!/^[A-Za-z0-9-]+$/.test(f.sku.trim())) e.sku = 'Use letters, numbers and hyphens only.';
    if (!f.category) e.category = 'Choose a category.';
    if (!(Number(f.price) > 0)) e.price = 'Enter a price above 0.';
    if (!editing && !wholeNum(f.stock)) e.stock = 'Enter a whole number, 0 or more.';
    if (!wholeNum(f.threshold)) e.threshold = 'Enter a whole number, 0 or more.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setServerError('');
    try {
      await onSave({ id: product?.id, name: f.name, sku: f.sku, category: f.category, description: f.description,
        price: Number(f.price), stock: Number(f.stock), threshold: Number(f.threshold) });
    } catch (err) { setServerError(err.message); setSaving(false); }
  };

  const Field = ({ id, label, children }) => (
    <div className="field"><label htmlFor={id}>{label}</label>{children}
      {errors[id] && <span className="form-error" role="alert">{errors[id]}</span>}</div>
  );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field id="name" label="Product name"><input id="name" value={f.name} onChange={set('name')} /></Field>
      <div className="two">
        <Field id="sku" label="SKU"><input id="sku" value={f.sku} onChange={set('sku')} /></Field>
        <Field id="category" label="Category">
          <select id="category" value={f.category} onChange={set('category')}>
            <option value="">Select...</option>{categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field id="description" label="Description (optional)"><textarea id="description" rows={2} value={f.description} onChange={set('description')} /></Field>
      <div className="three">
        <Field id="price" label="Unit price"><input id="price" inputMode="decimal" value={f.price} onChange={set('price')} /></Field>
        <Field id="stock" label={editing ? 'Stock (change in Inventory)' : 'Opening stock'}>
          <input id="stock" inputMode="numeric" value={f.stock} onChange={set('stock')} disabled={editing} /></Field>
        <Field id="threshold" label="Reorder threshold"><input id="threshold" inputMode="numeric" value={f.threshold} onChange={set('threshold')} /></Field>
      </div>
      {serverError && <p className="form-error" role="alert">{serverError}</p>}
      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-dark" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add product'}</button>
      </div>
    </form>
  );
}
