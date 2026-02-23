/**
 * One-off script: fetches top 10 violating addresses per borough from NYC Open Data,
 * writes src/data/topAddresses.json. Run with: node scripts/fetch-top-addresses.mjs
 * Re-run when you want to refresh the static data.
 */

const ODATA_BASE = 'https://data.cityofnewyork.us/api/odata/v4/wvxf-dwi5';
const SELECT = 'violationid,boro,housenumber,streetname,class,violationstatus,inspectiondate,novdescription,rentimpairing,latitude,longitude,nta';
const BOROUGHS = ['MANHATTAN', 'BROOKLYN', 'QUEENS', 'BRONX', 'STATEN ISLAND'];

function addressKey(v) {
  return `${(v.housenumber ?? '').trim()}|${(v.streetname ?? '').trim()}`;
}

function getTop10(violations, boro) {
  const counts = new Map();
  for (const v of violations) {
    const key = addressKey(v);
    const hn = (v.housenumber ?? '').trim();
    const sn = (v.streetname ?? '').trim();
    if (!counts.has(key)) counts.set(key, { housenumber: hn, streetname: sn, count: 0 });
    counts.get(key).count++;
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ housenumber, streetname, count }) => ({ boro, housenumber, streetname, count }));
}

async function fetchAllForBorough(borough) {
  const all = [];
  let url = `${ODATA_BASE}?$top=50000&$select=${SELECT}&$filter=${encodeURIComponent("boro eq '" + borough + "'")}`;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    all.push(...(data.value || []));
    url = data['@odata.nextLink'] || null;
  }
  return all;
}

async function main() {
  const data = {};
  for (const boro of BOROUGHS) {
    console.error(`Fetching ${boro}...`);
    const violations = await fetchAllForBorough(boro);
    data[boro] = getTop10(violations, boro);
    console.error(`  ${violations.length} records → top 10`);
  }
  const lastUpdated = new Date().toISOString().slice(0, 10);
  const out = { lastUpdated, data };
  const fs = await import('fs');
  const path = await import('path');
  const outPath = path.join(process.cwd(), 'src', 'data', 'topAddresses.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.error(`Wrote ${outPath} (lastUpdated: ${lastUpdated})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
