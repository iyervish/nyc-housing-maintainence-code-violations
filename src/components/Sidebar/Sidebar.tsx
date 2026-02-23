import { NavLink } from 'react-router-dom';
import { FilterPanel } from './FilterPanel';
import { useMapStore } from '../../store/mapStore';

export function Sidebar() {
  const visibleCount = useMapStore((s) => s.visibleCount);

  return (
    <aside className="sidebar" aria-label="Filter controls and navigation">
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
      <nav className="app-nav app-nav--bottom" aria-label="Main">
        <NavLink
          to="/top-addresses"
          className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
        >
          Top 10 Addresses
        </NavLink>
      </nav>
    </aside>
  );
}
