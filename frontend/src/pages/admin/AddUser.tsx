import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ApiError } from '../../types';

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 20) errs.name = 'Name must be at least 20 characters.';
    if (form.name.length > 60) errs.name = 'Name cannot exceed 60 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email.';
    if (!form.address.trim()) errs.address = 'Address is required.';
    if (form.address.length > 400) errs.address = 'Address too long (max 400).';
    if (form.password.length < 8 || form.password.length > 16) errs.password = 'Password: 8-16 chars.';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Need at least 1 uppercase letter.';
    else if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]/`~;']/.test(form.password))
      errs.password = 'Need at least 1 special character.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/users', form);
      navigate('/admin/users');
    } catch (err: unknown) {
      const msg = axios.isAxiosError<ApiError>(err)
        ? err.response?.data?.message || err.response?.data?.errors?.[0]?.msg
        : undefined;
      setApiError(msg || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="page-container fade-in">
      <div className="form-card card">
        <h2 className="form-title">Add New User</h2>
        <p className="form-subtitle">Create admin, normal user, or store owner accounts.</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Full name (20-60 characters)"
              required
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="user@example.com"
              required
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="8-16 chars, 1 uppercase, 1 special"
              required
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className={`form-textarea ${errors.address ? 'error' : ''}`}
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="User address (required, max 400 chars)"
              required
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="owner">Store Owner</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
