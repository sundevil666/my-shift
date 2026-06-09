export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/д/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

export function matchesSearch(value: string, query: string): boolean {
  return normalizeSearch(value).includes(normalizeSearch(query));
}
