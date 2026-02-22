import { Source, Layer } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';
import type { FeatureCollection, Point } from 'geojson';
import {
  HEATMAP_SOURCE_ID,
  HEATMAP_LAYER_ID,
} from '../../constants/map';
import type { ViolationProperties } from '../../types/violation';

interface HeatmapLayerProps {
  geojson: FeatureCollection<Point, ViolationProperties>;
}

const heatmapLayerStyle: LayerProps = {
  id: HEATMAP_LAYER_ID,
  type: 'heatmap',
  paint: {
    'heatmap-weight': [
      'match',
      ['get', 'class'],
      'C', 3,
      'B', 2,
      'A', 1,
      1,
    ],
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1,
      9, 3,
    ],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)',
    ],
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 2,
      9, 20,
    ],
    'heatmap-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      13, 1,
      15, 0,
    ],
  },
};

export function HeatmapLayer({ geojson }: HeatmapLayerProps) {
  return (
    <Source id={HEATMAP_SOURCE_ID} type="geojson" data={geojson}>
      <Layer {...heatmapLayerStyle} />
    </Source>
  );
}
