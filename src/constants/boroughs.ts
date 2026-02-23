import type { Borough } from '../types/violation';

export const BOROUGHS: { value: Borough; label: string }[] = [
  { value: 'MANHATTAN', label: 'Manhattan' },
  { value: 'BROOKLYN', label: 'Brooklyn' },
  { value: 'QUEENS', label: 'Queens' },
  { value: 'BRONX', label: 'Bronx' },
  { value: 'STATEN ISLAND', label: 'Staten Island' },
];

export const BOROUGH_LABEL: Record<Borough, string> = Object.fromEntries(
  BOROUGHS.map((b) => [b.value, b.label])
) as Record<Borough, string>;
