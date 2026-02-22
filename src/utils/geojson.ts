import type { FeatureCollection, Feature, Point } from 'geojson';
import type { ViolationRaw, ViolationProperties } from '../types/violation';

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
