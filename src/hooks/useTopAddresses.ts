import { useState, useEffect, useRef } from 'react';
import { fetchAllViolations } from '../api/violations';
import { buildBoroughOnlyFilter } from '../utils/odata';
import { getTop10Addresses } from '../utils/topAddresses';
import type { Borough, TopAddressEntry } from '../types/violation';

const BOROUGHS_ORDER: Borough[] = [
  'MANHATTAN',
  'BROOKLYN',
  'QUEENS',
  'BRONX',
  'STATEN ISLAND',
];

export type TopAddressesProgress = {
  currentBorough: Borough | null;
  boroughIndex: number;
  totalBoroughs: number;
  count: number;
};

export interface UseTopAddressesResult {
  topByBorough: Partial<Record<Borough, TopAddressEntry[]>> | null;
  loading: boolean;
  error: string | null;
  progress: TopAddressesProgress | null;
}

export function useTopAddresses(): UseTopAddressesResult {
  const [topByBorough, setTopByBorough] = useState<Partial<Record<Borough, TopAddressEntry[]>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<TopAddressesProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setTopByBorough(null);
    setProgress({ currentBorough: BOROUGHS_ORDER[0], boroughIndex: 0, totalBoroughs: BOROUGHS_ORDER.length, count: 0 });

    let cancelled = false;

    async function run() {
      const next: Partial<Record<Borough, TopAddressEntry[]>> = {};

      for (let i = 0; i < BOROUGHS_ORDER.length; i++) {
        if (controller.signal.aborted || cancelled) break;

        const borough = BOROUGHS_ORDER[i];
        setProgress({
          currentBorough: borough,
          boroughIndex: i + 1,
          totalBoroughs: BOROUGHS_ORDER.length,
          count: 0,
        });

        try {
          const violations = await fetchAllViolations(
            buildBoroughOnlyFilter(borough),
            controller.signal,
            (count) => {
              if (!cancelled) {
                setProgress((p) => (p ? { ...p, count } : null));
              }
            }
          );

          if (controller.signal.aborted || cancelled) break;

          const top10 = getTop10Addresses(violations, borough);
          next[borough] = top10;
          setTopByBorough((prev) => ({ ...prev, ...next }));
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return;
          setError(err instanceof Error ? err.message : 'Unknown error');
          break;
        }
      }

      if (!controller.signal.aborted && !cancelled) {
        setLoading(false);
        setProgress(null);
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { topByBorough, loading, error, progress };
}
