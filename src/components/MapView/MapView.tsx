import { useState, useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import type { MapMouseEvent } from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import type { FeatureCollection, Point } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HeatmapLayer } from './HeatmapLayer';
import { ClusterLayer } from './ClusterLayer';
import { ViolationPopup } from './ViolationPopup';
import {
  NYC_CENTER,
  NYC_INITIAL_ZOOM,
  CLUSTER_CIRCLES_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  CLUSTER_SOURCE_ID,
} from '../../constants/map';
import type { MapViewMode, ViolationProperties } from '../../types/violation';

interface PopupState {
  longitude: number;
  latitude: number;
  properties: ViolationProperties;
}

interface MapViewProps {
  geojson: FeatureCollection<Point, ViolationProperties> | null;
  viewMode: MapViewMode;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export function MapView({ geojson, viewMode }: MapViewProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);

  const interactiveLayerIds =
    viewMode === 'clusters'
      ? [CLUSTER_CIRCLES_LAYER_ID, UNCLUSTERED_LAYER_ID]
      : [];

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (viewMode !== 'clusters') return;

      const features = event.features;
      if (!features || features.length === 0) return;

      const feature = features[0];
      if (!feature) return;

      const geometry = feature.geometry;
      if (geometry.type !== 'Point') return;

      const [longitude, latitude] = geometry.coordinates as [number, number];

      if (feature.properties && 'point_count' in feature.properties) {
        const source = event.target.getSource(CLUSTER_SOURCE_ID) as GeoJSONSource | undefined;
        if (source) {
          const clusterId = feature.properties['cluster_id'] as number;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return;
            event.target.easeTo({ center: [longitude, latitude], zoom });
          });
        }
      } else if (feature.properties) {
        setPopup({
          longitude,
          latitude,
          properties: feature.properties as ViolationProperties,
        });
      }
    },
    [viewMode]
  );

  const handleClosePopup = useCallback(() => setPopup(null), []);

  return (
    <div className="map-container" role="main" aria-label="NYC Housing Violations Map">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: NYC_CENTER[0],
          latitude: NYC_CENTER[1],
          zoom: NYC_INITIAL_ZOOM,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />

        {geojson && viewMode === 'heatmap' && (
          <HeatmapLayer geojson={geojson} />
        )}

        {geojson && viewMode === 'clusters' && (
          <ClusterLayer geojson={geojson} />
        )}

        {popup && (
          <ViolationPopup
            longitude={popup.longitude}
            latitude={popup.latitude}
            properties={popup.properties}
            onClose={handleClosePopup}
          />
        )}
      </Map>
    </div>
  );
}
