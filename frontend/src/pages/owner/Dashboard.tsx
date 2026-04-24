import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import SortableTable from '../../components/SortableTable';
import { OwnerDashboardData, Rater } from '../../types';

export default function OwnerDashboard() {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get('/dashboard/owner');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load owner dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!data || data.stores.length === 0) {
    return (
      <div className="page-container fade-in">
        <div className="page-header">
          <h1>Store Owner Dashboard</h1>
        </div>
        <div className="empty-state">
          <p>You don't have any stores assigned yet. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  const raterColumns = [
    { key: 'name', label: 'User Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'rating',
      label: 'Rating',
      render: (rater: Rater) => (
        <StarRating value={rater.rating} readonly size="1rem" />
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (rater: Rater) => new Date(rater.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Store Owner Dashboard</h1>
      </div>

      {/* average rating hero */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '28px', padding: '32px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Your Average Rating
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <StarRating value={Math.round(data.averageRating)} readonly size="2rem" />
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--star-filled)' }}>
            {data.averageRating.toFixed(1)}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Based on {data.raters.length} rating{data.raters.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* raters table */}
      <h2 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Users Who Rated Your Store</h2>
      <SortableTable
        columns={raterColumns}
        data={data.raters}
        emptyMessage="No ratings submitted yet."
      />
    </div>
  );
}
