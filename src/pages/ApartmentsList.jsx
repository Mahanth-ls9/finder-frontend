import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApartmentsAPI } from '../api';
import Alert from '../components/Alert';
import ApartmentModal from '../components/ApartmentModel';

export default function ApartmentsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', apartmentNumber: '', communityId: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const modalRef = useRef();

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

  // callback when modal saves an apartment (update the list)
  function onModalSave(updated) {
    setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function onModalDelete(deletedId) {
    setItems(prev => prev.filter(p => p.id !== deletedId));
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Apartments</h2>
        <small className="text-muted">{items.length} total</small>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      <div className="card mb-4">
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

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Number</th>
                <th>Community</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan="4" className="text-muted">No apartments found</td></tr>
              )}
              {items.map(a => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.apartmentNumber}</td>
                  <td>{a.communityId}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModalFor(a.id)}>View</button>
                    <Link to={`/apartments/${a.id}`} className="btn btn-sm btn-outline-secondary me-2">Open Page</Link>
                    <span className="text-muted small">ID: {a.id}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ApartmentModal ref={modalRef} onSave={onModalSave} onDelete={onModalDelete} />
    </div>
  );
}
