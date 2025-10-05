import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CommunitiesAPI } from '../api';
import Alert from '../components/Alert';

export default function CommunitiesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await CommunitiesAPI.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  }

  async function create(e) {
    e.preventDefault();
    setError(null);
    try {
      const created = await CommunitiesAPI.create(form);
      setItems(prev => [created, ...prev]);
      setForm({ name: '', description: '' });
      setMessage('Community created');
      setTimeout(()=>setMessage(null), 3000);
    } catch (e) {
      setError(e.message || 'Create failed');
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Communities</h2>
        <small className="text-muted">{items.length} total</small>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={create} className="row g-2">
            <div className="col-md-4">
              <input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary" type="submit">Create</button>
            </div>
          </form>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="row g-3">
          {items.length === 0 && <div className="text-muted">No communities found</div>}
          {items.map(c => (
            <div key={c.id} className="col-sm-6 col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{c.name}</h5>
                  <p className="card-text text-muted small">{c.description}</p>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <Link to={`/communities/${c.id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    <span className="text-muted small">ID: {c.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
