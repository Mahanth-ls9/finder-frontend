import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApartmentsAPI } from '../api';
import Alert from '../components/Alert';

export default function ApartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // guard to avoid double-fetch in React StrictMode (dev)
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await ApartmentsAPI.get(id);
      setApartment(data);
      // seed form from returned object, keeping undefined -> ''
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
        communityName: data.communityName ?? '',
      });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load apartment');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setLoading(true);
    setError(null);
    try {
      // Prepare payload: cast numbers where appropriate, allow nullable values
      const payload = {
        ...apartment, // keep any server-side fields we don't display explicitly
        title: form.title,
        description: form.description || null,
        price: form.price === '' ? null : Number(form.price),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        sqft: Number(form.sqft || 0),
        available: !!form.available,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        address: form.address || null,
        communityId: form.communityId === '' ? null : Number(form.communityId),
      };

      const updated = await ApartmentsAPI.update(id, payload);
      setApartment(updated);
      // refresh form values from response (server may fill computed fields)
      setForm(prev => ({ ...prev,
        title: updated.title ?? prev.title,
        description: updated.description ?? prev.description,
        price: updated.price ?? prev.price,
        bedrooms: updated.bedrooms ?? prev.bedrooms,
        bathrooms: updated.bathrooms ?? prev.bathrooms,
        sqft: updated.sqft ?? prev.sqft,
        available: !!updated.available,
        latitude: updated.latitude ?? prev.latitude,
        longitude: updated.longitude ?? prev.longitude,
        address: updated.address ?? prev.address,
        communityId: updated.communityId ?? prev.communityId,
        communityName: updated.communityName ?? prev.communityName,
      }));
      setMessage('Saved successfully');
      setTimeout(()=>setMessage(null), 3000);
      setEditing(false);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this apartment?')) return;
    setLoading(true);
    setError(null);
    try {
      await ApartmentsAPI.remove(id);
      setMessage('Deleted');
      navigate('/apartments');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Delete failed');
      setLoading(false);
    }
  }

  if (loading && !apartment) return <div>Loading apartment...</div>;
  if (!apartment) return <div className="text-muted">Apartment not found</div>;

  return (
    <div>
      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      {/* Display card with full details */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h3 className="card-title">{apartment.title || `Apartment #${apartment.id}`}</h3>
            <p className="mb-1"><strong>Price:</strong> {apartment.price == null ? 'N/A' : apartment.price}</p>
            <p className="mb-1"><strong>Bedrooms:</strong> {apartment.bedrooms}</p>
            <p className="mb-1"><strong>Bathrooms:</strong> {apartment.bathrooms}</p>
            <p className="mb-1"><strong>Sqft:</strong> {apartment.sqft}</p>
            <p className="mb-1"><strong>Available:</strong> {apartment.available ? 'Yes' : 'No'}</p>
            <p className="mb-1"><strong>Address:</strong> {apartment.address ?? 'N/A'}</p>
            <p className="mb-1"><strong>Coordinates:</strong> {apartment.latitude ?? 'N/A'}, {apartment.longitude ?? 'N/A'}</p>
            <p className="mb-1"><strong>Community:</strong> {apartment.communityName ?? ('ID: ' + (apartment.communityId ?? 'N/A'))}</p>
            <div className="text-muted small mt-2">ID: {apartment.id}</div>
          </div>

          <div className="d-flex flex-column gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setEditing(s => !s)}>{editing ? 'Cancel' : 'Edit'}</button>
            <button className="btn btn-danger" onClick={remove}>Delete</button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">Edit apartment</h5>

            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
            </div>

            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">Price</label>
                <input type="number" className="form-control" value={form.price ?? ''} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>

              <div className="col-md-2">
                <label className="form-label">Bedrooms</label>
                <input type="number" className="form-control" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} />
              </div>

              <div className="col-md-2">
                <label className="form-label">Bathrooms</label>
                <input type="number" className="form-control" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} />
              </div>

              <div className="col-md-2">
                <label className="form-label">Sqft</label>
                <input type="number" className="form-control" value={form.sqft} onChange={e => setForm({ ...form, sqft: e.target.value })} />
              </div>

              <div className="col-md-3">
                <label className="form-label">Available</label>
                <select className="form-select" value={form.available ? 'true' : 'false'} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="row g-2 mt-3">
              <div className="col-md-6">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address ?? ''} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Latitude</label>
                <input className="form-control" value={form.latitude ?? ''} onChange={e => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Longitude</label>
                <input className="form-control" value={form.longitude ?? ''} onChange={e => setForm({ ...form, longitude: e.target.value })} />
              </div>
            </div>

            <div className="row g-2 mt-3">
              <div className="col-md-6">
                <label className="form-label">Community ID</label>
                <input className="form-control" value={form.communityId ?? ''} onChange={e => setForm({ ...form, communityId: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Community name</label>
                <input className="form-control" value={form.communityName ?? ''} readOnly />
              </div>
            </div>

            <div className="mt-3">
              <button className="btn btn-success me-2" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ // reset form to apartment values
                title: apartment.title ?? '',
                description: apartment.description ?? '',
                price: apartment.price ?? '',
                bedrooms: apartment.bedrooms ?? 0,
                bathrooms: apartment.bathrooms ?? 0,
                sqft: apartment.sqft ?? 0,
                available: apartment.available ?? false,
                latitude: apartment.latitude ?? '',
                longitude: apartment.longitude ?? '',
                address: apartment.address ?? '',
                communityId: apartment.communityId ?? '',
                communityName: apartment.communityName ?? '',
              }); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON for debugging (optional) */}
      <div className="card mt-3">
        <div className="card-body">
          <h6 className="card-subtitle mb-2 text-muted">Raw JSON</h6>
          <pre style={{ maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(apartment, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
