import { Routes, Route, useLocation } from 'react-router-dom';
import { MapView } from './components/MapView/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { LoadingProgress } from './components/Controls/LoadingProgress';
import { useViolations } from './hooks/useViolations';
import { TopAddressesPage } from './pages/TopAddressesPage';

interface FocusAddressState {
  housenumber: string;
  streetname: string;
  boro: string;
}

export default function App() {
  const { geojson, loading, error } = useViolations();
  const location = useLocation();
  const showSidebar = location.pathname === '/';
  const focusAddress = (location.state as { focusAddress?: FocusAddressState } | null)?.focusAddress ?? null;

  return (
    <div className="app-layout">
      {showSidebar && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ position: 'relative', flex: 1 }}>
              <MapView geojson={geojson} focusAddress={focusAddress} />
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
