import { Popup } from 'react-map-gl/maplibre';
import type { ViolationProperties } from '../../types/violation';
import { VIOLATION_CLASS_COLORS } from '../../constants/map';

interface ViolationPopupProps {
  longitude: number;
  latitude: number;
  properties: ViolationProperties;
  onClose: () => void;
}

const CLASS_LABELS: Record<string, string> = {
  A: 'Non-Hazardous',
  B: 'Hazardous',
  C: 'Immediately Hazardous',
};

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ViolationPopup({
  longitude,
  latitude,
  properties,
  onClose,
}: ViolationPopupProps) {
  const classColor = VIOLATION_CLASS_COLORS[properties.class] ?? '#888';
  const isOpen = properties.violationstatus === 'Open';
  const address = toTitleCase(`${properties.housenumber} ${properties.streetname}`);
  const borough = toTitleCase(properties.boro);
  const classLabel = CLASS_LABELS[properties.class] ?? `Class ${properties.class}`;
  const date = properties.inspectiondate
    ? new Date(properties.inspectiondate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      maxWidth="300px"
      className="violation-popup"
    >
      <div
        className="popup-card"
        role="dialog"
        aria-label="Violation details"
        style={{ '--class-color': classColor } as React.CSSProperties}
      >
        <div className="popup-severity-stripe" />

        <div className="popup-top">
          <div className="popup-grade-block">
            <span className="popup-grade-letter" aria-label={`Class ${properties.class}`}>
              {properties.class}
            </span>
            <span className="popup-grade-label">{classLabel}</span>
          </div>
          <span className={`popup-status-pill ${isOpen ? 'pill-open' : 'pill-closed'}`}>
            <span className="pill-dot" aria-hidden="true" />
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="popup-location">
          <p className="popup-address-line">{address}</p>
          <p className="popup-borough-line">{borough}</p>
        </div>

        <div className="popup-rule" />

        <div className="popup-meta">
          <div className="popup-meta-row">
            <span className="popup-meta-key">Inspected</span>
            <span className="popup-meta-val">{date}</span>
          </div>
          {properties.rentimpairing === 'YES' && (
            <div className="popup-rent-flag" role="alert">
              ⚠ Rent Impairing
            </div>
          )}
        </div>

        {properties.novdescription && (
          <div className="popup-desc" aria-label="Violation description">
            {properties.novdescription}
          </div>
        )}
      </div>
    </Popup>
  );
}
