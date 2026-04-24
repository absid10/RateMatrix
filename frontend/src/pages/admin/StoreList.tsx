import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import StarRating from '../../components/StarRating';
import { Store } from '../../types';

export default function AdminStoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Record<string, string>>({
    name: '',
    email: '',
    address: '',
  });

  const fetchStores = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      const res = await api.get('/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'overall_rating',
      label: 'Rating',
      render: (store: Store) => (
        <div className="overall-rating">
          <StarRating value={Math.round(store.overall_rating)} readonly />
          <span className="rating-value">
            {Number(store.overall_rating).toFixed(1)}
          </span>
        </div>
      ),
    },
  ];

  const filterFields = [
    { key: 'name', label: 'Search by name...' },
    { key: 'email', label: 'Search by email...' },
    { key: 'address', label: 'Search by address...' },
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Stores</h1>
        <Link to="/admin/stores/add" className="btn btn-primary">
          + Add Store
        </Link>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
      />

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading stores...</p>
      ) : (
        <SortableTable
          columns={columns}
          data={stores}
          emptyMessage="No stores registered yet."
        />
      )}
    </div>
  );
}
