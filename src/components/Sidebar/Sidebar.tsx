import { FilterPanel } from './FilterPanel';

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Filter controls">
      <div className="sidebar-header">
        <h1 className="sidebar-title">NYC Housing Violations</h1>
        <p className="sidebar-subtitle">Maintenance Code Violations Map</p>
      </div>
      <FilterPanel />
    </aside>
  );
}
