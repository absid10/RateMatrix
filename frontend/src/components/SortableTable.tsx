import { ReactNode, useState } from 'react';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function SortableTable<T extends object>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found.',
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (aVal instanceof Date && bVal instanceof Date) {
      const comparison = aVal.getTime() - bVal.getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    const comparison = typeof aVal === 'number' && typeof bVal === 'number'
      ? aVal - bVal
      : String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
              >
                {col.label}
                {col.sortable !== false && (
                  <span className={`sort-icon ${sortKey === col.key ? 'active' : ''}`}>
                    {sortKey === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(item)
                    : (() => {
                      const cellValue = (item as Record<string, unknown>)[col.key];
                      if (cellValue == null) return '—';
                      if (cellValue instanceof Date) return cellValue.toLocaleString();
                      return String(cellValue);
                    })()
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
