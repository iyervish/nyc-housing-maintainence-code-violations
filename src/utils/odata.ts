import type { Borough, ViolationClass } from '../types/violation';

interface ODataFilterOptions {
  boroughs: Borough[];
  classes: ViolationClass[];
  status: 'All' | 'Open' | 'Close';
}

export function buildODataFilter(options: ODataFilterOptions): string {
  const parts: string[] = [];

  if (options.boroughs.length > 0) {
    const boroughClauses = options.boroughs
      .map((b) => `boro eq '${b}'`)
      .join(' or ');
    parts.push(`(${boroughClauses})`);
  }

  if (options.classes.length > 0) {
    const classClauses = options.classes
      .map((c) => `class eq '${c}'`)
      .join(' or ');
    parts.push(`(${classClauses})`);
  }

  if (options.status !== 'All') {
    parts.push(`violationstatus eq '${options.status}'`);
  }

  parts.push('latitude ne null and longitude ne null');

  return parts.join(' and ');
}
