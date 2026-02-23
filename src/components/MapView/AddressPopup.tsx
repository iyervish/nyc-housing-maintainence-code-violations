import { Popup } from 'react-map-gl/maplibre';
import type { ViolationProperties } from '../../types/violation';
import { VIOLATION_CLASS_COLORS } from '../../constants/map';

interface AddressPopupProps {
  longitude: number;
  latitude: number;
  violations: ViolationProperties[];
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

function formatDate(inspectiondate: string): string {
  return inspectiondate
    ? new Date(inspectiondate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';
}

export function AddressPopup({
  longitude,
  latitude,
  violations,
  onClose,
}: AddressPopupProps) {
  const list = Array.isArray(violations) ? violations : [];
  if (list.length === 0) return null;

  const first = list[0];
  if (!first) return null;
  const address = toTitleCase(`${first.housenumber ?? ''} ${first.streetname ?? ''}`.trim() || 'Unknown');
  const borough = toTitleCase(first.boro ?? '');

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      closeButton={false}
      maxWidth="360px"
      className="address-popup violation-popup"
    >
      <div
        className="popup-card address-popup-card"
        role="dialog"
        aria-label={`${list.length} violations at ${address}`}
      >
        <div className="popup-severity-stripe address-popup-stripe" />

        <div className="popup-top">
          <div className="address-popup-header">
            <p className="popup-address-line">{address}</p>
            <p className="popup-borough-line">{borough}</p>
            <p className="address-popup-count" aria-live="polite">
              {list.length} violation{list.length !== 1 ? 's' : ''} at this address
            </p>
          </div>
          <button
            className="popup-close-btn"
            onClick={onClose}
            aria-label="Close violation details"
          >
            ×
          </button>
        </div>

        <div className="popup-rule" />

        <ul className="address-popup-list" aria-label="Violations list">
          {list.map((v) => {
            const classColor = VIOLATION_CLASS_COLORS[v.class] ?? '#888';
            const isOpen = v.violationstatus === 'Open';
            const classLabel = CLASS_LABELS[v.class] ?? `Class ${v.class}`;
            return (
              <li
                key={v.violationid}
                className="address-popup-item"
                style={{ '--class-color': classColor } as React.CSSProperties}
              >
                <div className="address-popup-item-top">
                  <span
                    className="popup-grade-letter address-popup-grade"
                    aria-label={`Class ${v.class}`}
                  >
                    {v.class}
                  </span>
                  <span className={`popup-status-pill ${isOpen ? 'pill-open' : 'pill-closed'}`}>
                    <span className="pill-dot" aria-hidden="true" />
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="address-popup-item-meta">
                  <span className="popup-meta-key">Inspected</span>
                  <span className="popup-meta-val">{formatDate(v.inspectiondate)}</span>
                </div>
                {v.rentimpairing === 'YES' && (
                  <div className="popup-rent-flag" role="alert">
                    ⚠ Rent Impairing
                  </div>
                )}
                {v.novdescription && (
                  <p className="address-popup-desc" aria-label="Violation description">
                    {v.novdescription}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Popup>
  );
}
