// src/api/index.js
import axios from 'axios';
import { getToken } from './auth';

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Add interceptor to attach Authorization header from auth.getToken()
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// error wrapper unchanged...
function handleError(err) {
  if (err.response) {
    const msg = err.response.data?.message || err.response.statusText || 'API error';
    return { error: true, status: err.response.status, message: msg, data: err.response.data };
  }
  return { error: true, message: err.message || 'Network error' };
}

// ...export your APIs exactly as before but using this `api` instance.
export const CommunitiesAPI = {
  list: async () => {
    try { const r = await api.get('/communities'); return r.data; }
    catch (e) { throw handleError(e); }
  },
  get: async (id) => {
    try { const r = await api.get(`/communities/${id}`); return r.data; }
    catch (e) { throw handleError(e); }
  },
  create: async (payload) => {
    try { const r = await api.post('/communities', payload); return r.data; }
    catch (e) { throw handleError(e); }
  },
  update: async (id, payload) => {
    try { const r = await api.put(`/communities/${id}`, payload); return r.data; }
    catch (e) { throw handleError(e); }
  },
  remove: async (id) => {
    try { const r = await api.delete(`/communities/${id}`); return r.data; }
    catch (e) { throw handleError(e); }
  }
};

export const ApartmentsAPI = {
  list: async () => {
    try { const r = await api.get('/apartments'); return r.data; }
    catch (e) { throw handleError(e); }
  },
  get: async (id) => {
    try { const r = await api.get(`/apartments/${id}`); return r.data; }
    catch (e) { throw handleError(e); }
  },
  create: async (payload) => {
    try { const r = await api.post('/apartments', payload); return r.data; }
    catch (e) { throw handleError(e); }
  },
  update: async (id, payload) => {
    try { const r = await api.put(`/apartment/${id}`, payload); return r.data; }
    catch (e) { throw handleError(e); }
  },
  remove: async (id) => {
    try { const r = await api.delete(`/apartments/${id}`); return r.data; }
    catch (e) { throw handleError(e); }
  },
  listByCommunity: async (communityId) => {
    try { const r = await api.get(`/apartments/community/${communityId}`); return r.data; }
    catch (e) { throw handleError(e); }
  },
  batchByCommunity: async (communityId, payload) => {
    try { const r = await api.post(`/apartments/batch/${communityId}`, payload); return r.data; }
    catch (e) { throw handleError(e); }
  },
  batchCreateWithCommunity: async (payload) => {
    try { const r = await api.post('/apartments/batch/create-with-community', payload); return r.data; }
    catch (e) { throw handleError(e); }
  }
};

export const UsersAPI = {
  list: async () => {
    try { const r = await api.get('/users'); return r.data; }
    catch (e) { throw handleError(e); }
  },
  get: async (id) => {
    try { const r = await api.get(`/users/${id}`); return r.data; }
    catch (e) { throw handleError(e); }
  },
  register: async (payload) => {
    try { const r = await api.post('/users/register', payload); return r.data; }
    catch (e) { throw handleError(e); }
  },
  adminRegister: async (payload) => {
    try { const r = await api.post('/users/adminregistration', payload); return r.data; }
    catch (e) { throw handleError(e); }
  }
};
