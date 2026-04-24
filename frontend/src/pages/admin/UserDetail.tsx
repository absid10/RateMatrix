import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { User } from '../../types';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-muted)' }}>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--danger)' }}>User not found.</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>User Details</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card">
        <div className="detail-grid">
          <span className="detail-label">Name</span>
          <span className="detail-value">{user.name}</span>

          <span className="detail-label">Email</span>
          <span className="detail-value">{user.email}</span>

          <span className="detail-label">Address</span>
          <span className="detail-value">{user.address || '—'}</span>

          <span className="detail-label">Role</span>
          <span className="detail-value">
            <span className={`role-badge ${user.role}`}>{user.role}</span>
          </span>
        </div>

        {/* Show store rating(s) if the user is a store owner */}
        {user.role === 'owner' && user.stores && user.stores.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
              Owned Stores
            </h3>
            {user.stores.map((store) => (
              <div key={store.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span>{store.name}</span>
                <div className="overall-rating">
                  <StarRating value={Math.round(store.avg_rating)} readonly size="1rem" />
                  <span className="rating-value">{Number(store.avg_rating).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
