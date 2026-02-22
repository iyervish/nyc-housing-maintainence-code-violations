import { MapView } from './components/MapView/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { LoadingProgress } from './components/Controls/LoadingProgress';
import { useViolations } from './hooks/useViolations';

export default function App() {
  const { geojson, loading, error, recordCount } = useViolations();

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ position: 'relative', flex: 1 }}>
        <MapView geojson={geojson} />
        <div className="controls-overlay">
          <LoadingProgress loading={loading} recordCount={recordCount} error={error} />
        </div>
      </div>
    </div>
  );
}
