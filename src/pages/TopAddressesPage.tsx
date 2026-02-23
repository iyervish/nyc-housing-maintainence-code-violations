import { useTopAddresses } from '../hooks/useTopAddresses';
import { BOROUGHS, BOROUGH_LABEL } from '../constants/boroughs';
import type { Borough } from '../types/violation';

function formatAddress(housenumber: string, streetname: string): string {
  const parts = [housenumber, streetname].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

export function TopAddressesPage() {
  const { topByBorough, loading, error, progress } = useTopAddresses();

  if (error) {
    return (
      <div className="top-addresses-page">
        <div className="top-addresses-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="top-addresses-page">
      <header className="top-addresses-header">
        <h1 className="top-addresses-title">Top 10 Violating Addresses by Borough</h1>
        <p className="top-addresses-subtitle">
          Addresses with the most housing maintenance code violations in each borough
        </p>
      </header>

      {loading && progress && (
        <div className="top-addresses-progress" aria-live="polite">
          <div className="top-addresses-progress-bar" />
          <p className="top-addresses-progress-text">
            Fetching {progress.currentBorough ? BOROUGH_LABEL[progress.currentBorough] : '…'} …
            {progress.count > 0 && ` ${progress.count.toLocaleString()} records`}
          </p>
          <p className="top-addresses-progress-meta">
            Borough {progress.boroughIndex} of {progress.totalBoroughs}
          </p>
        </div>
      )}

      <div className="top-addresses-content">
        {topByBorough &&
          BOROUGHS.map(({ value }) => {
            const entries = topByBorough[value as Borough];
            if (!entries?.length) return null;

            return (
              <section
                key={value}
                className="top-addresses-borough"
                aria-labelledby={`borough-${value}`}
              >
                <h2 id={`borough-${value}`} className="top-addresses-borough-title">
                  {BOROUGH_LABEL[value as Borough]}
                </h2>
                <ol className="top-addresses-list" start={1}>
                  {entries.map((entry, index) => (
                    <li key={`${entry.housenumber}-${entry.streetname}-${index}`} className="top-addresses-row">
                      <span className="top-addresses-rank" aria-hidden>{index + 1}</span>
                      <span className="top-addresses-address">
                        {formatAddress(entry.housenumber, entry.streetname)}
                      </span>
                      <span className="top-addresses-count">
                        {entry.count.toLocaleString()} violations
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
      </div>
    </div>
  );
}
