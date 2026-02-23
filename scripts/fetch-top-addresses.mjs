/**
 * One-off script: fetches top 10 violating addresses per borough from NYC Open Data,
 * writes src/data/topAddresses.json. Run with: node scripts/fetch-top-addresses.mjs
 * Re-run when you want to refresh the static data.
 */

const SOCRATA_BASE = 'https://data.cityofnewyork.us/resource/wvxf-dwi5.json';
const BOROUGHS = ['MANHATTAN', 'BROOKLYN', 'QUEENS', 'BRONX', 'STATEN ISLAND'];

async function fetchTop10ForBorough(borough) {
  const params = new URLSearchParams({
    '$select': 'boro,housenumber,streetname,count(*) as count',
    '$group': 'boro,housenumber,streetname',
    '$where': `boro='${borough}' AND violationstatus='Open'`,
    '$order': 'count DESC',
    '$limit': '10',
  });
  const url = `${SOCRATA_BASE}?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`);
  const rows = await res.json();
  return rows.map((row) => ({
    boro: row.boro,
    housenumber: (row.housenumber ?? '').trim(),
    streetname: (row.streetname ?? '').trim(),
    count: Number(row.count),
  }));
}

async function fetchClassCountsForAddress(boro, housenumber, streetname) {
  const params = new URLSearchParams({
    '$select': 'class,count(*) as count',
    '$group': 'class',
    '$where': `boro='${boro}' AND housenumber='${housenumber}' AND streetname='${streetname}' AND violationstatus='Open'`,
    '$limit': '10',
  });
  const url = `${SOCRATA_BASE}?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`);
  const rows = await res.json();
  const classCounts = {};
  for (const row of rows) {
    if (row.class) classCounts[row.class] = Number(row.count);
  }
  return classCounts;
}

async function main() {
  const data = {};
  for (const boro of BOROUGHS) {
    console.error(`Fetching ${boro}...`);
    const top10 = await fetchTop10ForBorough(boro);
    console.error(`  top address: ${top10[0]?.housenumber} ${top10[0]?.streetname} (${top10[0]?.count} violations)`);

    const enriched = [];
    for (const entry of top10) {
      const classCounts = await fetchClassCountsForAddress(entry.boro, entry.housenumber, entry.streetname);
      enriched.push({ ...entry, classCounts });
    }
    data[boro] = enriched;
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
