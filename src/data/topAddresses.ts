import type { Borough, TopAddressEntry } from '../types/violation';
import raw from './topAddresses.json';

export const LAST_UPDATED = (raw as { lastUpdated: string }).lastUpdated;
export const TOP_ADDRESSES_BY_BOROUGH: Partial<Record<Borough, TopAddressEntry[]>> = (raw as {
  data: Partial<Record<Borough, TopAddressEntry[]>>;
}).data;
