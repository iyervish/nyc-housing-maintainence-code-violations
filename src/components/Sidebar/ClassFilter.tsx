import { useFilterStore } from '../../store/filterStore';
import type { ViolationClass } from '../../types/violation';
import { VIOLATION_CLASS_COLORS } from '../../constants/map';

const CLASSES: { value: ViolationClass; label: string; description: string }[] = [
  { value: 'A', label: 'Class A', description: 'Non-hazardous' },
  { value: 'B', label: 'Class B', description: 'Hazardous' },
  { value: 'C', label: 'Class C', description: 'Immediately hazardous' },
];

export function ClassFilter() {
  const { classes, toggleClass } = useFilterStore();

  return (
    <fieldset className="filter-fieldset">
      <legend className="filter-legend">Violation Class</legend>
      <div className="filter-options">
        {CLASSES.map(({ value, label, description }) => (
          <label key={value} className="filter-label">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={classes.includes(value)}
              onChange={() => toggleClass(value)}
              aria-label={`Filter by ${label}: ${description}`}
            />
            <span
              className="class-dot"
              style={{ backgroundColor: VIOLATION_CLASS_COLORS[value] }}
              aria-hidden="true"
            />
            <span>
              {label}
              <span className="class-description"> — {description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
