// src/components/ApartmentModel.jsx
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Modal } from 'bootstrap';
import { ApartmentsAPI } from '../api';
import Alert from './Alert';
import { isAdmin } from '../api/auth';

/*
Usage: parent keeps a ref to this component and calls modalRef.current.open(apartmentId)
It will fetch full apartment details and show the modal. onSave callback returns updated apartment.
*/

const ApartmentModel = forwardRef(function ApartmentModel(props, ref) {
  const modalRef = useRef(null);
  const bsModal = useRef(null);
  const [loading, setLoading] = useState(false);
  const [apartment, setApartment] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const admin = isAdmin();

  useImperativeHandle(ref, () => ({
    open: (id) => showForId(id),
    close: () => hide()
  }));

  useEffect(() => {
    if (!modalRef.current) return;
    bsModal.current = new Modal(modalRef.current, { backdrop: 'static' });
    return () => {
      if (bsModal.current) bsModal.current.hide();
    };
  }, []);

  async function showForId(id) {
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const data = await ApartmentsAPI.get(id);
      setApartment(data);
      setForm({
        title: data.title ?? '',
        description: data.description ?? '',
        price: data.price ?? '',
        bedrooms: data.bedrooms ?? 0,
        bathrooms: data.bathrooms ?? 0,
        sqft: data.sqft ?? 0,
        available: !!data.available,
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
        address: data.address ?? '',
        communityId: data.communityId ?? '',
      });
      bsModal.current.show();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load apartment');
    } finally {
      setLoading(false);
    }
  }

  function hide() {
    if (bsModal.current) bsModal.current.hide();
    setApartment(null);
    setForm({});
    setError(null);
    setMessage(null);
  }

  async function save() {
    if (!admin) return setError('You do not have permission to edit this apartment');
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...apartment,
        title: form.title,
        description: form.description,
        price: form.price === '' ? null : Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        sqft: Number(form.sqft),
        available: !!form.available,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        address: form.address,
        communityId: form.communityId === '' ? null : Number(form.communityId),
      };
      const updated = await ApartmentsAPI.update(apartment.id, payload);
      setApartment(updated);
      setForm(prev => ({ ...prev })); // keep UI in sync
      setMessage('Saved successfully');
      setTimeout(() => setMessage(null), 2500);
      if (props.onSave) props.onSave(updated);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function del() {
    if (!admin) return setError('You do not have permission to delete this apartment');
    if (!confirm('Delete apartment?')) return;
    try {
      await ApartmentsAPI.remove(apartment.id);
      hide();
      if (props.onDelete) props.onDelete(apartment.id);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Delete failed');
    }
  }

  if (!apartment) {
    // render modal DOM so bootstrap can attach. Body will show spinner when loading.
    return (
      <div className="modal fade" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              {loading ? <div className="text-center py-4">Loading...</div> : <div className="text-muted py-4">No apartment selected</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputDisabled = !admin;

  return (
    <div className="modal fade" tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Apartment — {apartment.title || `#${apartment.id}`}</h5>
            <button type="button" className="btn-close" onClick={hide}></button>
          </div>

          <div className="modal-body">
            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" disabled={inputDisabled} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" disabled={inputDisabled} rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-3">
                <label className="form-label">Price</label>
                <input type="number" className="form-control" disabled={inputDisabled} value={form.price ?? ''} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Bedrooms</label>
                <input type="number" className="form-control" disabled={inputDisabled} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Bathrooms</label>
                <input type="number" className="form-control" disabled={inputDisabled} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Sqft</label>
                <input type="number" className="form-control" disabled={inputDisabled} value={form.sqft} onChange={e => setForm({ ...form, sqft: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Available</label>
                <select className="form-select" disabled={inputDisabled} value={form.available ? 'true' : 'false'} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label">Address</label>
                <input className="form-control" disabled={inputDisabled} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Latitude</label>
                <input className="form-control" disabled={inputDisabled} value={form.latitude ?? ''} onChange={e => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Longitude</label>
                <input className="form-control" disabled={inputDisabled} value={form.longitude ?? ''} onChange={e => setForm({ ...form, longitude: e.target.value })} />
              </div>
            </div>

            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Community</label>
                <input className="form-control" disabled={inputDisabled} value={form.communityId} onChange={e => setForm({ ...form, communityId: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Community Name</label>
                <input className="form-control" value={apartment.communityName || ''} readOnly />
              </div>
            </div>

            <div className="mt-3 text-muted small">
              <div>ID: {apartment.id}</div>
            </div>
          </div>

          <div className="modal-footer">
            {admin ? (
              <>
                <button className="btn btn-danger me-auto" onClick={del}>Delete</button>
                <button className="btn btn-secondary" onClick={hide}>Close</button>
                <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</button>
              </>
            ) : (
              <>
                <div className="me-auto text-muted small">Read-only</div>
                <button className="btn btn-secondary" onClick={hide}>Close</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ApartmentModel;
