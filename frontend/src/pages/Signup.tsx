import { useState, FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ApiError } from '../types';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateField(key: string, value: string): string {
    switch (key) {
      case 'name':
        if (value.length < 20) return 'Name must be at least 20 characters.';
        if (value.length > 60) return 'Name cannot exceed 60 characters.';
        return '';
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email.';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required.';
        if (value.length > 400) return 'Address cannot exceed 400 characters.';
        return '';
      case 'password':
        if (value.length < 8 || value.length > 16) return 'Password must be 8-16 characters.';
        if (!/[A-Z]/.test(value)) return 'Must include at least one uppercase letter.';
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]/`~;']/.test(value))
          return 'Must include at least one special character.';
        return '';
      default:
        return '';
    }
  }

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // validate in real-time
    const err = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: err }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');

    // validate all fields
    const newErrors: Record<string, string> = {};
    Object.entries(form).forEach(([key, val]) => {
      const err = validateField(key, val);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err: unknown) {
      const msg = axios.isAxiosError<ApiError>(err)
        ? err.response?.data?.message || err.response?.data?.errors?.[0]?.msg
        : undefined;
      setApiError(msg || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="logo">
          <h1>RateMatrix</h1>
          <p>Create your account</p>
          <p className="auth-note">Self-signup is for normal users only. Store-owner and admin accounts are created by administrators.</p>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              id="signup-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your full name (min 20 characters)"
              required
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="signup-email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              required
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              id="signup-address"
              className={`form-textarea ${errors.address ? 'error' : ''}`}
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Your address (max 400 chars)"
              required
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="signup-password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="8-16 chars, 1 uppercase, 1 special"
              required
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
