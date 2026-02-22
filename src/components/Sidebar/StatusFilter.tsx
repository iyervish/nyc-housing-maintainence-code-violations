import { useFilterStore } from '../../store/filterStore';
import type { ViolationStatus } from '../../types/violation';

const STATUS_OPTIONS: { value: 'All' | ViolationStatus; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Open', label: 'Open' },
  { value: 'Close', label: 'Closed' },
];

export function StatusFilter() {
  const { status, setStatus } = useFilterStore();

  return (
    <fieldset className="filter-fieldset">
      <legend className="filter-legend">Status</legend>
      <div className="filter-options">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <label key={value} className="filter-label">
            <input
              type="radio"
              name="violation-status"
              className="filter-radio"
              checked={status === value}
              onChange={() => setStatus(value)}
              aria-label={`Show ${label} violations`}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
