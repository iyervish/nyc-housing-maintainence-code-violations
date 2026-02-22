import { useState, useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HeatmapLayer } from './HeatmapLayer';
import { ClusterLayer } from './ClusterLayer';
import { ViolationPopup } from './ViolationPopup';
import {
  NYC_CENTER,
  NYC_INITIAL_ZOOM,
  CLUSTER_CIRCLES_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  CLUSTER_SOURCE_ID,
  MAPTILER_STYLE_URL,
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

const mapStyle = MAPTILER_STYLE_URL(import.meta.env.VITE_MAPTILER_KEY);

export function MapView({ geojson, viewMode }: MapViewProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);

  const interactiveLayerIds =
    viewMode === 'clusters'
      ? [CLUSTER_CIRCLES_LAYER_ID, UNCLUSTERED_LAYER_ID]
      : [];

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
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
          source.getClusterExpansionZoom(clusterId).then((zoom) => {
            event.target.easeTo({ center: [longitude, latitude], zoom });
          }).catch(() => undefined);
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
        initialViewState={{
          longitude: NYC_CENTER[0],
          latitude: NYC_CENTER[1],
          zoom: NYC_INITIAL_ZOOM,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
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
