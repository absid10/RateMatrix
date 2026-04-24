import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import StarRating from '../../components/StarRating';
import { ApiError, Store, User } from '../../types';

export default function AdminStoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<Record<number, string>>({});
  const [assigningStoreId, setAssigningStoreId] = useState<number | null>(null);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Record<string, string>>({
    name: '',
    email: '',
    address: '',
  });

  const fetchOwners = useCallback(async () => {
    try {
      const res = await api.get<User[]>('/users', { params: { role: 'owner' } });
      setOwners(res.data);
    } catch (err) {
      console.error('Failed to fetch owners:', err);
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      const res = await api.get<Store[]>('/stores', { params });
      setStores(res.data);

      const nextSelected: Record<number, string> = {};
      res.data.forEach((store) => {
        nextSelected[store.id] = store.owner_id ? String(store.owner_id) : '';
      });
      setSelectedOwners(nextSelected);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchOwners();
  }, [fetchOwners]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleOwnerSelection(storeId: number, ownerId: string) {
    setSelectedOwners((prev) => ({ ...prev, [storeId]: ownerId }));
  }

  async function handleAssignOwner(storeId: number) {
    setAssignError('');
    setAssignSuccess('');

    const selectedOwner = selectedOwners[storeId] ?? '';
    const ownerId = selectedOwner ? Number.parseInt(selectedOwner, 10) : null;

    if (selectedOwner && Number.isNaN(ownerId)) {
      setAssignError('Please select a valid owner.');
      return;
    }

    setAssigningStoreId(storeId);
    try {
      await api.patch(`/stores/${storeId}/owner`, { owner_id: ownerId });
      setAssignSuccess(ownerId === null ? 'Store owner removed successfully.' : 'Store owner linked successfully.');
      await fetchStores();
    } catch (err: unknown) {
      const msg = axios.isAxiosError<ApiError>(err)
        ? err.response?.data?.message || err.response?.data?.errors?.[0]?.msg
        : undefined;
      setAssignError(msg || 'Failed to update store owner.');
    } finally {
      setAssigningStoreId(null);
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'owner_name',
      label: 'Owner',
      render: (store: Store) => store.owner_name || 'Unassigned',
    },
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
    {
      key: 'owner_link',
      label: 'Link Owner',
      sortable: false,
      render: (store: Store) => (
        <div className="owner-link-actions" onClick={(e) => e.stopPropagation()}>
          <select
            className="form-select owner-link-select"
            value={selectedOwners[store.id] ?? ''}
            onChange={(e) => handleOwnerSelection(store.id, e.target.value)}
            disabled={assigningStoreId === store.id}
          >
            <option value="">Unassigned</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              void handleAssignOwner(store.id);
            }}
            disabled={assigningStoreId === store.id}
          >
            {assigningStoreId === store.id ? 'Saving...' : 'Save'}
          </button>
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

      {assignError && <div className="alert alert-error">{assignError}</div>}
      {assignSuccess && <div className="alert alert-success">{assignSuccess}</div>}

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
