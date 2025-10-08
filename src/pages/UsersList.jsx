// src/pages/UsersList.jsx
import React, { useEffect, useState } from 'react';
import { UsersAPI } from '../api';
import { isAdmin } from '../api/auth';
import { Navigate } from 'react-router-dom';
import useRevealOnScroll from '../hooks/useRevealOnScroll';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const admin = isAdmin();

  // enable reveal behavior
  useRevealOnScroll();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await UsersAPI.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  if (!admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h2 className="reveal">All Users</h2>

      {loading ? (
        <div className="text-muted mt-3">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-muted mt-3">No users found.</div>
      ) : (
        <div className="row mt-3 g-3">
          {users.map((u) => (
            <div key={u.id} className="col-sm-6 col-md-4 col-lg-3 reveal">
              <div className="card user-card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-1">{u.username || 'Unnamed User'}</h6>
                  <div className="text-muted small mb-2">{u.email || 'No email'}</div>

                  <div className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
                    {Array.isArray(u.roles) ? u.roles.join(', ') : u.roles || 'USER'}
                  </div>

                  <div className="text-muted small">ID: {u.id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
