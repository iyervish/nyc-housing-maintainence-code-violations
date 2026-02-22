import { useFilterStore } from '../../store/filterStore';
import type { Borough } from '../../types/violation';

const BOROUGHS: { value: Borough; label: string }[] = [
  { value: 'MANHATTAN', label: 'Manhattan' },
  { value: 'BROOKLYN', label: 'Brooklyn' },
  { value: 'QUEENS', label: 'Queens' },
  { value: 'BRONX', label: 'Bronx' },
  { value: 'STATEN ISLAND', label: 'Staten Island' },
];

export function BoroughFilter() {
  const { boroughs, toggleBorough } = useFilterStore();

  return (
    <fieldset className="filter-fieldset">
      <legend className="filter-legend">Borough</legend>
      <div className="filter-options">
        {BOROUGHS.map(({ value, label }) => (
          <label key={value} className="filter-label">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={boroughs.includes(value)}
              onChange={() => toggleBorough(value)}
              aria-label={`Filter by ${label}`}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
