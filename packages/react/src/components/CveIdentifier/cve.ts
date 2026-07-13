export type CveLinkSource = 'cve' | 'nvd';

export const CVE_ID_PATTERN = /^CVE-(\d{4})-(\d{4,})$/i;

export function normalizeCveId(cveId: string) {
  return cveId.trim().toUpperCase();
}

export function isCveId(cveId: string) {
  return CVE_ID_PATTERN.test(normalizeCveId(cveId));
}

export function getCveYear(cveId: string) {
  const match = normalizeCveId(cveId).match(CVE_ID_PATTERN);

  return match ? Number(match[1]) : null;
}

export function getCveUrl(cveId: string, source: CveLinkSource = 'cve') {
  const normalized = normalizeCveId(cveId);

  if (source === 'nvd') {
    return `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(normalized)}`;
  }

  return `https://www.cve.org/CVERecord?id=${encodeURIComponent(normalized)}`;
}
