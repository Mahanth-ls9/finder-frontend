// src/pages/CommunityDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CommunitiesAPI, ApartmentsAPI } from '../api';
import Alert from '../components/Alert';
import { isAdmin } from '../api/auth';
import { motion } from 'framer-motion';

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const admin = isAdmin();

  useEffect(() => { load(); }, [id]);

  async function load() {
    try {
      const c = await CommunitiesAPI.get(id);
      setCommunity(c);
      setForm({ name: c?.name || '', description: c?.description || '' });
    } catch (e) {
      setError(e.message || 'Failed to load community');
    }
    try {
      const a = await ApartmentsAPI.listByCommunity(id);
      setApartments(Array.isArray(a) ? a : []);
    } catch (e) {
      setApartments([]);
    }
  }

  async function save() {
    if (!admin) return setError('You do not have permission to save changes');
    setError(null);
    try {
      const updated = await CommunitiesAPI.update(id, form);
      setCommunity(updated);
      setEditing(false);
      setMessage('Community updated');
      setTimeout(()=>setMessage(null), 3000);
    } catch (e) {
      setError(e.message || 'Save failed');
    }
  }

  async function remove() {
    if (!admin) return setError('You do not have permission to delete');
    if (!confirm('Delete community?')) return;
    try {
      await CommunitiesAPI.remove(id);
      navigate('/communities');
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  }

  if (!community) return <div>Loading community...</div>;

  return (
    <div>
      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      <motion.div className="card mb-3 shadow-sm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h3 className="card-title">{community.name}</h3>
            <p className="text-muted mb-0">{community.description}</p>
            <div className="text-muted small mt-2">ID: {community.id}</div>
          </div>
          <div>
            {admin ? (
              <>
                <button className="btn btn-outline-secondary me-2" onClick={() => setEditing(s => !s)}>{editing ? 'Cancel' : 'Edit'}</button>
                <button className="btn btn-danger" onClick={remove}>Delete</button>
              </>
            ) : (
              <div className="text-muted small">Read-only</div>
            )}
          </div>
        </div>
      </motion.div>

      {editing && admin && (
        <motion.div className="card mb-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-body">
            <div className="mb-2"><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="mb-2"><input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><button className="btn btn-success me-2" onClick={save}>Save</button><button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button></div>
          </div>
        </motion.div>
      )}

      <section>
        <h5>Apartments in this community</h5>
        <div className="row g-3 mt-2">
          {apartments.length === 0 && <div className="text-muted">No apartments found</div>}
          {apartments.map(a => (
            <motion.div key={a.id} className="col-sm-6 col-md-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-1">{a.title || `Apartment ${a.apartmentNumber || a.id}`}</h6>
                  <div className="text-muted small">Number: {a.apartmentNumber}</div>
                  <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                    <Link to={`/apartments/${a.id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    <span className="text-muted small">ID: {a.id}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
