import { ODATA_BASE_URL, ODATA_SELECT_FIELDS } from '../constants/map';
import type { ViolationRaw } from '../types/violation';

interface ODataResponse {
  value: ViolationRaw[];
  '@odata.nextLink'?: string;
}

export async function fetchAllViolations(
  filter: string,
  signal: AbortSignal,
  onProgress: (count: number) => void
): Promise<ViolationRaw[]> {
  const all: ViolationRaw[] = [];

  const queryParts = [`$top=50000`, `$select=${ODATA_SELECT_FIELDS}`];
  if (filter) {
    queryParts.push(`$filter=${encodeURIComponent(filter)}`);
  }

  let nextUrl: string | null = `${ODATA_BASE_URL}?${queryParts.join('&')}`;

  while (nextUrl) {
    if (signal.aborted) break;

    const response = await fetch(nextUrl, { signal });

    if (!response.ok) {
      throw new Error(`OData request failed: ${response.status} ${response.statusText}`);
    }

    const data: ODataResponse = await response.json() as ODataResponse;

    all.push(...data.value);
    onProgress(all.length);

    const rawNext = data['@odata.nextLink'];
    if (rawNext) {
      // @odata.nextLink is the full external URL — rewrite to the local proxy path
      // so subsequent pages go through the Vite dev server proxy (avoids CORS).
      const parsed = new URL(rawNext);
      nextUrl = parsed.pathname + parsed.search;
    } else {
      nextUrl = null;
    }
  }

  return all;
}
