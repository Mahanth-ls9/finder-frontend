// src/pages/UsersList.jsx
import React, { useEffect, useState } from 'react';
import { UsersAPI } from '../api';
import { isAdmin } from '../api/auth';
import { Navigate } from 'react-router-dom';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const admin = isAdmin();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await UsersAPI.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to load users');
    }
  }

  // Redirect non-admins away from this page
  if (!admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h2>Users</h2>
      <div className="row mt-3 g-3">
        {users.length === 0 && <div className="text-muted">No users found</div>}
        {users.map(u => (
          <div key={u.id} className="col-sm-6 col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="fw-bold">{u.username || u.email}</div>
                <div className="text-muted small">ID: {u.id}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
