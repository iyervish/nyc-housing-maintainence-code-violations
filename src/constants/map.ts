export const ODATA_BASE_URL =
  'https://data.cityofnewyork.us/api/odata/v4/wvxf-dwi5';

export const MAPTILER_STYLE_URL = (key: string) =>
  `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${key}`;

export const ODATA_SELECT_FIELDS = [
  'violationid',
  'boro',
  'housenumber',
  'streetname',
  'class',
  'violationstatus',
  'inspectiondate',
  'novdescription',
  'rentimpairing',
  'latitude',
  'longitude',
  'nta',
].join(',');

export const HEATMAP_SOURCE_ID = 'violations-heatmap-source';
export const HEATMAP_LAYER_ID = 'violations-heatmap-layer';
export const CLUSTER_SOURCE_ID = 'violations-cluster-source';
export const CLUSTER_CIRCLES_LAYER_ID = 'violations-clusters';
export const CLUSTER_COUNT_LAYER_ID = 'violations-cluster-count';
export const UNCLUSTERED_LAYER_ID = 'violations-unclustered';

export const NYC_CENTER: [number, number] = [-73.9857, 40.7484];
export const NYC_INITIAL_ZOOM = 10;

export const VIOLATION_CLASS_COLORS: Record<string, string> = {
  C: '#F44336',
  B: '#FF9800',
  A: '#4CAF50',
};

export const HEATMAP_COLOR_RAMP = [
  'interpolate',
  ['linear'],
  ['heatmap-density'],
  0,
  'rgba(33,102,172,0)',
  0.2,
  'rgb(103,169,207)',
  0.4,
  'rgb(209,229,240)',
  0.6,
  'rgb(253,219,199)',
  0.8,
  'rgb(239,138,98)',
  1,
  'rgb(178,24,43)',
] as const;

export const CLUSTER_COLORS = [
  '#51bbd6',
  '#f1f075',
  '#f28cb1',
] as const;
