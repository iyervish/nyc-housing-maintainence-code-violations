import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { NavigationControl, useMap } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
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
  UNCLUSTERED_COUNT_LAYER_ID,
  CLUSTER_SOURCE_ID,
  MAPTILER_STYLE_URL,
} from '../../constants/map';
import type { AddressFeatureProperties, ViolationProperties } from '../../types/violation';

type BoundsLike = { getWest(): number; getEast(): number; getSouth(): number; getNorth(): number };

function countVisibleInBounds(
  geojson: FeatureCollection<Point, AddressFeatureProperties>,
  map: { getBounds(): BoundsLike }
): number {
  const bounds = map.getBounds();
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  return geojson.features.reduce((sum, f) => {
    if (f.geometry.type !== 'Point') return sum;
    const [lng, lat] = f.geometry.coordinates;
    const inBounds = lng >= west && lng <= east && lat >= south && lat <= north;
    const count = f.properties?.violationCount ?? 0;
    return inBounds ? sum + count : sum;
  }, 0);
}

interface PopupState {
  longitude: number;
  latitude: number;
  violations: ViolationProperties[];
}

interface FocusAddress {
  housenumber: string;
  streetname: string;
  boro: string;
}

interface MapViewProps {
  geojson: FeatureCollection<Point, AddressFeatureProperties> | null;
  focusAddress?: FocusAddress | null;
}

function FocusAddressHandler({
  geojson,
  focusAddress,
  onFocus,
}: {
  geojson: FeatureCollection<Point, AddressFeatureProperties> | null;
  focusAddress: FocusAddress | null | undefined;
  onFocus: (popup: PopupState) => void;
}) {
  const { current: mapRef } = useMap();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!focusAddress || !geojson || !mapRef) return;

    const key = `${focusAddress.housenumber}|${focusAddress.streetname}|${focusAddress.boro}`;
    if (handledRef.current === key) return;

    const hn = focusAddress.housenumber.trim().toUpperCase();
    const sn = focusAddress.streetname.trim().toUpperCase();
    const feature = geojson.features.find(
      (f) =>
        (f.properties?.housenumber ?? '').trim().toUpperCase() === hn &&
        (f.properties?.streetname ?? '').trim().toUpperCase() === sn
    );

    if (!feature || feature.geometry.type !== 'Point') return;

    const [lng, lat] = feature.geometry.coordinates as [number, number];
    const violations = feature.properties?.violations;
    if (Array.isArray(violations) && violations.length > 0) {
      mapRef.flyTo({ center: [lng, lat], zoom: 16 });
      onFocus({ longitude: lng, latitude: lat, violations });
      handledRef.current = key;
    }
  }, [focusAddress, geojson, mapRef, onFocus]);

  return null;
}

const mapStyle = MAPTILER_STYLE_URL(import.meta.env.VITE_MAPTILER_KEY);

function ViewportCountUpdater({
  geojson,
}: {
  geojson: FeatureCollection<Point, AddressFeatureProperties> | null;
}) {
  const { current: mapRef } = useMap();
  const setVisibleCount = useMapStore((s) => s.setVisibleCount);

  useEffect(() => {
    if (!geojson) {
      setVisibleCount(0);
      return;
    }
    if (!mapRef) return;
    const update = () => setVisibleCount(countVisibleInBounds(geojson, mapRef));
    update();
    mapRef.on?.('moveend', update);
    return () => {
      mapRef.off?.('moveend', update);
    };
  }, [geojson, mapRef, setVisibleCount]);
  return null;
}

export function MapView({ geojson, focusAddress }: MapViewProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const setVisibleCount = useMapStore((s) => s.setVisibleCount);
  const handleFocusAddress = useCallback((popupState: PopupState) => setPopup(popupState), []);

  useEffect(() => {
    if (!geojson) setVisibleCount(0);
  }, [geojson, setVisibleCount]);

  const interactiveLayerIds = [
  CLUSTER_CIRCLES_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  UNCLUSTERED_COUNT_LAYER_ID,
];

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
      } else if (geojson) {
        const clickLng = (event as unknown as { lngLat?: { lng: number; lat: number } }).lngLat?.lng ?? longitude;
        const clickLat = (event as unknown as { lngLat?: { lng: number; lat: number } }).lngLat?.lat ?? latitude;
        const thresholdDeg = 0.001;
        let best: { feature: (typeof geojson.features)[0]; dist: number } | null = null;
        for (const f of geojson.features) {
          if (f.geometry.type !== 'Point') continue;
          const [x, y] = f.geometry.coordinates;
          const dist = (x - clickLng) ** 2 + (y - clickLat) ** 2;
          if (dist <= thresholdDeg * thresholdDeg && (!best || dist < best.dist)) {
            best = { feature: f, dist };
          }
        }
        const violations = best?.feature?.properties?.violations;
        if (Array.isArray(violations) && violations.length > 0) {
          const [popupLng, popupLat] = best!.feature.geometry.coordinates;
          setPopup({
            longitude: popupLng,
            latitude: popupLat,
            violations,
          });
        }
      }
    },
    [geojson]
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
        <ViewportCountUpdater geojson={geojson} />
        <FocusAddressHandler geojson={geojson} focusAddress={focusAddress} onFocus={handleFocusAddress} />

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
