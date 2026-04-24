import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { DashboardStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatsCard label="Total Stores" value={stats.totalStores} icon="🏪" />
        <StatsCard label="Total Ratings" value={stats.totalRatings} icon="⭐" />
      </div>
    </div>
  );
}
