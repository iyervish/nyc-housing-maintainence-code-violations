import type { Borough, ViolationClass } from '../types/violation';

interface ODataFilterOptions {
  borough: Borough;
  classes: ViolationClass[];
}

export function buildODataFilter(options: ODataFilterOptions): string {
  const parts: string[] = [];

  parts.push(`boro eq '${options.borough}'`);

  if (options.classes.length > 0) {
    const classClauses = options.classes
      .map((c) => `class eq '${c}'`)
      .join(' or ');
    parts.push(`(${classClauses})`);
  }

  parts.push(`violationstatus eq 'Open'`);

  return parts.join(' and ');
}
