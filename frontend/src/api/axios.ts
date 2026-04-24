import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach token to every request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('ratematrix_auth');
  if (raw) {
    try {
      const auth = JSON.parse(raw);
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch {
      // corrupted storage, ignore
    }
  }
  return config;
});

// redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ratematrix_auth');
      // only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
