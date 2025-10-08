// src/components/Nav.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, currentUser, isAdmin } from '../api/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Nav() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(currentUser());
    setAdmin(isAdmin());
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // animation variants
  const linkVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, duration: 0.28 } })
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ background: 'black' }}>
      <div className="container container-max">
        <Link className="navbar-brand text-white fw-bold" to="/">Finder-UI-WS</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse" aria-expanded="false">
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navCollapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center">
            {isAuthenticated() && (
              <>
                {/* Animate links as a row of motion items */}
                <motion.li className="nav-item" initial="hidden" animate="visible" variants={{}}>
                  <motion.div custom={0} variants={linkVariants} className="d-inline-block">
                    <NavLink className="nav-link text-white" to="/apartments">Apartments</NavLink>
                  </motion.div>
                </motion.li>

                <motion.li className="nav-item" initial="hidden" animate="visible">
                  <motion.div custom={1} variants={linkVariants} className="d-inline-block">
                    <NavLink className="nav-link text-white" to="/communities">Communities</NavLink>
                  </motion.div>
                </motion.li>

                {admin && (
                  <motion.li className="nav-item" initial="hidden" animate="visible">
                    <motion.div custom={2} variants={linkVariants} className="d-inline-block">
                      <NavLink className="nav-link text-white" to="/users">Users</NavLink>
                    </motion.div>
                  </motion.li>
                )}

                {admin && (
                  <motion.li className="nav-item" initial="hidden" animate="visible">
                    <motion.div custom={3} variants={linkVariants} className="d-inline-block">
                      <NavLink className="nav-link text-white" to="/admin">Administration</NavLink>
                    </motion.div>
                  </motion.li>
                )}

                {/* user / logout area with a little animated dropdown */}
                <li className="nav-item ms-3 position-relative">
                  <div className="d-flex align-items-center">
                    <motion.button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => setMenuOpen(v => !v)}
                      whileTap={{ scale: 0.96 }}
                      aria-expanded={menuOpen}
                      aria-haspopup="true"
                    >
                      <span className="me-2">{user?.username}</span>
                      <small className="text-white">▾</small>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        className="dropdown-menu show p-2"
                        style={{ right: 0, left: 'auto', position: 'absolute', top: 'calc(100% + 8px)', minWidth: 180 }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={menuVariants}
                        onMouseLeave={() => setMenuOpen(false)}
                      >
                        <div className="px-2 py-1 small text-muted">Signed in as <strong>{user?.username}</strong></div>
                        <div className="dropdown-divider" />
                        <Link className="dropdown-item" to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                        <button className="dropdown-item" onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              </>
            )}

            {!isAuthenticated() && (
              <motion.li className="nav-item" initial="hidden" animate="visible">
                <motion.div custom={0} variants={linkVariants} className="d-inline-block">
                  <NavLink className="nav-link text-white" to="/login">Login</NavLink>
                </motion.div>
              </motion.li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
