import { useFilterStore } from '../../store/filterStore';
import type { ViolationClass } from '../../types/violation';
import { VIOLATION_CLASS_COLORS } from '../../constants/map';

const CLASSES: { value: ViolationClass; label: string; description: string }[] = [
  { value: 'C', label: 'Class C', description: 'Immediately hazardous' },
  { value: 'B', label: 'Class B', description: 'Hazardous' },
  { value: 'A', label: 'Class A', description: 'Non-hazardous' },
];

export function ClassFilter() {
  const { violationClass, setViolationClass } = useFilterStore();

  return (
    <fieldset className="filter-fieldset">
      <legend className="filter-legend">Violation Class</legend>
      <div className="filter-options">
        {CLASSES.map(({ value, label, description }) => (
          <label key={value} className="filter-label">
            <input
              type="radio"
              name="violationClass"
              className="filter-checkbox"
              checked={violationClass === value}
              onChange={() => setViolationClass(value)}
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
