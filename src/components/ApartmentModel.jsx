// src/components/ApartmentModel.jsx
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApartmentsAPI } from '../api';
import Alert from './Alert';
import { isAdmin } from '../api/auth';

/*
  Replaces Bootstrap modal with a simple accessible Framer Motion modal.
  Parent uses a ref: modalRef.current.open(id) to show, and modalRef.current.close() to hide.
*/

const backdrop = {
  visible: { opacity: 1, transition: { duration: 0.18 } },
  hidden: { opacity: 0, transition: { duration: 0.18 } }
};

const sheet = {
  hidden: { y: 24, opacity: 0, scale: 0.995 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.26, ease: 'easeOut' } },
  exit: { y: 12, opacity: 0, transition: { duration: 0.18 } }
};

const ApartmentModel = forwardRef(function ApartmentModel(props, ref) {
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apartment, setApartment] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const admin = isAdmin();

  useImperativeHandle(ref, () => ({
    open: (id) => setOpenId(id),
    close: () => setOpenId(null)
  }), []);

  useEffect(() => {
    if (!openId) {
      setApartment(null);
      setForm({});
      setError(null);
      setMessage(null);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await ApartmentsAPI.get(openId);
        if (cancelled) return;
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
          communityId: data.communityId ?? ''
        });
      } catch (e) {
        console.error(e);
        setError(e?.message || 'Failed to load apartment');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [openId]);

  async function save() {
    if (!admin) return setError('You do not have permission to edit this apartment');
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...apartment,
        title: form.title,
        description: form.description || null,
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
      setMessage('Saved successfully');
      setTimeout(() => setMessage(null), 2000);
      if (props.onSave) props.onSave(updated);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function del() {
    if (!admin) return setError('You do not have permission to delete this apartment');
    if (!confirm('Delete apartment?')) return;
    try {
      await ApartmentsAPI.remove(apartment.id);
      setOpenId(null);
      if (props.onDelete) props.onDelete(apartment.id);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Delete failed');
    }
  }

  return (
    <AnimatePresence>
      {openId != null && (
        <motion.div className="fr-modal-root" initial="hidden" animate="visible" exit="hidden">
          <motion.div
            className="fr-modal-backdrop"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setOpenId(null)}
            aria-hidden="true"
          />
          <motion.div
            className="fr-modal-sheet"
            role="dialog"
            aria-modal="true"
            variants={sheet}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="fr-modal-header">
              <h5 className="fr-modal-title">Apartment — {apartment ? (apartment.title || `#${apartment.id}`) : 'Loading...'}</h5>
              <button className="btn-close" onClick={() => setOpenId(null)} aria-label="Close"></button>
            </div>

            <div className="fr-modal-body">
              {loading && !apartment && <div className="text-center py-4">Loading...</div>}

              {message && <Alert type="success">{message}</Alert>}
              {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

              {apartment && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input className="form-control" disabled={!admin} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" disabled={!admin} rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Price</label>
                      <input type="number" className="form-control" disabled={!admin} value={form.price ?? ''} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Bedrooms</label>
                      <input type="number" className="form-control" disabled={!admin} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Bathrooms</label>
                      <input type="number" className="form-control" disabled={!admin} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Sqft</label>
                      <input type="number" className="form-control" disabled={!admin} value={form.sqft} onChange={e => setForm({ ...form, sqft: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Available</label>
                      <select className="form-select" disabled={!admin} value={form.available ? 'true' : 'false'} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Address</label>
                      <input className="form-control" disabled={!admin} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Latitude</label>
                      <input className="form-control" disabled={!admin} value={form.latitude ?? ''} onChange={e => setForm({ ...form, latitude: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Longitude</label>
                      <input className="form-control" disabled={!admin} value={form.longitude ?? ''} onChange={e => setForm({ ...form, longitude: e.target.value })} />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">Community</label>
                      <input className="form-control" disabled={!admin} value={form.communityId} onChange={e => setForm({ ...form, communityId: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Community Name</label>
                      <input className="form-control" value={apartment.communityName || ''} readOnly />
                    </div>
                  </div>

                  <div className="mt-3 text-muted small">ID: {apartment.id}</div>
                </>
              )}
            </div>

            <div className="fr-modal-footer">
              {admin ? (
                <>
                  <button className="btn btn-danger me-auto" onClick={del}>Delete</button>
                  <button className="btn btn-secondary" onClick={() => setOpenId(null)}>Close</button>
                  <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</button>
                </>
              ) : (
                <>
                  <div className="me-auto text-muted small">Read-only</div>
                  <button className="btn btn-secondary" onClick={() => setOpenId(null)}>Close</button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ApartmentModel;
