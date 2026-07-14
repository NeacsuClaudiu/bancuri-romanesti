// Diacritic-insensitive helpers for instant, forgiving search.
export function foldDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ș|ş/gi, 's')
    .replace(/ț|ţ/gi, 't')
    .replace(/ă|â/gi, 'a')
    .replace(/î/gi, 'i')
    .toLowerCase()
}

export function normalize(s: string): string {
  return foldDiacritics(s).replace(/\s+/g, ' ').trim()
}

// Splits a query into terms; a joke matches when every term is present.
export function tokens(q: string): string[] {
  return normalize(q)
    .split(' ')
    .filter((t) => t.length > 0)
}

export function preview(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

export function highlight(text: string, terms: string[]): string {
  return text
}
