interface FilterField {
  key: string;
  label: string;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function FilterBar({ fields, values, onChange }: FilterBarProps) {
  return (
    <div className="filters-bar">
      {fields.map((field) => {
        if (field.type === 'select') {
          return (
            <select
              key={field.key}
              className="filter-input"
              value={values[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
            >
              <option value="">{field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        return (
          <input
            key={field.key}
            type="text"
            className="filter-input"
            placeholder={field.label}
            value={values[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      })}
    </div>
  );
}
