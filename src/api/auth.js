// src/api/auth.js
import axios from 'axios';

const TOKEN_KEY = 'jwt_token';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Use full backend URL so requests don't accidentally go to the Vite server
export async function login(username, password) {
  const res = await axios.post(`${API_BASE}/api/auth/login`, { username, password });
  const data = res.data;
  const token = data?.jwt ?? data?.token;
  if (!token) throw new Error('No token returned from server');
  saveToken(token);
  return data;
}

export const loginRequest = login;

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  setAuthHeader(token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  delete axios.defaults.headers.common['Authorization'];
}

export function setAuthHeader(token) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
}

export function logout() {
  clearToken();
}

// helpers
export function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    // atob can throw on padded / URL-safe base64; replace URL-safe chars first
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // pad base64 string if necessary
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const decoded = atob(padded);
    // decode URI component safely
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    return null;
  }
}

export function currentUser() {
  const t = getToken();
  if (!t) return null;
  const p = parseJwt(t);
  if (!p) return null;
  return { username: p.sub, roles: p.roles || [], exp: p.exp };
}

export function tokenExpired() {
  const p = parseJwt(getToken() || '');
  if (!p || !p.exp) return true;
  return p.exp * 1000 < Date.now();
}

export function isAuthenticated() {
  const t = getToken();
  if (!t) return false;
  if (tokenExpired()) {
    clearToken();
    return false;
  }
  return true;
}

// New helper: returns true if the token includes ADMIN role
export function isAdmin() {
  const t = getToken();
  if (!t) return false;
  const p = parseJwt(t);
  if (!p) return false;
  const roles = p.roles || [];
  // roles may be ["USER"] or ["ROLE_ADMIN"] etc.
  return roles.some(r => {
    const rr = String(r).toUpperCase();
    return rr === 'ADMIN' || rr === 'ROLE_ADMIN' || rr.includes('ADMIN');
  });
}
