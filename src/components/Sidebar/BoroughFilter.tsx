import { useFilterStore } from '../../store/filterStore';
import { BOROUGHS } from '../../constants/boroughs';

export function BoroughFilter() {
  const { borough, setBorough } = useFilterStore();

  return (
    <fieldset className="filter-fieldset">
      <legend className="filter-legend">Borough</legend>
      <div className="filter-options">
        {BOROUGHS.map(({ value, label }) => (
          <label key={value} className="filter-label">
            <input
              type="radio"
              name="borough"
              className="filter-checkbox"
              checked={borough === value}
              onChange={() => setBorough(value)}
              aria-label={`Filter by ${label}`}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
