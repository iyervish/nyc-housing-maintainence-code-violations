# NYC Housing Maintenance Code Violations Map

## Context
Build an interactive map visualizing NYC housing maintenance code violations from the NYC Open Data OData API. The map supports heatmap and clustered marker views with sidebar filters for borough, violation class, and open/closed status.

## Tech Stack
- **Vite + React + TypeScript** (strict mode)
- **Mapbox GL JS** via `react-map-gl` for the map
- **Zustand** for filter state
- **OData API**: `https://data.cityofnewyork.us/api/odata/v4/wvxf-dwi5`

## Setup Steps
1. `npm create vite@latest . -- --template react-ts` (in current dir, ignore `.claude` folder)
2. `npm install react-map-gl mapbox-gl zustand`
3. `npm install -D @types/mapbox-gl`
4. Create `.env` with `VITE_MAPBOX_TOKEN=<token>` and `.env.example` as template
5. Add `.env` to `.gitignore`

## File Structure
```
src/
├── main.tsx
├── App.tsx                          # Root layout, viewMode state
├── vite-env.d.ts                    # VITE_MAPBOX_TOKEN type augmentation
├── types/
│   └── violation.ts                 # ViolationRaw, FilterState, MapViewMode, etc.
├── constants/
│   └── map.ts                       # ODATA_BASE_URL, SOURCE_ID, LAYER_ID, colors
├── api/
│   └── violations.ts                # fetchAllViolations() with nextLink pagination
├── hooks/
│   └── useViolations.ts             # Fetching hook: abort, progress, geojson state
├── store/
│   └── filterStore.ts               # Zustand: boroughs, classes, status, actions
├── utils/
│   ├── odata.ts                     # buildODataFilter() → $filter string
│   └── geojson.ts                   # violationsToGeoJSON() → FeatureCollection
├── components/
│   ├── MapView/
│   │   ├── MapView.tsx              # react-map-gl Map, onClick routing, popup state
│   │   ├── HeatmapLayer.tsx         # Source + heatmap Layer (weighted by class A/B/C)
│   │   ├── ClusterLayer.tsx         # Source(cluster=true) + 3 layers + expansion click
│   │   └── ViolationPopup.tsx       # Popup with violation details
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── BoroughFilter.tsx        # Checkboxes: all 5 boroughs
│   │   ├── ClassFilter.tsx          # Checkboxes: A / B / C
│   │   └── StatusFilter.tsx         # Radio: All / Open / Closed
│   └── Controls/
│       ├── ViewToggle.tsx           # Heatmap / Clusters toggle buttons
│       └── LoadingProgress.tsx      # Indeterminate bar + live record count
└── styles/
    └── global.css                   # CSS vars, app-layout flex, map-container
```

## Key Implementation Details

### Data Fetching (`api/violations.ts`)
- Fetch `$top=5000` per batch, follow `@odata.nextLink` for subsequent pages
- Pass `AbortSignal` so filter changes cancel in-flight requests
- `$select` only required fields (violationid, boro, housenumber, streetname, class, violationstatus, inspectiondate, novdescription, rentimpairing, latitude, longitude, nta)

### OData Filter Builder (`utils/odata.ts`)
- Borough: `(boro eq 'MANHATTAN' or boro eq 'BROOKLYN')` (empty array = no filter)
- Class: `(class eq 'A' or class eq 'C')` (empty array = no filter)
- Status: `violationstatus eq 'Open'` (skipped if 'All')
- Always append: `latitude ne null and longitude ne null`

### Mapbox Layers
**Heatmap** (`HeatmapLayer.tsx`):
- Single `Source` + `heatmap` Layer
- `heatmap-weight` expression: C=3, B=2, A=1
- Blue (low density) → Red (high density) color ramp
- Fades out at zoom > 13 (where individual points become meaningful)

**Clusters** (`ClusterLayer.tsx`):
- `Source` with `cluster={true}`, `clusterMaxZoom={14}`, `clusterRadius={50}`
- 3 layers: cluster circles (color/size by `point_count`), count labels, unclustered points
- Unclustered point color: C=`#F44336` (red), B=`#FF9800` (orange), A=`#4CAF50` (green)
- Cluster click: `source.getClusterExpansionZoom()` → `map.easeTo()`
- Unclustered click: show `ViolationPopup`

### State Flow
```
User changes filter checkbox
  → Zustand store updates
  → useViolations re-runs (prev AbortController aborted)
  → buildODataFilter() → $filter query string
  → fetchAllViolations() paginating via nextLink
  → violationsToGeoJSON() → FeatureCollection
  → MapView re-renders with new data
```

### View Toggle
- `viewMode: MapViewMode` state lives in `App.tsx` (UI concern, doesn't trigger re-fetch)
- `MapView` conditionally renders `HeatmapLayer` or `ClusterLayer`
- Default: `'heatmap'`

## Critical Files
- `src/types/violation.ts` — all types; every other file depends on these
- `src/api/violations.ts` — pagination loop is most complex logic
- `src/utils/odata.ts` — wrong `$filter` syntax causes silent empty results
- `src/components/MapView/ClusterLayer.tsx` — Mapbox paint expressions most likely to need iteration
- `src/hooks/useViolations.ts` — orchestrates abort, progress, and GeoJSON conversion

## Verification
1. `npx tsc --noEmit` — zero errors
2. `npm run dev` — map loads centered on NYC
3. Network tab: filter changes cancel previous request, new `$filter` in URL
4. Heatmap default visible on load
5. Toggle to Clusters: colored circles with count badges appear
6. Click cluster → zoom in (expansion)
7. Click individual point → popup with details
8. Status "Open" filter → `violationstatus eq 'Open'` in request URL
9. Lighthouse accessibility audit passes
10. `.env` not committed; `.env.example` committed as template
