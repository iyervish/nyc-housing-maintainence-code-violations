import { Routes, Route } from 'react-router-dom';
import { MapView } from './components/MapView/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { LoadingProgress } from './components/Controls/LoadingProgress';
import { useViolations } from './hooks/useViolations';
import { TopAddressesPage } from './pages/TopAddressesPage';

export default function App() {
  const { geojson, loading, error } = useViolations();

  return (
    <div className="app-layout">
      <Sidebar />
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ position: 'relative', flex: 1 }}>
              <MapView geojson={geojson} />
              <div className="controls-overlay">
                <LoadingProgress loading={loading} error={error} />
              </div>
            </div>
          }
        />
        <Route path="/top-addresses" element={<TopAddressesPage />} />
      </Routes>
    </div>
  );
}
