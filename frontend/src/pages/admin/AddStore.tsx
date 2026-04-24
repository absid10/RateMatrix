import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ApiError, User } from '../../types';

export default function AddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });
  const [owners, setOwners] = useState<User[]>([]);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // fetch store owners
  useEffect(() => {
    async function loadOwners() {
      try {
        const res = await api.get<User[]>('/users', { params: { role: 'owner' } });
        setOwners(res.data);
      } catch (err) {
        console.error('Failed to load owners:', err);
      }
    }
    loadOwners();
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 20) errs.name = 'Store name must be at least 20 characters.';
    if (form.name.length > 60) errs.name = 'Store name cannot exceed 60 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email.';
    if (!form.address.trim()) errs.address = 'Address is required.';
    if (form.address.length > 400) errs.address = 'Address too long (max 400).';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        owner_id: form.owner_id ? parseInt(form.owner_id) : null,
      };
      await api.post('/stores', payload);
      navigate('/admin/stores');
    } catch (err: unknown) {
      const msg = axios.isAxiosError<ApiError>(err)
        ? err.response?.data?.message || err.response?.data?.errors?.[0]?.msg
        : undefined;
      setApiError(msg || 'Failed to create store.');
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
        <h2 className="form-title">Add New Store</h2>
        <p className="form-subtitle">Register a new store on the platform.</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Store name (20-60 characters)"
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
              placeholder="store@example.com"
              required
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className={`form-textarea ${errors.address ? 'error' : ''}`}
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Store address (required, max 400 chars)"
              required
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Owner (Optional)</label>
            <select
              className="form-select"
              value={form.owner_id}
              onChange={(e) => handleChange('owner_id', e.target.value)}
            >
              <option value="">No owner assigned</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Store'}
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
