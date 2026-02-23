export type ViolationClass = 'A' | 'B' | 'C';
export type ViolationStatus = 'Open' | 'Close';
export type Borough =
  | 'MANHATTAN'
  | 'BROOKLYN'
  | 'QUEENS'
  | 'BRONX'
  | 'STATEN ISLAND';

export interface ViolationRaw {
  violationid: string;
  boro: Borough;
  housenumber: string;
  streetname: string;
  class: ViolationClass;
  violationstatus: ViolationStatus;
  inspectiondate: string;
  novdescription: string;
  rentimpairing: string;
  latitude: number;
  longitude: number;
  nta: string;
}

export interface FilterState {
  borough: Borough;
  violationClass: ViolationClass;
  setBorough: (borough: Borough) => void;
  setViolationClass: (cls: ViolationClass) => void;
}

export interface ViolationProperties {
  violationid: string;
  boro: Borough;
  housenumber: string;
  streetname: string;
  class: ViolationClass;
  violationstatus: ViolationStatus;
  inspectiondate: string;
  novdescription: string;
  rentimpairing: string;
  nta: string;
}

/** One point per address for map; used when showing individual addresses. */
export interface AddressFeatureProperties {
  violationCount: number;
  violations: ViolationProperties[];
  boro: Borough;
  housenumber: string;
  streetname: string;
  nta: string;
}
