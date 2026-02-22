import { BoroughFilter } from './BoroughFilter';
import { ClassFilter } from './ClassFilter';

export function FilterPanel() {
  return (
    <section className="filter-panel" aria-label="Map filters">
      <BoroughFilter />
      <ClassFilter />
    </section>
  );
}
