import { useState } from 'react';
import { MapView } from './components/MapView/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ViewToggle } from './components/Controls/ViewToggle';
import { LoadingProgress } from './components/Controls/LoadingProgress';
import { useViolations } from './hooks/useViolations';
import type { MapViewMode } from './types/violation';

export default function App() {
  const [viewMode, setViewMode] = useState<MapViewMode>('heatmap');
  const { geojson, loading, error, recordCount } = useViolations();

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ position: 'relative', flex: 1 }}>
        <MapView geojson={geojson} viewMode={viewMode} />
        <div className="controls-overlay">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <LoadingProgress loading={loading} recordCount={recordCount} error={error} />
        </div>
      </div>
    </div>
  );
}
