import { BOROUGHS, BOROUGH_LABEL } from '../constants/boroughs';
import { LAST_UPDATED, TOP_ADDRESSES_BY_BOROUGH } from '../data/topAddresses';
import type { Borough } from '../types/violation';

function formatAddress(housenumber: string, streetname: string): string {
  const parts = [housenumber, streetname].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

function formatLastUpdated(iso: string): string {
  try {
    const d = new Date(iso + 'T12:00:00');
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function TopAddressesPage() {
  return (
    <div className="top-addresses-page">
      <header className="top-addresses-header">
        <h1 className="top-addresses-title">Top 10 Violating Addresses by Borough</h1>
        <p className="top-addresses-subtitle">
          Addresses with the most housing maintenance code violations in each borough
        </p>
        <p className="top-addresses-updated" aria-label="Data last updated">
          Last updated {formatLastUpdated(LAST_UPDATED)}
        </p>
      </header>

      <div className="top-addresses-content">
        {BOROUGHS.map(({ value }) => {
          const entries = TOP_ADDRESSES_BY_BOROUGH[value as Borough] ?? [];
          return (
            <section
              key={value}
              className="top-addresses-borough"
              aria-labelledby={`borough-${value}`}
            >
              <h2 id={`borough-${value}`} className="top-addresses-borough-title">
                {BOROUGH_LABEL[value as Borough]}
              </h2>
              {entries.length > 0 ? (
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
              ) : (
                <p className="top-addresses-empty">No data. Run <code>node scripts/fetch-top-addresses.mjs</code> to refresh.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
