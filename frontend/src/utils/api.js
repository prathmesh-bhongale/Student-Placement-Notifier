import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Session expired -> clear it and send the user to the right login page
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      let role = null;
      try { role = JSON.parse(localStorage.getItem('user'))?.role; } catch { /* ignore */ }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = role === 'admin' ? '/admin/login' : '/student/login';
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err) => {
  if (!err.response) return 'Cannot reach the server. Is the backend running?';
  const d = err.response.data;
  if (d?.errors?.length && d.message === 'Validation failed') return d.errors.map((e) => e.message).join('. ');
  return d?.message || 'Something went wrong';
};

// Push backend field errors into react-hook-form
export const applyServerErrors = (err, setError) => {
  const list = err.response?.data?.errors;
  if (!Array.isArray(list)) return;
  list.forEach((e) => {
    const field = String(e.field || '').replace(/^eligibilityCriteria\./, '');
    if (field && field !== 'eligibility') setError(field, { type: 'server', message: e.message });
  });
};

export default api;
