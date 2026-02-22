import { BoroughFilter } from './BoroughFilter';
import { ClassFilter } from './ClassFilter';
import { StatusFilter } from './StatusFilter';

export function FilterPanel() {
  return (
    <section className="filter-panel" aria-label="Map filters">
      <BoroughFilter />
      <ClassFilter />
      <StatusFilter />
    </section>
  );
}
