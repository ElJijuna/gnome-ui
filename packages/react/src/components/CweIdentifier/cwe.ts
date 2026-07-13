export type CweLinkSource = 'mitre' | 'cwe';

export const CWE_ID_PATTERN = /^CWE-(\d{1,6})$/i;

export function normalizeCweId(cweId: string) {
  const normalized = cweId.trim().toUpperCase();

  if (/^\d{1,6}$/.test(normalized)) {
    return `CWE-${normalized}`;
  }

  return normalized;
}

export function isCweId(cweId: string) {
  return CWE_ID_PATTERN.test(normalizeCweId(cweId));
}

export function getCweNumber(cweId: string) {
  const match = normalizeCweId(cweId).match(CWE_ID_PATTERN);

  return match ? Number(match[1]) : null;
}

export function getCweUrl(cweId: string, _source: CweLinkSource = 'mitre') {
  const cweNumber = getCweNumber(cweId);

  if (cweNumber === null) {
    return 'https://cwe.mitre.org/';
  }

  return `https://cwe.mitre.org/data/definitions/${cweNumber}.html`;
}
