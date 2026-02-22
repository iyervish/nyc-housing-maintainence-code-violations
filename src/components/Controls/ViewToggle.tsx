import type { MapViewMode } from '../../types/violation';

interface ViewToggleProps {
  viewMode: MapViewMode;
  onChange: (mode: MapViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="group" aria-label="Map view mode">
      <button
        type="button"
        className={`toggle-btn ${viewMode === 'heatmap' ? 'toggle-btn--active' : ''}`}
        onClick={() => onChange('heatmap')}
        aria-pressed={viewMode === 'heatmap'}
      >
        Heatmap
      </button>
      <button
        type="button"
        className={`toggle-btn ${viewMode === 'clusters' ? 'toggle-btn--active' : ''}`}
        onClick={() => onChange('clusters')}
        aria-pressed={viewMode === 'clusters'}
      >
        Clusters
      </button>
    </div>
  );
}
