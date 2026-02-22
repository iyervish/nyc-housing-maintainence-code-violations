import { Source, Layer } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';
import type { FeatureCollection, Point } from 'geojson';
import {
  CLUSTER_SOURCE_ID,
  CLUSTER_CIRCLES_LAYER_ID,
  CLUSTER_COUNT_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
} from '../../constants/map';
import type { ViolationProperties } from '../../types/violation';

interface ClusterLayerProps {
  geojson: FeatureCollection<Point, ViolationProperties>;
}

const clusterCirclesLayer: LayerProps = {
  id: CLUSTER_CIRCLES_LAYER_ID,
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1',
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100,
      30,
      750,
      40,
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(255,255,255,0.4)',
  },
};

const clusterCountLayer: LayerProps = {
  id: CLUSTER_COUNT_LAYER_ID,
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
  paint: {
    'text-color': '#333',
  },
};

const unclusteredLayer: LayerProps = {
  id: UNCLUSTERED_LAYER_ID,
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match',
      ['get', 'class'],
      'C', '#F44336',
      'B', '#FF9800',
      'A', '#4CAF50',
      '#888888',
    ],
    'circle-radius': 6,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
};

export function ClusterLayer({ geojson }: ClusterLayerProps) {
  return (
    <Source
      id={CLUSTER_SOURCE_ID}
      type="geojson"
      data={geojson}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      <Layer {...clusterCirclesLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...unclusteredLayer} />
    </Source>
  );
}
