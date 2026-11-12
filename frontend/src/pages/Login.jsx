import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try { await login(email, password); nav(from, { replace: true }); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">Stockly</div>
        <h1>Sign in</h1>
        <p className="muted">Manage products, stock and orders in one place.</p>
        <form onSubmit={submit} noValidate>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="pw">Password</label>
          <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="btn btn-lime" type="submit">Sign in</button>
        </form>
        <p className="note">Use the account created by your administrator.</p>
      </div>
    </div>
  );
}
