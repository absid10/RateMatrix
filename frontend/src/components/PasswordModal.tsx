import { useState, FormEvent } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { ApiError } from '../types';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // client-side validation
    if (newPassword.length < 8 || newPassword.length > 16) {
      setError('New password must be 8-16 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('New password must include at least one uppercase letter.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]/`~;']/.test(newPassword)) {
      setError('New password must include at least one special character.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      setSuccess(res.data.message || 'Password updated!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = axios.isAxiosError<ApiError>(err)
        ? err.response?.data?.message || err.response?.data?.errors?.[0]?.msg
        : undefined;
      setError(msg || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Change Password</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8-16 chars, 1 uppercase, 1 special"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
