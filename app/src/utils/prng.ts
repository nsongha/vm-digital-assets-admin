// Deterministic seeded PRNG (mulberry32) used only to vary generated mock
// records (owner rotation, status, dates, size jitter) so the dataset avoids
// the "auto-generated fingerprint" patterns flagged in redteam.md mục (d) —
// perfectly-incrementing sizes, perfectly-cycling owners/status/dates.
// Seeded (not Math.random()) so the app renders the same dataset every load.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks an element from `arr` using `rng()` — uniform, deterministic given the rng's seed. */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

/** Weighted pick — `weights` must be the same length as `arr` and sum to any positive total. */
export function pickWeighted<T>(rng: () => number, arr: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Float in [min, max]. */
export function randFloat(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}
