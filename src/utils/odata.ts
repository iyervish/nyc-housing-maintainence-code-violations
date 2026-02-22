import type { Borough, ViolationClass } from '../types/violation';

interface ODataFilterOptions {
  borough: Borough;
  violationClass: ViolationClass;
}

export function buildODataFilter(options: ODataFilterOptions): string {
  const parts: string[] = [];

  parts.push(`boro eq '${options.borough}'`);
  parts.push(`class eq '${options.violationClass}'`);
  parts.push(`violationstatus eq 'Open'`);

  return parts.join(' and ');
}
