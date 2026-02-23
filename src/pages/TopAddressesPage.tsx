import { Link, useNavigate } from 'react-router-dom';
import { BOROUGHS, BOROUGH_LABEL } from '../constants/boroughs';
import { LAST_UPDATED, TOP_ADDRESSES_BY_BOROUGH } from '../data/topAddresses';
import type { Borough, TopAddressEntry } from '../types/violation';
import { useFilterStore } from '../store/filterStore';

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

// Order for known violation classes; unknown classes appended alphabetically after.
const CLASS_ORDER = ['A', 'B', 'C'];

function sortedClassEntries(classCounts: Record<string, number>): [string, number][] {
  const known = CLASS_ORDER.filter((c) => c in classCounts).map((c) => [c, classCounts[c]] as [string, number]);
  const unknown = Object.keys(classCounts)
    .filter((c) => !CLASS_ORDER.includes(c))
    .sort()
    .map((c) => [c, classCounts[c]] as [string, number]);
  return [...known, ...unknown];
}

export function TopAddressesPage() {
  const navigate = useNavigate();
  const setBorough = useFilterStore((s) => s.setBorough);

  function handleAddressClick(entry: TopAddressEntry) {
    setBorough(entry.boro);
    navigate('/', { state: { focusAddress: { housenumber: entry.housenumber, streetname: entry.streetname, boro: entry.boro } } });
  }

  return (
    <div className="top-addresses-page">
      <header className="top-addresses-header">
        <Link to="/" className="top-addresses-back">← Map</Link>
        <h1 className="top-addresses-title">Top 10 Violating Addresses by Borough</h1>
        <p className="top-addresses-subtitle">
          Addresses with the most open housing maintenance code violations in each borough
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
                  {entries.map((entry, index) => {
                    const classCounts = entry.classCounts as Record<string, number> | undefined;
                    const classEntries = classCounts ? sortedClassEntries(classCounts) : [];
                    return (
                      <li key={`${entry.housenumber}-${entry.streetname}-${index}`}>
                        <button
                          className="top-addresses-row"
                          onClick={() => handleAddressClick(entry)}
                          aria-label={`View ${formatAddress(entry.housenumber, entry.streetname)} on map`}
                        >
                          <span className="top-addresses-rank" aria-hidden="true">{index + 1}</span>
                          <span className="top-addresses-address">
                            {formatAddress(entry.housenumber, entry.streetname)}
                          </span>
                          <span className="top-addresses-count">
                            {entry.count.toLocaleString()} open
                          </span>
                          {classEntries.length > 0 && (
                            <span className="top-addresses-classes" aria-label="Open violations by class">
                              {classEntries.map(([cls, count]) => (
                                <span
                                  key={cls}
                                  className={`top-addresses-class top-addresses-class--${cls}`}
                                  aria-label={`Class ${cls}: ${count.toLocaleString()}`}
                                >
                                  {cls} {count.toLocaleString()}
                                </span>
                              ))}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
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
