import type { FeatureCollection, Feature, Point } from 'geojson';
import type { ViolationRaw, ViolationProperties, AddressFeatureProperties } from '../types/violation';

export function violationsToGeoJSON(
  violations: ViolationRaw[]
): FeatureCollection<Point, ViolationProperties> {
  const features: Feature<Point, ViolationProperties>[] = violations
    .filter((v) => v.latitude != null && v.longitude != null)
    .map((v) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [v.longitude, v.latitude],
      },
      properties: {
        violationid: v.violationid,
        boro: v.boro,
        housenumber: v.housenumber,
        streetname: v.streetname,
        class: v.class,
        violationstatus: v.violationstatus,
        inspectiondate: v.inspectiondate,
        novdescription: v.novdescription,
        rentimpairing: v.rentimpairing,
        nta: v.nta,
      },
    }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

const addressKey = (v: ViolationRaw) =>
  `${v.boro}|${v.housenumber}|${v.streetname}`;

/**
 * One feature per unique address; used for map so we can size/color by violation count.
 */
export function violationsToAddressGeoJSON(
  violations: ViolationRaw[]
): FeatureCollection<Point, AddressFeatureProperties> {
  const withCoords = violations.filter(
    (v) => v.latitude != null && v.longitude != null
  );
  const byAddress = new Map<
    string,
    { coords: [number, number]; violations: ViolationProperties[] }
  >();
  for (const v of withCoords) {
    const key = addressKey(v);
    const existing = byAddress.get(key);
    const props: ViolationProperties = {
      violationid: v.violationid,
      boro: v.boro,
      housenumber: v.housenumber,
      streetname: v.streetname,
      class: v.class,
      violationstatus: v.violationstatus,
      inspectiondate: v.inspectiondate,
      novdescription: v.novdescription,
      rentimpairing: v.rentimpairing,
      nta: v.nta,
    };
    if (!existing) {
      byAddress.set(key, {
        coords: [v.longitude, v.latitude],
        violations: [props],
      });
    } else {
      existing.violations.push(props);
    }
  }
  const features: Feature<Point, AddressFeatureProperties>[] = [];
  for (const { coords, violations: list } of byAddress.values()) {
    const first = list[0];
    if (!first) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: {
        violationCount: list.length,
        violations: list,
        boro: first.boro,
        housenumber: first.housenumber,
        streetname: first.streetname,
        nta: first.nta,
      },
    });
  }
  return { type: 'FeatureCollection', features };
}
