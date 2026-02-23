import type { ViolationRaw, TopAddressEntry, Borough } from '../types/violation';

function addressKey(v: ViolationRaw): string {
  return `${(v.housenumber ?? '').trim()}|${(v.streetname ?? '').trim()}`;
}

/**
 * From a list of violations (assumed all for the same borough), group by address,
 * count, sort by count descending, return top 10.
 */
export function getTop10Addresses(
  violations: ViolationRaw[],
  boro: Borough
): TopAddressEntry[] {
  const counts = new Map<string, { housenumber: string; streetname: string; count: number }>();

  for (const v of violations) {
    const key = addressKey(v);
    const existing = counts.get(key);
    const hn = (v.housenumber ?? '').trim();
    const sn = (v.streetname ?? '').trim();
    if (!existing) {
      counts.set(key, { housenumber: hn, streetname: sn, count: 1 });
    } else {
      existing.count += 1;
    }
  }

  const sorted = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return sorted.map(({ housenumber, streetname, count }) => ({
    boro,
    housenumber,
    streetname,
    count,
  }));
}
