import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ClusterLayer } from './ClusterLayer';
import { AddressPopup } from './AddressPopup';
import { useMapStore } from '../../store/mapStore';
import {
  NYC_CENTER,
  NYC_INITIAL_ZOOM,
  CLUSTER_CIRCLES_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  CLUSTER_SOURCE_ID,
  MAPTILER_STYLE_URL,
} from '../../constants/map';
import type { ViolationProperties } from '../../types/violation';

function countVisibleInBounds(
  geojson: FeatureCollection<Point, ViolationProperties>,
  map: MapLibreMap
): number {
  const bounds = map.getBounds();
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  return geojson.features.filter((f) => {
    if (f.geometry.type !== 'Point') return false;
    const [lng, lat] = f.geometry.coordinates;
    return lng >= west && lng <= east && lat >= south && lat <= north;
  }).length;
}

interface PopupState {
  longitude: number;
  latitude: number;
  violations: ViolationProperties[];
}

interface MapViewProps {
  geojson: FeatureCollection<Point, ViolationProperties> | null;
}

const mapStyle = MAPTILER_STYLE_URL(import.meta.env.VITE_MAPTILER_KEY);

export function MapView({ geojson }: MapViewProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const setVisibleCount = useMapStore((s) => s.setVisibleCount);

  const updateVisibleCount = useCallback(() => {
    if (!geojson) {
      setVisibleCount(0);
      return;
    }
    if (!mapRef.current) return;
    setVisibleCount(countVisibleInBounds(geojson, mapRef.current));
  }, [geojson, setVisibleCount]);

  useEffect(() => {
    updateVisibleCount();
  }, [updateVisibleCount]);

  const handleLoad = useCallback(
    (event: { target: MapLibreMap }) => {
      mapRef.current = event.target;
      if (geojson) setVisibleCount(countVisibleInBounds(geojson, event.target));
    },
    [geojson, setVisibleCount]
  );

  const handleMoveEnd = useCallback(() => {
    updateVisibleCount();
  }, [updateVisibleCount]);

  const interactiveLayerIds = [CLUSTER_CIRCLES_LAYER_ID, UNCLUSTERED_LAYER_ID];

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
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
      } else {
        const violationFeatures = features.filter(
          (f) => f.properties && !('point_count' in f.properties)
        );
        const violations = violationFeatures
          .map((f) => f.properties as ViolationProperties)
          .filter((p): p is ViolationProperties => p != null);
        if (violations.length > 0) {
          const addressKey = (p: ViolationProperties) =>
            `${p.boro}|${p.housenumber}|${p.streetname}`;
          const key = addressKey(violations[0]);
          const atSameAddress = violations.filter((p) => addressKey(p) === key);
          setPopup({
            longitude,
            latitude,
            violations: atSameAddress,
          });
        }
      }
    },
    []
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
        onLoad={handleLoad}
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="top-right" />

        {geojson && (
          <ClusterLayer geojson={geojson} />
        )}

        {popup && (
          <AddressPopup
            longitude={popup.longitude}
            latitude={popup.latitude}
            violations={popup.violations}
            onClose={handleClosePopup}
          />
        )}
      </Map>
    </div>
  );
}
