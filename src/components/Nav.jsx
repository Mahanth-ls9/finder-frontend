// src/components/Nav.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, currentUser, isAdmin } from '../api/auth';

export default function Nav() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setUser(currentUser());
    setAdmin(isAdmin());
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg" style={{ background: 'black' }}>
      <div className="container container-max">
        <Link className="navbar-brand text-white fw-bold" to="/">Finder-UI-WS</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse">
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>
        <div className="collapse navbar-collapse" id="navCollapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {isAuthenticated() && (
              <>
                <li className="nav-item"><NavLink className="nav-link text-white" to="/apartments">Apartments</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link text-white" to="/communities">Communities</NavLink></li>
                {admin && <li className="nav-item"><NavLink className="nav-link text-white" to="/users">Users</NavLink></li>}
                <li className="nav-item d-flex align-items-center ms-3">
                  <span className="text-white me-2 small">{user?.username}</span>
                  <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
            {!isAuthenticated() && (
              <li className="nav-item">
                <NavLink className="nav-link text-white" to="/login">Login</NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
