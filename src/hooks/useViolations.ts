import { useState, useEffect, useRef } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import { fetchAllViolations } from '../api/violations';
import { buildODataFilter } from '../utils/odata';
import { violationsToGeoJSON } from '../utils/geojson';
import { useFilterStore } from '../store/filterStore';
import type { ViolationProperties } from '../types/violation';

interface UseViolationsResult {
  geojson: FeatureCollection<Point, ViolationProperties> | null;
  loading: boolean;
  error: string | null;
  recordCount: number;
}

export function useViolations(): UseViolationsResult {
  const { borough, classes } = useFilterStore();
  const [geojson, setGeojson] = useState<FeatureCollection<Point, ViolationProperties> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setRecordCount(0);

    const filter = buildODataFilter({ borough, classes });

    fetchAllViolations(filter, controller.signal, (count) => {
      setRecordCount(count);
    })
      .then((violations) => {
        if (!controller.signal.aborted) {
          const featureCollection = violationsToGeoJSON(violations);
          setGeojson(featureCollection);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [borough, classes]);

  return { geojson, loading, error, recordCount };
}
