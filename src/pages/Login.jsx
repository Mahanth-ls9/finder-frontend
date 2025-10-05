// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, saveToken, getToken } from '../api/auth';
import Alert from '../components/Alert';
import { Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // call login API (assume it returns response data OR performs internal save)
      const res = await loginApi(form.username, form.password);

      // if API returned token in response, save it
      if (res && (res.jwt || res.token)) {
        const token = res.jwt ?? res.token;
        saveToken(token);
      }

      // otherwise if loginApi already saved token (side-effect), ensure header is present
      const existing = getToken();
      if (!existing) {
        // if no token found, treat as failure
        throw new Error('Login did not return a token');
      }

      navigate('/'); // go to home
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card shadow-sm p-4" style={{ width: '360px' }}>
        <h4 className="text-center mb-3">Login</h4>
        {error && <Alert type="danger">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-3">
          <small>
            Don’t have an account? <Link to="/register">Register</Link>
          </small>
        </div>
      </div>
    </div>
  );
}
