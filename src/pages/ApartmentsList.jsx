// src/pages/ApartmentsList.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApartmentsAPI } from '../api';
import Alert from '../components/Alert';
import ApartmentModal from '../components/ApartmentModel';
import { isAdmin } from '../api/auth';
import useRevealOnScroll from '../hooks/useRevealOnScroll';

export default function ApartmentsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', apartmentNumber: '', communityId: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const modalRef = useRef();
  const admin = isAdmin();

  // enable reveal behavior for this page
  useRevealOnScroll();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await ApartmentsAPI.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load apartments');
    } finally {
      setLoading(false);
    }
  }

  async function create(e) {
    e.preventDefault();
    if (!admin) return setError('You do not have permission to create apartments');
    setError(null);
    try {
      const created = await ApartmentsAPI.create(form);
      setItems(prev => [created, ...prev]);
      setForm({ title: '', apartmentNumber: '', communityId: '' });
      setMessage('Apartment created');
      setTimeout(()=>setMessage(null), 3000);
    } catch (e) {
      setError(e.message || 'Create failed');
    }
  }

  function openModalFor(id) {
    if (modalRef.current && modalRef.current.open) {
      modalRef.current.open(id);
    }
  }

  function onModalSave(updated) {
    setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function onModalDelete(deletedId) {
    setItems(prev => prev.filter(p => p.id !== deletedId));
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 reveal">
        <h2 className="mb-0">Apartments</h2>
        <small className="text-muted">{items.length} total</small>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      {admin && (
        <div className="card mb-4 reveal">
          <div className="card-body">
            <form onSubmit={create} className="row g-2">
              <div className="col-md-4">
                <input className="form-control" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <input className="form-control" placeholder="Number" value={form.apartmentNumber} onChange={e => setForm({ ...form, apartmentNumber: e.target.value })} />
              </div>
              <div className="col-md-3">
                <input className="form-control" placeholder="Community ID" value={form.communityId} onChange={e => setForm({ ...form, communityId: e.target.value })} />
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-primary" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-muted">Loading apartments...</div>
      ) : items.length === 0 ? (
        <div className="text-muted">No apartments found</div>
      ) : (
        <div className="row g-3">
          {items.map(a => (
            <div key={a.id} className="col-sm-6 col-md-4 col-lg-3 reveal">
              <div className="card apartment-card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <h6 className="card-title mb-1">{a.title || `Apartment #${a.id}`}</h6>
                    <div className="text-muted apartment-meta">
                      <div>Number: {a.apartmentNumber || 'N/A'}</div>
                      <div>Community: {a.communityId ?? 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mt-auto d-flex align-items-center justify-content-between">
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openModalFor(a.id)}>View</button>
                      <Link to={`/apartments/${a.id}`} className="btn btn-sm btn-outline-secondary">Open Page</Link>
                    </div>

                    <div className="text-muted small ms-2">ID: {a.id}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApartmentModal ref={modalRef} onSave={onModalSave} onDelete={onModalDelete} />
    </div>
  );
}
