import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import { User } from '../../types';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Record<string, string>>({
    name: '',
    email: '',
    address: '',
    role: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => (
        <span className={`role-badge ${user.role}`}>{user.role}</span>
      ),
    },
  ];

  const filterFields = [
    { key: 'name', label: 'Search by name...' },
    { key: 'email', label: 'Search by email...' },
    { key: 'address', label: 'Search by address...' },
    {
      key: 'role',
      label: 'Normal/Admin (default)',
      type: 'select' as const,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'owner', label: 'Owner (optional)' },
      ],
    },
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Users (Normal and Admin)</h1>
        <Link to="/admin/users/add" className="btn btn-primary">
          + Add User
        </Link>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
      />

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
      ) : (
        <SortableTable
          columns={columns}
          data={users}
          onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
          emptyMessage="No users found."
        />
      )}
    </div>
  );
}
