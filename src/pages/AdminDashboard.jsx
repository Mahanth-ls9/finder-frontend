// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UsersAPI, ApartmentsAPI } from '../api';
import { isAdmin } from '../api/auth';
import Alert from '../components/Alert';

/*
Admin dashboard:
- Create user (role dropdown -> sends roles array)
- Reset user password (admin only)
- Bulk upload apartments (CSV)
*/

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { error: 'Empty file', rows: [] };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const parts = line.split(',').map(p => p.trim());
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = parts[i] !== undefined ? parts[i] : '';
    }
    return obj;
  });
  return { headers, rows };
}

function normalizeApartmentRow(row) {
  const toNum = v => (v === '' || v == null) ? null : Number(v);
  const availableVal = (v) => {
    if (v == null || v === '') return false;
    const s = String(v).trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes';
  };

  return {
    title: row.title || null,
    apartmentNumber: row.apartmentNumber || null,
    communityId: row.communityId === '' ? null : (isNaN(Number(row.communityId)) ? row.communityId : Number(row.communityId)),
    price: toNum(row.price),
    bedrooms: toNum(row.bedrooms),
    bathrooms: toNum(row.bathrooms),
    sqft: toNum(row.sqft),
    address: row.address || null,
    available: availableVal(row.available),
    latitude: toNum(row.latitude),
    longitude: toNum(row.longitude),
  };
}

export default function AdminDashboard() {
  const admin = isAdmin();

  // Create user state
  const [uform, setUform] = useState({ username: '', email: '', password: '', role: '' });
  const [uLoading, setULoading] = useState(false);
  const [uMessage, setUMessage] = useState(null);
  const [uError, setUError] = useState(null);

  // Reset password state
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  // CSV upload state
  const [csvInfo, setCsvInfo] = useState({ filename: '', headers: [], rows: [] });
  const [csvError, setCsvError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ total: 0, success: 0, failed: 0 });
  const [failedRows, setFailedRows] = useState([]);

  // guard access
  if (!admin) return <Navigate to="/" replace />;

  // load users for reset dropdown
  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      try {
        const data = await UsersAPI.list();
        if (!mounted) return;
        setUsersList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Failed to load users for admin dashboard', e);
        setUsersList([]);
      }
    }
    loadUsers();
    return () => { mounted = false; };
  }, []);

  // ---------- create user ----------
  async function handleCreateUser(e) {
    e.preventDefault();
    setULoading(true);
    setUError(null);
    setUMessage(null);

    try {
      // requestedRoles: send as array and default to USER
      const requestedRoles = uform.role && uform.role.trim() !== ''
        ? [uform.role.trim().toUpperCase()]
        : ['USER'];

      await UsersAPI.adminRegister({
        username: uform.username,
        email: uform.email,
        password: uform.password,
        roles: requestedRoles
      });

      setUMessage(`User created successfully as ${requestedRoles.join(', ')}`);
      setUform({ username: '', email: '', password: '', role: '' });

      // refresh user list for reset dropdown
      try {
        const data = await UsersAPI.list();
        setUsersList(Array.isArray(data) ? data : []);
      } catch (_) { /* ignore */ }

      setTimeout(() => setUMessage(null), 3000);
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || err?.message || 'Create user failed';
      setUError(message);
    } finally {
      setULoading(false);
    }
  }

  // ---------- reset password ----------
  function validatePassword(pw) {
    if (!pw || pw.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!selectedUserId) {
      setResetError('Please select a user');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    const v = validatePassword(newPassword);
    if (v) {
      setResetError(v);
      return;
    }
    if (!confirm(`Reset password for user ID ${selectedUserId}? This will change their login password.`)) return;

    setResetting(true);
    try {
      await UsersAPI.resetPassword(selectedUserId, { newPassword });
      setResetSuccess('Password reset successfully');
      setSelectedUserId('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setResetSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      const m = err?.response?.data?.message || err?.message || 'Password reset failed';
      setResetError(m);
    } finally {
      setResetting(false);
    }
  }

  // ---------- CSV upload ----------
  function handleFileChange(e) {
    setCsvError(null);
    setCsvInfo({ filename: '', headers: [], rows: [] });
    setFailedRows([]);
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setCsvInfo(prev => ({ ...prev, filename: f.name }));
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const { headers, rows, error } = parseCSV(String(text));
      if (error) {
        setCsvError(error);
        return;
      }
      setCsvInfo({ filename: f.name, headers: headers || [], rows: rows || [] });
    };
    reader.onerror = () => { setCsvError('Failed to read file'); };
    reader.readAsText(f);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setCsvError(null);
    setFailedRows([]);
    const rows = csvInfo.rows || [];
    if (!rows.length) {
      setCsvError('No rows parsed from file');
      return;
    }

    // Basic header validation (optional)
    const required = ['title','apartmentNumber','communityId'];
    const missing = required.filter(h => !csvInfo.headers.includes(h));
    if (missing.length > 0) {
      setCsvError(`Missing required column(s): ${missing.join(', ')}`);
      return;
    }

    if (!confirm(`Upload ${rows.length} apartments? This cannot be undone.`)) return;

    setUploading(true);
    setProgress({ total: rows.length, success: 0, failed: 0 });

    const normalized = rows.map(normalizeApartmentRow);

    try {
      if (ApartmentsAPI.batchCreateWithCommunity) {
        await ApartmentsAPI.batchCreateWithCommunity({ apartments: normalized });
        setProgress({ total: rows.length, success: rows.length, failed: 0 });
        setCsvInfo({ filename: '', headers: [], rows: [] });
        setUploading(false);
        alert('Bulk upload completed successfully');
        return;
      }
    } catch (err) {
      console.warn('batchCreateWithCommunity failed, falling back to chunked:', err);
    }

    const chunkSize = 30;
    let successCount = 0;
    const failures = [];

    for (let i = 0; i < normalized.length; i += chunkSize) {
      const chunk = normalized.slice(i, i + chunkSize);
      try {
        const sameCommunity = chunk.every(r => r.communityId === chunk[0].communityId);
        if (sameCommunity && ApartmentsAPI.batchByCommunity) {
          await ApartmentsAPI.batchByCommunity(chunk[0].communityId, chunk);
          successCount += chunk.length;
        } else {
          for (let j = 0; j < chunk.length; j++) {
            try {
              await ApartmentsAPI.create(chunk[j]);
              successCount++;
            } catch (e) {
              failures.push({ index: i + j, row: rows[i + j], error: e?.response?.data?.message || e.message || String(e) });
            }
          }
        }
      } catch (e) {
        for (let j = 0; j < chunk.length; j++) {
          try {
            await ApartmentsAPI.create(chunk[j]);
            successCount++;
          } catch (er) {
            failures.push({ index: i + j, row: rows[i + j], error: er?.response?.data?.message || er.message || String(er) });
          }
        }
      }
      setProgress(prev => ({ ...prev, success: successCount, failed: failures.length }));
    }

    setFailedRows(failures);
    setUploading(false);
    if (failures.length === 0) {
      alert(`All ${successCount} apartments uploaded successfully`);
      setCsvInfo({ filename: '', headers: [], rows: [] });
    } else {
      alert(`${successCount} succeeded, ${failures.length} failed. See details on page.`);
    }
  }

  // ---------- UI ----------
  return (
    <div>
      <h2>Admin Dashboard</h2>

      {/* Create user */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Create User</h5>
          {uMessage && <Alert type="success">{uMessage}</Alert>}
          {uError && <Alert type="danger" onClose={() => setUError(null)}>{uError}</Alert>}
          <form onSubmit={handleCreateUser} className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Username</label>
              <input className="form-control" value={uform.username} onChange={e => setUform({...uform, username: e.target.value})} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={uform.email} onChange={e => setUform({...uform, email: e.target.value})} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={uform.password} onChange={e => setUform({...uform, password: e.target.value})} required />
            </div>

            <div className="col-md-2">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={uform.role}
                onChange={e => setUform({ ...uform, role: e.target.value })}
              >
                <option value="">USER (default)</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="col-md-1 d-grid">
              <button className="btn btn-primary" type="submit" disabled={uLoading}>{uLoading ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Reset password */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Reset user password</h5>
          {resetSuccess && <Alert type="success">{resetSuccess}</Alert>}
          {resetError && <Alert type="danger" onClose={() => setResetError(null)}>{resetError}</Alert>}
          <form onSubmit={handleResetPassword} className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Select user</label>
              <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                <option value="">-- select a user --</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.username || u.email} (ID: {u.id})</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">New password</label>
              <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>

            <div className="col-md-3">
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>

            <div className="col-md-2 d-grid">
              <button className="btn btn-warning" type="submit" disabled={resetting}>{resetting ? 'Resetting...' : 'Reset password'}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Bulk upload apartments */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Bulk upload apartments (CSV)</h5>
          {csvError && <Alert type="danger" onClose={() => setCsvError(null)}>{csvError}</Alert>}
          <div className="mb-3">
            <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
            <div className="form-text">CSV header: title,apartmentNumber,communityId,price,bedrooms,bathrooms,sqft,address,available,latitude,longitude</div>
          </div>

          {csvInfo.filename && (
            <div className="mb-3">
              <strong>File:</strong> {csvInfo.filename} • <strong>Rows:</strong> {csvInfo.rows.length} • <strong>Columns:</strong> {csvInfo.headers.join(', ')}
            </div>
          )}

          {csvInfo.rows.length > 0 && (
            <>
              <div className="mb-2">
                <small className="text-muted">Preview (first 5 rows)</small>
                <div style={{ maxHeight: 220, overflow: 'auto' }}>
                  <table className="table table-sm">
                    <thead>
                      <tr>{csvInfo.headers.map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {csvInfo.rows.slice(0,5).map((r,i) => (
                        <tr key={i}>
                          {csvInfo.headers.map(h => <td key={h}>{r[h]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="d-flex gap-2 align-items-center">
                <button className="btn btn-success" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload all'}</button>
                <button className="btn btn-secondary" onClick={() => { setCsvInfo({ filename: '', headers: [], rows: [] }); setFailedRows([]); }}>Clear</button>
                <div className="ms-auto text-muted">
                  {uploading ? `Progress: ${progress.success}/${progress.total} success, ${progress.failed} failed` : ''}
                </div>
              </div>
            </>
          )}

          {failedRows.length > 0 && (
            <div className="mt-3">
              <h6>Failed rows</h6>
              <div style={{ maxHeight: 220, overflow: 'auto' }}>
                <table className="table table-sm table-bordered">
                  <thead><tr><th>#</th><th>Error</th><th>Row data</th></tr></thead>
                  <tbody>
                    {failedRows.map(f => (
                      <tr key={f.index}>
                        <td>{f.index + 1}</td>
                        <td>{String(f.error)}</td>
                        <td><pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(f.row, null, 0)}</pre></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
