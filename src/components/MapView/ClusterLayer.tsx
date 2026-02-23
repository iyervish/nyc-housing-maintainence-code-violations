import { Source, Layer } from 'react-map-gl/maplibre';
import type { LayerProps } from 'react-map-gl/maplibre';
import type { FeatureCollection, Point } from 'geojson';
import {
  CLUSTER_SOURCE_ID,
  CLUSTER_CIRCLES_LAYER_ID,
  CLUSTER_COUNT_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  UNCLUSTERED_COUNT_LAYER_ID,
} from '../../constants/map';
import type { AddressFeatureProperties } from '../../types/violation';

interface ClusterLayerProps {
  geojson: FeatureCollection<Point, AddressFeatureProperties>;
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
      'interpolate',
      ['linear'],
      ['get', 'violationCount'],
      1,
      'rgba(76, 175, 80, 0.9)',
      5,
      'rgba(255, 152, 0, 0.9)',
      15,
      'rgba(244, 67, 54, 0.9)',
    ],
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'violationCount'],
      1,
      8,
      5,
      12,
      20,
      18,
      50,
      24,
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(255,255,255,0.8)',
  },
};

const unclusteredCountLayer: LayerProps = {
  id: UNCLUSTERED_COUNT_LAYER_ID,
  type: 'symbol',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'text-field': ['get', 'violationCount'],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 11,
  },
  paint: {
    'text-color': '#fff',
    'text-halo-color': 'rgba(0,0,0,0.6)',
    'text-halo-width': 1.5,
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
      <Layer {...unclusteredCountLayer} />
    </Source>
  );
}
