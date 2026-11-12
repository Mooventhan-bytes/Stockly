import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { listUsers, createUser, updateUser } from '../api/products.js';
import Modal from '../components/ui/Modal.jsx';

function UserForm({ user, onSave, onCancel }) {
  const editing = Boolean(user);
  const [f, setF] = useState({ fullName: user?.fullName || '', email: user?.email || '', password: '', role: user?.role || 'STAFF', enabled: user?.enabled ?? true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.fullName.trim()) return setError('Enter a name.');
    if (!editing && !f.email.trim()) return setError('Enter an email.');
    if ((!editing || f.password) && f.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true); setError('');
    try { await onSave(f); } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="uname">Full name</label><input id="uname" value={f.fullName} onChange={set('fullName')} /></div>
      <div className="field"><label htmlFor="uemail">Email</label><input id="uemail" type="email" value={f.email} onChange={set('email')} disabled={editing} /></div>
      <div className="two">
        <div className="field"><label htmlFor="upw">{editing ? 'New password (optional)' : 'Password'}</label><input id="upw" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} /></div>
        <div className="field"><label htmlFor="urole">Role</label>
          <select id="urole" value={f.role} onChange={set('role')}><option value="STAFF">Staff</option><option value="ADMIN">Admin</option></select></div>
      </div>
      {editing && <label className="check"><input type="checkbox" checked={f.enabled} onChange={set('enabled')} /> Account is active</label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-dark" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Add user'}</button>
      </div>
    </form>
  );
}

export default function Users() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => listUsers().then(setRows).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); }, [msg]);

  const onSave = async (f) => {
    if (modal.user) await updateUser(modal.user.id, f); else await createUser(f);
    await load(); setMsg(modal.user ? 'User updated.' : 'User added.'); setModal(null);
  };

  return (
    <>
      <div className="title-row">
        <div><h1 className="page-title">Users</h1><p className="muted">Admins manage everything. Staff can't delete data or manage users.</p></div>
        <button className="btn btn-lime" onClick={() => setModal({})}><Plus size={14} aria-hidden /> Add user</button>
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}
      <section className="card">
        {error ? <p className="form-error" role="alert">{error}</p> : !rows ? <p className="muted">Loading users...</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{rows.map((u) => (
              <tr key={u.id}><td><b>{u.fullName}</b></td><td>{u.email}</td>
                <td><span className={`badge ${u.role === 'ADMIN' ? 'st-confirmed' : 'st-shipped'}`}>{u.role.toLowerCase()}</span></td>
                <td><span className={`badge ${u.enabled ? 'st-in' : 'st-cancelled'}`}>{u.enabled ? 'Active' : 'Disabled'}</span></td>
                <td className="row-actions"><button className="icon-btn sm" aria-label={`Edit ${u.fullName}`} onClick={() => setModal({ user: u })}><Pencil size={15} /></button></td></tr>))}</tbody>
          </table></div>)}
      </section>
      {modal && <Modal title={modal.user ? 'Edit user' : 'Add user'} onClose={() => setModal(null)}><UserForm user={modal.user} onSave={onSave} onCancel={() => setModal(null)} /></Modal>}
    </>
  );
}
