import { FilterPanel } from './FilterPanel';
import { useMapStore } from '../../store/mapStore';

export function Sidebar() {
  const visibleCount = useMapStore((s) => s.visibleCount);

  return (
    <aside className="sidebar" aria-label="Filter controls">
      <div className="sidebar-header">
        <h1 className="sidebar-title">NYC Housing Violations</h1>
        <p className="sidebar-subtitle">Maintenance Code Violations Map</p>
        <p className="sidebar-visible-count" aria-live="polite">
          <span className="sidebar-visible-count-num">{visibleCount.toLocaleString()}</span>
          {' '}
          visible in map
        </p>
      </div>
      <FilterPanel />
    </aside>
  );
}
