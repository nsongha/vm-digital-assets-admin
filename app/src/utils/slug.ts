// Ported from v3.html's inline slugify logic (used both by `slugOf` for
// collections and inline inside the CONNS mapper for connection endpoints).
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(name: string | null | undefined): string {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** `slugOf` from v3.html — collection cover/slot id, prefixed with `coll-`. */
export function slugOf(name: string | null | undefined): string {
  return 'coll-' + slugify(name);
}
