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

// helpers (unchanged)
export function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
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
