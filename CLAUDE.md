# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (already running — don't start again)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npx tsc --noEmit   # Type-check only, no output
```

There are no tests in this project.

## Architecture

**Data flow (read this before touching any file):**

```
Zustand filterStore (boroughs, classes, status)
  → useViolations hook (re-runs on filter change, aborts previous fetch)
    → buildODataFilter() → $filter OData query string
    → fetchAllViolations() → paginated fetch via @odata.nextLink
    → violationsToGeoJSON() → GeoJSON FeatureCollection
      → App.tsx passes geojson + viewMode to MapView
        → MapView conditionally renders HeatmapLayer or ClusterLayer
```

**Key constraint:** `viewMode` (heatmap/clusters) lives in `App.tsx` state — it's a UI-only concern that does **not** trigger re-fetch. Only `filterStore` changes trigger re-fetch.

**Layer typing:** Mapbox/MapLibre layer spec constants must be typed as `LayerProps` from `react-map-gl/maplibre` — not `CircleLayerSpecification` etc. from `mapbox-gl`. The mapbox-gl spec types require a `source` field and use mutable array types that conflict with `as const`. Using `LayerProps` makes both `source` and `id` optional.

**Click handling in cluster mode:** `MapView` sets `interactiveLayerIds` to the two cluster layer IDs, which causes `event.features` to be populated on click. The `onClick` handler receives `MapLayerMouseEvent` (from `react-map-gl/maplibre`). Cluster circles call `source.getClusterExpansionZoom(clusterId)` — this returns a `Promise<number>` in MapLibre v5 (no callback). Individual point clicks open `ViolationPopup`.

**OData filter:** `buildODataFilter()` always appends `latitude ne null and longitude ne null`. Empty `boroughs[]` or `classes[]` arrays mean "no filter on that field" (show all). The `$filter` param is omitted entirely when the filter string is empty.

**Pagination:** `fetchAllViolations()` fetches `$top=5000` per page, follows `@odata.nextLink` for subsequent pages. Respects `AbortSignal` at the top of each loop iteration.

## Environment

Requires `VITE_MAPTILER_KEY` in `.env`. See `.env.example`. The key is read via `import.meta.env.VITE_MAPTILER_KEY` — type augmented in `src/vite-env.d.ts`. The key is embedded directly in the Maptiler style URL via `MAPTILER_STYLE_URL()` in `src/constants/map.ts` — there is no `mapboxAccessToken` prop on the `Map` component.

## API

OData endpoint: `https://data.cityofnewyork.us/api/odata/v4/wvxf-dwi5`
Dataset: NYC Housing Maintenance Code Violations (`wvxf-dwi5`)

The `ViolationStatus` type uses `'Close'` (not `'Closed'`) — this matches the raw API value.
