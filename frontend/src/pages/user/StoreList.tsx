import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { Store } from '../../types';

export default function UserStoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [submitting, setSubmitting] = useState<number | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchName) params.name = searchName;
      if (searchAddress) params.address = searchAddress;
      const res = await api.get('/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchAddress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  async function handleRate(storeId: number, rating: number) {
    setSubmitting(storeId);
    try {
      await api.post('/ratings', { store_id: storeId, rating });
      // update local state
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, user_rating: rating } : s))
      );
      // refetch to update overall ratings
      fetchStores();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Browse Stores</h1>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          className="filter-input"
          placeholder="Search by address..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading stores...</p>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <p>No stores found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {stores.map((store) => (
            <div key={store.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
                  {store.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {store.address || 'No address listed'}
                </p>
                <div className="overall-rating">
                  <StarRating value={Math.round(store.overall_rating)} readonly size="1rem" />
                  <span className="rating-value">
                    {Number(store.overall_rating).toFixed(1)} ({store.total_ratings} ratings)
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {store.user_rating ? 'Your Rating' : 'Rate this store'}
                </p>
                <StarRating
                  value={store.user_rating || 0}
                  onChange={(rating) => handleRate(store.id, rating)}
                  size="1.5rem"
                />
                {submitting === store.id && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '4px' }}>
                    Saving...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
