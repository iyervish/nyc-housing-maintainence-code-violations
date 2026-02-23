import { ODATA_BASE_URL, ODATA_SELECT_FIELDS } from '../constants/map';
import type { ViolationRaw } from '../types/violation';

const PAGE_SIZE = 50000;

interface ODataResponse {
  value: ViolationRaw[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}

function buildBaseQueryParts(filter: string): string[] {
  const parts = [`$select=${ODATA_SELECT_FIELDS}`];
  if (filter) {
    parts.push(`$filter=${encodeURIComponent(filter)}`);
  }
  return parts;
}

async function fetchPage(
  baseQueryParts: string[],
  skip: number,
  signal: AbortSignal
): Promise<ViolationRaw[]> {
  const queryParts = [`$top=${PAGE_SIZE}`, `$skip=${skip}`, ...baseQueryParts];
  const url = `${ODATA_BASE_URL}?${queryParts.join('&')}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`OData request failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json() as ODataResponse;
  return data.value;
}

async function fetchSequential(
  baseQueryParts: string[],
  signal: AbortSignal,
  onProgress: (count: number) => void
): Promise<ViolationRaw[]> {
  const all: ViolationRaw[] = [];
  let nextUrl: string | null = `${ODATA_BASE_URL}?$top=${PAGE_SIZE}&${baseQueryParts.join('&')}`;

  while (nextUrl) {
    if (signal.aborted) break;

    const response = await fetch(nextUrl, { signal });
    if (!response.ok) {
      throw new Error(`OData request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as ODataResponse;
    all.push(...data.value);
    onProgress(all.length);

    const rawNext = data['@odata.nextLink'];
    if (rawNext) {
      const parsed = new URL(rawNext);
      nextUrl = parsed.pathname + parsed.search;
    } else {
      nextUrl = null;
    }
  }

  return all;
}

export async function fetchAllViolations(
  filter: string,
  signal: AbortSignal,
  onProgress: (count: number) => void
): Promise<ViolationRaw[]> {
  const baseQueryParts = buildBaseQueryParts(filter);

  // Phase 1: fetch count
  let totalCount: number;
  try {
    const countParts = [`$top=1`, `$count=true`, ...baseQueryParts];
    const countUrl = `${ODATA_BASE_URL}?${countParts.join('&')}`;
    const countResponse = await fetch(countUrl, { signal });
    if (!countResponse.ok) {
      throw new Error(`Count request failed: ${countResponse.status}`);
    }
    const countData = await countResponse.json() as ODataResponse;
    totalCount = countData['@odata.count'] ?? 0;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    // Fall back to sequential fetching if count fails
    return fetchSequential(baseQueryParts, signal, onProgress);
  }

  if (signal.aborted) throw Object.assign(new Error('AbortError'), { name: 'AbortError' });

  if (totalCount === 0) return [];

  // Phase 2: fire all pages in parallel
  const pageCount = Math.ceil(totalCount / PAGE_SIZE);
  const skips = Array.from({ length: pageCount }, (_, i) => i * PAGE_SIZE);

  const pages = await Promise.all(
    skips.map((skip) => fetchPage(baseQueryParts, skip, signal))
  );

  const all = pages.flat();
  onProgress(all.length);
  return all;
}
