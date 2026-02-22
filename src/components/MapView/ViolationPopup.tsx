import { Popup } from 'react-map-gl/maplibre';
import type { ViolationProperties } from '../../types/violation';
import { VIOLATION_CLASS_COLORS } from '../../constants/map';

interface ViolationPopupProps {
  longitude: number;
  latitude: number;
  properties: ViolationProperties;
  onClose: () => void;
}

export function ViolationPopup({
  longitude,
  latitude,
  properties,
  onClose,
}: ViolationPopupProps) {
  const classColor = VIOLATION_CLASS_COLORS[properties.class] ?? '#888';
  const address = `${properties.housenumber} ${properties.streetname}`;
  const date = properties.inspectiondate
    ? new Date(properties.inspectiondate).toLocaleDateString()
    : 'Unknown';

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      maxWidth="320px"
    >
      <div className="violation-popup" role="dialog" aria-label="Violation details">
        <div className="popup-header">
          <span
            className="popup-class-badge"
            style={{ backgroundColor: classColor }}
            aria-label={`Class ${properties.class} violation`}
          >
            Class {properties.class}
          </span>
          <span
            className={`popup-status ${properties.violationstatus === 'Open' ? 'status-open' : 'status-closed'}`}
          >
            {properties.violationstatus}
          </span>
        </div>
        <h3 className="popup-address">{address}</h3>
        <p className="popup-borough">{properties.boro}</p>
        <dl className="popup-details">
          <div className="popup-detail-row">
            <dt>Inspection Date</dt>
            <dd>{date}</dd>
          </div>
          {properties.rentimpairing === 'YES' && (
            <div className="popup-detail-row popup-rent-impairing">
              <dt>Rent Impairing</dt>
              <dd>Yes</dd>
            </div>
          )}
          <div className="popup-detail-row">
            <dt>Description</dt>
            <dd className="popup-description">{properties.novdescription}</dd>
          </div>
        </dl>
      </div>
    </Popup>
  );
}
