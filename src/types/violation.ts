export type ViolationClass = 'A' | 'B' | 'C';
export type ViolationStatus = 'Open' | 'Close';
export type MapViewMode = 'heatmap' | 'clusters';
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
  boroughs: Borough[];
  classes: ViolationClass[];
  status: 'All' | ViolationStatus;
  setBoroughs: (boroughs: Borough[]) => void;
  setClasses: (classes: ViolationClass[]) => void;
  setStatus: (status: 'All' | ViolationStatus) => void;
  toggleBorough: (borough: Borough) => void;
  toggleClass: (cls: ViolationClass) => void;
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
